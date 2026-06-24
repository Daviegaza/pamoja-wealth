import { useAnalyticsStore } from "@/stores/analyticsStore";

export function useAnalytics() {
  return useAnalyticsStore((s) => s.analytics);
}
