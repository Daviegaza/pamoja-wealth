import { create } from "zustand";
import type { Analytics } from "@/types";
import { getMockDatabase } from "@/mock";
import { USE_MOCKS } from "@/lib/env";
import { fetchAnalytics, type AnalyticsData } from "@/api/analytics";

function mapApiToAnalytics(data: AnalyticsData): Analytics {
  return {
    contributionGrowth: (data.contributionGrowth ?? []).map((d: any) => ({
      month: d.month ?? "",
      amount: d.amount ?? d.value ?? 0,
    })),
    investmentGrowth: (data.investmentGrowth ?? []).map((d: any) => ({
      month: d.month ?? "",
      amount: d.amount ?? d.value ?? 0,
    })),
    cashFlow: (data.cashFlow ?? []).map((d: any) => ({
      month: d.month ?? "",
      inflow: d.inflow ?? 0,
      outflow: d.outflow ?? 0,
    })),
    loanDistribution: (data.loanDistribution ?? []).map((d: any) => ({
      category: d.name ?? d.category ?? "",
      value: d.value ?? 0,
    })),
    memberGrowth: (data.memberGrowth ?? []).map((d: any) => ({
      month: d.month ?? "",
      count: d.count ?? d.amount ?? 0,
    })),
    revenueTrends: (data.revenueTrends ?? []).map((d: any) => ({
      month: d.month ?? "",
      revenue: d.revenue ?? d.inflow ?? 0,
    })),
    portfolioAllocation: (data.portfolioAllocation ?? []).map((d: any) => ({
      name: d.name ?? d.category ?? "",
      value: d.value ?? 0,
    })),
  };
}

interface AnalyticsState {
  analytics: Analytics;
  isLoading: boolean;
  error: string | null;
  loadFromApi: (chamaId?: string) => Promise<void>;
}

// Seed with mock data as fallback, then load from API if available
const initialMock = getMockDatabase().analytics;

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  analytics: USE_MOCKS ? initialMock : {
    contributionGrowth: [],
    investmentGrowth: [],
    cashFlow: [],
    loanDistribution: [],
    memberGrowth: [],
    revenueTrends: [],
    portfolioAllocation: [],
    },
  isLoading: false,
  error: null,

  loadFromApi: async (chamaId?: string) => {
    if (USE_MOCKS) return;
    set({ isLoading: true, error: null });
    try {
      const data = await fetchAnalytics(chamaId ? { chamaId } : undefined);
      set({ analytics: mapApiToAnalytics(data), isLoading: false });
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message ?? err?.message ?? "Failed to load analytics";
      set({ error: msg, isLoading: false });
      // Keep mock data as fallback in dev
      if (get().analytics.contributionGrowth.length === 0) {
        set({ analytics: initialMock });
      }
    }
  },
}));

// Auto-load from API on module init
if (typeof window !== "undefined" && !USE_MOCKS) {
  setTimeout(() => useAnalyticsStore.getState().loadFromApi(), 200);
}
