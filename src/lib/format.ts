import type { BadgeProps } from "@/components/ui/Badge";

/** KES amount with thousands separators and no decimals for whole shillings. */
export function formatKes(amount: number | null | undefined): string {
  const n = typeof amount === "number" && Number.isFinite(amount) ? amount : 0;
  const hasCents = Math.round(n * 100) % 100 !== 0;
  return `KES ${n.toLocaleString("en-KE", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/** "YYYY-MM-DD" for today in local time — the format date inputs and the API use. */
export function todayIso(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Human date for a date-only or ISO string. Returns "—" for empty values. */
export function formatDay(value: string | null | undefined): string {
  if (!value) return "—";
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

/** M-Pesa receipt codes are 10 uppercase letters/digits (e.g. "SAB1C2D3E4"). */
export function normalizeMpesaReceipt(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

export function isValidMpesaReceipt(value: string): boolean {
  return /^[A-Z0-9]{10}$/.test(normalizeMpesaReceipt(value));
}

type Variant = NonNullable<BadgeProps["variant"]>;

const STATUS_VARIANTS: Record<string, Variant> = {
  recorded: "info",
  confirmed: "success",
  disputed: "warning",
  voided: "default",
  active: "info",
  completed: "success",
  defaulted: "danger",
  paid: "success",
  open: "warning",
  failed: "danger",
  trialing: "info",
  past_due: "warning",
  cancelled: "default",
  scheduled: "info",
};

export function statusVariant(status: string): Variant {
  return STATUS_VARIANTS[status] ?? "default";
}

export function statusLabel(status: string): string {
  const s = status.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}
