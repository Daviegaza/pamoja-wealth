import { useMemo, useState } from "react";
import { Plus, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InvestmentCard } from "@/components/cards/InvestmentCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { PortfolioAllocationChart } from "@/components/charts/PortfolioAllocationChart";
import { InvestmentGrowthChart } from "@/components/charts/InvestmentGrowthChart";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/dialogs/Modal";
import { useAnalytics } from "@/hooks/useAnalytics";
import { usePagination } from "@/hooks/usePagination";
import { useChamaStore } from "@/stores/chamaStore";
import {
  listInvestments,
  createInvestment,
  type InvestmentType,
  type RiskLevel,
  type InvestmentDTO,
} from "@/api/investments";
import type { Investment } from "@/types";

const investmentTypes = [
  { label: "Real Estate", value: "real_estate" },
  { label: "Stocks", value: "stocks" },
  { label: "Bonds", value: "bonds" },
  { label: "Treasury Bills", value: "treasury_bills" },
  { label: "Money Market", value: "money_market" },
  { label: "SACCO", value: "sacco" },
] as const;

const riskLevels = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
] as const;

type TypeFilter = InvestmentType | "all";

function extractErrorMessage(err: unknown): string {
  const e = err as {
    response?: { status?: number; data?: { message?: string; error?: string } };
    message?: string;
  };
  const status = e?.response?.status;
  if (status === 403) {
    return "You need treasurer permission to create an investment";
  }
  return (
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    e?.message ||
    "Failed to create investment"
  );
}

export default function InvestmentsPage() {
  const analytics = useAnalytics();
  const activeChamaId = useChamaStore((s) => s.activeChamaId);
  const chamas = useChamaStore((s) => s.chamas);
  const qc = useQueryClient();

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const filters = useMemo(
    () => ({
      chamaId: activeChamaId ?? undefined,
      type: typeFilter === "all" ? undefined : typeFilter,
    }),
    [activeChamaId, typeFilter]
  );

  const investmentsQuery = useQuery({
    queryKey: ["investments", filters],
    queryFn: () => listInvestments(filters),
  });

  const items: InvestmentDTO[] = investmentsQuery.data?.items ?? [];
  const { page, totalPages, paginated, goToPage } = usePagination(items, 9);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "stocks" as InvestmentType,
    amount: "",
    riskLevel: "medium" as RiskLevel,
  });

  const createMutation = useMutation({
    mutationFn: createInvestment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["investments"] });
      setForm({ name: "", type: "stocks", amount: "", riskLevel: "medium" });
      setModalOpen(false);
      toast.success("New investment opportunity created! Ready for member contributions.");
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err));
    },
  });

  const handleCreate = () => {
    if (!form.name || !form.amount) return;
    const chamaId = activeChamaId ?? chamas[0]?.id ?? "";
    if (!chamaId) {
      toast.error("Select a chama before creating an investment");
      return;
    }
    createMutation.mutate({
      chamaId,
      name: form.name,
      type: form.type,
      amountInvested: Number(form.amount),
      riskLevel: form.riskLevel,
      startDate: new Date().toISOString().slice(0, 10),
    });
  };

  const isLoading = investmentsQuery.isLoading;
  const isError = investmentsQuery.isError;
  const total = investmentsQuery.data?.meta?.total ?? items.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {total.toLocaleString()} active and historical investments
          </p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
          New Investment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Investment Growth">
          <InvestmentGrowthChart data={analytics.investmentGrowth} />
        </ChartCard>
        <ChartCard title="Portfolio Allocation">
          <PortfolioAllocationChart data={analytics.portfolioAllocation} />
        </ChartCard>
      </div>

      <div className="max-w-xs">
        <Select
          label="Filter by type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
          options={[
            { label: "All types", value: "all" },
            ...investmentTypes.map((t) => ({ label: t.label, value: t.value })),
          ]}
        />
      </div>

      {isLoading ? (
        <div className="text-sm text-gray-500 dark:text-gray-400 py-10 text-center">
          Loading investments...
        </div>
      ) : isError ? (
        <div className="py-10 text-center space-y-3">
          <p className="text-sm text-red-600 dark:text-red-400">
            Failed to load investments.
          </p>
          <Button variant="secondary" onClick={() => investmentsQuery.refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginated.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <EmptyState
                icon={TrendingUp}
                title="No investments yet"
                description="Start your first investment."
                actionLabel="New Investment"
                onAction={() => setModalOpen(true)}
              />
            </div>
          ) : (
            paginated.map((inv) => (
              <InvestmentCard key={inv.id} investment={inv as unknown as Investment} />
            ))
          )}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Investment"
        description="Create a new investment opportunity for the chama."
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="E.g., Syokimau Land"
          />
          <Select
            label="Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as InvestmentType })}
            options={investmentTypes.map((t) => ({ label: t.label, value: t.value }))}
          />
          <Input
            label="Amount (KSh)"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="50000"
          />
          <Select
            label="Risk Level"
            value={form.riskLevel}
            onChange={(e) => setForm({ ...form, riskLevel: e.target.value as RiskLevel })}
            options={riskLevels.map((r) => ({ label: r.label, value: r.value }))}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Investment"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
