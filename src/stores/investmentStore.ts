import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Investment } from "@/types";
import { getMockDatabase } from "@/mock";

interface InvestmentState {
  investments: Investment[];
  addInvestment: (data: {
    chamaId: string;
    name: string;
    type: Investment["type"];
    amountInvested: number;
    riskLevel: Investment["riskLevel"];
  }) => void;
}

export const useInvestmentStore = create<InvestmentState>()(
  persist(
    (set, get) => ({
      investments: getMockDatabase().investments,
      addInvestment: (data) =>
        set({
          investments: [
            {
              id: `inv_${Date.now()}`,
              chamaId: data.chamaId,
              name: data.name,
              type: data.type,
              amountInvested: data.amountInvested,
              currentValue: data.amountInvested,
              roi: 0,
              status: "pending",
              startDate: new Date().toISOString().slice(0, 10),
              riskLevel: data.riskLevel,
            },
            ...get().investments,
          ],
        }),
    }),
    { name: "pamoja-investments" }
  )
);
