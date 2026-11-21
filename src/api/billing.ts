/**
 * SaaS subscription billing — the ONLY money Pamoja collects is its own
 * per-chama subscription fee. Payment is confirmed server-side with the
 * provider before a plan is activated; the client never marks anything paid.
 */
import { api } from "./axios";
import type { Envelope } from "./http-types";

export type BillingCadence = "monthly" | "annual";
export type BillingProvider = "flutterwave" | "paystack";

export interface PlanDTO {
  code: string;
  name: string;
  monthlyPriceKes: number;
  annualPriceKes: number;
  memberCap: number | null;
}

export interface SubscriptionDTO {
  planCode: string;
  status: string;
  cadence: BillingCadence;
  currentPeriodEnd: string | null;
  memberCap: number | null;
  memberCount: number;
}

export interface CheckoutDTO {
  invoiceId: string;
  reference: string;
  checkoutUrl: string;
}

export interface InvoiceDTO {
  id: string;
  number: string;
  totalKes: number;
  status: string;
  periodStart: string;
  periodEnd: string;
  paidAt: string | null;
  provider: string;
}

export async function listPlans() {
  const r = await api.get<Envelope<PlanDTO[]>>("/billing/plans");
  return r.data.data;
}

export async function getSubscription(chamaId: string) {
  const r = await api.get<Envelope<SubscriptionDTO>>(`/chamas/${chamaId}/subscription`);
  return r.data.data;
}

export async function startCheckout(
  chamaId: string,
  input: { planCode: string; cadence: BillingCadence; provider: BillingProvider },
) {
  const r = await api.post<Envelope<CheckoutDTO>>(`/chamas/${chamaId}/subscription/checkout`, input);
  return r.data.data;
}

/**
 * Server response to a verify request. `activated` is only true after the
 * server confirmed the charge with the provider (status, KES, amount).
 */
export type VerifyResultDTO =
  | { activated: true; alreadyProcessed: boolean; subscription: SubscriptionDTO }
  | { activated: false; reason: "pending" | "failed" | "mismatch"; subscription: SubscriptionDTO };

export async function verifyPayment(chamaId: string, reference: string) {
  const r = await api.post<Envelope<VerifyResultDTO>>(`/chamas/${chamaId}/subscription/verify`, { reference });
  return r.data.data;
}

export async function cancelSubscription(chamaId: string) {
  const r = await api.post<Envelope<SubscriptionDTO>>(`/chamas/${chamaId}/subscription/cancel`);
  return r.data.data;
}

export async function listInvoices(chamaId: string) {
  const r = await api.get<Envelope<InvoiceDTO[]>>(`/chamas/${chamaId}/invoices`);
  return r.data.data;
}

/** Pick the payment reference out of a provider return URL (ours, Flutterwave, or Paystack). */
export function referenceFromSearch(search: URLSearchParams): string | null {
  return search.get("reference") ?? search.get("tx_ref") ?? search.get("trxref");
}
