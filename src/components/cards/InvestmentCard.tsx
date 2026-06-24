import type { Investment } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import { Building2, Landmark, LineChart, PiggyBank, TrendingUp, Wallet2 } from "lucide-react";
import { motion } from "framer-motion";

const typeIcon: Record<Investment["type"], typeof Building2> = {
  real_estate: Building2,
  stocks: LineChart,
  bonds: Landmark,
  treasury_bills: Landmark,
  money_market: PiggyBank,
  sacco: Wallet2,
};

const iconGradients: Record<Investment["type"], string> = {
  real_estate: "icon-gradient-amber",
  stocks: "icon-gradient-blue",
  bonds: "icon-gradient-cyan",
  treasury_bills: "icon-gradient-emerald",
  money_market: "icon-gradient-purple",
  sacco: "icon-gradient-brand",
};

const statusVariant: Record<Investment["status"], "success" | "default" | "warning" | "info"> = {
  active: "success",
  matured: "info",
  closed: "default",
  pending: "warning",
};

export function InvestmentCard({ investment }: { investment: Investment }) {
  const Icon = typeIcon[investment.type];
  const positive = investment.roi >= 0;

  return (
    <motion.div whileHover={{ y: -2 }} className="card-hover p-5 group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl shadow-soft-sm", iconGradients[investment.type])}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {investment.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{investment.type.replace("_", " ")}</p>
          </div>
        </div>
        <Badge variant={statusVariant[investment.status]} dot={investment.status === "active"} className="capitalize">
          {investment.status}
        </Badge>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Invested</p>
          <p className="text-base font-bold text-gray-900 dark:text-white">{formatCurrency(investment.amountInvested)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Current Value</p>
          <p className="text-base font-bold text-gray-900 dark:text-white">{formatCurrency(investment.currentValue)}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5",
            positive
              ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/[0.08]"
              : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/[0.08]"
          )}
        >
          <TrendingUp className="h-3 w-3" /> {formatPercent(investment.roi)} ROI
        </span>
        <Badge variant="default" className="capitalize">{investment.riskLevel} risk</Badge>
      </div>
    </motion.div>
  );
}
