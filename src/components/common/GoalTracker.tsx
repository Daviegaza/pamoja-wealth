import { motion } from "framer-motion";
import { Plus, X, Target } from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { Goal } from "@/stores/goalStore";

interface GoalTrackerProps {
  goals: Goal[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}

function daysRemaining(targetDate: string): number {
  const diff = new Date(targetDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export function GoalTracker({ goals, onAdd, onDelete }: GoalTrackerProps) {
  if (goals.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-hover p-5 text-center"
      >
        <div className="flex flex-col items-center py-6">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-500/[0.06] dark:to-brand-400/[0.04]"
          >
            <Target className="h-5 w-5 text-brand-500 dark:text-brand-400" />
          </motion.div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">No goals yet</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-[200px] mx-auto leading-relaxed">
            Set a savings goal to track your progress
          </p>
          <button
            onClick={onAdd}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-soft-sm hover:from-brand-700 hover:to-brand-600 transition-all active:scale-[0.97]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Goal
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="card-hover p-5 relative overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute top-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-brand-500 via-brand-400 to-transparent opacity-50" />

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Target className="h-4 w-4 text-brand-500" />
          Savings Goals
        </h3>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-lg bg-brand-50 dark:bg-brand-500/[0.08] px-2.5 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-500/[0.12] transition-colors"
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => {
          const pct = goal.targetAmount > 0
            ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
            : 0;
          const remaining = daysRemaining(goal.targetDate);
          const isComplete = goal.currentAmount >= goal.targetAmount;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="group rounded-xl border border-gray-100 dark:border-white/[0.04] p-3 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors relative"
            >
              <button
                onClick={() => onDelete(goal.id)}
                className="absolute right-2 top-2 rounded-lg p-1 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/[0.08] transition-all"
                aria-label={`Delete ${goal.name}`}
              >
                <X className="h-3 w-3" />
              </button>

              <div className="flex items-center justify-between mb-1.5 pr-6">
                <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                  {goal.name}
                </span>
                <span className={cn(
                  "text-xs font-bold shrink-0 ml-2",
                  isComplete ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white"
                )}>
                  {pct.toFixed(0)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden mb-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "h-full rounded-full transition-colors",
                    isComplete
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                      : "bg-gradient-to-r from-brand-500 to-accent-500"
                  )}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                <span>
                  {isComplete
                    ? "Complete!"
                    : `${remaining} day${remaining !== 1 ? "s" : ""} left`}
                </span>
              </div>

              {!isComplete && goal.targetDate && (
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Target: {formatDate(goal.targetDate)}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
