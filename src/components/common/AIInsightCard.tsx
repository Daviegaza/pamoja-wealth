import { Sparkles, TrendingUp, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface AIInsightCardProps {
  insights: string[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
}

export function AIInsightCard({ insights, isLoading, isError, errorMessage }: AIInsightCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 via-white to-accent-50 dark:from-brand-500/[0.04] dark:via-transparent dark:to-accent-500/[0.03] border border-brand-100 dark:border-brand-500/[0.08] p-5 shadow-soft animate-border">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl icon-gradient-brand shadow-glow-sm">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI Insights</h3>
          <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Powered by AI
          </p>
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating insights...</span>
        </div>
      ) : isError ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {errorMessage || "AI is currently unavailable."}
        </p>
      ) : insights.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No insights yet. Check back after your next contribution cycle.
        </p>
      ) : (
        <ul className="space-y-3">
          {insights.map((insight, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="flex gap-2.5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
            >
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              {insight}
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
