import { create } from "zustand";
import type { Investment } from "@/types";
import { getMockDatabase } from "@/mock";

interface InvestmentState {
  investments: Investment[];
}

export const useInvestmentStore = create<InvestmentState>(() => ({
  investments: getMockDatabase().investments,
}));
