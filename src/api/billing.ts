/**
 * Billing API — subscription tiers, invoices, coupons, checkout.
 *
 * Mirrors the backend Subscription/Invoice/Plan/Coupon models (see
 * docs/STEP-11-SETTINGS-NETWORK-BILLING.md and BACKEND.md). The real
 * checkout path returns either a Flutterwave hosted `checkoutUrl` or an
 * STK push reference (`stkInitiated`) — the UpgradeModal handles both.
 *
 * Mock mode (`VITE_USE_MOCKS=true`) returns the 4 hard-coded plans plus
 * a synthesised subscription/invoice trail per chama (see src/mock/billing.ts).
 */
import { api } from "@/api/axios";
import {
  getMockBilling,
  mockApplyCoupon,
  mockCancelSubscription,
  mockChangePlan,
  mockListInvoices,
  mockStartCheckout,
} from "@/mock/billing";

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

// ===== Public types =====

export type PlanCode = "free" | "starter" | "pro" | "enterprise";
export type BillingCadence = "monthly" | "annual";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled" | "paused";
export type InvoiceStatus = "paid" | "open" | "failed" | "uncollectible" | "void";

/**
 * Feature flag keys gated by plan. Stable IDs — PlanGate consumers reference
 * these by string. Add new keys whenever a feature ships behind a paywall.
 */
export type FeatureKey =
  | "ai_rule_compiler"
  | "recurring_billing"
  | "advanced_analytics"
  | "whatsapp_bot"
  | "dedicated_paybill"
  | "ai_loan_underwriter"
  | "custom_branding"
  | "api_access"
  | "white_label"
  | "audit_export"
  | "multi_group"
  | "dedicated_csm";

export interface Plan {
  code: PlanCode;
  name: string;
  monthlyPriceKes: number;
  /** Annual price KES — by convention 10 × monthly (2 free months). */
  annualPriceKes: number;
  /** null = unlimited. */
  memberCap: number | null;
  /** null = unlimited. */
  groupCap: number | null;
  features: Record<FeatureKey, boolean>;
  /** Marketing tagline shown beneath the plan name. */
  tagline?: string;
  /** Highlighted = recommended. Pro tier in our mix. */
  highlighted?: boolean;
}

export interface Subscription {
  id: string;
  chamaId: string;
  planCode: PlanCode;
  cadence: BillingCadence;
  status: SubscriptionStatus;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  cancelAtPeriodEnd: boolean;
}

export interface Invoice {
  id: string;
  number: string;
  amountKes: number;
  status: InvoiceStatus;
  periodStart: string;
  periodEnd: string;
  dueAt: string;
  paidAt?: string;
  /** Real backend exposes a presigned S3 PDF URL; mocks return undefined. */
  pdfUrl?: string;
}

export interface CheckoutResult {
  /** Set when payment method is Card via Flutterwave — redirect target. */
  checkoutUrl?: string;
  /** Set when payment method is M-Pesa STK Push — modal sits on `awaiting_pin`. */
  stkInitiated?: boolean;
  /** Optional trial extension applied server-side. */
  trialEndsAt?: string;
}

// ===== API functions =====

export async function getPlans(): Promise<Plan[]> {
  if (USE_MOCKS) return getMockBilling().plans;
  const { data } = await api.get<Plan[]>("/billing/plans");
  return data;
}

export async function getSubscription(chamaId: string): Promise<Subscription | null> {
  if (USE_MOCKS) return getMockBilling().subscriptionsByChama[chamaId] ?? null;
  try {
    const { data } = await api.get<Subscription>(`/billing/subscription/${chamaId}`);
    return data;
  } catch (err) {
    // 404 == no active subscription, treat as free tier.
    if ((err as { response?: { status?: number } })?.response?.status === 404) return null;
    throw err;
  }
}

export async function startCheckout(
  chamaId: string,
  planCode: PlanCode,
  cadence: BillingCadence,
  couponCode?: string,
  paymentMethod: "mpesa_stk" | "mpesa_ratiba" | "card" = "mpesa_stk"
): Promise<CheckoutResult> {
  if (USE_MOCKS) return mockStartCheckout(chamaId, planCode, cadence, couponCode, paymentMethod);
  const { data } = await api.post<CheckoutResult>(`/billing/subscription/${chamaId}/checkout`, {
    planCode,
    cadence,
    couponCode,
    paymentMethod,
  });
  return data;
}

export async function cancelSubscription(
  chamaId: string,
  immediate: boolean = false
): Promise<Subscription> {
  if (USE_MOCKS) return mockCancelSubscription(chamaId, immediate);
  const { data } = await api.post<Subscription>(`/billing/subscription/${chamaId}/cancel`, {
    immediate,
  });
  return data;
}

export async function changePlan(
  chamaId: string,
  planCode: PlanCode,
  prorate: boolean
): Promise<Subscription> {
  if (USE_MOCKS) return mockChangePlan(chamaId, planCode, prorate);
  const { data } = await api.post<Subscription>(`/billing/subscription/${chamaId}/change-plan`, {
    planCode,
    prorate,
  });
  return data;
}

export async function applyCoupon(
  chamaId: string,
  code: string
): Promise<{ discountKes: number; description?: string }> {
  if (USE_MOCKS) return mockApplyCoupon(chamaId, code);
  const { data } = await api.post<{ discountKes: number; description?: string }>(
    `/billing/subscription/${chamaId}/apply-coupon`,
    { code }
  );
  return data;
}

export async function listInvoices(
  chamaId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ invoices: Invoice[]; total: number }> {
  if (USE_MOCKS) return mockListInvoices(chamaId, page, limit);
  const { data } = await api.get<{ invoices: Invoice[]; total: number }>(
    `/billing/invoices/${chamaId}`,
    { params: { page, limit } }
  );
  return data;
}

// ===== Helpers =====

export function planByCode(plans: Plan[], code: PlanCode): Plan | undefined {
  return plans.find((p) => p.code === code);
}

/**
 * Resolve the cheapest plan that unlocks the given feature. Used by PlanGate
 * to render a precise upsell CTA ("Upgrade to Starter" vs "Upgrade to Pro").
 */
export function minimumPlanForFeature(
  plans: Plan[],
  feature: FeatureKey
): Plan | undefined {
  const order: PlanCode[] = ["free", "starter", "pro", "enterprise"];
  for (const code of order) {
    const plan = plans.find((p) => p.code === code);
    if (plan?.features[feature]) return plan;
  }
  return undefined;
}

export function priceForCadence(plan: Plan, cadence: BillingCadence): number {
  return cadence === "monthly" ? plan.monthlyPriceKes : plan.annualPriceKes;
}
