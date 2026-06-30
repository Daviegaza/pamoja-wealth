/**
 * Mock billing data — plans, subscriptions, invoices, coupons.
 *
 * Generated lazily once (singleton) so the same chama always has the same
 * subscription across re-renders. Mirrors the backend Plan/Subscription/
 * Invoice/Coupon shapes from src/api/billing.ts.
 *
 * Distribution per chama (seeded so demos are deterministic-ish):
 *   60% free · 25% starter · 12% pro · 3% enterprise
 *
 * Starter/Pro subscriptions get 3-12 invoices each, mixed paid/open/failed.
 */
import type {
  BillingCadence,
  CheckoutResult,
  Invoice,
  InvoiceStatus,
  Plan,
  Subscription,
} from "@/api/billing";
import { getMockDatabase } from "@/mock";

const DAY_MS = 86400000;

// ===== Plans =====

export const PLANS: Plan[] = [
  {
    code: "free",
    name: "Free",
    monthlyPriceKes: 0,
    annualPriceKes: 0,
    memberCap: 15,
    groupCap: 1,
    tagline: "For small groups getting started",
    features: {
      ai_rule_compiler: false,
      recurring_billing: false,
      advanced_analytics: false,
      whatsapp_bot: false,
      dedicated_paybill: false,
      ai_loan_underwriter: false,
      custom_branding: false,
      api_access: false,
      white_label: false,
      audit_export: false,
      multi_group: false,
      dedicated_csm: false,
    },
  },
  {
    code: "starter",
    name: "Starter",
    monthlyPriceKes: 499,
    annualPriceKes: 4990,
    memberCap: 30,
    groupCap: 3,
    tagline: "For growing chamas ready to automate",
    features: {
      ai_rule_compiler: true,
      recurring_billing: true,
      advanced_analytics: true,
      whatsapp_bot: false,
      dedicated_paybill: false,
      ai_loan_underwriter: false,
      custom_branding: false,
      api_access: false,
      white_label: false,
      audit_export: false,
      multi_group: true,
      dedicated_csm: false,
    },
  },
  {
    code: "pro",
    name: "Pro",
    monthlyPriceKes: 1499,
    annualPriceKes: 14990,
    memberCap: 100,
    groupCap: null,
    tagline: "For established chamas & SACCOs",
    highlighted: true,
    features: {
      ai_rule_compiler: true,
      recurring_billing: true,
      advanced_analytics: true,
      whatsapp_bot: true,
      dedicated_paybill: true,
      ai_loan_underwriter: true,
      custom_branding: true,
      api_access: false,
      white_label: false,
      audit_export: true,
      multi_group: true,
      dedicated_csm: false,
    },
  },
  {
    code: "enterprise",
    name: "Enterprise",
    monthlyPriceKes: 4999,
    annualPriceKes: 49990,
    memberCap: null,
    groupCap: null,
    tagline: "For SACCOs, federations & networks",
    features: {
      ai_rule_compiler: true,
      recurring_billing: true,
      advanced_analytics: true,
      whatsapp_bot: true,
      dedicated_paybill: true,
      ai_loan_underwriter: true,
      custom_branding: true,
      api_access: true,
      white_label: true,
      audit_export: true,
      multi_group: true,
      dedicated_csm: true,
    },
  },
];

// ===== Coupons =====

export interface Coupon {
  code: string;
  discountPct?: number;
  discountKes?: number;
  description: string;
  /** When true, server-side validation restricts to registered SACCOs. */
  saccoOnly?: boolean;
}

export const COUPONS: Coupon[] = [
  { code: "LAUNCH2026", discountPct: 50, description: "50% off your first 3 months" },
  { code: "SACCO50", discountPct: 50, description: "50% off for registered SACCOs", saccoOnly: true },
  { code: "WELCOME10", discountPct: 10, description: "10% off first month" },
  { code: "PARTNER25", discountPct: 25, description: "25% off for partner-referred groups" },
  { code: "ANNUAL20", discountPct: 20, description: "Extra 20% off annual plans" },
];

