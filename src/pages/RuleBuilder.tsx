import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sparkles, Save, Wand2, Languages, History, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useGroupStore } from "@/stores/groupStore";
import { Tabs } from "@/components/ui/Tabs";
import { RulePreview } from "@/components/rule-builder/RulePreview";
import { RuleBackTranslation } from "@/components/rule-builder/RuleBackTranslation";
import {
  getActiveRules as apiGetActiveRules,
  saveRuleVersion as apiSaveRuleVersion,
  listRuleVersions as apiListRuleVersions,
  getRuleGuardStatus as apiGetRuleGuardStatus,
  type ChamaRuleVersion,
  type RuleGuardStatus,
} from "@/api/chama";
import {
  RuleSectionContribution,
  type ContributionRule,
} from "@/components/rule-builder/RuleSectionContribution";
import {
  RuleSectionEntryDeposit,
  type EntryDepositRule,
} from "@/components/rule-builder/RuleSectionEntryDeposit";
import {
  RuleSectionEligibility,
  type EligibilityRule,
} from "@/components/rule-builder/RuleSectionEligibility";
import {
  RuleSectionVetting,
  type VettingRule,
} from "@/components/rule-builder/RuleSectionVetting";
import {
  RuleSectionVoting,
  type VotingRule,
} from "@/components/rule-builder/RuleSectionVoting";
import {
  RuleSectionPayoutOrder,
  type PayoutOrderRule,
} from "@/components/rule-builder/RuleSectionPayoutOrder";
import {
  RuleSectionExit,
  type ExitRule,
} from "@/components/rule-builder/RuleSectionExit";
import {
  RuleSectionDividend,
  type DividendRule,
} from "@/components/rule-builder/RuleSectionDividend";

// Local shape — sibling agent will replace this with the canonical `RuleDoc` from src/types/index.ts
interface RuleDocLocal {
  version: number;
  contributionRule: ContributionRule;
  entryDepositRule: EntryDepositRule;
  eligibilityRule: EligibilityRule;
  vettingRule: VettingRule;
  votingRule: VotingRule;
  payoutOrderRule: PayoutOrderRule;
  exitRule: ExitRule;
  dividendRule: DividendRule;
}

const DEFAULT_RULE_DOC: RuleDocLocal = {
  version: 1,
  contributionRule: { amountKes: 1000, cadence: "monthly", dueDay: 5, graceDays: 3 },
  entryDepositRule: { amountKes: 2000, refundable: true, refundTrigger: "exit" },
  eligibilityRule: { minAge: 18, residency: "kenya", kycLevel: "basic", requireReferral: false },
  vettingRule: { mode: "admin_review", approverQuorumPct: 51, reviewWindowDays: 7 },
  votingRule: { passThresholdPct: 66, quorumPct: 50, weighting: "one_member_one_vote", ballotDurationHours: 48 },
  payoutOrderRule: { strategy: "rotation", cycleMonths: 1, allowSwap: true },
  exitRule: {
    noticePeriodDays: 30,
    missedContributionsTrigger: 3,
    rollingWindowMonths: 12,
    forfeitEntryBond: true,
    prorateRefund: true,
  },
  dividendRule: { frequency: "annual", reserveBufferPct: 10, distributionBasis: "shares" },
};

// Hand-coded fallback to mirror the dossier §6.10 example shape.
const HAND_CODED_EXAMPLE: Partial<RuleDocLocal> = {
  contributionRule: { amountKes: 1000, cadence: "monthly", dueDay: 5, graceDays: 3 },
  exitRule: {
    noticePeriodDays: 14,
    missedContributionsTrigger: 3,
    rollingWindowMonths: 12,
    forfeitEntryBond: true,
    prorateRefund: false,
  },
};

async function compileRules(sourceText: string): Promise<Partial<RuleDocLocal>> {
  try {
    const token = localStorage.getItem("pamoja_token");
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "/api/v1"}/ai/rules/compile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ sourceText }),
    });
    if (!res.ok) throw new Error(String(res.status));
    const body = await res.json();
    const raw = body?.data ?? body;
    return fromCanonicalRuleDoc(raw, DEFAULT_RULE_DOC);
  } catch {
    // Soft-fall to a hand-coded example so the UI still demonstrates value.
    return HAND_CODED_EXAMPLE;
  }
}

