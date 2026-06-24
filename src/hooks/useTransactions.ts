import { useTransactionStore } from "@/stores/transactionStore";

export function useTransactions() {
  return useTransactionStore((s) => s.transactions);
}
