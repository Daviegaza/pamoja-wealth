import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Wallet, WalletHistoryPoint, Transaction } from "@/types";
import { getMockDatabase } from "@/mock";

interface WalletState {
  wallet: Wallet;
  history: WalletHistoryPoint[];
  deposit: (amount: number, method?: string) => void;
  withdraw: (amount: number, method?: string) => void;
}

const history = getMockDatabase().walletHistory;
const initialWallet: Wallet = {
  id: "wal_1",
  userId: "usr_1",
  balance: history[history.length - 1]?.balance ?? 50000,
  currency: "KES",
  pendingBalance: 12500,
  totalDeposits: 1245000,
  totalWithdrawals: 320000,
  lastTransactionAt: new Date().toISOString(),
};

function createTx(type: Transaction["type"], amount: number, desc: string): Transaction {
  return {
    id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId: "usr_1",
    type,
    amount,
    date: new Date().toISOString(),
    status: "completed",
    description: desc,
    reference: `PW${Math.floor(Math.random() * 900000) + 100000}`,
    balanceAfter: 0,
  };
}

let onNewTransaction: ((tx: Transaction) => void) | null = null;
export function setTransactionListener(fn: (tx: Transaction) => void) {
  onNewTransaction = fn;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallet: initialWallet,
      history,
      deposit: (amount, method = "mpesa") => {
        const tx = createTx("contribution", amount, `${method === "mpesa" ? "M-Pesa" : "Bank"} deposit`);
        const tx2 = createTx("transfer", amount, "Wallet top-up");
        set({
          wallet: {
            ...get().wallet,
            balance: get().wallet.balance + amount,
            totalDeposits: get().wallet.totalDeposits + amount,
            lastTransactionAt: new Date().toISOString(),
          },
          history: [...get().history, { date: new Date().toISOString(), balance: get().wallet.balance + amount }],
        });
        onNewTransaction?.(tx);
        onNewTransaction?.(tx2);
      },
      withdraw: (amount, method = "bank") => {
        const tx = createTx("withdrawal", -amount, `${method === "bank" ? "Bank" : "M-Pesa"} withdrawal`);
        set({
          wallet: {
            ...get().wallet,
            balance: get().wallet.balance - amount,
            totalWithdrawals: get().wallet.totalWithdrawals + amount,
            lastTransactionAt: new Date().toISOString(),
          },
          history: [...get().history, { date: new Date().toISOString(), balance: get().wallet.balance - amount }],
        });
        onNewTransaction?.(tx);
      },
    }),
    { name: "pamoja-wallet" }
  )
);
