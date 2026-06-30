/**
 * UpgradeModal — single-screen plan upgrade flow.
 *
 * Reused from BillingPage, PlanGate, and the deep-link
 * `/billing/upgrade?plan=pro` route. One screen, no wizard.
 *
 * Payment-method picker mirrors ContributeModal's vocabulary:
 *   - mpesa_stk  : STK Push → sit on `awaiting_pin`, wait for
 *                  `payment:completed` socket event for the subscription invoice.
 *   - mpesa_ratiba: M-Pesa Ratiba standing-order (recurring) — Pro+ feature.
 *   - card        : Flutterwave hosted checkout — redirect via `checkoutUrl`.
 *
 * TODO: real Flutterwave webhook + STK upgrade flow once backend lands.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, CreditCard, Repeat, Smartphone, Sparkles, Tag } from "lucide-react";
import { Modal } from "@/components/dialogs/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { useSocketEvent } from "@/lib/socket";
import {
  applyCoupon,
  getPlans,
  priceForCadence,
  startCheckout,
  type BillingCadence,
  type Plan,
  type PlanCode,
} from "@/api/billing";

type PaymentMethod = "mpesa_stk" | "mpesa_ratiba" | "card";

type Stage = "form" | "awaiting_pin" | "redirecting" | "success" | "failed";

export interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  chamaId: string | undefined;
  targetPlanCode: PlanCode;
  /** Override the starting cadence (default monthly). */
  defaultCadence?: BillingCadence;
}

function fmtKes(n: number): string {
  return `KES ${n.toLocaleString("en-KE")}`;
}

