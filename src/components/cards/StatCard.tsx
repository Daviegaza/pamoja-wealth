import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn, formatPercent } from "@/lib/utils";

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  iconColor = "icon-gradient-brand",
  className,
  variant: _variant = "default",
}: {
  label: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
  variant?: "default" | "compact";
}) {
  const positive = (change ?? 0) >= 0;

  return (
    <motion.div whileHover={{ y: -3 }} className={cn("card-metric p-5 group cursor-default relative overflow-hidden hover:shadow-premium-lg hover:border-brand-200/60 dark:hover:border-brand-500/20 before:absolute before:top-0 before:left-5 before:right-5 before:h-px before:bg-gradient-to-r before:from-brand-500/60 before:via-brand-400/40 before:to-transparent", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 tracking-[0.08em] uppercase">{label}</p>
          <p className="mt-2 text-[26px] leading-tight font-bold tracking-tight text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl shadow-soft-md ring-1 ring-inset ring-white/10", iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {change !== undefined && (
        <div
          className={cn(
            "mt-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
            positive
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/[0.08] dark:text-emerald-400"
              : "bg-red-50 text-red-600 dark:bg-red-500/[0.08] dark:text-red-400"
          )}
        >
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {formatPercent(change)}
          <span className="font-normal text-gray-400 dark:text-gray-500 ml-0.5">vs last month</span>
        </div>
      )}
    </motion.div>
  );
}
