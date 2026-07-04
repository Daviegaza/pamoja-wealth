import { motion } from "framer-motion";
import { Flame, Gift, TrendingUp, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
  contributionGoal: number;
  nextMilestone: number;
  onContribute: () => void;
}

export function StreakCard({
  currentStreak,
  longestStreak,
  totalContributions,
  contributionGoal,
  nextMilestone,
  onContribute,
}: StreakCardProps) {
  const pct = Math.min(100, Math.round((totalContributions / contributionGoal) * 100));
  const _streakDays = Array.from({ length: 7 }, (_, i) => i < currentStreak % 7);
  void _streakDays;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 rounded-xl p-3 border border-amber-200/50 dark:border-amber-800/30"
    >
      {/* Header + weekly grid on one row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
              {currentStreak}-day streak 🔥
            </p>
            <p className="text-[10px] text-gray-500 leading-tight">Best {longestStreak}d · Goal {totalContributions}/{contributionGoal}</p>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
            <div
              key={i}
              className={cn(
                "w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold",
                i < currentStreak % 7
                  ? "bg-amber-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400",
              )}
            >
              {i < currentStreak % 7 ? <Star className="w-2.5 h-2.5" /> : day}
            </div>
          ))}
        </div>
        {currentStreak >= 7 && (
          <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1 bg-amber-200 dark:bg-amber-900/50 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* Milestone + CTA on one row */}
      <div className="mt-2 flex items-center justify-between gap-2">
        {nextMilestone > currentStreak ? (
          <p className="text-[10px] text-amber-700 dark:text-amber-400 inline-flex items-center gap-1 min-w-0 truncate">
            <Gift className="w-3 h-3 shrink-0" />
            {nextMilestone - currentStreak}d to <b>{nextMilestone}d reward</b>
          </p>
        ) : <span />}
        <Button onClick={onContribute} className="shrink-0" variant="premium" size="sm" leftIcon={<TrendingUp className="w-3 h-3" />}>
          Contribute
        </Button>
      </div>
    </motion.div>
  );
}
