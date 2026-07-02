import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Download, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { UpgradeModal } from "@/components/billing/UpgradeModal";
import { useChamaStore } from "@/stores/chamaStore";
import {
  cancelSubscription,
  getPlans,
  getSubscription,
  listInvoices,
  type PlanCode,
} from "@/api/billing";

export default function BillingPage() {
  const activeChamaId = useChamaStore((s) => s.activeChamaId);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState<PlanCode>("pro");
  const [cancelOpen, setCancelOpen] = useState(false);

  const subscriptionQuery = useQuery({
    queryKey: ["billing", "subscription", activeChamaId],
    queryFn: () => (activeChamaId ? getSubscription(activeChamaId) : Promise.resolve(null)),
    enabled: !!activeChamaId,
  });

  const plansQuery = useQuery({
    queryKey: ["billing", "plans"],
    queryFn: getPlans,
    staleTime: 5 * 60_000,
  });

  const invoicesQuery = useQuery({
    queryKey: ["billing", "invoices", activeChamaId],
    queryFn: () => (activeChamaId ? listInvoices(activeChamaId, 1, 12) : Promise.resolve({ invoices: [], total: 0 })),
    enabled: !!activeChamaId,
  });

  const cancelMutation = useMutation({
    mutationFn: () => {
      if (!activeChamaId) throw new Error("No active chama");
      return cancelSubscription(activeChamaId, false);
    },
    onSuccess: () => {
      toast.success("Subscription set to cancel at period end.");
      qc.invalidateQueries({ queryKey: ["billing", "subscription", activeChamaId] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to cancel subscription."),
  });

  const subscription = subscriptionQuery.data;
  const invoices = invoicesQuery.data?.invoices ?? [];

  const plans = Array.isArray(plansQuery.data) ? plansQuery.data : [];
  const currentPlan = subscription ? plans.find((p) => p.code === subscription.planCode) : undefined;
  const planLabel = currentPlan?.name ?? (subscription?.planCode ? subscription.planCode.charAt(0).toUpperCase() + subscription.planCode.slice(1) : "Growth");
  const monthlyPrice = currentPlan
    ? (subscription?.cadence === "annual" ? currentPlan.annualPriceKes / 12 : currentPlan.monthlyPriceKes)
    : 2500;
  const renewsAt = subscription?.currentPeriodEnd;
  const status = subscription?.status ?? "active";

  function handleChangePlan() {
    setUpgradeTarget("pro");
    setUpgradeOpen(true);
  }

  function handleUpdatePayment() {
    navigate("/wallet");
    toast.info("Manage your cards, banks, and M-Pesa here.");
  }

  function handleDownload(inv: { id: string; pdfUrl?: string }) {
    if (inv.pdfUrl) {
      window.open(inv.pdfUrl, "_blank", "noopener,noreferrer");
      return;
    }
    toast.error(`No PDF available for ${inv.id}. Contact support.`);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your plan, payment methods, and invoices.</p>
      </div>

      <div className="card-hover p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current Plan</p>
            <Badge variant={status === "active" || status === "trialing" ? "success" : "warning"} dot>
              {status === "cancelled" ? "Cancelled" : status === "past_due" ? "Past due" : "Active"}
            </Badge>
            {subscription?.cancelAtPeriodEnd && <Badge variant="warning">Cancels {formatDate(subscription.currentPeriodEnd)}</Badge>}
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{planLabel} Plan</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {formatCurrency(monthlyPrice)}/month{renewsAt ? ` · Renews ${formatDate(renewsAt)}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleChangePlan} disabled={!activeChamaId}>
            Change plan
          </Button>
          <Button
            variant="ghost-brand"
            size="sm"
            onClick={() => setCancelOpen(true)}
            disabled={!activeChamaId || !subscription || subscription.cancelAtPeriodEnd || cancelMutation.isPending}
          >
            {cancelMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel"}
          </Button>
        </div>
      </div>

      <div className="card-hover p-5 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl icon-gradient-purple shadow-soft-sm">
          <CreditCard className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Visa ending in 4242</p>
          <p className="text-xs text-gray-400 font-medium">Expires 08/2028 · Default payment method</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleUpdatePayment} disabled={!activeChamaId}>Update</Button>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invoice History</h2>
        <div className="card-base overflow-hidden divide-y divide-gray-100 dark:divide-white/[0.04]">
          {invoicesQuery.isLoading && (
            <div className="flex items-center justify-center py-10 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading invoices…
            </div>
          )}
          {!invoicesQuery.isLoading && invoices.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-400">No invoices yet.</div>
          )}
          {invoices.map((inv, idx) => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="flex items-center justify-between p-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{inv.number || inv.id}</p>
                <p className="text-xs text-gray-400 font-medium">{formatDate(inv.paidAt ?? inv.periodEnd)}</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={inv.status === "paid" ? "success" : inv.status === "failed" ? "danger" : "warning"} className="capitalize">
                  {inv.status}
                </Badge>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(inv.amountKes)}</span>
                <button
                  onClick={() => handleDownload(inv)}
                  aria-label={`Download invoice ${inv.number || inv.id}`}
                  className="rounded-lg p-1.5 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-500" /> Secure payment
        </span>
        <span>·</span>
        <span>All prices include VAT</span>
        <span>·</span>
        <span>Cancel anytime</span>
      </div>

      {upgradeOpen && (
        <UpgradeModal
          isOpen={upgradeOpen}
          onClose={() => setUpgradeOpen(false)}
          chamaId={activeChamaId ?? undefined}
          targetPlanCode={upgradeTarget}
        />
      )}

      <ConfirmDialog
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={() => cancelMutation.mutate()}
        title="Cancel subscription?"
        description="Your plan will remain active until the end of the current billing period. You can reactivate any time."
        confirmLabel="Yes, cancel"
        danger
      />
    </div>
  );
}
