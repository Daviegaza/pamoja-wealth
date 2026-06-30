/**
 * Public /pricing page.
 *
 * Visual style mirrors landing/PricingSection.tsx + landing/FAQSection.tsx
 * (motion-on-view, gradient-border for the highlighted plan, brand-coloured
 * accents). Differs in being a standalone route with FAQ + comparison table
 * + SACCO discount banner — the landing version is a teaser only.
 *
 * Per docs/RESEARCH_DOSSIER.md §1 (M-Changa Rex Masai backlash), the
 * harambee FAQ entry leads with fee transparency: harambees are free for
 * organisers because donors carry the 2.5% platform fee, surfaced pre-totals.
 */
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, X, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { PLANS, COUPONS } from "@/mock/billing";
import type { BillingCadence, FeatureKey, Plan } from "@/api/billing";

const FEATURE_ROWS: { key: FeatureKey | "memberCap" | "groupCap"; label: string }[] = [
  { key: "memberCap", label: "Member cap" },
  { key: "groupCap", label: "Groups" },
  { key: "ai_rule_compiler", label: "AI Rule Compiler" },
  { key: "recurring_billing", label: "M-Pesa Ratiba recurring billing" },
  { key: "advanced_analytics", label: "Advanced analytics" },
  { key: "whatsapp_bot", label: "WhatsApp bot" },
  { key: "dedicated_paybill", label: "Dedicated M-Pesa paybill" },
  { key: "ai_loan_underwriter", label: "AI Loan Underwriter" },
  { key: "custom_branding", label: "Custom branding" },
  { key: "audit_export", label: "Audit log export" },
  { key: "multi_group", label: "Multi-group" },
  { key: "api_access", label: "API access" },
  { key: "white_label", label: "White-label" },
  { key: "dedicated_csm", label: "Dedicated success manager" },
];

const FAQS = [
  {
    q: "What payment methods do you accept?",
    a: "M-Pesa STK Push (one-tap), M-Pesa Ratiba (auto-renewing standing order — Sep 2024 launch), Visa / Mastercard via Flutterwave, and bank transfer for Enterprise. All prices are in KES and include VAT.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel at period end (default) keeps you on the plan until your next bill date; cancel immediately moves you to Free now and we prorate-refund any unused time. No long-term contracts.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes — pro-rated refunds on immediate cancellation, and a 14-day money-back guarantee on the first paid period. Reach out to billing@pamojawealth.app and we'll handle it within 2 business days.",
  },
  {
    q: "Is tax included? What about KRA / VAT?",
    a: "All prices shown include 16% VAT. We issue KRA-compliant ETR receipts for every paid invoice and remit excise duty (where applicable per the Finance Act 2025) on your behalf.",
  },
  {
    q: "How does proration work when I change plans?",
    a: "Upgrades take effect immediately and we charge the prorated difference for the remainder of your billing period. Downgrades schedule for the start of the next period — you keep access to the higher tier until then.",
  },
  {
    q: "Aren't harambees expensive on other platforms? What do they cost on Pamoja?",
    a: "Harambees are always free for organisers on Pamoja. Donors pay a flat 2.5% platform fee shown pre-totals — donors see exactly what the family receives before authorising the M-Pesa STK Push. This is in direct response to the 2024 Rex Masai / Evans Kiratu backlash where KES 127K was deducted from KES 2.87M raised for protest victims' families. Transparency-first, always.",
  },
];

function fmtKes(n: number): string {
  if (n === 0) return "Free";
  return `KES ${n.toLocaleString("en-KE")}`;
}

function fmtCap(cap: number | null): string {
  if (cap === null) return "Unlimited";
  return cap.toLocaleString("en-KE");
}