// ===== Deterministic-ish RNG (seeded by chamaId) =====

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rngFromSeed(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

// ===== Singleton DB =====

interface MockBillingDb {
  plans: Plan[];
  subscriptionsByChama: Record<string, Subscription>;
  invoicesByChama: Record<string, Invoice[]>;
}

let db: MockBillingDb | null = null;

export function getMockBilling(): MockBillingDb {
  if (db) return db;

  const groups = getMockDatabase().groups;
  const subscriptionsByChama: Record<string, Subscription> = {};
  const invoicesByChama: Record<string, Invoice[]> = {};

  for (const g of groups) {
    const rng = rngFromSeed(hashString(g.id));
    const roll = rng();
    let planCode: Subscription["planCode"];
    if (roll < 0.6) planCode = "free";
    else if (roll < 0.85) planCode = "starter";
    else if (roll < 0.97) planCode = "pro";
    else planCode = "enterprise";

    const cadence: BillingCadence = rng() < 0.3 ? "annual" : "monthly";
    const periodLengthDays = cadence === "annual" ? 365 : 30;
    const nextBillDays = Math.floor(rng() * periodLengthDays);

    // ~15% of paid subs are still in trial; ~5% past_due; rest active.
    let status: Subscription["status"] = "active";
    let trialEndsAt: string | undefined;
    if (planCode !== "free") {
      const statusRoll = rng();
      if (statusRoll < 0.15) {
        status = "trialing";
        trialEndsAt = new Date(Date.now() + Math.floor(rng() * 14 + 1) * DAY_MS).toISOString();
      } else if (statusRoll < 0.2) {
        status = "past_due";
      }
    }

    subscriptionsByChama[g.id] = {
      id: `sub_${g.id}`,
      chamaId: g.id,
      planCode,
      cadence,
      status,
      currentPeriodEnd: new Date(Date.now() + nextBillDays * DAY_MS).toISOString(),
      trialEndsAt,
      cancelAtPeriodEnd: false,
    };

    if (planCode !== "free") {
      const count = 3 + Math.floor(rng() * 10);
      const invoices: Invoice[] = [];
      const plan = PLANS.find((p) => p.code === planCode)!;
      const amount = cadence === "monthly" ? plan.monthlyPriceKes : plan.annualPriceKes;
      for (let i = 0; i < count; i++) {
        const start = new Date(Date.now() - (count - i) * periodLengthDays * DAY_MS);
        const end = new Date(start.getTime() + periodLengthDays * DAY_MS);
        const isLast = i === count - 1;
        const statusRoll = rng();
        let invStatus: InvoiceStatus = "paid";
        let paidAt: string | undefined = end.toISOString();
        if (isLast && status === "past_due") {
          invStatus = "failed";
          paidAt = undefined;
        } else if (isLast && status === "trialing") {
          invStatus = "open";
          paidAt = undefined;
        } else if (statusRoll < 0.05) {
          invStatus = "failed";
          paidAt = undefined;
        }
        invoices.push({
          id: `inv_${g.id}_${i + 1}`,
          number: `INV-${new Date().getFullYear()}-${String(hashString(g.id) % 9000 + 1000)}${String(i + 1).padStart(3, "0")}`,
          amountKes: amount,
          status: invStatus,
          periodStart: start.toISOString(),
          periodEnd: end.toISOString(),
          dueAt: end.toISOString(),
          paidAt,
        });
      }
      invoicesByChama[g.id] = invoices.reverse();
    }
  }

  db = { plans: PLANS, subscriptionsByChama, invoicesByChama };
  return db;
}

// ===== Mock mutators =====

export async function mockStartCheckout(
  chamaId: string,
  planCode: Subscription["planCode"],
  cadence: BillingCadence,
  _couponCode?: string,
  paymentMethod: "mpesa_stk" | "mpesa_ratiba" | "card" = "mpesa_stk"
): Promise<CheckoutResult> {
  await new Promise((r) => setTimeout(r, 350));
  const billing = getMockBilling();
  const plan = billing.plans.find((p) => p.code === planCode)!;
  const periodLengthDays = cadence === "annual" ? 365 : 30;
  const sub: Subscription = {
    id: `sub_${chamaId}`,
    chamaId,
    planCode,
    cadence,
    status: planCode === "free" ? "active" : "trialing",
    currentPeriodEnd: new Date(Date.now() + periodLengthDays * DAY_MS).toISOString(),
    trialEndsAt:
      planCode === "free"
        ? undefined
        : new Date(Date.now() + 14 * DAY_MS).toISOString(),
    cancelAtPeriodEnd: false,
  };
  billing.subscriptionsByChama[chamaId] = sub;

  if (planCode !== "free") {
    const amount = cadence === "monthly" ? plan.monthlyPriceKes : plan.annualPriceKes;
    const inv: Invoice = {
      id: `inv_${chamaId}_${Date.now()}`,
      number: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`,
      amountKes: amount,
      status: "open",
      periodStart: new Date().toISOString(),
      periodEnd: sub.currentPeriodEnd,
      dueAt: sub.currentPeriodEnd,
    };
    billing.invoicesByChama[chamaId] = [inv, ...(billing.invoicesByChama[chamaId] ?? [])];
  }

  if (paymentMethod === "card") {
    return { checkoutUrl: `https://checkout.flutterwave.com/pay/mock_${Date.now()}` };
  }
  return { stkInitiated: true, trialEndsAt: sub.trialEndsAt };
}

export async function mockCancelSubscription(
  chamaId: string,
  immediate: boolean
): Promise<Subscription> {
  await new Promise((r) => setTimeout(r, 250));
  const billing = getMockBilling();
  const existing = billing.subscriptionsByChama[chamaId];
  if (!existing) throw new Error("No subscription to cancel");
  const updated: Subscription = {
    ...existing,
    status: immediate ? "cancelled" : existing.status,
    cancelAtPeriodEnd: !immediate,
    planCode: immediate ? "free" : existing.planCode,
  };
  billing.subscriptionsByChama[chamaId] = updated;
  return updated;
}

export async function mockChangePlan(
  chamaId: string,
  planCode: Subscription["planCode"],
  _prorate: boolean
): Promise<Subscription> {
  await new Promise((r) => setTimeout(r, 250));
  const billing = getMockBilling();
  const existing = billing.subscriptionsByChama[chamaId];
  const periodLengthDays = existing?.cadence === "annual" ? 365 : 30;
  const updated: Subscription = {
    id: existing?.id ?? `sub_${chamaId}`,
    chamaId,
    planCode,
    cadence: existing?.cadence ?? "monthly",
    status: "active",
    currentPeriodEnd:
      existing?.currentPeriodEnd ??
      new Date(Date.now() + periodLengthDays * DAY_MS).toISOString(),
    trialEndsAt: existing?.trialEndsAt,
    cancelAtPeriodEnd: false,
  };
  billing.subscriptionsByChama[chamaId] = updated;
  return updated;
}

export async function mockApplyCoupon(
  _chamaId: string,
  code: string
): Promise<{ discountKes: number; description?: string }> {
  await new Promise((r) => setTimeout(r, 200));
  const coupon = COUPONS.find((c) => c.code.toUpperCase() === code.toUpperCase());
  if (!coupon) throw new Error("Coupon not found or expired");
  // Approximation — backend computes real discount against the actual plan price.
  const discountKes = coupon.discountKes ?? Math.round((coupon.discountPct ?? 0) * 14.99);
  return { discountKes, description: coupon.description };
}

export async function mockListInvoices(
  chamaId: string,
  page: number,
  limit: number
): Promise<{ invoices: Invoice[]; total: number }> {
  await new Promise((r) => setTimeout(r, 150));
  const billing = getMockBilling();
  const all = billing.invoicesByChama[chamaId] ?? [];
  const start = (page - 1) * limit;
  return { invoices: all.slice(start, start + limit), total: all.length };
}
