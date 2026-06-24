import { ChartCard } from "@/components/charts/ChartCard";
import { ContributionGrowthChart } from "@/components/charts/ContributionGrowthChart";
import { InvestmentGrowthChart } from "@/components/charts/InvestmentGrowthChart";
import { CashFlowChart } from "@/components/charts/CashFlowChart";
import { LoanDistributionChart } from "@/components/charts/LoanDistributionChart";
import { MemberGrowthChart } from "@/components/charts/MemberGrowthChart";
import { RevenueTrendsChart } from "@/components/charts/RevenueTrendsChart";
import { PortfolioAllocationChart } from "@/components/charts/PortfolioAllocationChart";
import { StatCard } from "@/components/cards/StatCard";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Activity, TrendingUp, Users, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AnalyticsPage() {
  const analytics = useAnalytics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform-wide performance and trends across all chamas.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatCurrency(1_840_000)} change={6.2} icon={Wallet} />
        <StatCard label="Member Growth" value="+18.4%" change={18.4} icon={Users} iconColor="text-purple-600 bg-purple-50 dark:bg-purple-500/10" />
        <StatCard label="Avg ROI" value="14.6%" change={2.1} icon={TrendingUp} iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" />
        <StatCard label="Active Engagement" value="86.2%" change={3.4} icon={Activity} iconColor="text-blue-600 bg-blue-50 dark:bg-blue-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Contribution Growth"><ContributionGrowthChart data={analytics.contributionGrowth} /></ChartCard>
        <ChartCard title="Investment Growth"><InvestmentGrowthChart data={analytics.investmentGrowth} /></ChartCard>
        <ChartCard title="Cash Flow"><CashFlowChart data={analytics.cashFlow} /></ChartCard>
        <ChartCard title="Loan Distribution"><LoanDistributionChart data={analytics.loanDistribution} /></ChartCard>
        <ChartCard title="Member Growth"><MemberGrowthChart data={analytics.memberGrowth} /></ChartCard>
        <ChartCard title="Revenue Trends"><RevenueTrendsChart data={analytics.revenueTrends} /></ChartCard>
        <ChartCard title="Portfolio Allocation" className="lg:col-span-2"><PortfolioAllocationChart data={analytics.portfolioAllocation} /></ChartCard>
      </div>
    </div>
  );
}
