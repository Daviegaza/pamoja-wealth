import { useWalletStore } from "@/stores/walletStore";

export function useWallet() {
  const { wallet, history, deposit, withdraw } = useWalletStore();
  return { wallet, history, deposit, withdraw };
}
