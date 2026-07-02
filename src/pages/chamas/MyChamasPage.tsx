import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, UserPlus, HandCoins, Building2, AlertCircle } from "lucide-react";
import { ChamaCard } from "@/components/cards/ChamaCard";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/common/SearchInput";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { ContributeModal } from "@/components/payments/ContributeModal";
import { useGroupStore } from "@/stores/groupStore";
import { useSearch } from "@/hooks/useSearch";
import { usePagination } from "@/hooks/usePagination";
import { listMyChamas, type ChamaDTO } from "@/api/chama";
import type { Chama, Group, MpesaAccount } from "@/types";

const USER_MPESA: MpesaAccount[] = [
  { id: "mp_1", userId: "usr_1", phoneNumber: "+254712345678", isDefault: true, isVerified: true, lastUsed: new Date().toISOString() },
];

interface ChamaWithRole extends Chama {
  myRole: string | null;
  myCustomTitle: string | null;
}

function dtoToChama(c: ChamaDTO): ChamaWithRole {
  return {
    id: c.id,
    name: c.name,
    description: c.description ?? "",
    category: c.category,
    logoUrl: c.logoUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=059669&color=fff&size=128`,
    memberCount: c.memberCount ?? 0,
    totalFunds: Number(c.totalFunds ?? 0),
    monthlyContribution: Number(c.monthlyContribution ?? 0),
    createdAt: c.createdAt,
    nextMeetingDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    growthRate: 0,
    status: (c.status as Chama["status"]) ?? "active",
    location: c.location ?? "",
    myRole: c.myRole ?? null,
    myCustomTitle: c.myCustomTitle ?? null,
  };
}

const ROLE_FILTERS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All" },
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "chairperson", label: "Chairperson" },
  { value: "treasurer", label: "Treasurer" },
  { value: "secretary", label: "Secretary" },
  { value: "member", label: "Member" },
];

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/[0.08] dark:text-purple-400 dark:border-purple-500/20",
  admin: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/[0.08] dark:text-blue-400 dark:border-blue-500/20",
  chairperson: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/[0.08] dark:text-amber-400 dark:border-amber-500/20",
  treasurer: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/[0.08] dark:text-emerald-400 dark:border-emerald-500/20",
  secretary: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/[0.08] dark:text-cyan-400 dark:border-cyan-500/20",
  member: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-white/[0.05] dark:text-gray-300 dark:border-white/[0.08]",
};

function chamaToGroup(c: Chama): Group {
  return {
    id: c.id,
    kind: "chama",
    visibility: "private",
    status: "active",
    name: c.name,
    slug: c.id,
    description: c.description,
    logoUrl: c.logoUrl,
    location: c.location,
    tags: [],
    createdAt: c.createdAt,
    updatedAt: c.createdAt,
    memberCount: c.memberCount,
    totalFunds: c.totalFunds,
    requireKyc: false,
    allowDiscovery: false,
    category: c.category,
    monthlyContribution: c.monthlyContribution,
  };
}

export default function MyChamasPage() {
  const groupById = useGroupStore((s) => s.byId);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["chamas", "mine"],
    queryFn: () => listMyChamas({ page: 1, pageSize: 50 }),
  });

  const chamas = useMemo<ChamaWithRole[]>(() => (data?.items ?? []).map(dtoToChama), [data]);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const { query, setQuery, results } = useSearch(chamas, ["name", "location", "category"]);
  const filteredByRole = useMemo(
    () => (roleFilter === "all" ? results : results.filter((c) => c.myRole === roleFilter)),
    [results, roleFilter]
  );
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of chamas) {
      const r = c.myRole ?? "member";
      counts[r] = (counts[r] ?? 0) + 1;
    }
    return counts;
  }, [chamas]);
  const { page, totalPages, paginated, goToPage } = usePagination(filteredByRole, 9);
  const [payTarget, setPayTarget] = useState<Group | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Chamas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isLoading ? "Loading chamas..." : `${chamas.length} chamas across the platform`}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/chamas/join"><Button variant="outline" leftIcon={<UserPlus className="h-4 w-4" />}>Join Chama</Button></Link>
          <Link to="/chamas/create"><Button leftIcon={<Plus className="h-4 w-4" />}>Create Chama</Button></Link>
        </div>
      </div>

      <SearchInput value={query} onChange={setQuery} placeholder="Search chamas by name, location..." />

      <div className="flex flex-wrap gap-1.5">
        {ROLE_FILTERS.map((f) => {
          const count = f.value === "all" ? chamas.length : roleCounts[f.value] ?? 0;
          if (f.value !== "all" && count === 0) return null;
          const active = roleFilter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setRoleFilter(f.value)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${
                active
                  ? "bg-brand-600 text-white border-brand-600 shadow-glow-sm"
                  : (f.value !== "all" && ROLE_COLORS[f.value]) || "bg-white dark:bg-white/[0.03] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/[0.08] hover:border-brand-400"
              }`}
            >
              {f.label}
              <span className={`inline-flex items-center justify-center rounded-full h-4 min-w-[16px] px-1 text-[10px] font-bold ${active ? "bg-white/25 text-white" : "bg-gray-200 dark:bg-white/[0.08] text-gray-700 dark:text-gray-300"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-base p-5 space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-white/[0.06]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-2/3 rounded bg-gray-200 dark:bg-white/[0.06]" />
                  <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-white/[0.06]" />
                </div>
              </div>
              <div className="h-3 w-full rounded bg-gray-200 dark:bg-white/[0.06]" />
              <div className="h-8 w-full rounded bg-gray-200 dark:bg-white/[0.06]" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={AlertCircle}
          title="Could not load chamas"
          description="Something went wrong fetching your chamas. Please try again."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : paginated.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No chamas yet"
          description="No chamas yet - create your first one to get started."
          actionLabel="Create Chama"
          onAction={() => { window.location.href = "/chamas/create"; }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginated.map((chama) => (
              <div key={chama.id} className="flex flex-col gap-2">
                {chama.myRole && (
                  <div className={`inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${ROLE_COLORS[chama.myRole] ?? ROLE_COLORS.member}`}>
                    {chama.myCustomTitle ? `${chama.myCustomTitle} · ${chama.myRole}` : chama.myRole}
                  </div>
                )}
                <ChamaCard chama={chama} />
                <Button
                  variant="premium"
                  size="sm"
                  leftIcon={<HandCoins className="h-3.5 w-3.5" />}
                  onClick={() => setPayTarget(groupById(chama.id) ?? chamaToGroup(chama))}
                  className="w-full"
                >
                  Contribute
                </Button>
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
        </>
      )}

      {payTarget && (
        <ContributeModal
          isOpen={!!payTarget}
          onClose={() => setPayTarget(null)}
          mode="contribute"
          group={payTarget}
          mpesaAccounts={USER_MPESA}
          suggestedAmount={
            payTarget.kind === "chama" || payTarget.kind === "savings_loan"
              ? payTarget.monthlyContribution
              : undefined
          }
        />
      )}
    </div>
  );
}
