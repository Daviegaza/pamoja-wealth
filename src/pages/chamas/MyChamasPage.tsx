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

function dtoToChama(c: ChamaDTO): Chama {
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
  };
}

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

  const chamas = useMemo<Chama[]>(() => (data?.items ?? []).map(dtoToChama), [data]);
  const { query, setQuery, results } = useSearch(chamas, ["name", "location", "category"]);
  const { page, totalPages, paginated, goToPage } = usePagination(results, 9);
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
