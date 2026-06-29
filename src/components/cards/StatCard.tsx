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
    <motion.div whileHover={{ y: -3 }} className={cn("card-base p-5 group cursor-default relative overflow-hidden before:absolute before:top-0 before:left-4 before:right-4 before:h-0.5 before:rounded-full before:bg-gradient-to-r before:from-brand-500 before:to-transparent", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide uppercase">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl shadow-soft-sm", iconColor)}>
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