export default function Pricing() {
  const [cadence, setCadence] = useState<BillingCadence>("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showCompare, setShowCompare] = useState(false);

  const plans = useMemo(() => PLANS, []);

  return (
    <div className="bg-gradient-to-b from-white via-brand-50/20 to-white dark:from-neutral-950 dark:via-brand-500/[0.02] dark:to-neutral-950">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-16 sm:pt-24 pb-12 text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider"
        >
          Pricing
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-[1.05]"
        >
          Built for chamas, harambees, and every{" "}
          <span className="bg-gradient-to-r from-brand-600 via-brand-400 to-emerald-400 dark:from-brand-400 dark:via-brand-300 dark:to-emerald-300 bg-clip-text text-transparent">
            pot of money
          </span>{" "}
          in between.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-5 text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto"
        >
          Free forever for small groups. Upgrade as you grow.
          <span className="block mt-1 text-sm">No card required to start.</span>
        </motion.p>

        {/* Cadence toggle */}
        <div className="mt-8 inline-flex items-center rounded-full border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] p-1 shadow-soft-sm">
          {(["monthly", "annual"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCadence(c)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2",
                cadence === c
                  ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-soft-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              {c === "monthly" ? "Monthly" : "Annual"}
              {c === "annual" && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    cadence === c
                      ? "bg-white/20 text-white"
                      : "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  )}
                >
                  Save 2 months
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Plan cards */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="grid lg:grid-cols-4 gap-5">
          {plans.map((plan, idx) => (
            <PlanCard key={plan.code} plan={plan} cadence={cadence} delay={idx * 0.05} />
          ))}
        </div>
      </section>

      {/* SACCO banner */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-brand-200 dark:border-brand-500/30 bg-gradient-to-r from-brand-50 via-white to-emerald-50 dark:from-brand-500/[0.08] dark:via-neutral-900 dark:to-emerald-500/[0.06] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white shadow-glow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              SASRA-registered SACCO? Get 50% off any plan.
            </p>
            <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
              Use code <span className="font-mono font-semibold text-brand-700 dark:text-brand-300">SACCO50</span> at checkout. We verify your SASRA licence in 48 hours.
            </p>
          </div>
          <Link to="/register">
            <Button variant="outline" size="sm">Claim SACCO discount</Button>
          </Link>
        </motion.div>
      </section>

      {/* Compare all features */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <button
          onClick={() => setShowCompare((s) => !s)}
          className="mx-auto flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 focus-ring rounded-lg px-3 py-2"
        >
          {showCompare ? "Hide" : "Compare"} all features
          <ChevronDown className={cn("h-4 w-4 transition-transform", showCompare && "rotate-180")} />
        </button>
        <AnimatePresence initial={false}>
          {showCompare && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-6 card-base overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.04]">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Feature</th>
                      {plans.map((p) => (
                        <th key={p.code} className={cn("p-4 font-semibold text-center", p.highlighted ? "text-brand-700 dark:text-brand-300" : "text-gray-700 dark:text-gray-300")}>
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                    {FEATURE_ROWS.map((row) => (
                      <tr key={row.key}>
                        <td className="p-4 text-gray-700 dark:text-gray-300">{row.label}</td>
                        {plans.map((p) => (
                          <td key={p.code} className="p-4 text-center">
                            {row.key === "memberCap" ? (
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{fmtCap(p.memberCap)}</span>
                            ) : row.key === "groupCap" ? (
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{fmtCap(p.groupCap)}</span>
                            ) : p.features[row.key as FeatureKey] ? (
                              <Check className="h-4 w-4 mx-auto text-brand-600 dark:text-brand-400" />
                            ) : (
                              <X className="h-4 w-4 mx-auto text-gray-300 dark:text-white/[0.15]" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="text-center">
          <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">FAQ</p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Pricing questions, answered</h2>
        </div>
        <div className="mt-10 space-y-3">
          {FAQS.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.04 }}
              className={cn(
                "card-base overflow-hidden transition-all duration-200",
                openFaq === idx && "border-l-4 border-l-brand-500 shadow-soft-md"
              )}
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="flex w-full items-center justify-between p-5 text-left gap-4"
                aria-expanded={openFaq === idx}
              >
                <span className={cn("font-medium text-sm transition-colors", openFaq === idx ? "text-brand-600 dark:text-brand-400" : "text-gray-900 dark:text-white")}>
                  {faq.q}
                </span>
                <ChevronDown className={cn("h-4 w-4 shrink-0 transition-all duration-200", openFaq === idx ? "rotate-180 text-brand-500" : "text-gray-400")} />
              </button>
              <AnimatePresence initial={false}>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Coupon hint */}
      <section className="mx-auto max-w-3xl px-6 pb-16 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Try <span className="font-mono font-semibold text-brand-700 dark:text-brand-300">{COUPONS[0].code}</span> at checkout — {COUPONS[0].description.toLowerCase()}.
        </p>
      </section>

      {/* Footer CTA */}
      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <div className="rounded-3xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-neutral-900/40 p-8 sm:p-10 shadow-soft">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Still have questions?</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Our team replies within 4 hours — usually faster.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/support">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Talk to us
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline">Start free</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ===== Plan card =====

function PlanCard({ plan, cadence, delay }: { plan: Plan; cadence: BillingCadence; delay: number }) {
  const price = cadence === "monthly" ? plan.monthlyPriceKes : plan.annualPriceKes;
  const period = cadence === "monthly" ? "/month" : "/year";
  const isFree = plan.code === "free";
  const isEnterprise = plan.code === "enterprise";

  const cta = isFree
    ? { label: "Start free", to: "/register", variant: "outline" as const }
    : isEnterprise
      ? { label: "Talk to sales", to: "/support", variant: "outline" as const }
      : { label: "Start 14-day trial", to: `/billing/upgrade?plan=${plan.code}`, variant: plan.highlighted ? ("premium" as const) : ("primary" as const) };

  // Pull the most-important 5 features for the card (full list in compare table).
  const featureBullets: { feature: FeatureKey; label: string }[] = [
    { feature: "ai_rule_compiler", label: "AI Rule Compiler" },
    { feature: "recurring_billing", label: "Recurring M-Pesa billing" },
    { feature: "advanced_analytics", label: "Advanced analytics" },
    { feature: "whatsapp_bot", label: "WhatsApp bot" },
    { feature: "ai_loan_underwriter", label: "AI Loan Underwriter" },
    { feature: "custom_branding", label: "Custom branding" },
    { feature: "api_access", label: "API access" },
    { feature: "dedicated_csm", label: "Dedicated CSM" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.35 }}
      className={cn(
        "relative rounded-2xl p-6 sm:p-7 flex flex-col",
        plan.highlighted
          ? "border-2 border-brand-500 bg-white dark:bg-neutral-900/60 shadow-glow-md lg:-translate-y-2 z-10"
          : "border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] shadow-soft"
      )}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 text-white text-xs font-semibold px-4 py-1 shadow-glow-sm whitespace-nowrap">
          <Sparkles className="h-3 w-3" /> Most popular
        </span>
      )}

      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{plan.name}</h3>
          {isEnterprise && <Badge variant="brand">Custom</Badge>}
        </div>
        {plan.tagline && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{plan.tagline}</p>}
      </div>

      <div className="mt-5">
        {isEnterprise && price > 0 ? (
          <div>
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">From {fmtKes(price)}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{period}</span>
          </div>
        ) : (
          <div>
            <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{fmtKes(price)}</span>
            {price > 0 && <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{period}</span>}
          </div>
        )}
      </div>

      <div className="mt-5 space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <Check className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
          <span><strong className="font-semibold text-gray-900 dark:text-white">{fmtCap(plan.memberCap)}</strong> members</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
          <span><strong className="font-semibold text-gray-900 dark:text-white">{fmtCap(plan.groupCap)}</strong> {plan.groupCap === 1 ? "group" : "groups"}</span>
        </div>
      </div>

      <ul className="mt-5 space-y-2.5 flex-1">
        {featureBullets.map((f) => {
          const has = plan.features[f.feature];
          return (
            <li key={f.feature} className={cn("flex items-center gap-2.5 text-sm", has ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-600")}>
              <div className={cn("flex h-4 w-4 items-center justify-center rounded-full shrink-0", has ? "bg-brand-50 dark:bg-brand-500/[0.12]" : "bg-gray-50 dark:bg-white/[0.03]")}>
                {has ? <Check className="h-2.5 w-2.5 text-brand-600 dark:text-brand-400" /> : <X className="h-2.5 w-2.5 text-gray-300 dark:text-gray-600" />}
              </div>
              {f.label}
            </li>
          );
        })}
      </ul>

      <Link to={cta.to} className="block mt-7">
        <Button className="w-full" variant={cta.variant} size="md">
          {cta.label}
        </Button>
      </Link>
      {!isFree && !isEnterprise && (
        <p className="mt-2 text-[11px] text-center text-gray-400">No card required to start trial.</p>
      )}
    </motion.div>
  );
}
