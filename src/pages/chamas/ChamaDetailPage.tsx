import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Users, Wallet, Calendar, TrendingUp, ArrowLeft, Settings,
  CreditCard, Landmark, Copy, Check, Building2, HandCoins,
} from "lucide-react";
import { toast } from "sonner";
import { ContributeModal } from "@/components/payments/ContributeModal";
import { useGroupStore } from "@/stores/groupStore";
import type { Chama, Member, MpesaAccount, Role } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useLoans } from "@/hooks/useLoans";
import { useChatStore } from "@/stores/chatStore";
import { StatCard } from "@/components/cards/StatCard";
import { MemberCard, computeTrustScore } from "@/components/cards/MemberCard";
import { ChamaChat } from "@/components/common/ChamaChat";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/dialogs/Modal";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/common/EmptyState";
import { getMockDatabase } from "@/mock";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { motion } from "framer-motion";
import { getChama, getMembers, type ChamaDetail, type ChamaDetailMember } from "@/api/chama";

const MANAGEMENT_ROLES: Role[] = ["owner", "admin", "chairperson"];

function toChama(d: ChamaDetail["chama"], memberCount: number): Chama {
  return {
    id: d.id,
    name: d.name,
    description: d.description ?? "",
    category: d.category,
    logoUrl: d.logoUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name)}&background=059669&color=fff&size=128`,
    memberCount,
    totalFunds: Number(d.totalFunds ?? 0),
    monthlyContribution: Number(d.monthlyContribution ?? 0),
    createdAt: d.createdAt,
    nextMeetingDate: d.nextMeetingDate ?? new Date(Date.now() + 7 * 86400000).toISOString(),
    growthRate: 0,
    status: (d.status as Chama["status"]) ?? "active",
    location: d.location ?? "",
  };
}

function toMember(m: ChamaDetailMember): Member {
  return {
    id: m.id,
    userId: m.userId,
    chamaId: m.chamaId,
    fullName: m.fullName,
    avatarUrl: m.avatarUrl ?? "",
    role: (m.role as Role) ?? "member",
    joinedAt: m.joinedAt,
    totalContributions: Number(m.totalContributions ?? 0),
    shares: m.shares ?? 0,
    status: (m.status as Member["status"]) ?? "active",
    contributionStreak: m.contributionStreak ?? 0,
  };
}

export default function ChamaDetailPage() {
  const { id } = useParams();
  const chamaId = id ?? "";
  const qc = useQueryClient();
  const { user } = useAuth();
  const { loans } = useLoans();

  const detailQuery = useQuery({
    queryKey: ["chamas", "detail", chamaId],
    queryFn: () => getChama(chamaId),
    enabled: !!chamaId,
    retry: false,
  });

  const membersQuery = useQuery({
    queryKey: ["chamas", "members", chamaId],
    queryFn: () => getMembers(chamaId, { page: 1, pageSize: 50 }),
    enabled: !!chamaId,
    retry: false,
  });

  const rawMembers = useMemo(() => {
    if (membersQuery.data?.items?.length) return membersQuery.data.items;
    return detailQuery.data?.members ?? [];
  }, [membersQuery.data, detailQuery.data]);

  const members = useMemo<Member[]>(() => rawMembers.map(toMember), [rawMembers]);
  const chama = useMemo<Chama | null>(() => {
    if (!detailQuery.data?.chama) return null;
    return toChama(detailQuery.data.chama, members.length || (detailQuery.data.chama.memberCount ?? 0));
  }, [detailQuery.data, members.length]);

  const myMembership = members.find((m) => m.userId === user?.id);
  const myRole: Role = myMembership?.role ?? "member";
  const canManage = MANAGEMENT_ROLES.includes(myRole);

  const pendingLoans = loans.filter((l) => l.chamaId === chamaId && l.status === "pending");

  const chatMessages = useChatStore((s) => s.messages);
  const sendMessage = useChatStore((s) => s.sendMessage);

  const dbUsers = getMockDatabase().users;
  const verifiedUserIds = new Set(dbUsers.filter((u) => u.isVerified).map((u) => u.id));

  const [manageOpen, setManageOpen] = useState(false);
  const [contributeOpen, setContributeOpen] = useState(false);
  const groupForPayment = useGroupStore((s) => (chamaId ? s.byId(chamaId) : undefined));
  const userMpesa: MpesaAccount[] = [
    { id: "mp_1", userId: user?.id ?? "usr_1", phoneNumber: "+254712345678", isDefault: true, isVerified: true, lastUsed: new Date().toISOString() },
  ];
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editContribution, setEditContribution] = useState("");
  const [editLocation, setEditLocation] = useState("");

  const [inviteCode, setInviteCode] = useState("");
  const [inviteCopied, setInviteCopied] = useState(false);

  useEffect(() => {
    const code = `PW-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setInviteCode(code);
  }, []);

  const copyInviteCode = async () => {
    await navigator.clipboard.writeText(inviteCode);
    setInviteCopied(true);
    toast.success("Invite code copied!");
  };

  if (detailQuery.isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-40 rounded bg-gray-200 dark:bg-white/[0.06]" />
        <div className="card-base p-6 flex gap-5">
          <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-white/[0.06]" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-1/3 rounded bg-gray-200 dark:bg-white/[0.06]" />
            <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-white/[0.06]" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-base p-5 h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (detailQuery.isError || !chama) {
    return (
      <EmptyState
        icon={Building2}
        title="Chama not found"
        description="This chama may have been removed, archived, or you may not have access."
        actionLabel="Back to Chamas"
        onAction={() => window.history.back()}
      />
    );
  }

  const openManage = () => {
    setEditName(chama.name);
    setEditDescription(chama.description);
    setEditContribution(String(chama.monthlyContribution));
    setEditLocation(chama.location);
    setManageOpen(true);
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      toast.error("Chama name is required.");
      return;
    }
    const monthly = parseInt(editContribution);
    if (!monthly || monthly < 100) {
      toast.error("Monthly contribution must be at least KES 100.");
      return;
    }
    await qc.invalidateQueries({ queryKey: ["chamas", "detail", chamaId] });
    toast.success("Chama settings updated.");
    setManageOpen(false);
  };

  const tabs: TabItem[] = [];

  if (myMembership) {
    tabs.push({
      value: "chat",
      label: "Chat",
      content: (
        <ChamaChat
          chamaId={chamaId}
          messages={chatMessages.filter((m) => m.chamaId === chamaId)}
          onSend={(content) => {
            if (!user) return;
            sendMessage({
              chamaId,
              userId: user.id,
              userName: user.fullName,
              userAvatar: user.avatarUrl,
              content,
            });
          }}
          currentUser={{
            id: user?.id ?? "",
            name: user?.fullName ?? "",
            avatar: user?.avatarUrl ?? "",
          }}
        />
      ),
    });
  }

  tabs.push(
    {
      value: "members",
      label: "Members",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {members.length > 0 ? members.slice(0, 10).map((m) => (
            <MemberCard key={m.id} member={m} trustScore={computeTrustScore(m, loans, verifiedUserIds.has(m.userId))} />
          )) : (
            <p className="text-sm text-gray-400 col-span-2 py-8 text-center">No members yet.</p>
          )}
        </div>
      ),
    },
    {
      value: "about",
      label: "About",
      content: (
        <div className="card-hover p-6 max-w-2xl">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">About this Chama</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{chama.description}</p>
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Category</p>
              <p className="font-semibold text-gray-900 dark:text-white mt-0.5 capitalize">{chama.category}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Location</p>
              <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{chama.location}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Created</p>
              <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{new Date(chama.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Next Meeting</p>
              <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{new Date(chama.nextMeetingDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      ),
    }
  );

  if (canManage) {
    tabs.push({
      value: "management",
      label: "Management",
      content: (
        <div className="space-y-6 max-w-3xl">
          <div className="grid sm:grid-cols-3 gap-4">
            <Link to="/treasury" className="card-hover p-4 hover:border-brand-300 dark:hover:border-brand-500/30 transition-all group">
              <Landmark className="h-5 w-5 text-brand-500 mb-2" />
              <p className="text-xs text-gray-400 uppercase tracking-wider">Treasury</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{formatCurrency(chama.totalFunds)}</p>
              <span className="text-xs text-brand-600 dark:text-brand-400 font-medium group-hover:underline mt-1 inline-block">View treasury &rarr;</span>
            </Link>
            <Link to="/loans" className="card-hover p-4 hover:border-brand-300 dark:hover:border-brand-500/30 transition-all group">
              <CreditCard className="h-5 w-5 text-amber-500 mb-2" />
              <p className="text-xs text-gray-400 uppercase tracking-wider">Pending Loans</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{pendingLoans.length}</p>
              <span className="text-xs text-brand-600 dark:text-brand-400 font-medium group-hover:underline mt-1 inline-block">Review loans &rarr;</span>
            </Link>
            <div className="card-hover p-4">
              <Users className="h-5 w-5 text-blue-500 mb-2" />
              <p className="text-xs text-gray-400 uppercase tracking-wider">Members</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{chama.memberCount}</p>
              <Link to="/members" className="text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline mt-1 inline-block">Manage members &rarr;</Link>
            </div>
          </div>

          {pendingLoans.length > 0 && (
            <div className="card-hover p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-amber-500" /> Pending Loan Approvals
              </h3>
              <div className="space-y-2">
                {pendingLoans.slice(0, 5).map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-white/[0.04] p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{loan.borrowerName}</p>
                      <p className="text-xs text-gray-400">{formatCurrency(loan.amount)} &middot; {loan.purpose}</p>
                    </div>
                    <Badge variant="warning" className="text-[10px]">Pending</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button variant="outline" size="sm" leftIcon={<Settings className="h-3.5 w-3.5" />} onClick={openManage}>
            Edit Chama Settings
          </Button>

          <div className="card-hover p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Share Invite</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Share this invite code with new members to join this chama.</p>
            <div className="flex items-center gap-3 mb-3">
              <code className="flex-1 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.03] px-4 py-2 text-sm font-mono font-bold text-brand-600 dark:text-brand-400 tracking-wider select-all">
                {inviteCode}
              </code>
              <Button leftIcon={inviteCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} onClick={copyInviteCode} variant="secondary" size="sm">
                {inviteCopied ? "Copied" : "Copy"}
              </Button>
            </div>
            <a
              href={`https://wa.me/?text=${encodeURIComponent("Join my chama on Pamoja Wealth! Use invite code: " + inviteCode)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors w-full"
            >
              Share via WhatsApp
            </a>
          </div>
        </div>
      ),
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <Link
          to="/chamas"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Chamas
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant={canManage ? "brand" : "default"} className="capitalize text-[11px]">
            {myRole.replace("_", " ")}
          </Badge>
          {myMembership && (
            <Button
              variant="premium"
              size="sm"
              leftIcon={<HandCoins className="h-3.5 w-3.5" />}
              onClick={() => setContributeOpen(true)}
            >
              Contribute
            </Button>
          )}
          {canManage && (
            <Button variant="outline" size="sm" leftIcon={<Settings className="h-3.5 w-3.5" />} onClick={openManage}>
              Manage
            </Button>
          )}
        </div>
      </div>

      <div className="card-hover p-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <Avatar src={chama.logoUrl} name={chama.name} size="xl" ring="brand" />
        <div className="flex-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{chama.name}</h1>
            <Badge variant={chama.status === "active" ? "success" : "default"} dot={chama.status === "active"} className="capitalize">
              {chama.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{chama.description}</p>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <Badge variant="brand" className="capitalize">{chama.category}</Badge>
            <span className="text-xs text-gray-400">&middot;</span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{chama.location}</span>
            <span className="text-xs text-gray-400">&middot;</span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{chama.memberCount} members</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Funds" value={formatCurrency(chama.totalFunds)} icon={Wallet} />
        <StatCard label="Members" value={String(chama.memberCount)} icon={Users} iconColor="icon-gradient-blue" />
        <StatCard label="Growth Rate" value={formatPercent(chama.growthRate)} icon={TrendingUp} iconColor="icon-gradient-emerald" />
        <StatCard label="Monthly Contribution" value={formatCurrency(chama.monthlyContribution)} icon={Calendar} iconColor="icon-gradient-purple" />
      </div>

      <Tabs items={tabs} />

      <Modal isOpen={manageOpen} onClose={() => setManageOpen(false)} title="Manage Chama" description="Edit your chama settings.">
        <div className="space-y-4">
          <Input label="Chama Name" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Chama name" />
          <Input label="Description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="What is this chama about?" />
          <Input label="Monthly Contribution (KES)" type="number" value={editContribution} onChange={(e) => setEditContribution(e.target.value)} />
          <Input label="Location" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="City, Country" />
          <Button className="w-full" variant="premium" onClick={handleSave}>Save Changes</Button>
        </div>
      </Modal>

      {groupForPayment ? (
        <ContributeModal
          isOpen={contributeOpen}
          onClose={() => setContributeOpen(false)}
          mode="contribute"
          group={groupForPayment}
          mpesaAccounts={userMpesa}
          suggestedAmount={chama.monthlyContribution}
        />
      ) : (
        <ContributeModal
          isOpen={contributeOpen}
          onClose={() => setContributeOpen(false)}
          mode="contribute"
          group={{
            id: chama.id,
            kind: "chama",
            visibility: "private",
            status: "active",
            name: chama.name,
            slug: chama.id,
            description: chama.description,
            logoUrl: chama.logoUrl,
            location: chama.location,
            tags: [],
            createdAt: chama.createdAt,
            updatedAt: chama.createdAt,
            memberCount: chama.memberCount,
            totalFunds: chama.totalFunds,
            requireKyc: false,
            allowDiscovery: false,
            category: chama.category,
            monthlyContribution: chama.monthlyContribution,
          }}
          mpesaAccounts={userMpesa}
          suggestedAmount={chama.monthlyContribution}
        />
      )}
    </motion.div>
  );
}
