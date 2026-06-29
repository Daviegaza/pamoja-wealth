import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Loan, Transaction } from "@/types";
import { getMockDatabase } from "@/mock";

interface LoanState {
  loans: Loan[];
  applyForLoan: (loan: Omit<Loan, "id" | "status" | "amountRepaid">) => void;
  approveLoan: (id: string) => void;
  rejectLoan: (id: string) => void;
}

let onNewTransaction: ((tx: Transaction) => void) | null = null;
export function setLoanTransactionListener(fn: (tx: Transaction) => void) {
  onNewTransaction = fn;
}

export const useLoanStore = create<LoanState>()(
  persist(
    (set, get) => ({
      loans: getMockDatabase().loans,
      applyForLoan: (loan) => {
        const newLoan: Loan = { ...loan, id: `loan_${Date.now()}`, status: "pending", amountRepaid: 0 };
        set({ loans: [newLoan, ...get().loans] });
        onNewTransaction?.({
          id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          userId: "usr_1",
          type: "loan_disbursement",
          amount: loan.amount,
          date: new Date().toISOString(),
          status: "pending",
          description: `Loan application: ${loan.purpose}`,
          reference: `PW${Math.floor(Math.random() * 900000) + 100000}`,
          balanceAfter: 0,
        });
      },
      approveLoan: (id) =>
        set({
          loans: get().loans.map((l) =>
            l.id === id ? { ...l, status: "approved" as const, approvedDate: new Date().toISOString() } : l
          ),
        }),
      rejectLoan: (id) =>
        set({
          loans: get().loans.map((l) =>
            l.id === id ? { ...l, status: "rejected" as const } : l
          ),
        }),
    }),
    { name: "pamoja-loans" }
  )
);
