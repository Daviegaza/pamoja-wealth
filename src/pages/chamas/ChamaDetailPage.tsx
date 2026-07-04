import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, Wallet, Calendar, TrendingUp, ArrowLeft, Settings,
  CreditCard, Landmark, Copy, Check, Building2, HandCoins, QrCode,
  PiggyBank, BarChart3, ShieldAlert, LandmarkIcon, Download,
} from "lucide-react";
import { toast } from "sonner";
import { ContributeModal } from "@/components/payments/ContributeModal";
import { useGroupStore } from "@/stores/groupStore";
import type { Chama, Member, MpesaAccount, Role } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useLoans } from "@/hooks/useLoans";
import { getChatMessages, sendChatMessage } from "@/api/chat";
import { StatCard } from "@/components/cards/StatCard";
import { MemberCard, computeTrustScore } from "@/components/cards/MemberCard";
import { ChamaChat } from "@/components/common/ChamaChat";
import { LedgerAuditPanel } from "@/components/chama/LedgerAuditPanel";
import { CapTablePanel } from "@/components/chama/CapTablePanel";
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
import { QRCodeSVG } from "qrcode.react";
import { getChama, getMembers, updateChama, updateMemberRole, inviteToChama, removeMemberFromChama, listJoinRequests, decideJoinRequest, listDonations, type ChamaDetail, type ChamaDetailMember, type ChamaRole } from "@/api/chama";
import { USE_MOCKS } from "@/lib/env";
import { useSocketEvent } from "@/lib/socket";

