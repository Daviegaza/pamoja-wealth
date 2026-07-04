/**
 * Multi-currency wallet chips.
 *
 * Reads GET /wallet/balances and renders a horizontally scrollable row of
 * currency badges. Empty when the caller has only a KES account (silence
 * on the main dashboard).
 */
import { useQuery } from "@tanstack/react-query";
import { Globe } from "lucide-react";
import { api } from "@/api/axios";

interface Envelope<T> { success: true; data: T; }
interface Row { currency: string; balance: string }

async function fetchBalances(): Promise<Row[]> {
  const r = await api.get<Envelope<Row[]>>("/wallet/balances");
  return r.data.data;
}

function formatBalance(currency: string, raw: string): string {
  const n = Number(raw);
  if (!Number.isFinite(n)) return `${currency} 0`;
  return `${currency} ${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function MultiCurrencyChips() {
  const q = useQuery({
    queryKey: ["wallet-balances-multi"],
    queryFn: fetchBalances,
    staleTime: 60_000,
    retry: false,
  });

  const rows = q.data ?? [];
  const nonEmpty = rows.filter((r) => Number(r.balance) !== 0);
  if (nonEmpty.length <= 1) return null;

  return (
    <div className="card-base p-4">
      <div className="flex items-center gap-2 mb-2">
        <Globe className="h-4 w-4 text-brand-500" />
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Balances by currency</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {nonEmpty.map((r) => (
          <span
            key={r.currency}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-gray-50 dark:bg-white/[0.04] text-gray-900 dark:text-white border border-gray-100 dark:border-white/[0.06]"
          >
            <span className="font-mono">{r.currency}</span>
            <span className="text-gray-500">·</span>
            <span>{formatBalance(r.currency, r.balance).replace(`${r.currency} `, "")}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