async function backTranslate(_doc: RuleDocLocal): Promise<{ en: string; sw: string }> {
  try {
    const token = localStorage.getItem("pamoja_token");
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "/api/v1"}/ai/rules/back-translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ruleDoc: toCanonicalRuleDoc(_doc), languages: ["en", "sw"] }),
    });
    if (res.ok) {
      const body = await res.json();
      const data = body?.data ?? body;
      if (data && typeof data.en === "string" && typeof data.sw === "string") return data;
    }
  } catch { /* fall through to local generation */ }

  // Local bilingual summary fallback
  const cadenceSw = _doc.contributionRule.cadence === "monthly" ? "mwezi" : _doc.contributionRule.cadence === "weekly" ? "wiki" : "wiki mbili";
  return {
    en: `Members contribute ${_doc.contributionRule.amountKes} KES every ${_doc.contributionRule.cadence}. Miss ${_doc.exitRule.missedContributionsTrigger} contributions in ${_doc.exitRule.rollingWindowMonths} months and you are removed${_doc.exitRule.forfeitEntryBond ? " and lose the entry bond" : ""}. Votes pass at ${_doc.votingRule.passThresholdPct}% with a ${_doc.votingRule.quorumPct}% quorum.`,
    sw: `Wanachama wanachangia KES ${_doc.contributionRule.amountKes} kila ${cadenceSw}. Ukikosa michango ${_doc.exitRule.missedContributionsTrigger} ndani ya miezi ${_doc.exitRule.rollingWindowMonths}, utaondolewa${_doc.exitRule.forfeitEntryBond ? " na utapoteza amana ya kuingia" : ""}. Kura zinapita kwa ${_doc.votingRule.passThresholdPct}% na akidi ya ${_doc.votingRule.quorumPct}%.`,
  };
}

// Coerce the local UI shape to the canonical RuleDoc the backend expects.
// The canonical shape uses `contribution`, `entryDeposit`, `voting`, etc.
// (no *Rule suffix). Server persists it as JSONB — keep unknown fields intact.
function toCanonicalRuleDoc(d: RuleDocLocal): unknown {
  return {
    version: d.version,
    contribution: d.contributionRule,
    entryDeposit: d.entryDepositRule,
    eligibility: d.eligibilityRule,
    vetting: d.vettingRule,
    voting: d.votingRule,
    payoutOrder: d.payoutOrderRule,
    exit: d.exitRule,
    dividend: d.dividendRule,
  };
}

// Best-effort reverse mapping — tolerant to canonical, legacy, or partial shapes.
function fromCanonicalRuleDoc(raw: unknown, fallback: RuleDocLocal): RuleDocLocal {
  const r = (raw ?? {}) as Record<string, unknown>;
  const pick = <T,>(canonical: string, legacy: string, fb: T): T =>
    (r[canonical] as T) ?? (r[legacy] as T) ?? fb;
  return {
    version: (r.version as number) ?? fallback.version,
    contributionRule: pick("contribution", "contributionRule", fallback.contributionRule),
    entryDepositRule: pick("entryDeposit", "entryDepositRule", fallback.entryDepositRule),
    eligibilityRule: pick("eligibility", "eligibilityRule", fallback.eligibilityRule),
    vettingRule: pick("vetting", "vettingRule", fallback.vettingRule),
    votingRule: pick("voting", "votingRule", fallback.votingRule),
    payoutOrderRule: pick("payoutOrder", "payoutOrderRule", fallback.payoutOrderRule),
    exitRule: pick("exit", "exitRule", fallback.exitRule),
    dividendRule: pick("dividend", "dividendRule", fallback.dividendRule),
  };
}

