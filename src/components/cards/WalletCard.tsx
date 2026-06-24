import { Wallet, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import type { Wallet as WalletType } from "@/types";

export function WalletCard({ wallet }: { wallet: WalletType }) {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-800 to-accent-900 p-6 text-white shadow-glow-xl">
      {/* Decorative elements */}
      <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/[0.06] blur-3xl" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-brand-400/[0.08] blur-2xl" />
      <div className="absolute top-4 right-4 h-24 w-24 rounded-full border border-white/[0.04]" />
      <div className="absolute bottom-4 right-12 h-16 w-16 rounded-full border border-white/[0.04]" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.12] backdrop-blur-sm">
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <p className="text-sm font-medium text-brand-100">Wallet Balance</p>
        </div>
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="rounded-lg p-1.5 text-brand-200 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <p className="relative mt-3 text-4xl font-extrabold tracking-tight">
        {showBalance ? formatCurrency(wallet.balance, wallet.currency) : "KES •••••••"}
      </p>

      <div className="relative mt-6 grid grid-cols-3 gap-2">
        {[
          { label: "Pending", value: formatCurrency(wallet.pendingBalance, wallet.currency) },
          { label: "Total Deposits", value: formatCurrency(wallet.totalDeposits, wallet.currency) },
          { label: "Withdrawals", value: formatCurrency(wallet.totalWithdrawals, wallet.currency) },
        ].map((item) => (
          <div key={item.label} className="rounded-xl bg-white/[0.06] backdrop-blur-sm px-3 py-2.5">
            <p className="text-[10px] font-medium text-brand-200/70 uppercase tracking-wider">{item.label}</p>
            <p className="text-xs font-semibold text-white mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
