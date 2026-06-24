import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, Network, UserPlus, Building2,
  Eye, EyeOff, Lock, Handshake, MessageCircle, ArrowRight,
  Star, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/common/SearchInput";
import { Tabs } from "@/components/ui/Tabs";
import { Switch } from "@/components/ui/Switch";
import { useAuth } from "@/hooks/useAuth";
import { useChamaStore } from "@/stores/chamaStore";
import { getMockDatabase } from "@/mock";
import { formatRelativeTime } from "@/lib/utils";
import type { MemberConnection, PrivacySettings, ConnectionType } from "@/types";

const db = getMockDatabase();

const connectionLabels: Record<ConnectionType, { label: string; icon: typeof Users; color: string }> = {
  chama_mate: { label: "Chama Mate", icon: Building2, color: "text-brand-600 bg-brand-50 dark:bg-brand-500/[0.08]" },
  guarantor: { label: "Guarantor", icon: ShieldCheck, color: "text-amber-600 bg-amber-50 dark:bg-amber-500/[0.08]" },
  borrower: { label: "Borrower", icon: Handshake, color: "text-purple-600 bg-purple-50 dark:bg-purple-500/[0.08]" },
  transaction: { label: "Transaction", icon: ArrowRight, color: "text-blue-600 bg-blue-50 dark:bg-blue-500/[0.08]" },
  meeting_attendee: { label: "Meeting", icon: MessageCircle, color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-500/[0.08]" },
};

// Build real connections from mock data
function buildConnections(userId: string): MemberConnection[] {
  const user = db.users.find((u) => u.id === userId);
  if (!user) return [];
  const seen = new Set<string>();
  const connections: MemberConnection[] = [];

  // Get user's memberships
  const myMemberships = db.members.filter((m) => m.userId === userId);
  const myChamaIds = new Set(myMemberships.map((m) => m.chamaId));

  // 1. Chama mates - other members in same chamas
  db.members
    .filter((m) => myChamaIds.has(m.chamaId) && m.userId !== userId)
    .forEach((m) => {
      if (seen.has(m.userId)) return;
      seen.add(m.userId);
      const chama = db.chamas.find((c) => c.id === m.chamaId);
      connections.push({
        id: `conn_chama_${m.userId}`,
        userId: m.userId,
        fullName: m.fullName,
        avatarUrl: m.avatarUrl,
        connectionType: "chama_mate",
        chamaName: chama?.name,
        chamaId: m.chamaId,
        strength: Math.min(10, 3 + m.contributionStreak),
        lastInteraction: m.joinedAt,
        mutualConnections: countMutual(userId, m.userId),
        isVerified: db.users.find((u) => u.id === m.userId)?.isVerified ?? false,
        role: m.role,
      });
    });

  // 2. Guarantors (from loans where user is borrower or guarantor)
  db.loans
    .filter((l) => l.borrowerId === userId || l.guarantors.includes(user?.fullName ?? ""))
    .forEach((l) => {
      // Guarantors on user's loans
      if (l.borrowerId === userId) {
        l.guarantors.forEach((gName) => {
          const guarantor = db.users.find((u) => u.fullName === gName);
          if (guarantor && !seen.has(guarantor.id)) {
            seen.add(guarantor.id);
            connections.push({
              id: `conn_guar_${guarantor.id}`,
              userId: guarantor.id,
              fullName: guarantor.fullName,
              avatarUrl: guarantor.avatarUrl,
              connectionType: "guarantor",
              strength: 7,
              lastInteraction: l.appliedDate,
              mutualConnections: countMutual(userId, guarantor.id),
              isVerified: guarantor.isVerified,
              role: guarantor.role,
            });
          }
        });
      }
      // User is guarantor for someone else's loan
      if (l.guarantors.includes(user?.fullName ?? "") && l.borrowerId !== userId) {
        const borrower = db.users.find((u) => u.id === l.borrowerId);
        if (borrower && !seen.has(borrower.id)) {
          seen.add(borrower.id);
          connections.push({
            id: `conn_borr_${borrower.id}`,
            userId: borrower.id,
            fullName: borrower.fullName,
            avatarUrl: borrower.avatarUrl,
            connectionType: "borrower",
            strength: 6,
            lastInteraction: l.appliedDate,
            mutualConnections: countMutual(userId, borrower.id),
            isVerified: borrower.isVerified,
            role: borrower.role,
          });
        }
      }
    });

  // 3. People user transacted with (recent)
  const myTx = db.transactions.filter((t) => t.userId === userId).slice(0, 50);
  const txUserIds = new Set(myTx.map((t) => t.userId));
  db.transactions
    .filter((t) => txUserIds.has(t.userId) && t.userId !== userId)
    .slice(0, 20)
    .forEach((t) => {
      const other = db.users.find((u) => u.id === t.userId);
      if (other && !seen.has(other.id)) {
        seen.add(other.id);
        connections.push({
          id: `conn_tx_${other.id}`,
          userId: other.id,
          fullName: other.fullName,
          avatarUrl: other.avatarUrl,
          connectionType: "transaction",
          strength: 3,
          lastInteraction: t.date,
          mutualConnections: countMutual(userId, other.id),
          isVerified: other.isVerified,
          role: other.role,
        });
      }
    });

  return connections.sort((a, b) => b.strength - a.strength);
}

function countMutual(userId: string, otherId: string): number {
  const userChamas = new Set(db.members.filter((m) => m.userId === userId).map((m) => m.chamaId));
  const otherChamas = new Set(db.members.filter((m) => m.userId === otherId).map((m) => m.chamaId));
  let count = 0;
  userChamas.forEach((c) => { if (otherChamas.has(c)) count++; });
  // Also count mutual guarantor relationships
  const userLoans = db.loans.filter((l) => l.borrowerId === userId);
  const otherLoans = db.loans.filter((l) => l.borrowerId === otherId);
  const userG = new Set(userLoans.flatMap((l) => l.guarantors));
  const otherG = new Set(otherLoans.flatMap((l) => l.guarantors));
  userG.forEach((g) => { if (otherG.has(g)) count++; });
  return count;
}

export default function NetworkPage() {
  const { user } = useAuth();
  const chamas = useChamaStore((s) => s.chamas);
  const [query, setQuery] = useState("");
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    showConnections: true,
    showTransactionHistory: false,
    showContributionAmount: false,
    showLoanDetails: false,
    showInvestmentDetails: false,
    profileVisibility: "chama_only",
  });

  const myChamas = chamas.filter((c) =>
    db.members.some((m) => m.userId === user?.id && m.chamaId === c.id)
  );
  const connections = buildConnections(user?.id ?? "usr_1");
  const filtered = connections.filter((c) =>
    c.fullName.toLowerCase().includes(query.toLowerCase()) ||
    c.chamaName?.toLowerCase().includes(query.toLowerCase()) ||
    connectionLabels[c.connectionType].label.toLowerCase().includes(query.toLowerCase())
  );

  const strongConnections = connections.filter((c) => c.strength >= 7);
  const verifiedConnections = connections.filter((c) => c.isVerified);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg icon-gradient-brand">
              <Network className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Network</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {connections.length} connections across {myChamas.length} chamas
          </p>
        </div>
        <Link to="/chamas/join">
          <Button size="sm" variant="premium" leftIcon={<UserPlus className="h-3.5 w-3.5" />}>Join New Chama</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Connections", value: connections.length, icon: Users, color: "icon-gradient-brand" },
          { label: "Strong Ties", value: strongConnections.length, icon: Star, color: "icon-gradient-amber" },
          { label: "Verified", value: verifiedConnections.length, icon: ShieldCheck, color: "icon-gradient-emerald" },
          { label: "My Chamas", value: myChamas.length, icon: Building2, color: "icon-gradient-blue" },
        ].map((s) => (
          <div key={s.label} className="card-hover p-4 text-center">
            <div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-xl ${s.color} shadow-soft-sm`}>
              <s.icon className="h-4 w-4" />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{s.value}</p>
            <p className="text-[11px] text-gray-400 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs
        items={[
          {
            value: "connections",
            label: "Connections",
            content: (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <SearchInput value={query} onChange={setQuery} placeholder="Search connections by name, chama, or type..." />
                </div>

                {/* Connection Type Quick Filters */}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(connectionLabels).map(([type, info]) => {
                    const count = connections.filter((c) => c.connectionType === type).length;
                    if (count === 0) return null;
                    return (
                      <button
                        key={type}
                        onClick={() => setQuery(type === query ? "" : info.label)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          query === info.label
                            ? "bg-brand-600 text-white"
                            : `${info.color} hover:opacity-80`
                        }`}
                      >
                        <info.icon className="h-3 w-3" />
                        {info.label}
                        <span className="opacity-70">({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Connections List */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((conn, idx) => {
                    const typeInfo = connectionLabels[conn.connectionType];
                    return (
                      <motion.div
                        key={conn.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="card-hover p-4 group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <Avatar
                              src={conn.avatarUrl}
                              name={conn.fullName}
                              size="md"
                              ring={conn.strength >= 7 ? "brand" : false}
                              status={conn.isVerified ? "online" : undefined}
                            />
                            {conn.strength >= 7 && (
                              <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[8px] font-bold text-white ring-2 ring-white dark:ring-neutral-950">
                                <Star className="h-2 w-2 fill-white" />
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                {conn.fullName}
                              </p>
                              {conn.isVerified && (
                                <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${typeInfo.color}`}>
                                <typeInfo.icon className="h-2.5 w-2.5" />
                                {typeInfo.label}
                              </span>
                              <span className="text-[11px] text-gray-400 capitalize">{conn.role.replace("_", " ")}</span>
                            </div>
                            {conn.chamaName && (
                              <p className="text-[11px] text-gray-400 mt-1 truncate">
                                <Building2 className="h-2.5 w-2.5 inline mr-0.5" />
                                {conn.chamaName}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100 dark:border-white/[0.04]">
                              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                <Star className={`h-2.5 w-2.5 ${conn.strength >= 7 ? "text-amber-400 fill-amber-400" : ""}`} />
                                Strength: {conn.strength}/10
                              </div>
                              {conn.mutualConnections > 0 && (
                                <span className="text-[10px] text-gray-400">
                                  {conn.mutualConnections} mutual
                                </span>
                              )}
                              <span className="text-[10px] text-gray-400 ml-auto">
                                {formatRelativeTime(conn.lastInteraction)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {filtered.length === 0 && (
                  <div className="text-center py-12 text-gray-400 text-sm">
                    No connections match your search.
                  </div>
                )}
              </div>
            ),
          },
          {
            value: "chamas",
            label: "My Chamas",
            content: (
              <div className="space-y-4">
                {myChamas.map((chama) => {
                  const members = db.members.filter((m) => m.chamaId === chama.id);
                  return (
                    <div key={chama.id} className="card-hover p-5">
                      <div className="flex items-center justify-between mb-4">
                        <Link to={`/chamas/${chama.id}`} className="flex items-center gap-3 group">
                          <Avatar src={chama.logoUrl} name={chama.name} size="md" ring="brand" />
                          <div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors">
                              {chama.name}
                            </p>
                            <p className="text-xs text-gray-400">{members.length} members · {chama.location}</p>
                          </div>
                        </Link>
                        <Badge variant={chama.status === "active" ? "success" : "default"} dot>{chama.status}</Badge>
                      </div>
                      <div className="flex -space-x-2">
                        {members.slice(0, 8).map((m) => (
                          <Avatar key={m.id} src={m.avatarUrl} name={m.fullName} size="xs" ring="white" />
                        ))}
                        {members.length > 8 && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-white/[0.06] text-[10px] font-bold text-gray-400 ring-2 ring-white dark:ring-neutral-950">
                            +{members.length - 8}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ),
          },
          {
            value: "privacy",
            label: "Privacy",
            content: (
              <div className="max-w-lg space-y-5">
                <div className="card-hover p-6 space-y-5">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Lock className="h-4 w-4 text-brand-500" /> Privacy Settings
                  </h3>
                  {[
                    { key: "showConnections" as const, label: "Show my connections", desc: "Other members can see who I'm connected with" },
                    { key: "showTransactionHistory" as const, label: "Show transaction history", desc: "Visible to chama administrators" },
                    { key: "showContributionAmount" as const, label: "Show contribution amounts", desc: "Other members can see how much I contribute" },
                    { key: "showLoanDetails" as const, label: "Show loan details", desc: "Loan amounts and status visible to chama mates" },
                    { key: "showInvestmentDetails" as const, label: "Show investment details", desc: "My investments visible to fellow members" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                      </div>
                      <Switch
                        checked={privacy[item.key]}
                        onChange={(v) => {
                          setPrivacy({ ...privacy, [item.key]: v });
                          toast.success(`${item.label}: ${v ? "Enabled" : "Disabled"}`);
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="card-hover p-6">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Profile Visibility</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "public" as const, label: "Public", desc: "Anyone", icon: Eye },
                      { value: "chama_only" as const, label: "Chama Only", desc: "Members only", icon: Users },
                      { value: "private" as const, label: "Private", desc: "Just you", icon: EyeOff },
                    ].map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => { setPrivacy({ ...privacy, profileVisibility: opt.value }); toast.success(`Profile set to ${opt.label}`); }}
                          className={`card-hover p-4 text-center transition-all ${
                            privacy.profileVisibility === opt.value
                              ? "border-brand-500 bg-brand-50/50 dark:bg-brand-500/[0.06] ring-2 ring-brand-500/20"
                              : ""
                          }`}
                        >
                          <Icon className={`h-5 w-5 mx-auto mb-1.5 ${
                            privacy.profileVisibility === opt.value ? "text-brand-500" : "text-gray-400"
                          }`} />
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">{opt.label}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{opt.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
