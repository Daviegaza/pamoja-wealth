/**
 * ContributeModal — the zero-friction payment surface.
 *
 * Single-screen flow: amount → tap → STK push → PIN → receipt. Per the brief,
 * we NEVER show paybill/account/shortcode, NEVER ask the logged-in user to
 * type a phone number, NEVER copy-to-clipboard "for the user to paste into
 * M-Pesa". The user's default MpesaAccount is pulled from local state.
 *
 * State machine: idle → submitting → awaiting_pin → success | failed.
 * Socket events `payment:initiated|completed|failed|timeout` advance state.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import {
  CheckCircle2,
  Smartphone,
  XCircle,
  AlertCircle,
  Loader2,
  Share2,
  ChevronRight,
  ArrowLeft,
  Phone,
  Receipt,
  Copy,
} from "lucide-react";
import { Modal } from "@/components/dialogs/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { contribute, donateNow, type ContributeResponse } from "@/api/payments";
import { useSocketEvent } from "@/lib/socket";
import { cn, formatCurrency } from "@/lib/utils";
import { useWalletStore } from "@/stores/walletStore";
import { useGroupStore } from "@/stores/groupStore";
import { useDonationStore } from "@/stores/donationStore";
import type { Group, MpesaAccount } from "@/types";

// ===== Helpers =====
const QUICK_AMOUNTS = [100, 500, 1_000, 2_000, 5_000];
const MIN_AMOUNT = 1;
const MAX_AMOUNT = 250_000;
const PLATFORM_FEE_PCT = 0.025;
const PAYBILL = (import.meta.env.VITE_MPESA_PAYBILL as string | undefined) ?? "4123456";

// Three-mode payment picker.
export type PayMode = "default_phone" | "other_phone" | "manual";

// KE phone validation + normalisation helpers (carried over from legacy dialog).
const KE_PHONE_RX = /^(\+?254|0)?7\d{8}$/;
const phoneSchema = z
  .string()
  .regex(KE_PHONE_RX, "Enter a valid Kenyan number (e.g. 07XX XXX XXX)");

/** Normalise any KE input to canonical +2547XXXXXXXX form. */
function normalizeKePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  let local: string;
  if (digits.startsWith("254")) local = digits.slice(3);
  else if (digits.startsWith("0")) local = digits.slice(1);
  else local = digits;
  if (!/^7\d{8}$/.test(local)) return null;
  return `+254${local}`;
}

/** Live mask: turns "0712345678" -> "+254 712 345 678" as user types. */
function formatKePhoneLive(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  let local = digits;
  if (digits.startsWith("254")) local = digits.slice(3);
  else if (digits.startsWith("0")) local = digits.slice(1);
  local = local.slice(0, 9);
  if (!local) return "";
  const a = local.slice(0, 3);
  const b = local.slice(3, 6);
  const c = local.slice(6, 9);
  return ["+254", a, b, c].filter(Boolean).join(" ").trim();
}

async function copyToClipboard(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  } catch {
    toast.error("Couldn't copy — try selecting manually");
  }
}

function kindLabel(kind: Group["kind"]): string {
  switch (kind) {
    case "chama": return "Chama";
    case "harambee": return "Harambee";
    case "pot": return "Pot";
    case "savings_loan": return "Savings & Loan";
  }
}

/** Mask the middle digits of a Kenyan phone number per RESEARCH_DOSSIER §7.15. */
function maskPhone(phone: string): string {
  // Accepts "+254712345678", "+254 712 345 678", "0712345678", etc.
  const digits = phone.replace(/\D/g, "");
  const last = digits.slice(-4); // keep last 4 incl. typo allowance
  if (digits.length < 9) return phone;
  // Normalize to +254 7XX format
  const tail = digits.length >= 9 ? digits.slice(-9) : digits; // 712345678
  const prefix = tail.slice(0, 1); // "7"
  return `+254 ${prefix}XX XXX X${last.slice(-3)}`;
}

