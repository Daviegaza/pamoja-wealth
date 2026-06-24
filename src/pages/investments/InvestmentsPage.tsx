import { Plus } from "lucide-react";
import { toast } from "sonner";
import { InvestmentCard } from "@/components/cards/InvestmentCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { PortfolioAllocationChart } from "@/components/charts/PortfolioAllocationChart";
import { InvestmentGrowthChart } from "@/components/charts/InvestmentGrowthChart";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Pagination } from "@/components/common/Pagination";
import { useInvestments } from "@/hooks/useInvestments";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";

export default function InvestmentsPage() {
  const investments = useInvestments();
  const analytics = useAnalytics();
  const { value, setValue, results } = useFilter(investments, "type");
  const { page, totalPages, paginated, goToPage } = usePagination(results, 9);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{investments.length.toLocaleString()} active and historical investments</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => toast.success("New investment opportunity created! Ready for member contributions.")}>New Investment</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Investment Growth"><InvestmentGrowthChart data={analytics.investmentGrowth} /></ChartCard>
        <ChartCard title="Portfolio Allocation"><PortfolioAllocationChart data={analytics.portfolioAllocation} /></ChartCard>
      </div>

      <div className="max-w-xs">
        <Select
          label="Filter by type"
          value={value === "all" ? "all" : value}
          onChange={(e) => setValue(e.target.value as typeof value)}
          options={[
            { label: "All types", value: "all" }, { label: "Real Estate", value: "real_estate" }, { label: "Stocks", value: "stocks" },
            { label: "Bonds", value: "bonds" }, { label: "Treasury Bills", value: "treasury_bills" }, { label: "Money Market", value: "money_market" }, { label: "SACCO", value: "sacco" },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginated.map((inv) => <InvestmentCard key={inv.id} investment={inv} />)}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
    </div>
  );
}
