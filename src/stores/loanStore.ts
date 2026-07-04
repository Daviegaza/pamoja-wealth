import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Loan, Transaction } from "@/types";
import { getMockDatabase } from "@/mock";
import {
  listLoans as apiList,
  createLoan as apiCreate,
  approveLoan as apiApprove,
  rejectLoan as apiReject,
  repayLoan as apiRepay,
  type LoanDTO,
} from "@/api/loans";

import { USE_MOCKS } from "@/lib/env";
void USE_MOCKS;

interface LoanState {
  loans: Loan[];
  isLoading: boolean;
  sync: (params?: { chamaId?: string; status?: string }) => Promise<void>;
  applyForLoan: (loan: Omit<Loan, "id" | "status" | "amountRepaid">) => Promise<void>;
  approveLoan: (id: string) => Promise<void>;
  rejectLoan: (id: string) => Promise<void>;
  repay: (id: string, amount: number) => Promise<void>;
}

let onNewTransaction: ((tx: Transaction) => void) | null = null;
export function setLoanTransactionListener(fn: (tx: Transaction) => void) {
  onNewTransaction = fn;
}

function mapDto(l: LoanDTO): Loan {
  return {
    id: l.id,
    chamaId: l.chamaId,
    borrowerId: l.borrowerId,
    amount: l.amount,
    interestRate: l.interestRate,
    termMonths: l.termMonths,
    amountRepaid: l.amountRepaid,
    purpose: l.purpose,
    status: l.status as Loan["status"],
    appliedDate: l.appliedDate,
    approvedDate: l.approvedDate,
    dueDate: l.dueDate,
  } as Loan;
}

export const useLoanStore = create<LoanState>()(
  persist(
    (set, get) => ({
      loans: getMockDatabase().loans,
      isLoading: false,

      sync: async (params) => {
        if (USE_MOCKS) return;
        set({ isLoading: true });
        try {
          const { items } = await apiList(params as any);
          set({ loans: items.map(mapDto) });
        } catch (err) {
          console.warn("[loanStore] sync failed", err);
        } finally {
          set({ isLoading: false });
        }
      },

      applyForLoan: async (loan) => {
        const optimistic: Loan = { ...loan, id: `loan_${Date.now()}`, status: "pending", amountRepaid: 0 };
        set({ loans: [optimistic, ...get().loans] });
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

        if (USE_MOCKS) return;

        try {
          const created = await apiCreate({
            chamaId: loan.chamaId,
            amount: loan.amount,
            termMonths: loan.termMonths,
            purpose: loan.purpose,
          });
          const real = mapDto(created);
          set({ loans: get().loans.map((l) => (l.id === optimistic.id ? real : l)) });
        } catch (err) {
          set({ loans: get().loans.filter((l) => l.id !== optimistic.id) });
          throw err;
        }
      },

      approveLoan: async (id) => {
        const prev = get().loans;
        set({
          loans: prev.map((l) =>
            l.id === id ? { ...l, status: "approved" as const, approvedDate: new Date().toISOString() } : l,
          ),
        });
        if (USE_MOCKS) return;
        try {
          const updated = await apiApprove(id);
          set({ loans: get().loans.map((l) => (l.id === id ? mapDto(updated) : l)) });
        } catch (err) {
          set({ loans: prev });
          throw err;
        }
      },

      rejectLoan: async (id) => {
        const prev = get().loans;
        set({ loans: prev.map((l) => (l.id === id ? { ...l, status: "rejected" as const } : l)) });
        if (USE_MOCKS) return;
        try {
          const updated = await apiReject(id);
          set({ loans: get().loans.map((l) => (l.id === id ? mapDto(updated) : l)) });
        } catch (err) {
          set({ loans: prev });
          throw err;
        }
      },

      repay: async (id, amount) => {
        const prev = get().loans;
        set({
          loans: prev.map((l) =>
            l.id === id ? { ...l, amountRepaid: l.amountRepaid + amount } : l,
          ),
        });
        if (USE_MOCKS) return;
        try {
          const updated = await apiRepay(id, { amount });
          set({ loans: get().loans.map((l) => (l.id === id ? mapDto(updated) : l)) });
        } catch (err) {
          set({ loans: prev });
          throw err;
        }
      },
    }),
    { name: "pamoja-loans" }
  )
);
