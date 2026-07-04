import { Sparkles } from "lucide-react";

/**
 * Editable rule-doc preview.
 *
 * Reads the compiled RuleDoc, renders one sentence per rule with inline
 * inputs where the meaningful numbers live. Users edit here directly —
 * no JSON, no separate "fine-tune" tabs.
 */

interface RuleDocLike {
  contribution?: Record<string, unknown>;
  contributionRule?: Record<string, unknown>;
  entryDeposit?: Record<string, unknown>;
  entryDepositRule?: Record<string, unknown>;
  eligibility?: Record<string, unknown>;
  eligibilityRule?: Record<string, unknown>;
  vetting?: Record<string, unknown>;
  vettingRule?: Record<string, unknown>;
  voting?: Record<string, unknown>;
  votingRule?: Record<string, unknown>;
  payoutOrder?: Record<string, unknown>;
  payoutOrderRule?: Record<string, unknown>;
  exit?: Record<string, unknown>;
  exitRule?: Record<string, unknown>;
  dividend?: Record<string, unknown>;
  dividendRule?: Record<string, unknown>;
  [k: string]: unknown;
}

interface Props {
  ruleDoc: unknown;
  onChange?: (next: RuleDocLike) => void;
}

export function RulePreview({ ruleDoc, onChange }: Props) {
  const doc = (ruleDoc as RuleDocLike) ?? {};

  function patch(bucket: keyof RuleDocLike, field: string, value: unknown) {
    if (!onChange) return;
    // Prefer the aliased "short" key (contribution) then the "Rule" key.
    const shortKey = String(bucket).replace(/Rule$/, "") as keyof RuleDocLike;
    const long = doc[shortKey] ?? doc[bucket] ?? {};
    const nextBucket = { ...(long as Record<string, unknown>), [field]: value };
    onChange({
      ...doc,
      [shortKey]: nextBucket,
      [bucket]: nextBucket,
    } as RuleDocLike);
  }

  const contribution = (doc.contribution ?? doc.contributionRule ?? {}) as Record<string, unknown>;
  const entry = (doc.entryDeposit ?? doc.entryDepositRule ?? {}) as Record<string, unknown>;
  const eligibility = (doc.eligibility ?? doc.eligibilityRule ?? {}) as Record<string, unknown>;
  const vetting = (doc.vetting ?? doc.vettingRule ?? {}) as Record<string, unknown>;
  const voting = (doc.voting ?? doc.votingRule ?? {}) as Record<string, unknown>;
  const payoutOrder = (doc.payoutOrder ?? doc.payoutOrderRule ?? {}) as Record<string, unknown>;
  const exitRule = (doc.exit ?? doc.exitRule ?? {}) as Record<string, unknown>;
  const dividend = (doc.dividend ?? doc.dividendRule ?? {}) as Record<string, unknown>;

  const num = (v: unknown, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };
  const str = (v: unknown, fallback = "") => (v == null ? fallback : String(v));

  const hasAny = [contribution, entry, eligibility, vetting, voting, payoutOrder, exitRule, dividend]
    .some((b) => Object.keys(b).length > 0);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-neutral-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
          <Sparkles className="h-3.5 w-3.5 text-brand-500" />
          Bylaws — click any number or word in blue to edit
        </div>
      </div>

      <div className="p-5 space-y-3 max-h-[520px] overflow-auto">
        {!hasAny && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No rules compiled yet. Describe your chama in plain English on the left and press <b>Compile</b>.
          </p>
        )}

        {Object.keys(contribution).length > 0 && (
          <Card title="Contributions">
            Every member contributes{" "}
            <MoneyEdit
              value={num(contribution.amountKes ?? contribution.amount, 1000)}
              onChange={(v) => patch("contributionRule", "amountKes", v)}
            />
            {" "}
            <TextEdit
              value={str(contribution.cadence ?? contribution.frequency, "monthly")}
              options={["daily", "weekly", "monthly", "quarterly"]}
              onChange={(v) => patch("contributionRule", "cadence", v)}
            />, due on the{" "}
            <NumEdit
              value={num(contribution.dueDayOfMonth ?? contribution.day, 5)}
              min={1} max={28}
              onChange={(v) => patch("contributionRule", "dueDayOfMonth", v)}
            />{ordinal(num(contribution.dueDayOfMonth ?? contribution.day, 5))}.{" "}
            <NumEdit
              value={num(contribution.graceDays ?? contribution.grace, 3)}
              min={0} max={30}
              onChange={(v) => patch("contributionRule", "graceDays", v)}
            />{" "}days of grace before a penalty applies.
          </Card>
        )}

        {Object.keys(entry).length > 0 && (
          <Card title="Entry deposit">
            New members pay a one-time bond of{" "}
            <MoneyEdit
              value={num(entry.amountKes ?? entry.amount, 5000)}
              onChange={(v) => patch("entryDepositRule", "amountKes", v)}
            /> when they join.
          </Card>
        )}

        {Object.keys(eligibility).length > 0 && (
          <Card title="Who can join">
            Members must be at least{" "}
            <NumEdit
              value={num(eligibility.minAge, 18)}
              min={16} max={80}
              onChange={(v) => patch("eligibilityRule", "minAge", v)}
            />{" "}years old and live{" "}
            <TextInputEdit
              value={str(eligibility.location, "anywhere in Kenya")}
              onChange={(v) => patch("eligibilityRule", "location", v)}
            />.
          </Card>
        )}

        {Object.keys(vetting).length > 0 && (
          <Card title="Vetting">
            New members need{" "}
            <NumEdit
              value={num(vetting.sponsorsRequired ?? vetting.sponsors, 2)}
              min={0} max={10}
              onChange={(v) => patch("vettingRule", "sponsorsRequired", v)}
            />{" "}sponsors from existing members before joining.
          </Card>
        )}

        {Object.keys(voting).length > 0 && (
          <Card title="Voting">
            A motion passes when{" "}
            <NumEdit
              value={num(voting.passPct ?? voting.threshold, 66)}
              min={50} max={100} suffix="%"
              onChange={(v) => patch("votingRule", "passPct", v)}
            />{" "}agree, with at least{" "}
            <NumEdit
              value={num(voting.quorumPct ?? voting.quorum, 50)}
              min={10} max={100} suffix="%"
              onChange={(v) => patch("votingRule", "quorumPct", v)}
            />{" "}of members present.
          </Card>
        )}

        {Object.keys(payoutOrder).length > 0 && (
          <Card title="Payout order">
            Payouts go out in{" "}
            <TextEdit
              value={str(payoutOrder.method ?? payoutOrder.strategy, "rotation")}
              options={["rotation", "auction", "need-based", "random-draw"]}
              onChange={(v) => patch("payoutOrderRule", "method", v)}
            /> order.
          </Card>
        )}

        {Object.keys(exitRule).length > 0 && (
          <Card title="Exit + defaulters">
            Miss{" "}
            <NumEdit
              value={num(exitRule.consecutiveMisses ?? exitRule.strikes, 3)}
              min={1} max={12}
              onChange={(v) => patch("exitRule", "consecutiveMisses", v)}
            />{" "}contributions in a rolling 12 months and you&rsquo;re out — you{" "}
            <TextEdit
              value={exitRule.forfeitBond === true ? "forfeit" : "keep"}
              options={["forfeit", "keep"]}
              onChange={(v) => patch("exitRule", "forfeitBond", v === "forfeit")}
            />{" "}your entry bond.
          </Card>
        )}

        {Object.keys(dividend).length > 0 && (
          <Card title="Dividends">
            Profits are distributed{" "}
            <TextEdit
              value={str(dividend.method, "pro-rata by shares")}
              options={["pro-rata by shares", "equal split", "seniority weighted"]}
              onChange={(v) => patch("dividendRule", "method", v)}
            />,{" "}
            <TextEdit
              value={dividend.annual === false ? "at the AGM" : "annually"}
              options={["annually", "at the AGM", "quarterly"]}
              onChange={(v) => patch("dividendRule", "annual", v === "annually")}
            />.
          </Card>
        )}
      </div>
    </div>
  );
}