interface FeeBreakdown { gross: number; fee: number; net: number; pct: number; }
function computeFees(amount: number, kind: Group["kind"]): FeeBreakdown {
  // Only harambees show a platform fee per the brief (donor-facing causes).
  // Chama/pot/savings_loan are member-internal and pass-through.
  if (kind === "harambee") {
    const fee = Math.round(amount * PLATFORM_FEE_PCT);
    return { gross: amount, fee, net: Math.max(0, amount - fee), pct: PLATFORM_FEE_PCT * 100 };
  }
  return { gross: amount, fee: 0, net: amount, pct: 0 };
}

type FlowState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "awaiting_pin"; transactionId: string; expiresAt: string }
  | { kind: "waiting_c2b" }
  | { kind: "success"; mpesaReceipt: string; completedAt: string; newBalance?: number }
  | { kind: "failed"; reason: string };

// ===== Subcomponents =====
function HeroRow({ group }: { group: Group }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar src={group.logoUrl} name={group.name} size="lg" ring="brand" />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
            {group.name}
          </h3>
          <Badge variant="brand" className="text-[10px] shrink-0">{kindLabel(group.kind)}</Badge>
        </div>
        {group.location && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{group.location}</p>
        )}
      </div>
    </div>
  );
}

function AmountField({
  amount,
  onChange,
  disabled,
}: {
  amount: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
        Amount
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-400">
          KES
        </span>
        <input
          type="text"
          inputMode="decimal"
          autoFocus
          disabled={disabled}
          value={amount}
          onChange={(e) => {
            // Allow only digits + optional decimal
            const raw = e.target.value.replace(/[^\d.]/g, "");
            // Single decimal point only
            const parts = raw.split(".");
            const sanitized = parts.length > 1 ? `${parts[0]}.${parts.slice(1).join("").slice(0, 2)}` : raw;
            onChange(sanitized);
          }}
          placeholder="0"
          className={cn(
            "w-full rounded-2xl border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-white/[0.03]",
            "pl-16 pr-4 py-5 text-3xl font-bold tabular-nums text-gray-900 dark:text-white",
            "placeholder:text-gray-300 dark:placeholder:text-gray-600",
            "focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none",
            "disabled:opacity-50 transition",
          )}
          aria-label="Amount in Kenyan Shillings"
        />
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {QUICK_AMOUNTS.map((v) => (
          <button
            key={v}
            type="button"
            disabled={disabled}
            onClick={() => onChange(String(v))}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              "border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]",
              "text-gray-700 dark:text-gray-200",
              "hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-500/[0.08] dark:hover:text-brand-300",
              "disabled:opacity-50 disabled:pointer-events-none",
            )}
          >
            {formatCurrency(v)}
          </button>
        ))}
      </div>
    </div>
  );
}

function FeeBreakdownRow({ fees, group }: { fees: FeeBreakdown; group: Group }) {
  if (group.kind === "harambee") {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-white/[0.06] bg-gray-50/60 dark:bg-white/[0.02] p-3.5 space-y-1.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">You pay</span>
          <span className="font-semibold tabular-nums text-gray-900 dark:text-white">{formatCurrency(fees.gross)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Platform fee ({fees.pct.toFixed(1)}%)</span>
          <span className="tabular-nums text-gray-700 dark:text-gray-300">−{formatCurrency(fees.fee)}</span>
        </div>
        <div className="h-px bg-gray-200 dark:bg-white/[0.06]" />
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-900 dark:text-white">Family receives</span>
          <span className="font-bold tabular-nums text-brand-600 dark:text-brand-400">{formatCurrency(fees.net)}</span>
        </div>
      </div>
    );
  }
  // Internal flow — no fee.
  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/[0.06] bg-gray-50/60 dark:bg-white/[0.02] p-3.5 space-y-1.5 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-gray-600 dark:text-gray-400">You pay</span>
        <span className="font-semibold tabular-nums text-gray-900 dark:text-white">{formatCurrency(fees.gross)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-900 dark:text-white">Goes to {kindLabel(group.kind).toLowerCase()}</span>
        <span className="font-bold tabular-nums text-brand-600 dark:text-brand-400">{formatCurrency(fees.net)}</span>
      </div>
    </div>
  );
}

