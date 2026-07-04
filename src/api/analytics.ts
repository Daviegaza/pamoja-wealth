/**
 * Analytics API — fetches real analytics from the backend.
 * Used by AnalyticsPage as primary data source when USE_MOCKS=false.
 */

import { api } from "@/api/client";

export interface AnalyticsData {
  contributionGrowth: Array<{ month: string; amount: number }>;
  investmentGrowth: Array<{ month: string; value: number }>;
  cashFlow: Array<{ month: string; inflow: number; outflow: number }>;
  loanDistribution: Array<{ name: string; value: number; status: string }>;
  memberGrowth: Array<{ month: string; count: number }>;
  revenueTrends: Array<{ month: string; revenue: number; expenses: number }>;
  portfolioAllocation: Array<{ name: string; value: number }>;
  totalRevenue: number;
  memberGrowthRate: number;
  avgRoi: number;
  activeEngagement: number;
  periodLabel: string;
}

export async function fetchAnalytics(params?: {
  chamaId?: string;
  period?: "monthly" | "quarterly" | "yearly";
}): Promise<AnalyticsData> {
  const res = await api.get("/analytics", { params });
  const data = res.data?.data ?? res.data;
  return {
    ...data,
    contributionGrowth: data.contributionGrowth ?? [],
    investmentGrowth: data.investmentGrowth ?? [],
    cashFlow: data.cashFlow ?? [],
    loanDistribution: data.loanDistribution ?? [],
    memberGrowth: data.memberGrowth ?? [],
    revenueTrends: data.revenueTrends ?? [],
    portfolioAllocation: data.portfolioAllocation ?? [],
    totalRevenue: data.totalRevenue ?? 0,
    memberGrowthRate: data.memberGrowthRate ?? 0,
    avgRoi: data.avgRoi ?? 0,
    activeEngagement: data.activeEngagement ?? 0,
    periodLabel: data.periodLabel ?? "This month",
  };
}