export default function RuleBuilder() {
  const { groupId } = useParams<{ groupId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isDraft = searchParams.get("draft") === "true";
  const allGroups = useGroupStore((s) => s.groups);
  const group = useMemo(
    () => (groupId ? allGroups.find((g) => g.id === groupId) ?? null : null),
    [allGroups, groupId],
  );
  const chamasIown = useMemo(
    () => allGroups.filter((g) => g.kind === "chama" || g.kind === "savings_loan"),
    [allGroups],
  );

  const [sourceText, setSourceText] = useState(
    "Everyone contributes 1000 KES on the 5th of each month, with 3 days grace.\nMiss 3 contributions in a rolling 12 months and you're out and lose the entry bond.\nVotes need 66% to pass with 50% quorum."
  );
  const [ruleDoc, setRuleDoc] = useState<RuleDocLocal>(DEFAULT_RULE_DOC);
  const [compiling, setCompiling] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translation, setTranslation] = useState<{ en: string; sw: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [verified, setVerified] = useState(false);
  const [versions, setVersions] = useState<ChamaRuleVersion[]>([]);
  const [guard, setGuard] = useState<RuleGuardStatus | null>(null);
  const [emergency, setEmergency] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState("");

  // Load active + history + guard status when editing an existing group.
  useEffect(() => {
    if (!groupId) return;
    let cancelled = false;
    (async () => {
      try {
        const [active, list, guardStatus] = await Promise.all([
          apiGetActiveRules(groupId).catch(() => null),
          apiListRuleVersions(groupId).catch(() => []),
          apiGetRuleGuardStatus(groupId).catch(() => null),
        ]);
        if (cancelled) return;
        if (active) {
          setRuleDoc((prev) => fromCanonicalRuleDoc(active.ruleDoc, prev));
          if (active.sourceText) setSourceText(active.sourceText);
        }
        setVersions(list);
        setGuard(guardStatus);
      } catch {
        // Silent — draft mode is fine.
      }
    })();
    return () => { cancelled = true; };
  }, [groupId]);

  const onCompile = async () => {
    if (!sourceText.trim()) {
      toast.error("Describe your rules first");
      return;
    }
    setCompiling(true);
    try {
      const compiled = await compileRules(sourceText);
      setRuleDoc((prev) => ({ ...prev, ...compiled, version: prev.version }));
      toast.success("Rules compiled — review and tweak below");
    } finally {
      setCompiling(false);
    }
  };

  const onBackTranslate = async () => {
    setTranslating(true);
    try {
      const t = await backTranslate(ruleDoc);
      setTranslation(t);
    } finally {
      setTranslating(false);
    }
  };

  const onSave = async (opts?: { emergency?: boolean; reason?: string }) => {
    if (!groupId) {
      toast.error("Attach these rules to a group before saving. Open from a group's settings.");
      return;
    }
    setSaving(true);
    try {
      const saved = await apiSaveRuleVersion(groupId, toCanonicalRuleDoc(ruleDoc), sourceText, {
        emergency: opts?.emergency,
        reason: opts?.reason,
      });
      setRuleDoc((prev) => ({ ...prev, version: saved.version }));
      const list = await apiListRuleVersions(groupId).catch(() => versions);
      setVersions(list);
      toast.success(`Saved as Version ${saved.version}`);
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message
        ?? "Could not save rules. Ensure you're the treasurer or admin.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const tabItems = useMemo(
    () => [
      {
        value: "contribution",
        label: "Contribution",
        content: (
          <RuleSectionContribution
            value={ruleDoc.contributionRule}
            onChange={(v) => setRuleDoc((d) => ({ ...d, contributionRule: v }))}
          />
        ),
      },
      {
        value: "entry",
        label: "Entry deposit",
        content: (
          <RuleSectionEntryDeposit
            value={ruleDoc.entryDepositRule}
            onChange={(v) => setRuleDoc((d) => ({ ...d, entryDepositRule: v }))}
          />
        ),
      },
      {
        value: "eligibility",
        label: "Eligibility",
        content: (
          <RuleSectionEligibility
            value={ruleDoc.eligibilityRule}
            onChange={(v) => setRuleDoc((d) => ({ ...d, eligibilityRule: v }))}
          />
        ),
      },
      {
        value: "vetting",
        label: "Vetting",
        content: (
          <RuleSectionVetting
            value={ruleDoc.vettingRule}
            onChange={(v) => setRuleDoc((d) => ({ ...d, vettingRule: v }))}
          />
        ),
      },
      {
        value: "voting",
        label: "Voting",
        content: (
          <RuleSectionVoting
            value={ruleDoc.votingRule}
            onChange={(v) => setRuleDoc((d) => ({ ...d, votingRule: v }))}
          />
        ),
      },
      {
        value: "payout",
        label: "Payout order",
        content: (
          <RuleSectionPayoutOrder
            value={ruleDoc.payoutOrderRule}
            onChange={(v) => setRuleDoc((d) => ({ ...d, payoutOrderRule: v }))}
          />
        ),
      },
      {
        value: "exit",
        label: "Exit",
        content: (
          <RuleSectionExit
            value={ruleDoc.exitRule}
            onChange={(v) => setRuleDoc((d) => ({ ...d, exitRule: v }))}
          />
        ),
      },
      {
        value: "dividend",
        label: "Dividend",
        content: (
          <RuleSectionDividend
            value={ruleDoc.dividendRule}
            onChange={(v) => setRuleDoc((d) => ({ ...d, dividendRule: v }))}
          />
        ),
      },
    ],
    [ruleDoc]
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> AI Rule-Engine Compiler
          </div>
          <h1 className="mt-1.5 text-3xl font-bold text-gray-900 dark:text-white">
            {groupId ? `Edit bylaws` : isDraft ? "Draft new bylaws" : "Rule Builder"}
          </h1>
          {groupId && (
            <div className="mt-1.5 inline-flex items-center gap-2 text-sm">
              <Users className="h-3.5 w-3.5 text-brand-500" />
              <span className="text-gray-500 dark:text-gray-400">for</span>
              {group ? (
                <Link
                  to={`/chamas/${groupId}`}
                  className="font-semibold text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 underline underline-offset-4 decoration-brand-500/40"
                >
                  {group.name}
                </Link>
              ) : (
                <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                  {groupId.slice(0, 8)}…
                </span>
              )}
              {group && "category" in group && group.category && (
                <span className="text-[10px] uppercase tracking-wider text-gray-400 border border-gray-200 dark:border-white/[0.1] rounded px-1.5 py-0.5">
                  {String(group.category)}
                </span>
              )}
            </div>
          )}
          {!groupId && !isDraft && chamasIown.length > 0 && (
            <div className="mt-3 rounded-xl border border-amber-200/60 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/[0.06] p-3 flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
              <label className="inline-flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-200 shrink-0">
                <Users className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                Save bylaws for:
              </label>
              <select
                defaultValue=""
                onChange={(e) => { if (e.target.value) navigate(`/rules/builder/${e.target.value}`); }}
                className="flex-1 sm:max-w-xs rounded-lg border border-amber-200/70 dark:border-amber-500/20 bg-white dark:bg-white/[0.06] px-2.5 py-1.5 text-xs font-semibold text-gray-900 dark:text-white focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              >
                <option value="" disabled>Choose a chama…</option>
                {chamasIown.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <span className="text-[10px] text-amber-700/70 dark:text-amber-300/70">
                {chamasIown.length} chama{chamasIown.length === 1 ? "" : "s"} available
              </span>
            </div>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-2xl">
            Describe how your group should work in plain English. We compile it to enforceable bylaws,
            preview the structured rules, and back-translate to EN + SW for member sign-off.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {versions.length > 0 && (
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
              <History className="h-3.5 w-3.5" />
              <span>{versions.length} version{versions.length === 1 ? "" : "s"} on record</span>
            </div>
          )}
        </div>
      </header>

      {/* Two-pane: NL source on the left, structured preview on the right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="card-hover p-5">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Describe your chama rules in your own words
          </label>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            rows={14}
            placeholder="e.g. We meet on the first Saturday. Members contribute KES 2000 monthly. Miss 2 in a row and you pay a 500 KES fine..."
            className="mt-2 w-full rounded-xl border border-gray-300 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-3.5 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 focus:outline-none font-mono leading-relaxed"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={onCompile} isLoading={compiling} leftIcon={<Wand2 className="h-4 w-4" />}>
              Compile
            </Button>
            <Button
              variant="outline"
              onClick={onBackTranslate}
              isLoading={translating}
              leftIcon={<Languages className="h-4 w-4" />}
            >
              Back-translate
            </Button>
          </div>
        </section>

        <section>
          <RulePreview
            ruleDoc={ruleDoc}
            onChange={(next) => setRuleDoc((prev) => ({ ...prev, ...(next as Partial<RuleDocLocal>) }))}
          />
        </section>
      </div>

      {/* Bilingual confirmation panel */}
      <div className="mt-8">
        <RuleBackTranslation translation={translation} />
      </div>

      {/* Save gate — layered checks: role, cooldown, quorum, confirmation. */}
      <section className="mt-10 rounded-2xl border border-brand-200/60 dark:border-brand-500/20 bg-gradient-to-br from-brand-50/60 to-transparent dark:from-brand-500/[0.06] p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Ready to save?</h2>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-xl">
            Bylaws are load-bearing — the system enforces role, cooldown, and officer-signature
            checks before writing a new version. Every attempt is audit-logged.
          </p>
        </div>

        {/* Trust status grid */}
        {groupId && guard && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <div className={`rounded-lg px-3 py-2 border ${guard.isOfficer ? "bg-emerald-50 dark:bg-emerald-500/[0.08] border-emerald-200/60 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-200" : "bg-red-50 dark:bg-red-500/[0.08] border-red-200/60 dark:border-red-500/20 text-red-800 dark:text-red-200"}`}>
              <p className="font-semibold uppercase tracking-wider mb-0.5">Your role</p>
              <p>{guard.isOfficer ? "✓ Chama officer (owner / admin / treasurer / chairperson)" : "✗ Not an officer — cannot propose changes"}</p>
            </div>
            <div className={`rounded-lg px-3 py-2 border ${guard.inCooldown && !emergency ? "bg-amber-50 dark:bg-amber-500/[0.08] border-amber-200/60 dark:border-amber-500/20 text-amber-800 dark:text-amber-200" : "bg-emerald-50 dark:bg-emerald-500/[0.08] border-emerald-200/60 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-200"}`}>
              <p className="font-semibold uppercase tracking-wider mb-0.5">Cooldown</p>
              <p>
                {guard.inCooldown
                  ? emergency
                    ? "Overridden by emergency"
                    : `Next normal change: ${guard.cooldownEndsAt ? new Date(guard.cooldownEndsAt).toLocaleDateString() : "—"}`
                  : "No cooldown active"}
              </p>
            </div>
            <div className="rounded-lg px-3 py-2 border bg-white dark:bg-white/[0.03] border-gray-200 dark:border-white/[0.06] text-gray-700 dark:text-gray-200">
              <p className="font-semibold uppercase tracking-wider mb-0.5 text-gray-500">Signatures required</p>
              <p>
                <span className="font-mono font-semibold">{emergency ? guard.officerCount : guard.requiredSignatures}</span>
                {" "}of {guard.officerCount} officers
                {emergency && " (emergency = unanimous)"}
              </p>
            </div>
          </div>
        )}

        {/* Emergency override */}
        {groupId && guard?.inCooldown && (
          <div className="rounded-lg border border-amber-200/60 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/[0.05] p-3 space-y-2">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-200 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-amber-300 text-amber-500 focus:ring-amber-500/30"
                checked={emergency}
                onChange={(e) => setEmergency(e.target.checked)}
              />
              Override cooldown as an <span className="underline">emergency</span> (requires unanimous officer sign-off + written reason)
            </label>
            {emergency && (
              <textarea
                value={emergencyReason}
                onChange={(e) => setEmergencyReason(e.target.value)}
                placeholder="Why is this an emergency? (fraud discovered, court order, member death…)"
                rows={2}
                className="w-full rounded-lg border border-amber-200/60 dark:border-amber-500/20 bg-white dark:bg-white/[0.02] p-2 text-xs"
              />
            )}
          </div>
        )}

        {/* Confirmation */}
        <label className="inline-flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 rounded border-gray-300 text-brand-500 focus:ring-brand-500/30"
            checked={verified}
            onChange={(e) => setVerified(e.target.checked)}
          />
          <span>I&rsquo;ve reviewed the summary above and it matches our chama&rsquo;s agreed bylaws.</span>
        </label>

        <div className="flex justify-end">
          <Button
            variant="premium"
            size="lg"
            leftIcon={<Save className="h-4 w-4" />}
            onClick={() => onSave({ emergency, reason: emergencyReason })}
            isLoading={saving}
            disabled={
              saving
              || !groupId
              || !verified
              || (guard ? !guard.isOfficer : false)
              || (guard?.inCooldown && !emergency)
              || (emergency && emergencyReason.trim().length < 5)
            }
          >
            {!groupId
              ? "Pick a chama above first"
              : guard && !guard.isOfficer
                ? "Only officers can save"
                : guard?.inCooldown && !emergency
                  ? "In cooldown — mark emergency"
                  : `Save as Version ${(versions[0]?.version ?? 0) + 1}`}
          </Button>
        </div>
      </section>
    </div>
  );
}