function PhonePrepRow({
  phone,
  onChangeRequest,
}: {
  phone: string;
  onChangeRequest: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200/70 dark:border-white/[0.05] bg-gray-50/40 dark:bg-white/[0.015] px-3.5 py-2.5">
      <div className="flex items-center gap-2.5 min-w-0">
        <Smartphone className="h-4 w-4 text-gray-400 shrink-0" />
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          STK push will go to{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-200 tabular-nums">{phone}</span>
        </p>
      </div>
      <button
        type="button"
        onClick={onChangeRequest}
        className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline shrink-0"
      >
        Change
      </button>
    </div>
  );
}

// ===== Mode picker (3 radio chips) =====
function ModeChip({
  active,
  icon,
  label,
  onClick,
  disabled,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-3 text-xs font-semibold transition",
        "focus:outline-none focus:ring-2 focus:ring-brand-500/30",
        active
          ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/[0.12] dark:text-brand-300 dark:border-brand-500/60 ring-2 ring-brand-500/20"
          : "border-gray-200 dark:border-white/[0.06] text-gray-600 dark:text-gray-300 hover:border-brand-400 hover:bg-gray-50 dark:hover:bg-white/[0.03]",
        "disabled:opacity-50 disabled:pointer-events-none",
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function PaybillRow({
  label,
  value,
  copyable = true,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <span className="text-gray-500 dark:text-gray-400 w-20 text-sm">{label}:</span>
      <span className="flex-1 font-mono font-semibold text-gray-900 dark:text-white text-sm">{value}</span>
      {copyable && (
        <button
          type="button"
          onClick={() => copyToClipboard(value, label)}
          aria-label={`Copy ${label}`}
          className="rounded-lg border border-gray-200 dark:border-white/[0.08] px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        >
          <span className="inline-flex items-center gap-1">
            <Copy className="h-3 w-3" />
            Copy
          </span>
        </button>
      )}
    </div>
  );
}

function CountdownRing({ expiresAt }: { expiresAt: string }) {
  const total = 90;
  const [remaining, setRemaining] = useState(total);
  useEffect(() => {
    const end = new Date(expiresAt).getTime();
    const tick = () => {
      const s = Math.max(0, Math.round((end - Date.now()) / 1000));
      setRemaining(s);
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [expiresAt]);
  const pct = Math.max(0, Math.min(1, remaining / total));
  const radius = 56;
  const c = 2 * Math.PI * radius;
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={radius} className="fill-none stroke-gray-200 dark:stroke-white/[0.08]" strokeWidth="6" />
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          className="fill-none stroke-brand-500"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 0.25, ease: "linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-500/[0.1] text-brand-600 dark:text-brand-400"
        >
          <Smartphone className="h-8 w-8" />
        </motion.div>
      </div>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-white dark:bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:text-gray-400 tabular-nums border border-gray-200 dark:border-white/[0.06]">
        {remaining}s
      </div>
    </div>
  );
}

// ===== Mpesa account picker (sub-modal) =====
function MpesaAccountPicker({
  isOpen,
  onClose,
  accounts,
  selectedId,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  accounts: MpesaAccount[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pay from which number?" size="sm">
      <div className="space-y-2">
        {accounts.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
            No linked M-Pesa numbers yet. Add one from{" "}
            <a className="text-brand-600 dark:text-brand-400 font-semibold hover:underline" href="/wallet">Wallet settings</a>.
          </p>
        )}
        {accounts.map((acct) => (
          <button
            key={acct.id}
            onClick={() => { onSelect(acct.id); onClose(); }}
            className={cn(
              "w-full flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition",
              acct.id === selectedId
                ? "border-brand-500 bg-brand-50/60 dark:bg-brand-500/[0.06] ring-2 ring-brand-500/20"
                : "border-gray-200 dark:border-white/[0.06] hover:border-brand-400 hover:bg-gray-50 dark:hover:bg-white/[0.03]",
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Smartphone className="h-4 w-4 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                  {maskPhone(acct.phoneNumber)}
                </p>
                {acct.isDefault && (
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">Default</p>
                )}
              </div>
            </div>
            {acct.id === selectedId && <CheckCircle2 className="h-4 w-4 text-brand-500 shrink-0" />}
          </button>
        ))}
      </div>
    </Modal>
  );
}

// ===== Main component =====
export interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  mode: "contribute" | "donate";
  /** User's linked M-Pesa accounts. Pulled from wallet/auth context by caller. */
  mpesaAccounts?: MpesaAccount[];
  /** Optional fixed amount (e.g. monthly contribution prefill). */
  suggestedAmount?: number;
}

export function ContributeModal({
  isOpen,
  onClose,
  group,
  mode,
  mpesaAccounts = [],
  suggestedAmount,
}: ContributeModalProps) {
  const [amountStr, setAmountStr] = useState<string>(
    suggestedAmount ? String(suggestedAmount) : "",
  );
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    mpesaAccounts.find((a) => a.isDefault)?.id ?? mpesaAccounts[0]?.id ?? null,
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [payMode, setPayMode] = useState<PayMode>("default_phone");
  const [typedPhone, setTypedPhone] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [flow, setFlow] = useState<FlowState>({ kind: "idle" });
  const txnRef = useRef<string | null>(null);

  // Refresh stores on success — fire-and-forget.
  const refreshGroups = useGroupStore((s) => s.updateGroup);
  const addDonation = useDonationStore((s) => s.addDonation);
  const depositWallet = useWalletStore((s) => s.deposit);

  const amount = useMemo(() => {
    const n = parseFloat(amountStr);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
  }, [amountStr]);

  const fees = useMemo(() => computeFees(amount, group.kind), [amount, group.kind]);
  const valid = amount >= MIN_AMOUNT && amount <= MAX_AMOUNT;
  const selectedAccount = mpesaAccounts.find((a) => a.id === selectedAccountId) ?? null;

  // Reset on close.
  useEffect(() => {
    if (!isOpen) {
      setFlow({ kind: "idle" });
      txnRef.current = null;
      setPayMode("default_phone");
      setTypedPhone("");
      setPhoneError(null);
      if (!suggestedAmount) setAmountStr("");
    }
  }, [isOpen, suggestedAmount]);

  // Per-group manual paybill account (deterministic fallback if not assigned).
  const paybillAccount =
    (group as Group & { paybillAccountNumber?: string }).paybillAccountNumber
    ?? `GRP-${group.id.slice(-5).toUpperCase()}`;

  // ===== Socket subscriptions =====
  useSocketEvent<{ transactionId: string }>("payment:initiated", (p) => {
    if (p?.transactionId && p.transactionId === txnRef.current) {
      setFlow((curr) => curr.kind === "submitting" || curr.kind === "awaiting_pin"
        ? curr.kind === "awaiting_pin"
          ? curr
          : { kind: "awaiting_pin", transactionId: p.transactionId, expiresAt: new Date(Date.now() + 90_000).toISOString() }
        : curr);
    }
  });

  useSocketEvent<{
    transactionId: string;
    groupId?: string;
    mpesaReceipt: string;
    completedAt: string;
    newBalance?: number;
    amount?: number;
  }>("payment:completed", (p) => {
    if (!p) return;
    // STK modes match by txn id; manual mode has no STK txn so we match by group.
    const matchedByTxn = txnRef.current !== null && p.transactionId === txnRef.current;
    const matchedByGroup =
      txnRef.current === null && flow.kind === "waiting_c2b" && p.groupId === group.id;
    if (!matchedByTxn && !matchedByGroup) return;
    setFlow({
      kind: "success",
      mpesaReceipt: p.mpesaReceipt,
      completedAt: p.completedAt,
      newBalance: p.newBalance,
    });
    // Refresh local stores so balances & lists update without page reload.
    try {
      depositWallet(p.amount ?? amount, "mpesa");
    } catch { /* no-op if wallet store API surface changes */ }
    if (mode === "donate") {
      addDonation({
        id: p.transactionId,
        groupId: group.id,
        amount: p.amount ?? amount,
        isAnonymous: false,
        paymentMethod: "mpesa",
        reference: p.mpesaReceipt,
        createdAt: p.completedAt,
      });
    }
    // For harambee, bump raisedAmount via group store.
    if (group.kind === "harambee") {
      refreshGroups(group.id, {
        raisedAmount: (group as Extract<Group, { kind: "harambee" }>).raisedAmount + (p.amount ?? amount),
      } as Partial<Group>);
    }
  });

  useSocketEvent<{ transactionId: string; reason?: string }>("payment:failed", (p) => {
    if (!p || p.transactionId !== txnRef.current) return;
    setFlow({ kind: "failed", reason: p.reason ?? "Payment was not completed." });
  });

  useSocketEvent<{ transactionId: string }>("payment:timeout", (p) => {
    if (!p || p.transactionId !== txnRef.current) return;
    setFlow({ kind: "failed", reason: "Timed out — try again." });
  });

  // ===== Submit =====
  const onSubmit = async () => {
    if (!valid) return;

    // Manual mode: no STK push, just transition to waiting state and let the
    // C2B webhook surface via payment:completed.
    if (payMode === "manual") {
      txnRef.current = null;
      setFlow({ kind: "waiting_c2b" });
      return;
    }

    // STK modes: optionally pass a typed phone override.
    let phoneArg: string | undefined;
    if (payMode === "other_phone") {
      const parsed = phoneSchema.safeParse(typedPhone.replace(/\s/g, ""));
      if (!parsed.success) {
        setPhoneError(parsed.error.issues[0]?.message ?? "Invalid phone");
        return;
      }
      const norm = normalizeKePhone(typedPhone);
      if (!norm) {
        setPhoneError("Enter a valid Kenyan number");
        return;
      }
      phoneArg = norm;
    }
    setPhoneError(null);

    setFlow({ kind: "submitting" });
    try {
      const res: ContributeResponse = mode === "donate"
        ? await donateNow({ groupId: group.id, amount, phone: phoneArg })
        : await contribute({ groupId: group.id, amount, phone: phoneArg });
      txnRef.current = res.transactionId;
      setFlow({
        kind: "awaiting_pin",
        transactionId: res.transactionId,
        expiresAt: res.expiresAt,
      });
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        ?? (e as { message?: string })?.message
        ?? "Could not start payment. Try again.";
      setFlow({ kind: "failed", reason: msg });
    }
  };

  // ===== Receipt share =====
  const shareReceipt = () => {
    if (flow.kind !== "success") return;
    const text =
      `Paid ${formatCurrency(amount)} to ${group.name} via Pamoja Wealth.\n` +
      `M-Pesa receipt: ${flow.mpesaReceipt}\n` +
      new Date(flow.completedAt).toLocaleString();
    window.open(`whatsapp://send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const phoneDisplay = selectedAccount ? maskPhone(selectedAccount.phoneNumber) : "no number linked";

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={mode === "donate" ? `Donate to ${group.name}` : `Contribute to ${group.name}`}
        size="md"
      >
        <AnimatePresence mode="wait">
          {/* ===== IDLE ===== */}
          {flow.kind === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <HeroRow group={group} />
              <AmountField amount={amountStr} onChange={setAmountStr} />
              <FeeBreakdownRow fees={fees} group={group} />

              {/* ===== Mode picker — 3 radio chips ===== */}
              <div>
                <p className="mb-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pay with
                </p>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Payment mode">
                  <ModeChip
                    active={payMode === "default_phone"}
                    icon={<Smartphone className="h-4 w-4" />}
                    label="My phone"
                    onClick={() => setPayMode("default_phone")}
                  />
                  <ModeChip
                    active={payMode === "other_phone"}
                    icon={<Phone className="h-4 w-4" />}
                    label="Another phone"
                    onClick={() => setPayMode("other_phone")}
                  />
                  <ModeChip
                    active={payMode === "manual"}
                    icon={<Receipt className="h-4 w-4" />}
                    label="Pay manually"
                    onClick={() => setPayMode("manual")}
                  />
                </div>
              </div>

              {/* ===== Mode 1: default phone (existing MpesaAccount picker) ===== */}
              {payMode === "default_phone" && (
                selectedAccount ? (
                  <PhonePrepRow phone={phoneDisplay} onChangeRequest={() => setPickerOpen(true)} />
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/[0.06] p-3 text-xs text-amber-700 dark:text-amber-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>
                      No M-Pesa number on file.{" "}
                      <a href="/wallet" className="font-semibold underline">Link one in Wallet settings</a>{" "}
                      to enable one-tap payments.
                    </span>
                  </div>
                )
              )}

              {/* ===== Mode 2: typed phone with live mask ===== */}
              {payMode === "other_phone" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="+254 712 345 678"
                    value={typedPhone}
                    onChange={(e) => {
                      setTypedPhone(formatKePhoneLive(e.target.value));
                      setPhoneError(null);
                    }}
                    className={cn(
                      "w-full rounded-2xl border bg-white dark:bg-white/[0.03]",
                      "px-4 py-3 text-base font-medium tabular-nums text-gray-900 dark:text-white",
                      "placeholder:text-gray-400 dark:placeholder:text-gray-600",
                      "focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition",
                      phoneError
                        ? "border-red-400 dark:border-red-500/60"
                        : "border-gray-300 dark:border-white/[0.08]",
                    )}
                    aria-invalid={phoneError ? "true" : "false"}
                    aria-describedby={phoneError ? "phone-error" : undefined}
                  />
                  {phoneError ? (
                    <p id="phone-error" className="mt-1.5 text-xs text-red-500">{phoneError}</p>
                  ) : typedPhone ? (
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      STK push will go to{" "}
                      <span className="font-semibold text-gray-700 dark:text-gray-200">
                        {normalizeKePhone(typedPhone) ?? typedPhone}
                      </span>
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      We'll send an STK prompt to this number.
                    </p>
                  )}
                </div>
              )}

              {/* ===== Mode 3: manual paybill card ===== */}
              {payMode === "manual" && (
                <div className="rounded-xl border border-brand-200 dark:border-brand-500/30 bg-brand-50/60 dark:bg-brand-500/[0.06] p-4 text-sm">
                  <p className="mb-3 font-semibold text-gray-900 dark:text-white">
                    Pay via M-Pesa menu:
                  </p>
                  <PaybillRow label="Paybill" value={PAYBILL} />
                  <PaybillRow label="Account" value={paybillAccount} />
                  <PaybillRow label="Amount" value={formatCurrency(amount || 0)} copyable={false} />
                  <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                    After paying, this screen updates automatically the moment M-Pesa confirms.
                  </p>
                </div>
              )}

              <Button
                variant="premium"
                size="xl"
                className="w-full"
                disabled={
                  !valid
                  || (payMode === "default_phone" && !selectedAccount)
                }
                onClick={onSubmit}
              >
                {payMode === "manual"
                  ? "I've paid"
                  : `Pay ${amount > 0 ? formatCurrency(amount) : ""}`}
              </Button>
              {!valid && amount > MAX_AMOUNT && (
                <p className="text-xs text-red-500 text-center">
                  Maximum {formatCurrency(MAX_AMOUNT)} per transaction.
                </p>
              )}
            </motion.div>
          )}

          {/* ===== SUBMITTING ===== */}
          {flow.kind === "submitting" && (
            <motion.div
              key="submitting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-10 gap-3"
            >
              <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Starting your payment…
              </p>
            </motion.div>
          )}

          {/* ===== AWAITING PIN ===== */}
          {flow.kind === "awaiting_pin" && (
            <motion.div
              key="awaiting"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-6 gap-5 text-center"
            >
              <CountdownRing expiresAt={flow.expiresAt} />
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Check your phone
                </h4>
                <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-300 max-w-sm">
                  Enter your M-Pesa PIN on the prompt to confirm{" "}
                  <span className="font-semibold">{formatCurrency(amount)}</span> to{" "}
                  <span className="font-semibold">{group.name}</span>.
                </p>
                <p className="mt-2 text-xs text-gray-400">Don't close this window.</p>
              </div>
            </motion.div>
          )}

          {/* ===== WAITING C2B (manual paybill mode) ===== */}
          {flow.kind === "waiting_c2b" && (
            <motion.div
              key="waiting_c2b"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-6 gap-5 text-center"
            >
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-500/[0.1] text-brand-600 dark:text-brand-400">
                <motion.div
                  animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-2xl bg-brand-400/30 dark:bg-brand-500/20"
                />
                <Smartphone className="relative h-9 w-9" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Waiting for M-Pesa confirmation…
                </h4>
                <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-300 max-w-sm">
                  Pay <span className="font-semibold">{formatCurrency(amount)}</span> to paybill{" "}
                  <span className="font-mono font-semibold">{PAYBILL}</span>, account{" "}
                  <span className="font-mono font-semibold">{paybillAccount}</span>. This screen updates the moment M-Pesa confirms.
                </p>
                <p className="mt-2 text-xs text-gray-400">Usually under 30 seconds.</p>
              </div>
            </motion.div>
          )}

          {/* ===== SUCCESS ===== */}
          {flow.kind === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <div className="flex flex-col items-center py-2 gap-2.5 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 14 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/[0.15] text-emerald-600 dark:text-emerald-400"
                >
                  <CheckCircle2 className="h-9 w-9" />
                </motion.div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Done! {formatCurrency(amount)} received.
                </h4>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-white/[0.06] bg-gray-50/60 dark:bg-white/[0.02] p-4 text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">M-Pesa receipt</span>
                  <span className="font-mono font-semibold text-gray-900 dark:text-white">{flow.mpesaReceipt}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Time</span>
                  <span className="text-gray-700 dark:text-gray-200">
                    {new Date(flow.completedAt).toLocaleString("en-KE", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                  </span>
                </div>
                {typeof flow.newBalance === "number" && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">New wallet balance</span>
                    <span className="font-semibold tabular-nums text-brand-600 dark:text-brand-400">{formatCurrency(flow.newBalance)}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" leftIcon={<Share2 className="h-4 w-4" />} onClick={shareReceipt}>
                  Share to WhatsApp
                </Button>
                <Button variant="premium" rightIcon={<ChevronRight className="h-4 w-4" />} onClick={onClose}>
                  Done
                </Button>
              </div>
            </motion.div>
          )}

          {/* ===== FAILED ===== */}
          {flow.kind === "failed" && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <div className="flex flex-col items-center py-2 gap-2.5 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/[0.15] text-red-600 dark:text-red-400">
                  <XCircle className="h-9 w-9" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Payment didn't go through</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm">{flow.reason}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => setFlow({ kind: "idle" })}>
                  Try again
                </Button>
                <Button variant="ghost" onClick={onClose}>Close</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>

      <MpesaAccountPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        accounts={mpesaAccounts}
        selectedId={selectedAccountId}
        onSelect={setSelectedAccountId}
      />
    </>
  );
}

export default ContributeModal;
