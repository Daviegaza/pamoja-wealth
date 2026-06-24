import { getMockDatabase } from "@/mock";
import type { Loan } from "@/types";

export const loanService = {
  async list(): Promise<Loan[]> {
    await new Promise((r) => setTimeout(r, 300));
    return getMockDatabase().loans;
  },
};
