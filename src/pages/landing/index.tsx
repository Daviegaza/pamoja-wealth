import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NON_CUSTODIAL_STATEMENT } from "@/lib/copy";
import { PricingSection } from "./PricingSection";

const STEPS = [
  { title: "Members pay the chama directly", body: "Into your chama's own M-Pesa Paybill/Till or bank account — exactly as you do today." },
  { title: "The treasurer records it", body: "Amount, date, method and the M-Pesa code as proof. It takes seconds on a phone." },
  { title: "Each member confirms", body: "Members confirm their own entries, or dispute them with a reason. No more arguing over a notebook." },
  { title: "Everyone sees the same books", body: "Statements, loan balances, minutes and a permanent audit log of every change." },
];

const FEATURES = [
  { title: "Contribution records", body: "Schedules, recorded payments, member confirmation and disputes, goals." },
  { title: "Loan register", body: "Record loans the chama gives from its own account, and every repayment." },
  { title: "Meetings & minutes", body: "Agendas, RSVPs and minutes kept with the chama's records." },
  { title: "Statements", body: "Per-member and whole-chama statements, downloadable as CSV or PDF." },
  { title: "Roles", body: "Chairperson, treasurer, secretary and member — each sees and does only what their role allows." },
  { title: "Audit log", body: "Every record change is logged with who made it and when. Nothing is silently edited." },
];

const IS = [
  "A shared, tamper-evident record book for your chama",
  "A flat subscription per chama — no fees on your money",
];
const IS_NOT = [
  "A wallet, bank or M-Pesa account — we never hold your money",
  "A lender — we do not give, disburse or charge interest on loans",
  "An investment product — we do not offer shares, dividends or returns",
];

const FAQS = [
  {
    q: "Does Pamoja Wealth hold our chama's money?",
    a: "No. Pamoja Wealth is a record-keeping tool. Members pay directly into the chama's own M-Pesa Paybill/Till or bank account. We never receive, hold or move that money.",
  },
  {
    q: "How do we know a recorded payment is real?",
    a: "The treasurer can attach the M-Pesa receipt code from the chama's statement, and the member it belongs to must confirm it. If something is wrong, the member disputes it and the dispute is visible to officers.",
  },
  {
    q: "Can records be changed after the fact?",
    a: "Officers can void a wrong entry with a reason and record a corrected one. Nothing is deleted, and every change appears in the audit log.",
  },
  {
    q: "Who can see member phone numbers and balances?",
    a: "Officers (chairperson, treasurer, secretary) see member details needed to run the chama. Ordinary members see their own contributions and loans, and the chama-wide statement.",
  },
  {
    q: "What does it cost?",
    a: "Small chamas can start on the free plan. Larger chamas pay a flat monthly or yearly subscription per chama. There are no transaction fees and we never take a cut of contributions or loans.",
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-16 sm:pt-24 pb-16">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">Chama record-keeping</p>
        <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white leading-[1.05] max-w-3xl">
          Your chama's books, kept honestly and shared with every member.
        </h1>
        <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
          Record contributions and loans, run meetings and share statements — while your money stays in your chama's own
          M-Pesa or bank account.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link to="/register">
            <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>Start free</Button>
          </Link>
          <Link to="/help">
            <Button size="lg" variant="outline">How it works</Button>
          </Link>
        </div>
        <p className="mt-6 max-w-2xl text-sm text-gray-500 dark:text-gray-400 border-l-2 border-brand-500 pl-3">{NON_CUSTODIAL_STATEMENT}</p>
      </section>

      <section id="how-it-works" className="border-t border-gray-100 dark:border-white/[0.05]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">How it works</h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{i + 1}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{s.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="features" className="border-t border-gray-100 dark:border-white/[0.05]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">What you can keep in Pamoja</h2>
          <dl className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <dt className="font-semibold text-gray-900 dark:text-white">{f.title}</dt>
                <dd className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t border-gray-100 dark:border-white/[0.05] bg-gray-50/60 dark:bg-white/[0.01]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 grid gap-10 sm:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">What Pamoja is</h2>
            <ul className="mt-4 space-y-3">
              {IS.map((t) => (
                <li key={t} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">What Pamoja is not</h2>
            <ul className="mt-4 space-y-3">
              {IS_NOT.map((t) => (
                <li key={t} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <XCircle className="h-5 w-5 shrink-0 text-gray-400" aria-hidden="true" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <PricingSection />

      <section id="faq" className="border-t border-gray-100 dark:border-white/[0.05]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Questions</h2>
          <div className="mt-6 divide-y divide-gray-200 dark:divide-white/[0.06]">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="cursor-pointer list-none font-medium text-gray-900 dark:text-white flex justify-between gap-4 focus-ring rounded">
                  {f.q}
                  <span className="text-gray-400 group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
                </summary>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 dark:border-white/[0.05]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bring your chama's notebook online</h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400">Free for small chamas. No card needed.</p>
          </div>
          <Link to="/register">
            <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>Create your account</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