export function UpgradeModal({
  isOpen,
  onClose,
  chamaId,
  targetPlanCode,
  defaultCadence = "monthly",
}: UpgradeModalProps) {
  const qc = useQueryClient();
  const plansQuery = useQuery({ queryKey: ["billing", "plans"], queryFn: getPlans, staleTime: 5 * 60_000 });

  const [cadence, setCadence] = useState<BillingCadence>(defaultCadence);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa_stk");
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discountKes: number; description?: string } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("form");
  const [submitting, setSubmitting] = useState(false);
  const [failureReason, setFailureReason] = useState<string | null>(null);
  const refIdRef = useRef<string | null>(null);

  // Reset on open/close.
  useEffect(() => {
    if (!isOpen) return;
    setCadence(defaultCadence);
    setPaymentMethod("mpesa_stk");
    setCouponInput("");
    setCouponApplied(null);
    setCouponError(null);
    setStage("form");
    setSubmitting(false);
    setFailureReason(null);
    refIdRef.current = null;
  }, [isOpen, defaultCadence]);

  const plan: Plan | undefined = useMemo(
    () => plansQuery.data?.find((p) => p.code === targetPlanCode),
    [plansQuery.data, targetPlanCode]
  );

  const grossPrice = plan ? priceForCadence(plan, cadence) : 0;
  const discount = couponApplied?.discountKes ?? 0;
  const netPrice = Math.max(0, grossPrice - discount);
  const annualSavings = plan ? plan.monthlyPriceKes * 12 - plan.annualPriceKes : 0;

  // ===== Socket: subscription:completed reuses contribute infra payload. =====
  useSocketEvent<{ subscriptionId: string; chamaId: string }>(
    "subscription:completed",
    (payload) => {
      if (!isOpen || payload.chamaId !== chamaId) return;
      setStage("success");
      qc.invalidateQueries({ queryKey: ["billing"] });
      toast.success("Plan upgraded — asante!");
    }
  );

  // STK push: same `payment:completed` event the ContributeModal listens for.
  useSocketEvent<{ groupId: string; transactionId: string }>(
    "payment:completed",
    (payload) => {
      if (!isOpen || stage !== "awaiting_pin") return;
      if (payload.groupId !== chamaId) return;
      setStage("success");
      qc.invalidateQueries({ queryKey: ["billing"] });
    }
  );

  // ===== Handlers =====
  const onApplyCoupon = async () => {
    if (!chamaId || !couponInput.trim()) return;
    setCouponError(null);
    try {
      const res = await applyCoupon(chamaId, couponInput.trim());
      setCouponApplied({ code: couponInput.trim().toUpperCase(), ...res });
      toast.success(`Coupon applied: -${fmtKes(res.discountKes)}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid coupon";
      setCouponError(msg);
    }
  };

  const onUpgrade = async () => {
    if (!chamaId || !plan) return;
    setSubmitting(true);
    setFailureReason(null);
    try {
      const res = await startCheckout(
        chamaId,
        plan.code,
        cadence,
        couponApplied?.code,
        paymentMethod
      );
      if (res.checkoutUrl) {
        setStage("redirecting");
        // Open hosted Flutterwave checkout.
        window.open(res.checkoutUrl, "_blank", "noopener,noreferrer");
        // Optimistically mark success; real flow waits for webhook.
        setTimeout(() => {
          setStage("success");
          qc.invalidateQueries({ queryKey: ["billing"] });
        }, 1200);
      } else if (res.stkInitiated) {
        refIdRef.current = `upg_${Date.now()}`;
        setStage("awaiting_pin");
        // Mock-mode safety net: if the socket event doesn't fire (e.g. real
        // backend has yet to wire it), flip to success after a short delay.
        setTimeout(() => {
          setStage((s) => (s === "awaiting_pin" ? "success" : s));
          qc.invalidateQueries({ queryKey: ["billing"] });
        }, 4500);
      } else {
        setStage("success");
        qc.invalidateQueries({ queryKey: ["billing"] });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Couldn't start upgrade";
      setFailureReason(msg);
      setStage("failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!plan) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Upgrade plan">
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading plan details…</p>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Upgrade to ${plan.name}`} size="lg">
      {stage === "form" && (
        <div className="space-y-5">
          {/* Plan summary card */}
          <div className="rounded-2xl border border-brand-200 dark:border-brand-500/30 bg-brand-50/60 dark:bg-brand-500/[0.08] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                  {plan.highlighted && (
                    <Badge variant="premium">
                      <Sparkles className="h-3 w-3" /> Most popular
                    </Badge>
                  )}
                </div>
                {plan.tagline && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{plan.tagline}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {fmtKes(netPrice)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {cadence === "monthly" ? "/month" : "/year"}
                </p>
              </div>
            </div>
          </div>

          {/* Cadence toggle */}
          <div>
            <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Billing cycle
            </p>
            <div className="grid grid-cols-2 gap-2" role="radiogroup">
              <CadenceChip
                active={cadence === "monthly"}
                label="Monthly"
                onClick={() => setCadence("monthly")}
                sub={fmtKes(plan.monthlyPriceKes) + "/mo"}
              />
              <CadenceChip
                active={cadence === "annual"}
                label="Annual"
                onClick={() => setCadence("annual")}
                sub={fmtKes(plan.annualPriceKes) + "/yr"}
                badge={annualSavings > 0 ? `Save ${fmtKes(annualSavings)}` : undefined}
              />
            </div>
          </div>

          {/* Coupon */}
          <div>
            <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Coupon code
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. LAUNCH2026"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value.toUpperCase());
                  setCouponError(null);
                }}
                leftIcon={<Tag className="h-4 w-4" />}
                error={couponError ?? undefined}
              />
              <Button variant="outline" onClick={onApplyCoupon} disabled={!couponInput.trim()}>
                Apply
              </Button>
            </div>
            {couponApplied && (
              <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                {couponApplied.code} applied — {couponApplied.description ?? `-${fmtKes(couponApplied.discountKes)}`}
              </p>
            )}
          </div>

          {/* Payment method picker */}
          <div>
            <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Pay with
            </p>
            <div className="grid grid-cols-3 gap-2" role="radiogroup">
              <MethodChip
                active={paymentMethod === "mpesa_stk"}
                icon={<Smartphone className="h-4 w-4" />}
                label="M-Pesa"
                sub="One-tap STK"
                onClick={() => setPaymentMethod("mpesa_stk")}
              />
              <MethodChip
                active={paymentMethod === "mpesa_ratiba"}
                icon={<Repeat className="h-4 w-4" />}
                label="Ratiba"
                sub="Auto-renew"
                onClick={() => setPaymentMethod("mpesa_ratiba")}
              />
              <MethodChip
                active={paymentMethod === "card"}
                icon={<CreditCard className="h-4 w-4" />}
                label="Card"
                sub="Visa / MC"
                onClick={() => setPaymentMethod("card")}
              />
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-xl border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02] p-3 text-sm">
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>{plan.name} ({cadence})</span>
              <span>{fmtKes(grossPrice)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Coupon ({couponApplied?.code})</span>
                <span>− {fmtKes(discount)}</span>
              </div>
            )}
            <div className="mt-1 flex justify-between font-semibold text-gray-900 dark:text-white border-t border-gray-200 dark:border-white/[0.06] pt-1.5">
              <span>Total due today</span>
              <span>{fmtKes(netPrice)}</span>
            </div>
          </div>

          <Button
            onClick={onUpgrade}
            className="w-full"
            size="lg"
            variant="premium"
            isLoading={submitting}
            disabled={!chamaId || submitting}
          >
            Upgrade to {plan.name} for {fmtKes(netPrice)}
          </Button>
          <p className="text-[11px] text-center text-gray-400 dark:text-gray-500">
            Cancel anytime · Prices include VAT · M-Changa lesson: no hidden fees.
          </p>
        </div>
      )}

      {stage === "awaiting_pin" && (
        <WaitingState
          title="Check your phone"
          body={`Enter your M-Pesa PIN to confirm ${fmtKes(netPrice)} for ${plan.name}.`}
        />
      )}

      {stage === "redirecting" && (
        <WaitingState
          title="Opening card checkout…"
          body="A new tab opened with Flutterwave. Complete the payment there and come back."
        />
      )}

      {stage === "success" && (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <Check className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">You're on {plan.name}!</h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              All {plan.name} features are unlocked for this chama.
            </p>
          </div>
          <Button onClick={onClose} className="w-full">Done</Button>
        </div>
      )}

      {stage === "failed" && (
        <div className="space-y-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            {failureReason ?? "Couldn't complete the upgrade."}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">Close</Button>
            <Button onClick={() => setStage("form")} className="flex-1">Try again</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ===== Sub-components =====

function CadenceChip({
  active,
  label,
  sub,
  badge,
  onClick,
}: {
  active: boolean;
  label: string;
  sub: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left transition-colors focus-ring",
        active
          ? "border-brand-500 bg-brand-50 dark:bg-brand-500/15"
          : "border-gray-200 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-white/[0.03]"
      )}
    >
      <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400">{sub}</span>
      {badge && (
        <span className="absolute right-2 top-2 rounded-full bg-emerald-100 dark:bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
          {badge}
        </span>
      )}
    </button>
  );
}

function MethodChip({
  active,
  icon,
  label,
  sub,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium transition-colors focus-ring",
        active
          ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300 dark:border-brand-500/50"
          : "border-gray-200 dark:border-white/[0.06] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.03]"
      )}
    >
      {icon}
      <span>{label}</span>
      <span className="text-[10px] text-gray-400">{sub}</span>
    </button>
  );
}

const WaitingState = ({ title, body }: { title: string; body: string }) => (
  <div className="space-y-4 py-4 text-center">
    <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-brand-100 dark:bg-brand-500/15" />
    <div>
      <h4 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h4>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{body}</p>
    </div>
  </div>
);
