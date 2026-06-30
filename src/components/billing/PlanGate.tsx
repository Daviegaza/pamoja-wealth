/**
 * PlanGate — declaratively wrap premium UI behind a plan-tier feature flag.
 *
 *   <PlanGate feature="ai_rule_compiler" chamaId={activeGroup.id}>
 *     <RuleBuilderUI />
 *   </PlanGate>
 *
 * Falls back to a friendly upsell card with a one-tap "Upgrade to {plan}" CTA
 * that opens <UpgradeModal>. Pass `fallback` to render an inline preview
 * (e.g. blurred chart) instead of the default card.
 *
 * The `usePlanFeature` hook exposes the boolean for non-children gating —
 * use it to enable/disable buttons or short-circuit logic.
 */
import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  getPlans,
  getSubscription,
  minimumPlanForFeature,
  type FeatureKey,
  type Plan,
  type PlanCode,
  type Subscription,
} from "@/api/billing";
import { UpgradeModal } from "@/components/billing/UpgradeModal";

const PLAN_RANK: Record<PlanCode, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  enterprise: 3,
};

function hasFeature(plan: Plan | undefined, feature: FeatureKey): boolean {
  return Boolean(plan?.features[feature]);
}

/** Stable, friendly labels for upsell copy. */
const FEATURE_COPY: Record<FeatureKey, { name: string; benefit: string }> = {
  ai_rule_compiler: {
    name: "AI Rule Compiler",
    benefit: "Turn plain English bylaws into a structured, hash-chained rule doc in seconds.",
  },
  recurring_billing: {
    name: "Recurring billing",
    benefit: "Auto-collect monthly contributions via M-Pesa Ratiba — no chasing.",
  },
  advanced_analytics: {
    name: "Advanced Analytics",
    benefit: "Cohort retention, treasury heatmaps, member health scores.",
  },
  whatsapp_bot: {
    name: "WhatsApp Bot",
    benefit: "Contribute, vote and check balance straight from WhatsApp.",
  },
  dedicated_paybill: {
    name: "Dedicated paybill",
    benefit: "Your own M-Pesa paybill number — no shared account number suffixes.",
  },
  ai_loan_underwriter: {
    name: "AI Loan Underwriter",
    benefit: "Auto-score loan applications using contribution history and guarantor reputation.",
  },
  custom_branding: {
    name: "Custom branding",
    benefit: "Your logo, your colours, your subdomain — pamojawealth.com/your-chama.",
  },
  api_access: {
    name: "API access",
    benefit: "Build your own integrations against the same APIs we use internally.",
  },
  white_label: {
    name: "White-label",
    benefit: "Ship Pamoja under your own SACCO brand — no Pamoja mentions.",
  },
  audit_export: {
    name: "Audit export",
    benefit: "Download hash-chained, SACCO-audit-ready ledger CSV/PDF.",
  },
  multi_group: {
    name: "Multi-group",
    benefit: "Run more than one chama, harambee or pot from a single account.",
  },
  dedicated_csm: {
    name: "Dedicated success manager",
    benefit: "Named CSM with a 24h response SLA and quarterly business review.",
  },
};

// ===== Hooks =====

/**
 * Tiny convenience hook: returns the plan + subscription pair via React Query
 * so all PlanGate instances on a screen share one fetch.
 */
function usePlanContext(chamaId: string | undefined) {
  const plansQuery = useQuery({ queryKey: ["billing", "plans"], queryFn: getPlans, staleTime: 5 * 60_000 });
  const subQuery = useQuery({
    queryKey: ["billing", "subscription", chamaId ?? "_"],
    queryFn: () => (chamaId ? getSubscription(chamaId) : Promise.resolve<Subscription | null>(null)),
    enabled: Boolean(chamaId),
    staleTime: 60_000,
  });

  const currentPlan = useMemo(() => {
    const code: PlanCode = subQuery.data?.planCode ?? "free";
    return plansQuery.data?.find((p) => p.code === code);
  }, [plansQuery.data, subQuery.data]);

  return {
    plans: plansQuery.data,
    subscription: subQuery.data ?? null,
    currentPlan,
    isLoading: plansQuery.isLoading || subQuery.isLoading,
  };
}

