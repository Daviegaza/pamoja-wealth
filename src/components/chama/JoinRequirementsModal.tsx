/**
 * Before-you-join modal.
 *
 * Fetches the active bylaws for a chama and surfaces the concrete
 * requirements the applicant needs to know: entry bond, contribution
 * amount + cadence, sponsors needed, voting rules, exit terms. Only
 * after the applicant sees these does the actual Join click fire.
 *
 * Called from JoinChamaPage cards.
 */
import { useQuery } from "@tanstack/react-query";
import { Coins, Calendar, Users, ShieldCheck, LogOut, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getActiveRules, type ChamaRuleVersion } from "@/api/chama";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  chamaId: string;
  chamaName: string;
  monthlyContribution?: number;
  memberCount?: number;
  confirming?: boolean;
}

function pick(doc: Record<string, unknown> | undefined, ...keys: string[]): Record<string, unknown> | null {
  if (!doc) return null;
  for (const k of keys) {
    const v = doc[k];
    if (v && typeof v === "object") return v as Record<string, unknown>;
  }
  return null;
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function kes(n: number): string {
  return `KES ${n.toLocaleString("en-KE")}`;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function JoinRequirementsModal({ isOpen, onClose, onConfirm, chamaId, chamaName, monthlyContribution, memberCount, confirming }: Props) {
  const rulesQ = useQuery({
    queryKey: ["chama-rules-active", chamaId],
    queryFn: () => getActiveRules(chamaId),
    enabled: isOpen,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const rules = rulesQ.data as ChamaRuleVersion | null | undefined;
  const doc = (rules?.ruleDoc as Record<string, unknown>) ?? {};

  const contribution = pick(doc, "contribution", "contributionRule");
  const entry = pick(doc, "entryDeposit", "entryDepositRule");
  const eligibility = pick(doc, "eligibility", "eligibilityRule");
  const vetting = pick(doc, "vetting", "vettingRule");
  const voting = pick(doc, "voting", "votingRule");
  const payoutOrder = pick(doc, "payoutOrder", "payoutOrderRule");
  const exitRule = pick(doc, "exit", "exitRule");

  const contributionAmount = contribution ? num(contribution.amountKes ?? contribution.amount, monthlyContribution ?? 0) : (monthlyContribution ?? 0);
  const contributionCadence = String(contribution?.cadence ?? contribution?.frequency ?? "monthly");
  const contributionDay = num(contribution?.dueDayOfMonth ?? contribution?.day, 5);
  const graceDays = num(contribution?.graceDays ?? contribution?.grace, 3);

  const entryBond = entry ? num(entry.amountKes ?? entry.amount, 0) : 0;
  const minAge = eligibility ? num(eligibility.minAge, 18) : 18;
  const location = String(eligibility?.location ?? "anywhere");
  const sponsorsRequired = vetting ? num(vetting.sponsorsRequired ?? vetting.sponsors, 0) : 0;
  const passPct = voting ? num(voting.passPct ?? voting.threshold, 66) : 66;
  const quorumPct = voting ? num(voting.quorumPct ?? voting.quorum, 50) : 50;
  const payoutMethod = String(payoutOrder?.method ?? payoutOrder?.strategy ?? "rotation");
  const consecutiveMisses = exitRule ? num(exitRule.consecutiveMisses ?? exitRule.strikes, 3) : 3;
  const forfeitBond = exitRule?.forfeitBond === true;

  const totalUpfront = entryBond + contributionAmount;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-md" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-2xl ring-1 ring-gray-200/70 dark:ring-white/[0.06] max-h-[85vh] overflow-y-auto"
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <button onClick={onClose} className="absolute right-4 top-4 rounded-xl p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.05]" aria-label="Close">
              <X className="h-4 w-4" />
            </button>

            <div className="pr-8">
              <p className="text-xs uppercase tracking-wider font-semibold text-brand-600 dark:text-brand-400">Before you join</p>
              <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{chamaName}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{memberCount ?? 0} members · read the bylaws below before applying</p>
            </div>

            {rulesQ.isLoading && (
              <div className="mt-6 h-40 animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.03]" />
            )}

            {!rulesQ.isLoading && !rules && (
              <div className="mt-6 rounded-xl border border-amber-200/60 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/[0.06] p-3 text-xs text-amber-800 dark:text-amber-200 inline-flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                This chama has not published formal bylaws yet. Ask an existing member what the entry deposit and contribution rules are before you commit.
              </div>
            )}

            {!rulesQ.isLoading && rules && (
              <div className="mt-6 space-y-3">
                {/* Cost to join right now */}
                <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-emerald-50 dark:from-brand-500/[0.08] dark:to-emerald-500/[0.06] p-4 border border-brand-200/60 dark:border-brand-500/20">
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-brand-700 dark:text-brand-300">You&rsquo;ll pay to join</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{kes(totalUpfront)}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                    {entryBond > 0 && (
                      <Badge variant="default">Entry bond {kes(entryBond)}</Badge>
                    )}
                    <Badge variant="default">First {contributionCadence} contribution {kes(contributionAmount)}</Badge>
                  </div>
                </div>

                {/* Requirements list */}
                <Row icon={<Coins className="h-4 w-4 text-brand-500" />} label="Contributions">
                  {kes(contributionAmount)} <b>{contributionCadence}</b>, due on the <b>{ordinal(contributionDay)}</b>. {graceDays} day{graceDays === 1 ? "" : "s"} of grace.
                </Row>

                {entryBond > 0 && (
                  <Row icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />} label="Entry deposit">
                    A one-time bond of <b>{kes(entryBond)}</b> when you join.
                  </Row>
                )}

                {eligibility && (
                  <Row icon={<Users className="h-4 w-4 text-blue-500" />} label="Who can join">
                    At least <b>{minAge}</b> years old, living <b>{location}</b>.
                  </Row>
                )}

                {sponsorsRequired > 0 && (
                  <Row icon={<Users className="h-4 w-4 text-purple-500" />} label="Sponsors">
                    You need <b>{sponsorsRequired}</b> existing member{sponsorsRequired === 1 ? "" : "s"} to sponsor your application before you&rsquo;re admitted.
                  </Row>
                )}

                <Row icon={<Calendar className="h-4 w-4 text-cyan-500" />} label="Payouts">
                  Distributed in <b>{payoutMethod}</b> order.
                </Row>

                {voting && (
                  <Row icon={<ShieldCheck className="h-4 w-4 text-amber-500" />} label="Voting">
                    Motions need <b>{passPct}%</b> yes with at least <b>{quorumPct}%</b> quorum.
                  </Row>
                )}

                <Row icon={<LogOut className="h-4 w-4 text-red-500" />} label="Exit + defaults">
                  Miss <b>{consecutiveMisses}</b> contributions in 12 months and you&rsquo;re out. Bond is <b>{forfeitBond ? "forfeited" : "returned"}</b>.
                </Row>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-2">
              <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button
                variant="premium"
                className="flex-1"
                isLoading={confirming}
                onClick={onConfirm}
              >
                I agree — apply to join
              </Button>
            </div>
            <p className="mt-2 text-[10px] text-center text-gray-500 dark:text-gray-400">
              Your application is subject to sponsor + officer approval per the bylaws.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 dark:border-white/[0.05] bg-gray-50/50 dark:bg-white/[0.02] p-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-0.5 text-sm text-gray-900 dark:text-white leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
