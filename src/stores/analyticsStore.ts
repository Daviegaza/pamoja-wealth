import { create } from "zustand";
import type { Analytics } from "@/types";
import { getMockDatabase } from "@/mock";

interface AnalyticsState {
  analytics: Analytics;
}

export const useAnalyticsStore = create<AnalyticsState>(() => ({
  analytics: getMockDatabase().analytics,
}));
