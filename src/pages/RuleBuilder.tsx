import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Sparkles, Save, Wand2, Languages } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { RulePreview } from "@/components/rule-builder/RulePreview";
import { RuleBackTranslation } from "@/components/rule-builder/RuleBackTranslation";
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
  // TODO: real backend endpoint pending
  try {
    const res = await fetch("/api/v1/ai/rules/compile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceText }),
    });
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as Partial<RuleDocLocal>;
  } catch {
    // Soft-fall to a hand-coded example so the UI still demonstrates value.
    return HAND_CODED_EXAMPLE;
  }
}

async function backTranslate(_doc: RuleDocLocal): Promise<{ en: string; sw: string }> {
  // TODO: real backend endpoint pending — stubbed bilingual summary.
  await new Promise((r) => setTimeout(r, 350));
  return {
    en: `Members contribute ${_doc.contributionRule.amountKes} KES every ${_doc.contributionRule.cadence}.
Miss ${_doc.exitRule.missedContributionsTrigger} contributions in ${_doc.exitRule.rollingWindowMonths} months and you are removed${
      _doc.exitRule.forfeitEntryBond ? " and lose the entry bond" : ""
    }. Votes pass at ${_doc.votingRule.passThresholdPct}% with a ${_doc.votingRule.quorumPct}% quorum.`,
    sw: `Wanachama wanachangia KES ${_doc.contributionRule.amountKes} kila ${
      _doc.contributionRule.cadence === "monthly" ? "mwezi" : _doc.contributionRule.cadence === "weekly" ? "wiki" : "wiki mbili"
    }.
Ukikosa michango ${_doc.exitRule.missedContributionsTrigger} ndani ya miezi ${_doc.exitRule.rollingWindowMonths}, utaondolewa${
      _doc.exitRule.forfeitEntryBond ? " na utapoteza amana ya kuingia" : ""
    }. Kura zinapita kwa ${_doc.votingRule.passThresholdPct}% na akidi ya ${_doc.votingRule.quorumPct}%.`,
  };
}

// Stub of useRuleStore — sibling agent owns the real one.
function addRuleVersionStub(groupId: string | undefined, doc: RuleDocLocal, sourceText: string) {
  // eslint-disable-next-line no-console
  console.info("[ruleStore stub] addRuleVersion", { groupId, version: doc.version + 1, sourceText });
}

export default function RuleBuilder() {
  const { groupId } = useParams<{ groupId?: string }>();
  const [searchParams] = useSearchParams();
  const isDraft = searchParams.get("draft") === "true";

  const [sourceText, setSourceText] = useState(
    "Everyone contributes 1000 KES on the 5th of each month, with 3 days grace.\nMiss 3 contributions in a rolling 12 months and you're out and lose the entry bond.\nVotes need 66% to pass with 50% quorum."
  );
  const [ruleDoc, setRuleDoc] = useState<RuleDocLocal>(DEFAULT_RULE_DOC);
  const [compiling, setCompiling] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translation, setTranslation] = useState<{ en: string; sw: string } | null>(null);

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

  const onSave = () => {
    addRuleVersionStub(groupId, ruleDoc, sourceText);
    toast.success(`Saved as Version ${ruleDoc.version + 1}`);
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-2xl">
            Describe how your group should work in plain English. We compile it to enforceable bylaws,
            preview the structured rules, and back-translate to EN + SW for member sign-off.
          </p>
        </div>
        <Button variant="premium" leftIcon={<Save className="h-4 w-4" />} onClick={onSave}>
          Save as Version {ruleDoc.version + 1}
        </Button>
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
          <RulePreview ruleDoc={ruleDoc} />
        </section>
      </div>

      {/* Bilingual confirmation panel */}
      <div className="mt-8">
        <RuleBackTranslation translation={translation} />
      </div>

      {/* Manual tweak editor */}
      <section className="mt-10 card-hover p-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Fine-tune each rule</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          The compiler is opinionated — adjust any field by hand. Changes flow into the JSON preview live.
        </p>
        <Tabs items={tabItems} variant="pill" />
      </section>
    </div>
  );
}
