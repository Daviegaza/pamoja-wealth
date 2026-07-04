import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Wallet, WalletHistoryPoint, Transaction } from "@/types";
import { getMockDatabase } from "@/mock";
import {
  getWallet as apiGetWallet,
  getHistory as apiGetHistory,
  deposit as apiDeposit,
  withdraw as apiWithdraw,
  type DepositMethod,
  type WithdrawMethod,
} from "@/api/wallet";

import { USE_MOCKS } from "@/lib/env";
void USE_MOCKS;

interface WalletState {
  wallet: Wallet;
  history: WalletHistoryPoint[];
  isLoading: boolean;
  lastSyncedAt: string | null;
  sync: () => Promise<void>;
  deposit: (amount: number, method?: DepositMethod, chamaId?: string) => Promise<void>;
  withdraw: (amount: number, method?: WithdrawMethod, destination?: string) => Promise<void>;
}

const seedHistory = getMockDatabase().walletHistory;
const initialWallet: Wallet = {
  id: "wal_1",
  userId: "usr_1",
  balance: seedHistory[seedHistory.length - 1]?.balance ?? 50000,
  currency: "KES",
  pendingBalance: 12500,
  totalDeposits: 1245000,
  totalWithdrawals: 320000,
  lastTransactionAt: new Date().toISOString(),
};

function createTx(type: Transaction["type"], amount: number, desc: string, ref?: string): Transaction {
  return {
    id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId: "usr_1",
    type,
    amount,
    date: new Date().toISOString(),
    status: "completed",
    description: desc,
    reference: ref ?? `PW${Math.floor(Math.random() * 900000) + 100000}`,
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
      history: seedHistory,
      isLoading: false,
      lastSyncedAt: null,

      sync: async () => {
        if (USE_MOCKS) return;
        set({ isLoading: true });
        try {
          const [walletDto, historyDto] = await Promise.all([
            apiGetWallet(),
            apiGetHistory({ days: 90 }),
          ]);
          set({
            wallet: {
              id: walletDto.id,
              userId: walletDto.userId,
              balance: walletDto.balance,
              currency: walletDto.currency,
              pendingBalance: walletDto.pendingBalance,
              totalDeposits: walletDto.totalDeposits,
              totalWithdrawals: walletDto.totalWithdrawals,
              lastTransactionAt: walletDto.lastTransactionAt ?? new Date().toISOString(),
            },
            history: historyDto,
            lastSyncedAt: new Date().toISOString(),
          });
        } catch (err) {
          console.warn("[walletStore] sync failed, keeping local state", err);
        } finally {
          set({ isLoading: false });
        }
      },

      deposit: async (amount, method = "mpesa", chamaId) => {
        // Optimistic local mutation
        const prev = get().wallet;
        const optimistic: Wallet = {
          ...prev,
          balance: prev.balance + amount,
          totalDeposits: prev.totalDeposits + amount,
          lastTransactionAt: new Date().toISOString(),
        };
        set({
          wallet: optimistic,
          history: [...get().history, { date: new Date().toISOString(), balance: optimistic.balance }],
        });
        const tx = createTx("contribution", amount, `${method === "mpesa" ? "M-Pesa" : method === "bank" ? "Bank" : "Card"} deposit`);
        onNewTransaction?.(tx);

        if (USE_MOCKS) return;

        try {
          const result = await apiDeposit({ amount, method, chamaId });
          set({
            wallet: { ...get().wallet, balance: result.wallet.balance },
          });
        } catch (err) {
          // Rollback
          set({ wallet: prev });
          throw err;
        }
      },

      withdraw: async (amount, method = "bank", destination = "") => {
        const prev = get().wallet;
        if (prev.balance < amount) throw new Error("Insufficient balance");

        const optimistic: Wallet = {
          ...prev,
          balance: prev.balance - amount,
          totalWithdrawals: prev.totalWithdrawals + amount,
          lastTransactionAt: new Date().toISOString(),
        };
        set({
          wallet: optimistic,
          history: [...get().history, { date: new Date().toISOString(), balance: optimistic.balance }],
        });
        const tx = createTx("withdrawal", -amount, `${method === "bank" ? "Bank" : "M-Pesa"} withdrawal`);
        onNewTransaction?.(tx);

        if (USE_MOCKS) return;

        try {
          const result = await apiWithdraw({ amount, method, destination });
          set({ wallet: { ...get().wallet, balance: result.wallet.balance } });
        } catch (err) {
          set({ wallet: prev });
          throw err;
        }
      },
    }),
    { name: "pamoja-wallet" }
  )
);
