import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, UserPlus, HandCoins, Building2 } from "lucide-react";
import { ChamaCard } from "@/components/cards/ChamaCard";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/common/SearchInput";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { ContributeModal } from "@/components/payments/ContributeModal";
import { useChamaStore } from "@/stores/chamaStore";
import { useGroupStore } from "@/stores/groupStore";
import { useSearch } from "@/hooks/useSearch";
import { usePagination } from "@/hooks/usePagination";
import type { Chama, Group, MpesaAccount } from "@/types";

// Single linked M-Pesa account for the mock layer. Production wires from
// wallet store / auth context.
const USER_MPESA: MpesaAccount[] = [
  { id: "mp_1", userId: "usr_1", phoneNumber: "+254712345678", isDefault: true, isVerified: true, lastUsed: new Date().toISOString() },
];

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
  const chamas = useChamaStore((s) => s.chamas);
  const groupById = useGroupStore((s) => s.byId);
  const { query, setQuery, results } = useSearch(chamas, ["name", "location", "category"]);
  const { page, totalPages, paginated, goToPage } = usePagination(results, 9);

  const [payTarget, setPayTarget] = useState<Group | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Chamas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{chamas.length} chamas across the platform</p>
        </div>
        <div className="flex gap-3">
          <Link to="/chamas/join"><Button variant="outline" leftIcon={<UserPlus className="h-4 w-4" />}>Join Chama</Button></Link>
          <Link to="/chamas/create"><Button leftIcon={<Plus className="h-4 w-4" />}>Create Chama</Button></Link>
        </div>
      </div>

      <SearchInput value={query} onChange={setQuery} placeholder="Search chamas by name, location..." />

      {paginated.length === 0 ? (
        <EmptyState icon={Building2} title="No chamas found" description="Try adjusting your search or create a new chama." />
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
