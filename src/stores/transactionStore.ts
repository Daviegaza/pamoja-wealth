import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Transaction } from "@/types";
import { getMockDatabase } from "@/mock";

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
}

const mockTx = getMockDatabase().transactions;

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: mockTx,
      addTransaction: (tx) => {
        set({ transactions: [{ ...tx, balanceAfter: get().transactions[0]?.balanceAfter ?? 0 }, ...get().transactions] });
      },
    }),
    { name: "pamoja-transactions" }
  )
);

// Wire up cross-module listeners
import { setTransactionListener } from "./walletStore";
import { setLoanTransactionListener } from "./loanStore";

setTransactionListener((tx) => {
  useTransactionStore.getState().addTransaction(tx);
});

setLoanTransactionListener((tx) => {
  useTransactionStore.getState().addTransaction(tx);
});