/**
 * Returns true when the chama's current plan unlocks `feature`. Use to
 * enable/disable buttons in flows that can't easily wrap children.
 */
export function usePlanFeature(chamaId: string | undefined, feature: FeatureKey): {
  unlocked: boolean;
  isLoading: boolean;
  minimumPlan?: Plan;
  currentPlan?: Plan;
} {
  const { plans, currentPlan, isLoading } = usePlanContext(chamaId);
  const minimumPlan = plans ? minimumPlanForFeature(plans, feature) : undefined;
  const unlocked = hasFeature(currentPlan, feature);
  return { unlocked, isLoading, minimumPlan, currentPlan };
}

// ===== Component =====

export interface PlanGateProps {
  feature: FeatureKey;
  chamaId: string | undefined;
  children: ReactNode;
  /** Optional alternative locked-state UI (e.g. blurred preview). */
  fallback?: ReactNode;
  /** Compact upsell — no banner, no benefit copy. */
  compact?: boolean;
}

export function PlanGate({ feature, chamaId, children, fallback, compact }: PlanGateProps) {
  const { plans, currentPlan, subscription, isLoading } = usePlanContext(chamaId);
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (isLoading) {
    return (
      <div className="card-base p-6 animate-pulse">
        <div className="h-4 w-24 rounded bg-gray-100 dark:bg-white/[0.04]" />
        <div className="mt-3 h-3 w-3/4 rounded bg-gray-100 dark:bg-white/[0.04]" />
      </div>
    );
  }

  const unlocked = hasFeature(currentPlan, feature);
  if (unlocked) return <>{children}</>;

  if (fallback) {
    return (
      <div>
        {fallback}
        <UpgradeModal
          isOpen={showUpgrade}
          onClose={() => setShowUpgrade(false)}
          chamaId={chamaId}
          targetPlanCode={(plans && minimumPlanForFeature(plans, feature)?.code) ?? "pro"}
        />
      </div>
    );
  }

  const minimumPlan = plans ? minimumPlanForFeature(plans, feature) : undefined;
  const copy = FEATURE_COPY[feature];
  const currentRank = currentPlan ? PLAN_RANK[currentPlan.code] : 0;
  const targetRank = minimumPlan ? PLAN_RANK[minimumPlan.code] : 99;
  const isDowngrade = currentRank > targetRank;

  return (
    <>
      <div
        role="region"
        aria-label={`${copy.name} requires ${minimumPlan?.name ?? "a paid"} plan`}
        className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-gradient-to-br from-brand-50/60 via-white to-white dark:from-brand-500/[0.06] dark:via-neutral-900 dark:to-neutral-900 p-6 sm:p-8"
      >
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300">
            <Lock className="h-5 w-5" aria-hidden />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {copy.name} is part of the {minimumPlan?.name ?? "Pro"} plan
              </h3>
              {minimumPlan?.highlighted && (
                <Badge variant="premium">
                  <Sparkles className="h-3 w-3" /> Most popular
                </Badge>
              )}
            </div>
            {!compact && (
              <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 max-w-prose">
                {copy.benefit}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                size="md"
                variant="premium"
                onClick={() => setShowUpgrade(true)}
                disabled={!chamaId || isDowngrade}
              >
                {isDowngrade
                  ? `Available on your ${currentPlan?.name} plan`
                  : `Upgrade to ${minimumPlan?.name ?? "Pro"}`}
              </Button>
              {!compact && subscription?.status === "trialing" && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Trial includes this feature — add a payment method to keep it.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        chamaId={chamaId}
        targetPlanCode={minimumPlan?.code ?? "pro"}
      />
    </>
  );
}