const MANAGEMENT_ROLES: Role[] = ["owner", "admin", "chairperson"];
const TREASURY_ROLES: Role[] = ["owner", "admin", "treasurer"];

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
    // @ts-expect-error preserve type for fundraiser/pot detection
    type: (d as any).type ?? "chama",
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
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") ?? undefined;
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
  const canTreasury = TREASURY_ROLES.includes(myRole);

  // ── ALL hooks must be before any conditional returns (Rules of Hooks) ──
  const [showQR, setShowQR] = useState(false);
  const chamaShareUrl = `https://pamojawealth.app/chamas/${chamaId}`;

  // Real-time donation updates via WebSocket
  const [liveDonations, setLiveDonations] = useState<Array<{ id: string; donorName: string; amount: number; timestamp: string }>>([]);
  useSocketEvent<{ transactionId: string; groupId?: string; amount: number; mpesaReceipt: string; completedAt: string; donorName?: string }>(
    "payment:completed",
    (p) => {
      if (!p || p.groupId !== chamaId) return;
      setLiveDonations((prev) => [{
        id: p.transactionId,
        donorName: p.donorName ?? "Anonymous Donor",
        amount: p.amount,
        timestamp: p.completedAt,
      }, ...prev].slice(0, 20));
      qc.invalidateQueries({ queryKey: ["chamas", "detail", chamaId] });
      qc.invalidateQueries({ queryKey: ["chamas", "members", chamaId] });
    }
  );

  // Fetch donations (always called — returns empty for non-fundraisers)
  const donationsQuery = useQuery({
    queryKey: ["chamas", "donations", chamaId],
    queryFn: () => listDonations(chamaId, 1, 50),
    enabled: !!chamaId,
    refetchInterval: 10_000,
  });

  // Use type preserved in the mapped chama object (added in toChama above)
  const isFundraiser = (chama as any)?.type === "fundraiser";
  const isPot = (chama as any)?.type === "pot";

  const pendingLoans = loans.filter((l) => l.chamaId === chamaId && l.status === "pending");

  const chatQuery = useQuery({
    queryKey: ["chat", "messages", chamaId],
    queryFn: () => getChatMessages(chamaId),
    enabled: !!chamaId,
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });
  const chatMessages = (chatQuery.data ?? []).map((m) => ({
    id: m.id,
    chamaId: m.chamaId,
    userId: m.userId,
    userName: m.userName,
    userAvatar: m.userAvatar ?? "",
    content: m.content,
    timestamp: m.createdAt,
  }));
  const sendChatMutation = useMutation({
    mutationFn: (content: string) => sendChatMessage(chamaId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat", "messages", chamaId] }),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error(msg || "Failed to send message.");
    },
  });

  const dbUsers = USE_MOCKS ? getMockDatabase().users : [];
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
  const [editPaybill, setEditPaybill] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteMethod, setInviteMethod] = useState<"phone" | "email" | "username" | "link">("phone");
  const [inviteValue, setInviteValue] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteResult, setInviteResult] = useState<{ link: string; inviteCode?: string } | null>(null);

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

  const joinRequestsQuery = useQuery({
    queryKey: ["chamas", "join-requests", chamaId],
    queryFn: () => listJoinRequests(chamaId),
    enabled: !!chamaId,
    retry: false,
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => removeMemberFromChama(chamaId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chamas", "detail", chamaId] });
      qc.invalidateQueries({ queryKey: ["chamas", "members", chamaId] });
      toast.success("Member removed.");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error(msg || "Failed to remove member.");
    },
  });

  const decideJoinRequestMutation = useMutation({
    mutationFn: ({ requestId, decision }: { requestId: string; decision: "approved" | "rejected" }) =>
      decideJoinRequest(chamaId, requestId, decision),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chamas", "join-requests", chamaId] });
      qc.invalidateQueries({ queryKey: ["chamas", "members", chamaId] });
      qc.invalidateQueries({ queryKey: ["chamas", "detail", chamaId] });
      toast.success("Decision saved.");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error(msg || "Failed to save decision.");
    },
  });

  const inviteMutation = useMutation({
    mutationFn: () => inviteToChama(chamaId, {
      method: inviteMethod,
      ...(inviteMethod === "phone" && { phone: inviteValue.trim() }),
      ...(inviteMethod === "email" && { email: inviteValue.trim() }),
      ...(inviteMethod === "username" && { username: inviteValue.trim() }),
      message: inviteMessage.trim() || undefined,
    }),
    onSuccess: (data) => {
      setInviteResult({ link: data.link, inviteCode: data.inviteCode });
      qc.invalidateQueries({ queryKey: ["chamas", "detail", chamaId] });
      toast.success("Invite sent!");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error(msg || "Failed to send invite.");
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role, customTitle }: { userId: string; role: ChamaRole; customTitle?: string | null }) =>
      updateMemberRole(chamaId, userId, role, customTitle),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chamas", "detail", chamaId] });
      qc.invalidateQueries({ queryKey: ["chamas", "members", chamaId] });
      toast.success("Role updated.");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error(msg || "Failed to update role.");
    },
  });

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
    setEditPaybill((chama as unknown as { paybillAccountNumber?: string }).paybillAccountNumber ?? "");
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
    try {
      await updateChama(chamaId, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        monthlyContribution: monthly,
        location: editLocation.trim() || undefined,
        paybillAccountNumber: editPaybill.trim() || undefined,
      });
      await qc.invalidateQueries({ queryKey: ["chamas", "detail", chamaId] });
      await qc.invalidateQueries({ queryKey: ["chamas", "mine"] });
      toast.success("Chama settings updated.");
      setManageOpen(false);
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error(msg || "Failed to update chama.");
    }
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
            if (!user || !content.trim()) return;
            sendChatMutation.mutate(content.trim());
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
        <div className="space-y-4">
          {(myRole === "owner" || myRole === "admin") && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-brand-200/60 dark:border-brand-500/20 bg-brand-50/50 dark:bg-brand-500/[0.04] p-3">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Grow this chama</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Send an invite by phone, email, or share a link.</p>
              </div>
              <Button variant="premium" size="sm" onClick={() => { setInviteResult(null); setInviteOpen(true); }}>
                + Add Member
              </Button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {members.length > 0 ? members.slice(0, 10).map((m) => (
            <div key={m.id} className="space-y-2">
              <MemberCard member={m} trustScore={computeTrustScore(m, loans, verifiedUserIds.has(m.userId))} />
              {(myRole === "owner" || myRole === "admin") && m.userId !== user?.id && m.role !== "owner" && (
                <div className="rounded-xl border border-gray-100 dark:border-white/[0.05] bg-gray-50/40 dark:bg-white/[0.02] p-2 space-y-1.5">
                  <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400">Admin controls</p>
                  <select
                    value={m.role}
                    onChange={(e) => roleMutation.mutate({ userId: m.userId, role: e.target.value as ChamaRole })}
                    disabled={roleMutation.isPending}
                    className="w-full text-xs rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-2 py-1.5 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                  >
                    <option value="member">Member</option>
                    <option value="secretary">Secretary</option>
                    <option value="treasurer">Treasurer</option>
                    <option value="chairperson">Chairperson</option>
                    <option value="admin">Admin</option>
                    {myRole === "owner" && <option value="owner">Promote to Owner</option>}
                  </select>
                  <input
                    type="text"
                    placeholder="Custom title (optional) e.g. Auditor, Advisor…"
                    defaultValue={(m as unknown as { customTitle?: string }).customTitle ?? ""}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      const cur = ((m as unknown as { customTitle?: string }).customTitle ?? "").trim();
                      if (val !== cur) {
                        roleMutation.mutate({ userId: m.userId, role: m.role as ChamaRole, customTitle: val || null });
                      }
                    }}
                    className="w-full text-xs rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-2 py-1.5 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${m.fullName} from ${chama.name}? This cannot be undone.`)) {
                        removeMemberMutation.mutate(m.userId);
                      }
                    }}
                    disabled={removeMemberMutation.isPending}
                    className="w-full text-[11px] font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/[0.08] rounded-lg py-1.5 transition-colors disabled:opacity-50"
                  >
                    Remove Member
                  </button>
                </div>
              )}
            </div>
          )) : (
            <p className="text-sm text-gray-400 col-span-2 py-8 text-center">No members yet.</p>
          )}
          </div>
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

  const pendingRequests: Array<{ id: string; userId: string; fullName?: string; message?: string; createdAt?: string }> = (joinRequestsQuery.data as unknown as Array<{ id: string; userId: string; fullName?: string; message?: string; createdAt?: string }>) ?? [];

  if (canManage) {
    tabs.push({
      value: "ledger",
      label: "Ledger & Audit",
      content: <LedgerAuditPanel chamaId={chamaId} chamaName={chama.name} />,
    });
    tabs.push({
      value: "cap-table",
      label: "Cap Table",
      content: <CapTablePanel chamaId={chamaId} />,
    });
  }

  // Treasury tab — visible to treasurers, admins, and owners
  if (canTreasury) {
    tabs.push({
      value: "treasury",
      label: "Treasury",
      content: (
        <div className="space-y-6 max-w-3xl">
          {/* STK Push / Paybill Info */}
          <div className="card-hover p-5 border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/[0.15]">
                <QrCode className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Contribution methods</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">How members can send money</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02] p-4">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">M-Pesa STK Push</p>
                <p className="text-xs text-gray-500 mb-2">Members get a pop-up on their phone to pay. No paybill number needed.</p>
                <Button size="sm" variant="outline" className="w-full text-xs"
                  onClick={() => setContributeOpen(true)}>
                  Send test STK Push
                </Button>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02] p-4">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Paybill / Till Number</p>
                <p className="text-[11px] text-gray-500 mb-1">Current: <code className="font-mono font-bold text-brand-600 dark:text-brand-400">{(chama as unknown as { paybillAccountNumber?: string }).paybillAccountNumber ?? "Not set"}</code></p>
                <Button size="sm" variant="outline" className="w-full text-xs" onClick={openManage}>
                  Update payment number
                </Button>
              </div>
            </div>
            {showQR && (
              <div className="mt-4 flex flex-col items-center gap-2 rounded-xl bg-white dark:bg-white p-4 shadow-sm border border-gray-100 dark:border-white/[0.06]">
                <QRCodeSVG value={`https://pamojawealth.app/pay/${chamaId}`} size={140} level="M" includeMargin />
                <p className="text-[11px] text-gray-500 text-center">Payment QR — scan to pay into {chama.name}</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/transactions" className="card-hover p-4 hover:border-brand-300 dark:hover:border-brand-500/30 transition-all group">
              <BarChart3 className="h-5 w-5 text-brand-500 mb-2" />
              <p className="text-xs text-gray-400 uppercase tracking-wider">Transactions</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">View all</p>
              <span className="text-xs text-brand-600 dark:text-brand-400 font-medium group-hover:underline mt-1 inline-block">Transaction history &rarr;</span>
            </Link>
            <Link to="/treasury" className="card-hover p-4 hover:border-brand-300 dark:hover:border-brand-500/30 transition-all group">
              <PiggyBank className="h-5 w-5 text-amber-500 mb-2" />
              <p className="text-xs text-gray-400 uppercase tracking-wider">Total Pool</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{formatCurrency(chama.totalFunds)}</p>
              <span className="text-xs text-brand-600 dark:text-brand-400 font-medium group-hover:underline mt-1 inline-block">View treasury &rarr;</span>
            </Link>
            <div className="card-hover p-4">
              <ShieldAlert className="h-5 w-5 text-purple-500 mb-2" />
              <p className="text-xs text-gray-400 uppercase tracking-wider">Audit Status</p>
              <Badge variant="success" dot className="text-[11px] mt-1">Balanced</Badge>
              <p className="text-[11px] text-gray-500 mt-1">All entries verified</p>
            </div>
          </div>
        </div>
      ),
    });
  }

  if (canManage) {
    tabs.push({
      value: "management",
      label: pendingRequests.length > 0 ? `Management · ${pendingRequests.length} pending` : "Management",
      content: (
        <div className="space-y-6 max-w-3xl">
          {pendingRequests.length > 0 && (
            <div className="card-hover p-4 border-l-4 border-l-amber-500">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Pending join requests ({pendingRequests.length})
              </h3>
              <div className="space-y-2">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-gray-50 dark:bg-white/[0.03]">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{req.fullName ?? req.userId}</p>
                      {req.message && <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">"{req.message}"</p>}
                    </div>
                    <button
                      onClick={() => decideJoinRequestMutation.mutate({ requestId: req.id, decision: "approved" })}
                      disabled={decideJoinRequestMutation.isPending}
                      className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-lg px-2.5 py-1 hover:bg-emerald-50 dark:hover:bg-emerald-500/[0.08]"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => decideJoinRequestMutation.mutate({ requestId: req.id, decision: "rejected" })}
                      disabled={decideJoinRequestMutation.isPending}
                      className="text-[11px] font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-lg px-2.5 py-1 hover:bg-red-50 dark:hover:bg-red-500/[0.08]"
                    >
                      Reject
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to={`/rules/builder/${chamaId}`} className="card-hover p-4 hover:border-brand-300 dark:hover:border-brand-500/30 transition-all group border-brand-200/60 dark:border-brand-500/20 bg-gradient-to-br from-brand-50/50 to-transparent dark:from-brand-500/[0.04]">
              <Settings className="h-5 w-5 text-brand-500 mb-2" />
              <p className="text-xs text-gray-400 uppercase tracking-wider">Bylaws</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">Edit rules</p>
              <span className="text-xs text-brand-600 dark:text-brand-400 font-medium group-hover:underline mt-1 inline-block">Open rule builder &rarr;</span>
            </Link>
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

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" leftIcon={<Settings className="h-3.5 w-3.5" />} onClick={openManage}>
              Edit Chama Settings
            </Button>
            <Button variant="premium" size="sm" onClick={() => { setInviteResult(null); setInviteOpen(true); }}>
              + Add Member
            </Button>
          </div>

          <div className="card-hover p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Share Invite</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Share this invite code and QR with new members.</p>

            {/* Invite code */}
            <div className="flex items-center gap-3">
              <code className="flex-1 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.03] px-4 py-2 text-sm font-mono font-bold text-brand-600 dark:text-brand-400 tracking-wider select-all">
                {inviteCode}
              </code>
              <Button leftIcon={inviteCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} onClick={copyInviteCode} variant="secondary" size="sm">
                {inviteCopied ? "Copied" : "Copy"}
              </Button>
            </div>

            {/* QR Code Toggle */}
            <button
              onClick={() => setShowQR(!showQR)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              <QrCode className="h-4 w-4" />
              {showQR ? "Hide QR Code" : "Show QR Code for quick joining"}
            </button>

            {showQR && (
              <div className="flex flex-col items-center gap-3 rounded-xl bg-white dark:bg-white p-4 shadow-sm border border-gray-100 dark:border-white/[0.06]">
                <QRCodeSVG value={chamaShareUrl} size={160} level="M" includeMargin />
                <p className="text-[11px] text-gray-500 text-center">
                  Scan to join <strong className="text-gray-700 dark:text-gray-300">{chama.name}</strong>
                </p>
              </div>
            )}

            <a
              href={`https://wa.me/?text=${encodeURIComponent("Join my chama on Pamoja Wealth! Use invite code: " + inviteCode + " or visit " + chamaShareUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors w-full"
            >
              Share via WhatsApp
            </a>
          </div>
        </div>
      ),
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // POT VIEW — Fast-track money pool. One-click pay, no tabs.
  // ══════════════════════════════════════════════════════════════════
  if (isPot) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto space-y-6">
        <Link to="/chamas" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="card-hover p-8 text-center space-y-5">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-500/[0.15]">
            <HandCoins className="h-8 w-8 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <Badge variant="brand" className="text-xs mb-2">Quick Pot</Badge>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">{chama.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">{chama.description}</p>
          </div>
          <div className="rounded-xl bg-violet-50 dark:bg-violet-500/[0.06] p-5">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount per person</p>
            <p className="text-3xl font-black text-violet-700 dark:text-violet-400">{formatCurrency(chama.monthlyContribution)}</p>
          </div>
          <Button variant="premium" size="xl" className="w-full" onClick={() => setContributeOpen(true)}>
            <HandCoins className="h-5 w-5 mr-2" /> Pay {formatCurrency(chama.monthlyContribution)} Now
          </Button>
          <p className="text-xs text-gray-400">Enter your M-Pesa number, pop-up appears, enter PIN, done.</p>
          {canManage && (
            <Button variant="outline" size="sm" onClick={openManage} className="w-full mt-3">
              <Settings className="h-3.5 w-3.5 mr-2" /> Edit Pot Settings
            </Button>
          )}
        </div>
        <ContributeModal isOpen={contributeOpen} onClose={() => setContributeOpen(false)} mode="contribute"
          group={{ id: chama.id, kind: "pot" as const, visibility: "public" as const, status: "active" as const, name: chama.name, slug: chamaId, description: chama.description, logoUrl: chama.logoUrl, location: chama.location, tags: [], createdAt: chama.createdAt, updatedAt: chama.createdAt, memberCount: chama.memberCount, totalFunds: chama.totalFunds, purpose: chama.description, monthlyContribution: chama.monthlyContribution } as any}
          mpesaAccounts={userMpesa} suggestedAmount={chama.monthlyContribution} />
        <Modal isOpen={manageOpen} onClose={() => setManageOpen(false)} title="Edit Pot" description="Update your pot settings.">
          <div className="space-y-4">
            <Input label="Pot Name" value={editName} onChange={(e: any) => setEditName(e.target.value)} placeholder="Pot name" />
            <Input label="Description" value={editDescription} onChange={(e: any) => setEditDescription(e.target.value)} placeholder="What is this pot for?" />
            <Input label="Amount Per Person (KES)" type="number" value={editContribution} onChange={(e: any) => setEditContribution(e.target.value)} />
            <Input label="Location" value={editLocation} onChange={(e: any) => setEditLocation(e.target.value)} placeholder="City, Country" />
            <Button className="w-full" variant="premium" onClick={handleSave}>Save Changes</Button>
          </div>
        </Modal>
      </motion.div>
    );
  }
  // FUNDRAISER VIEW — GoFundMe style. No membership, no roles, no tabs.
  // Just: QR code → donate → receipt → donor wall.
  // ══════════════════════════════════════════════════════════════════
  if (isFundraiser) {
    const rawChama = (detailQuery.data?.chama ?? {}) as any;
    const fundraiserUrl = `https://pamojawealth.app/c/${chamaId}`;
    const targetAmount = Number(rawChama.targetAmount ?? 0);
    const raisedAmount = Number(rawChama.raisedAmount ?? chama.totalFunds ?? 0);
    const pct = targetAmount > 0
      ? Math.min(100, Math.round((raisedAmount / targetAmount) * 100))
      : 0;

    // Use donations from the top-level query
    const donations = (donationsQuery.data?.items ?? []) as Array<{
      id: string; donorName?: string; amount: number; message?: string;
      isAnonymous?: boolean; createdAt: string; mpesaReceipt?: string;
    }>;

    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Link to="/chamas" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        {/* ── Fundraiser Hero ── */}
        <div className="card-hover p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="warning" className="text-xs">Fundraiser</Badge>
            <Badge variant="brand" className="capitalize text-xs">{chama.category}</Badge>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">{chama.name}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{chama.description}</p>
          <p className="text-xs text-gray-500">{chama.location}</p>

          {/* Progress */}
          {targetAmount > 0 && (
            <div className="space-y-2">
              <div className="h-3 rounded-full bg-gray-200 dark:bg-white/[0.08] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-black text-gray-900 dark:text-white text-lg">{formatCurrency(chama.totalFunds)}</span>
                <span className="text-gray-500">of {formatCurrency(targetAmount)} ({pct}%)</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Share & Donate Card ── */}
        <div className="rounded-2xl border-2 border-amber-300 dark:border-amber-500/30 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/[0.06] dark:to-orange-500/[0.04] p-6 space-y-5">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Share & Get Donations</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Share this fundraiser. Anyone can scan the QR code, tap their phone, enter their M-Pesa PIN, and the money lands instantly. No sign-up needed.
          </p>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* QR Code */}
            <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-5 shadow-sm fundraiser-qr-download">
              <QRCodeSVG value={fundraiserUrl} size={200} level="M" includeMargin />
              <p className="text-xs text-gray-500 text-center font-medium">Scan to donate</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col justify-center gap-3">
              <input
                readOnly
                value={fundraiserUrl}
                className="w-full rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white px-3 py-2.5 text-xs font-mono text-brand-600 select-all text-center"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button variant="premium" size="lg" className="w-full" onClick={() => setContributeOpen(true)}>
                <HandCoins className="h-5 w-5 mr-2" /> Donate Now
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(fundraiserUrl);
                    toast.success("Link copied! Share it anywhere.");
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy Link
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Support "${chama.name}" 💛\n\n${fundraiserUrl}\n\nScan the QR or tap the link to donate. Every bit helps! 🙏`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  WhatsApp
                </a>
              </div>
              <button
                onClick={() => {
                  const svg = document.querySelector('.fundraiser-qr-download svg');
                  if (!svg) return;
                  const svgData = new XMLSerializer().serializeToString(svg);
                  const canvas = document.createElement('canvas');
                  canvas.width = 512; canvas.height = 512;
                  const ctx = canvas.getContext('2d');
                  const img = new Image();
                  img.onload = () => {
                    ctx!.fillStyle = '#ffffff'; ctx!.fillRect(0, 0, 512, 512);
                    ctx!.drawImage(img, 0, 0, 512, 512);
                    const a = document.createElement('a');
                    a.download = `pamoja-${chama.name.replace(/\s/g, '-').toLowerCase()}.png`;
                    a.href = canvas.toDataURL('image/png');
                    a.click();
                    toast.success('QR code saved! Print it, share it anywhere.');
                  };
                  img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-white border border-gray-200 dark:border-white/[0.08] px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> Download QR
              </button>
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-xl bg-white/80 p-4 text-xs text-gray-600 dark:text-gray-400 leading-relaxed space-y-1">
            <p><strong className="text-gray-900 dark:text-white">How donors pay:</strong></p>
            <p>1️⃣ Open the link or scan QR on their phone</p>
            <p>2️⃣ Enter their M-Pesa phone number</p>
            <p>3️⃣ M-Pesa pops up — they enter their PIN</p>
            <p>4️⃣ Money moves instantly. Receipt sent automatically.</p>
            <p className="text-emerald-700 dark:text-emerald-400 font-medium mt-2">✅ No sign-up. No app download. No Paybill. Just a phone number.</p>
          </div>
        </div>

        {/* ── Donations Dashboard ── */}
        <div className="card-hover p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-4 w-4" /> Donations
              {liveDonations.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-500/[0.15] px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Live
                </span>
              )}
            </h3>
            <span className="text-xs text-gray-400">
              {donations.length + liveDonations.length} donation{donations.length + liveDonations.length !== 1 ? "s" : ""}
            </span>
          </div>
          {(liveDonations.length > 0 || members.length > 0) ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.06] text-xs text-gray-400 uppercase tracking-wider">
                    <th className="text-left py-2 font-medium">Donor</th>
                    <th className="text-right py-2 font-medium">Amount</th>
                    <th className="text-right py-2 font-medium hidden sm:table-cell">Receipt</th>
                    <th className="text-right py-2 font-medium hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {liveDonations.slice(0, 10).map((d, i) => (
                    <tr key={d.id} className="border-b border-emerald-100 dark:border-emerald-500/10 last:border-0 bg-emerald-50/30 dark:bg-emerald-500/[0.02]">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar src="" name={d.donorName} size="xs" />
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white text-xs">{d.donorName}</span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 ml-1.5">Just now</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-right font-bold text-emerald-600 dark:text-emerald-400 text-xs tabular-nums">+{formatCurrency(d.amount)}</td>
                      <td className="text-right text-[10px] text-gray-400 font-mono hidden sm:table-cell">{d.id.slice(-8).toUpperCase()}</td>
                      <td className="text-right text-[10px] text-gray-400 hidden md:table-cell">{new Date(d.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                  {donations.filter((d: any) => !liveDonations.some((ld) => ld.id === d.id)).map((d: any) => (
                    <tr key={d.id} className="border-b border-gray-50 dark:border-white/[0.03] last:border-0">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar src="" name={d.isAnonymous ? "Anon" : (d.donorName || "Donor")} size="xs" />
                          <span className="font-medium text-gray-900 dark:text-white text-xs">{d.isAnonymous ? "Anonymous" : (d.donorName || "Supporter")}</span>
                        </div>
                      </td>
                      <td className="text-right font-bold text-gray-700 dark:text-gray-300 text-xs tabular-nums">{formatCurrency(d.amount || 0)}</td>
                      <td className="text-right text-[10px] text-gray-400 font-mono hidden sm:table-cell">{d.mpesaReceipt ? String(d.mpesaReceipt).slice(-8) : "-"}</td>
                      <td className="text-right text-[10px] text-gray-400 hidden md:table-cell">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">No donations yet. Be the first to donate! 🙏</p>
          )}
        </div>

        {/* Owner-only: Edit settings */}
        {canManage && (
          <div className="card-hover p-4">
            <Button variant="outline" size="sm" onClick={openManage} className="w-full">
              <Settings className="h-3.5 w-3.5 mr-2" /> Edit Fundraiser Settings
            </Button>
          </div>
        )}

        {/* Contribute modal — works for anyone (no membership needed) */}
        <ContributeModal
          isOpen={contributeOpen}
          onClose={() => setContributeOpen(false)}
          mode="donate"
          group={{
            id: chama.id,
            kind: "harambee" as const,
            visibility: "public" as const,
            status: "active" as const,
            name: chama.name,
            slug: chamaId,
            description: chama.description,
            logoUrl: chama.logoUrl,
            location: chama.location,
            tags: [],
            createdAt: chama.createdAt,
            updatedAt: chama.createdAt,
            memberCount: chama.memberCount,
            totalFunds: chama.totalFunds,
            cause: "community" as const,
            targetAmount: targetAmount || chama.totalFunds * 2,
            raisedAmount: chama.totalFunds,
            organizerVerified: true,
          } as any}
          mpesaAccounts={userMpesa}
          suggestedAmount={chama.monthlyContribution || 500}
        />

        {/* Manage modal for fundraiser */}
        <Modal isOpen={manageOpen} onClose={() => setManageOpen(false)} title="Edit Fundraiser" description="Update your fundraiser settings.">
          <div className="space-y-4">
            <Input label="Fundraiser Name" value={editName} onChange={(e: any) => setEditName(e.target.value)} placeholder="Fundraiser name" />
            <Input label="Description" value={editDescription} onChange={(e: any) => setEditDescription(e.target.value)} placeholder="What is this fundraiser about?" />
            <Input label="Suggested Donation (KES)" type="number" value={editContribution} onChange={(e: any) => setEditContribution(e.target.value)} />
            <Input label="Location" value={editLocation} onChange={(e: any) => setEditLocation(e.target.value)} placeholder="City, Country" />
            <Input label="M-Pesa Receive Number" value={editPaybill} onChange={(e: any) => setEditPaybill(e.target.value)} placeholder="e.g. 247247 or phone number" hint="Number where donations are received." />
            <Button className="w-full" variant="premium" onClick={handleSave}>Save Changes</Button>
          </div>
        </Modal>
      </motion.div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // CHAMA VIEW — Normal member/role-based layout
  // ══════════════════════════════════════════════════════════════════
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

      <Tabs items={tabs} defaultValue={initialTab} />

      <Modal isOpen={inviteOpen} onClose={() => { setInviteOpen(false); setInviteResult(null); setInviteValue(""); setInviteMessage(""); }} title="Add Member" description="Invite someone to join this chama.">
        {inviteResult ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/[0.08] p-4 text-center">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Invite created!</p>
              {inviteResult.inviteCode && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Code: <code className="font-mono font-bold text-brand-600 dark:text-brand-400">{inviteResult.inviteCode}</code></p>
              )}
            </div>
            <div className="flex gap-2">
              <input readOnly value={inviteResult.link} className="flex-1 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.03] px-3 py-2 text-xs font-mono select-all" />
              <Button size="sm" variant="secondary" onClick={() => { navigator.clipboard.writeText(inviteResult.link); toast.success("Link copied!"); }}>Copy</Button>
            </div>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Join my chama on Pamoja Wealth: ${inviteResult.link}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Share via WhatsApp
            </a>
            <Button variant="outline" className="w-full" onClick={() => { setInviteResult(null); setInviteValue(""); }}>Invite another</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-1.5">
              {(["phone", "email", "username", "link"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setInviteMethod(m); setInviteValue(""); }}
                  className={`rounded-xl px-2 py-2 text-[11px] font-semibold capitalize border transition-colors ${inviteMethod === m ? "border-brand-500 bg-brand-50 dark:bg-brand-500/[0.08] text-brand-700 dark:text-brand-400" : "border-gray-200 dark:border-white/[0.08] text-gray-500 hover:border-brand-300"}`}
                >
                  {m === "link" ? "Share Link" : m}
                </button>
              ))}
            </div>
            {inviteMethod !== "link" && (
              <Input
                label={inviteMethod === "phone" ? "Phone number" : inviteMethod === "email" ? "Email address" : "Username"}
                placeholder={inviteMethod === "phone" ? "+254 7XX XXX XXX" : inviteMethod === "email" ? "user@example.com" : "@username"}
                value={inviteValue}
                onChange={(e) => setInviteValue(e.target.value)}
              />
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Personal note (optional)</label>
              <textarea
                rows={2}
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Hey! Join our savings group…"
                className="w-full rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none resize-none"
              />
            </div>
            <Button
              variant="premium"
              className="w-full"
              onClick={() => inviteMutation.mutate()}
              disabled={inviteMutation.isPending || (inviteMethod !== "link" && !inviteValue.trim())}
            >
              {inviteMutation.isPending ? "Sending…" : inviteMethod === "link" ? "Generate invite link" : `Send invite via ${inviteMethod}`}
            </Button>
          </div>
        )}
      </Modal>

      <Modal isOpen={manageOpen} onClose={() => setManageOpen(false)} title="Manage Chama" description="Edit your chama settings.">
        <div className="space-y-4">
          <Input label="Chama Name" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Chama name" />
          <Input label="Description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="What is this chama about?" />
          <Input label="Monthly Contribution (KES)" type="number" value={editContribution} onChange={(e) => setEditContribution(e.target.value)} />
          <Input label="Location" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="City, Country" />
          <Input label="Paybill / Receive Number" value={editPaybill} onChange={(e) => setEditPaybill(e.target.value)} placeholder="e.g. 247247 or M-Pesa Till number" hint="Number where contributions are received." />
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
