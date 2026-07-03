import { motion } from "framer-motion";
import { Flame, Gift, TrendingUp, Calendar, ArrowRight, Star, Trophy } from "lucide-react";
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
  const streakDays = Array.from({ length: 7 }, (_, i) => i < currentStreak % 7);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 rounded-2xl p-6 border border-amber-200/50 dark:border-amber-800/30"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
            <Flame className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
              {currentStreak} Day Streak! 🔥
            </h3>
            <p className="text-xs text-gray-500">Best: {longestStreak} days</p>
          </div>
        </div>
        {currentStreak >= 7 && (
          <Trophy className="w-6 h-6 text-amber-500 animate-pulse" />
        )}
      </div>

      {/* Weekly Streak Grid */}
      <div className="flex gap-1.5 mb-4">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
          <div key={i} className="flex-1 text-center">
            <div
              className={cn(
                "w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                i < currentStreak % 7
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400",
              )}
            >
              {i < currentStreak % 7 ? <Star className="w-3 h-3" /> : day}
            </div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Monthly goal</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {totalContributions} / {contributionGoal} contributions
          </span>
        </div>
        <div className="h-2 bg-amber-200 dark:bg-amber-900/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Next Milestone */}
      {nextMilestone > currentStreak && (
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 rounded-lg px-3 py-2">
          <Gift className="w-3.5 h-3.5" />
          <span>
            {nextMilestone - currentStreak} more days to unlock{" "}
            <strong>{nextMilestone}-day streak reward!</strong>
          </span>
        </div>
      )}

      {/* CTA */}
      <Button onClick={onContribute} className="w-full mt-4 gap-2" variant="premium">
        <TrendingUp className="w-4 h-4" />
        Contribute Now — Keep the Streak Alive!
      </Button>
    </motion.div>
  );
}
