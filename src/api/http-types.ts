/** Shared API envelope + small enums for the Pamoja record-keeping backend. */
export interface PageMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Envelope<T> {
  success: true;
  data: T;
  meta?: PageMeta;
}

export type PaymentMethod = "mpesa" | "bank" | "cash" | "other";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  mpesa: "M-Pesa",
  bank: "Bank",
  cash: "Cash",
  other: "Other",
};
