import { useInvestmentStore } from "@/stores/investmentStore";

export function useInvestments() {
  return useInvestmentStore((s) => s.investments);
}
