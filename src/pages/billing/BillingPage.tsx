import { CreditCard, Download, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";

const INVOICES = [
  { id: "INV-2026-006", date: "2026-06-01", amount: 2500, status: "paid" as const },
  { id: "INV-2026-005", date: "2026-05-01", amount: 2500, status: "paid" as const },
  { id: "INV-2026-004", date: "2026-04-01", amount: 2500, status: "paid" as const },
  { id: "INV-2026-003", date: "2026-03-01", amount: 2500, status: "paid" as const },
];

export default function BillingPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your plan, payment methods, and invoices.</p>
      </div>

      {/* Current Plan */}
      <div className="card-hover p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current Plan</p>
            <Badge variant="success" dot>Active</Badge>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Growth Plan</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatCurrency(2500)}/month · Renews July 1, 2026</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Plan change requested. Our team will contact you.")}>Change plan</Button>
          <Button variant="ghost-brand" size="sm" onClick={() => toast.info("To cancel, please contact support@ pamojawealth.app")}>Cancel</Button>
        </div>
      </div>

      {/* Payment Method */}
      <div className="card-hover p-5 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl icon-gradient-purple shadow-soft-sm">
          <CreditCard className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Visa ending in 4242</p>
          <p className="text-xs text-gray-400 font-medium">Expires 08/2028 · Default payment method</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => toast.success("Payment method updated successfully.")}>Update</Button>
      </div>

      {/* Invoice History */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invoice History</h2>
        <div className="card-base overflow-hidden divide-y divide-gray-100 dark:divide-white/[0.04]">
          {INVOICES.map((inv, idx) => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="flex items-center justify-between p-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{inv.id}</p>
                <p className="text-xs text-gray-400 font-medium">{formatDate(inv.date)}</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="success" className="capitalize">{inv.status}</Badge>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(inv.amount)}</span>
                <button
                  onClick={() => toast.success(`Invoice ${inv.id} download started.`)}
                  className="rounded-lg p-1.5 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-500" /> Secure payment
        </span>
        <span>·</span>
        <span>All prices include VAT</span>
        <span>·</span>
        <span>Cancel anytime</span>
      </div>
    </div>
  );
}
