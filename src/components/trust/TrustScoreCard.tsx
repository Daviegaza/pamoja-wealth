import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp, Award, AlertCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export interface TrustScoreBreakdown {
  contributionStreakMonths: number;
  onTimePaymentRate: number;
  disputeCount: number;
  kycTier: 0 | 1 | 2 | 3;
  chamasActive: number;
  yearsOnPlatform: number;
}

export interface TrustScoreCardProps {
  score: number;
  breakdown: TrustScoreBreakdown;
  compact?: boolean;
}

function scoreBand(score: number): { label: string; color: string; ringColor: string } {
  if (score >= 850) return { label: "Elite", color: "text-emerald-600 dark:text-emerald-400", ringColor: "stroke-emerald-500" };
  if (score >= 700) return { label: "Strong", color: "text-brand-600 dark:text-brand-400", ringColor: "stroke-brand-500" };
  if (score >= 550) return { label: "Fair", color: "text-amber-600 dark:text-amber-400", ringColor: "stroke-amber-500" };
  if (score >= 400) return { label: "Building", color: "text-orange-600 dark:text-orange-400", ringColor: "stroke-orange-500" };
  return { label: "New", color: "text-gray-600 dark:text-gray-400", ringColor: "stroke-gray-400" };
}

export function TrustScoreCard({ score, breakdown, compact }: TrustScoreCardProps) {
  const band = scoreBand(score);
  const pct = Math.max(0, Math.min(100, ((score - 300) / (950 - 300)) * 100));
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div className="rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-white dark:bg-neutral-900/60 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" /> Trust score
          </div>
          <h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">Portable credit passport</h3>
        </div>
        <Badge variant="default" title="Ledger-derived, cryptographically signed">
          <Info className="h-3 w-3 mr-1" />v1
        </Badge>
      </div>

      <div className="flex items-center gap-6">
        {/* Ring */}
        <div className="relative h-32 w-32 shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="54" className="stroke-gray-100 dark:stroke-white/[0.05]" strokeWidth="10" fill="none" />
            <motion.circle
              cx="60"
              cy="60"
              r="54"
              className={band.ringColor}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-gray-900 dark:text-white tabular-nums">{score}</span>
            <span className={`text-xs font-semibold ${band.color}`}>{band.label}</span>
          </div>
        </div>

        {!compact && (
          <div className="flex-1 min-w-0 space-y-2">
            <ScoreRow icon={TrendingUp} label="On-time payments" value={`${Math.round(breakdown.onTimePaymentRate * 100)}%`} />
            <ScoreRow icon={Award} label="Streak" value={`${breakdown.contributionStreakMonths} months`} />
            <ScoreRow icon={ShieldCheck} label="KYC tier" value={`Tier ${breakdown.kycTier}`} />
            {breakdown.disputeCount > 0 && (
              <ScoreRow icon={AlertCircle} label="Disputes" value={`${breakdown.disputeCount}`} bad />
            )}
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/[0.05] text-xs text-gray-500 dark:text-gray-400">
        Portable across chamas. Shareable to SACCOs, banks, and insurers you authorise.
      </div>
    </div>
  );
}

function ScoreRow({ icon: Icon, label, value, bad }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; bad?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Icon className={`h-3.5 w-3.5 ${bad ? "text-red-500" : "text-brand-500"}`} />
        <span>{label}</span>
      </div>
      <span className={`text-sm font-semibold tabular-nums ${bad ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>{value}</span>
    </div>
  );
}
