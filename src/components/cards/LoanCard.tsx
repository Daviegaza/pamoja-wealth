import type { Loan } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";

const statusVariant: Record<Loan["status"], "default" | "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  approved: "info",
  active: "info",
  completed: "success",
  defaulted: "danger",
  rejected: "default",
};

const progressColors: Record<string, string> = {
  active: "bg-gradient-to-r from-brand-500 to-brand-600",
  completed: "bg-gradient-to-r from-emerald-500 to-emerald-600",
  defaulted: "bg-gradient-to-r from-red-500 to-red-600",
};

export function LoanCard({ loan }: { loan: Loan }) {
  const progress = loan.amount > 0 ? (loan.amountRepaid / loan.amount) * 100 : 0;

  return (
    <motion.div whileHover={{ y: -2 }} className="card-hover p-5 group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar src={loan.borrowerAvatar} name={loan.borrowerName} size="md" ring="brand" />
          <div>
            <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {loan.borrowerName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{loan.purpose}</p>
          </div>
        </div>
        <Badge variant={statusVariant[loan.status]} dot={loan.status === "active"} className="capitalize">
          {loan.status}
        </Badge>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Loan Amount</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(loan.amount)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Interest</p>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {loan.interestRate}% / {loan.termMonths}mo
          </p>
        </div>
      </div>
      {(loan.status === "active" || loan.status === "completed" || loan.status === "defaulted") && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
            <span>Repaid {formatCurrency(loan.amountRepaid)}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <ProgressBar
            value={progress}
            colorClassName={progressColors[loan.status] ?? progressColors.active}
            size="md"
          />
        </div>
      )}
      <p className="mt-4 text-xs text-gray-400 font-medium flex items-center gap-1">
        <span className="h-1 w-1 rounded-full bg-gray-400" />
        Due {formatDate(loan.dueDate)}
      </p>
    </motion.div>
  );
}