// ── Bits ────────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-white/[0.05] bg-gray-50/50 dark:bg-white/[0.02] p-3">
      <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <p className="text-sm text-gray-900 dark:text-white leading-loose">{children}</p>
    </div>
  );
}

const editClass =
  "inline-flex items-center border-b border-dashed border-brand-400/60 text-brand-700 dark:text-brand-300 font-semibold bg-brand-50/50 dark:bg-brand-500/[0.08] px-1 rounded";

function NumEdit({ value, onChange, min, max, suffix }: { value: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string }) {
  return (
    <span className={editClass}>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-transparent outline-none border-0 p-0 w-[3.5em] text-brand-700 dark:text-brand-300 font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      {suffix}
    </span>
  );
}

function MoneyEdit({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <span className={editClass}>
      <span className="mr-1 text-brand-700 dark:text-brand-300">KES</span>
      <input
        type="number"
        value={value}
        min={0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-transparent outline-none border-0 p-0 w-[6em] text-brand-700 dark:text-brand-300 font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </span>
  );
}

function TextEdit({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <span className={editClass}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-none border-0 p-0 text-brand-700 dark:text-brand-300 font-semibold pr-1"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-white text-gray-900">{o}</option>
        ))}
      </select>
    </span>
  );
}

function TextInputEdit({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <span className={editClass}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-none border-0 p-0 min-w-[10em] text-brand-700 dark:text-brand-300 font-semibold"
      />
    </span>
  );
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
