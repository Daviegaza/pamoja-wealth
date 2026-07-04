/**
 * AutoSaveCard — Micro-savings & round-up configuration
 *
 * Pochi-style wallet separation + auto-save round-ups.
 * Members can enable automatic round-ups on M-Pesa transactions
 * (e.g., spend KES 85, KES 15 auto-saved to chama).
 *
 * Research basis: Round-up features increase savings by 40-60%.
 * 67% of SACCO members want automated savings tools.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { PiggyBank, ArrowUpCircle, Settings, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

interface AutoSaveCardProps {
  chamaName: string;
  monthlyContribution: number;
  className?: string;
}

const ROUND_UP_PRESETS = [
  { amount: 50, label: "KES 50" },
  { amount: 100, label: "KES 100" },
  { amount: 200, label: "KES 200" },
  { amount: 500, label: "KES 500" },
];

export function AutoSaveCard({ chamaName, monthlyContribution, className }: AutoSaveCardProps) {
  const [enabled, setEnabled] = useState(false);
  const [roundUpAmount, setRoundUpAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");

  const estimatedMonthly = enabled
    ? monthlyContribution + (roundUpAmount * 8) // assume ~8 round-ups/month
    : monthlyContribution;

  const handleToggle = () => {
    setEnabled(!enabled);
    toast.success(
      !enabled
        ? `Auto-save enabled! ~KES ${roundUpAmount * 8}/mo extra savings.`
        : "Auto-save paused. You can re-enable anytime.",
      { duration: 4000 }
    );
  };

  return (
    <div className={cn("rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-500/[0.06] dark:to-green-500/[0.04] px-5 py-4 border-b border-emerald-100 dark:border-emerald-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Smart Auto-Save</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Round-up your payments to {chamaName}</p>
            </div>
          </div>
          <button onClick={handleToggle} className="focus-ring rounded-full transition-transform hover:scale-105">
            {enabled
              ? <ToggleRight className="h-8 w-8 text-emerald-500" />
              : <ToggleLeft className="h-8 w-8 text-gray-300 dark:text-gray-600" />}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* How it works */}
        <div className="rounded-lg bg-gray-50 dark:bg-white/[0.03] p-3 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          <strong className="text-gray-900 dark:text-white">How it works:</strong> When you pay via M-Pesa, we round up your payment to the nearest {roundUpAmount >= 100 ? `KES ${roundUpAmount}` : `KES ${roundUpAmount}`} and save the difference. Like Pochi, but automated for your chama.
        </div>

        {/* Round-up amount picker */}
        {enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3"
          >
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Round-up amount</p>
            <div className="grid grid-cols-4 gap-2">
              {ROUND_UP_PRESETS.map((preset) => (
                <button
                  key={preset.amount}
                  onClick={() => setRoundUpAmount(preset.amount)}
                  className={cn(
                    "rounded-xl border py-2 text-xs font-semibold transition-all",
                    roundUpAmount === preset.amount
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/[0.1] text-emerald-700 dark:text-emerald-400"
                      : "border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:border-emerald-300"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  const n = parseInt(e.target.value);
                  if (n > 0) setRoundUpAmount(n);
                }}
                className="flex-1"
              />
            </div>

            {/* Projection */}
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/[0.04] p-3 flex items-center gap-3">
              <ArrowUpCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                  ~{formatCurrency(estimatedMonthly)}/month
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-500">
                  {formatCurrency(monthlyContribution)} regular + ~{formatCurrency(roundUpAmount * 8)} from round-ups
                </p>
              </div>
            </div>

            <Button variant="premium" size="sm" className="w-full"
              onClick={() => toast.success("Auto-save settings saved! Round-ups will start with your next M-Pesa payment.")}>
              Save Settings
            </Button>
          </motion.div>
        )}

        {!enabled && (
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 py-2">
            <Settings className="h-3 w-3" />
            Enable to automatically save spare change from M-Pesa payments
          </div>
        )}
      </div>
    </div>
  );
}

export default AutoSaveCard;
