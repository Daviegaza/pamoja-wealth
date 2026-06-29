import { ChartCard } from "@/components/charts/ChartCard";
import { ContributionGrowthChart } from "@/components/charts/ContributionGrowthChart";
import { InvestmentGrowthChart } from "@/components/charts/InvestmentGrowthChart";
import { CashFlowChart } from "@/components/charts/CashFlowChart";
import { LoanDistributionChart } from "@/components/charts/LoanDistributionChart";
import { MemberGrowthChart } from "@/components/charts/MemberGrowthChart";
import { RevenueTrendsChart } from "@/components/charts/RevenueTrendsChart";
import { PortfolioAllocationChart } from "@/components/charts/PortfolioAllocationChart";
import { StatCard } from "@/components/cards/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Activity, BarChart3, TrendingUp, Users, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AnalyticsPage() {
  const analytics = useAnalytics();

  const isEmpty =
    analytics.contributionGrowth.length === 0 &&
    analytics.investmentGrowth.length === 0 &&
    analytics.cashFlow.length === 0 &&
    analytics.loanDistribution.length === 0 &&
    analytics.memberGrowth.length === 0 &&
    analytics.revenueTrends.length === 0 &&
    analytics.portfolioAllocation.length === 0;

  if (isEmpty) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform-wide performance and trends across all chamas.</p>
        </div>
        <EmptyState icon={BarChart3} title="No analytics data yet" description="Start contributing to see your chama's analytics." />
      </div>
    );
  }

  const totalRevenue = analytics.revenueTrends.reduce((s, r) => s + r.revenue, 0);
  const revenueChange =
    analytics.revenueTrends.length >= 2
      ? Number(
          (
            ((analytics.revenueTrends[analytics.revenueTrends.length - 1].revenue -
              analytics.revenueTrends[0].revenue) /
              analytics.revenueTrends[0].revenue) *
            100
          ).toFixed(1)
        )
      : 0;

  const lastIdx = analytics.memberGrowth.length - 1;
  const memberGrowthRate =
    analytics.memberGrowth.length >= 2
      ? Number(
          (
            ((analytics.memberGrowth[lastIdx].count - analytics.memberGrowth[lastIdx - 1].count) /
              analytics.memberGrowth[lastIdx - 1].count) *
            100
          ).toFixed(1)
        )
      : 0;

  const investIdx = analytics.investmentGrowth.length - 1;
  const avgRoi =
    analytics.investmentGrowth.length >= 2
      ? Number(
          (
            ((analytics.investmentGrowth[investIdx].amount - analytics.investmentGrowth[0].amount) /
              analytics.investmentGrowth[0].amount) *
            (100 / analytics.investmentGrowth.length)
          ).toFixed(1)
        )
      : 14.6;

  const contribIdx = analytics.contributionGrowth.length - 1;
  const activeEngagement =
    analytics.contributionGrowth.length >= 2
      ? Number(
          (
            ((analytics.contributionGrowth[contribIdx].amount - analytics.contributionGrowth[0].amount) /
              analytics.contributionGrowth[0].amount) *
              50 +
            50
          ).toFixed(1)
        )
      : 86.2;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform-wide performance and trends across all chamas.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} change={revenueChange} icon={Wallet} />
        <StatCard label="Member Growth" value={`+${memberGrowthRate}%`} change={memberGrowthRate} icon={Users} iconColor="text-purple-600 bg-purple-50 dark:bg-purple-500/10" />
        <StatCard label="Avg ROI" value={`${avgRoi}%`} change={avgRoi} icon={TrendingUp} iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" />
        <StatCard label="Active Engagement" value={`${activeEngagement}%`} change={activeEngagement} icon={Activity} iconColor="text-blue-600 bg-blue-50 dark:bg-blue-500/10" />
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
