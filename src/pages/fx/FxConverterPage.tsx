import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { getRates, convert, type Currency, type FxRatesDTO, type FxConvertResult } from "@/api/fx";

import { USE_MOCKS } from "@/lib/env";
const CURRENCIES: Currency[] = ["KES", "UGX", "TZS", "RWF", "NGN", "USD", "EUR", "GBP"];

const MOCK_RATES: FxRatesDTO = {
  base: "KES",
  rates: { KES: 1, UGX: 28.5, TZS: 19.3, RWF: 10.1, NGN: 12.6, USD: 0.0078, EUR: 0.0072, GBP: 0.0061 } as Record<Currency, number>,
  updatedAt: new Date().toISOString(),
};

export default function FxConverterPage() {
  const [rates, setRates] = useState<FxRatesDTO | null>(null);
  const [amount, setAmount] = useState<number>(10000);
  const [from, setFrom] = useState<Currency>("KES");
  const [to, setTo] = useState<Currency>("USD");
  const [result, setResult] = useState<FxConvertResult | null>(null);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    if (USE_MOCKS) { setRates(MOCK_RATES); return; }
    getRates().then(setRates).catch(() => setRates(MOCK_RATES));
  }, []);

  useEffect(() => {
    if (!amount || !from || !to || !rates) return;
    setConverting(true);
    const t = setTimeout(async () => {
      try {
        if (USE_MOCKS) {
          const kesAmount = from === "KES" ? amount : amount / (rates.rates[from] ?? 1);
          const out = kesAmount * (rates.rates[to] ?? 1);
          setResult({ amount: out, currency: to, formatted: `${out.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${to}` });
        } else {
          const r = await convert(amount, from, to);
          setResult(r);
        }
      } catch { toast.error("Rate lookup failed"); }
      finally { setConverting(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [amount, from, to, rates]);

  function swap() { setFrom(to); setTo(from); }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
          <ArrowRightLeft className="h-3.5 w-3.5" /> FX converter
        </div>
        <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">Cross-border rates</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Live rates for diaspora harambees. KES, UGX, TZS, RWF, NGN + majors.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-gray-200/60 dark:border-white/[0.06] bg-white dark:bg-neutral-900/60 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">From</label>
            <div className="mt-1 flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="flex-1 rounded-lg border border-gray-300 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-3 py-3 text-lg font-semibold"
              />
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value as Currency)}
                className="rounded-lg border border-gray-300 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-3 py-3 text-sm font-semibold"
              >
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <Button variant="outline" onClick={swap} aria-label="Swap currencies" className="!p-3">
            <ArrowRightLeft className="h-4 w-4" />
          </Button>

          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">To</label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={converting ? "…" : (result?.amount.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? "")}
                readOnly
                className="flex-1 rounded-lg border border-gray-300 dark:border-white/[0.07] bg-gray-50 dark:bg-white/[0.02] px-3 py-3 text-lg font-semibold"
              />
              <select
                value={to}
                onChange={(e) => setTo(e.target.value as Currency)}
                className="rounded-lg border border-gray-300 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-3 py-3 text-sm font-semibold"
              >
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {result && (
          <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
            1 {from} = {rates ? ((rates.rates[to] ?? 0) / (rates.rates[from] ?? 1)).toFixed(6) : "—"} {to}
          </p>
        )}
      </motion.div>

      {rates && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Snapshot ({rates.base} base)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CURRENCIES.filter((c) => c !== rates.base).map((c) => (
              <div key={c} className="rounded-xl border border-gray-100 dark:border-white/[0.05] bg-white dark:bg-neutral-900/40 p-3">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">{rates.base} → {c}</p>
                <p className="mt-1 text-base font-bold text-gray-900 dark:text-white font-mono">
                  {rates.rates[c]?.toFixed(4) ?? "—"}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-gray-400 dark:text-gray-500">
            Updated {new Date(rates.updatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
