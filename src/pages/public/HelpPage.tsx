import { Link } from "react-router-dom";
import { NON_CUSTODIAL_STATEMENT, LOAN_REGISTER_STATEMENT } from "@/lib/copy";

const FAQS = [
  {
    q: "What is a chama?",
    a: "A chama is a savings or welfare group common across East Africa. Members contribute regularly to the group's own account and agree, under their own rules, how that money is used.",
  },
  {
    q: "Does Pamoja Wealth hold, receive or move our money?",
    a: NON_CUSTODIAL_STATEMENT + " Pamoja Wealth is not a bank, SACCO, payment service provider, lender or investment platform.",
  },
  {
    q: "How do I create or join a chama?",
    a: "Sign up, then choose “Create a chama” — you become the chairperson. To join an existing chama, ask its chairperson or secretary for an invite code and enter it under “Join with a code”.",
  },
  {
    q: "How are contributions recorded?",
    a: "Members pay into the chama's own M-Pesa Paybill/Till or bank account. The treasurer (or chairperson) then records the payment in Pamoja: amount, date, method and, optionally, the M-Pesa receipt code as proof. The member sees the entry and confirms it, or disputes it with a reason.",
  },
  {
    q: "What if a record is wrong?",
    a: "The member disputes it. The treasurer can void the wrong entry with a reason and record a corrected one. Nothing is deleted — every change is kept in the chama's audit log.",
  },
  {
    q: "How does the loan register work?",
    a: LOAN_REGISTER_STATEMENT + " The treasurer records a loan after the chama has paid it out from its own account, then records each repayment as it comes in.",
  },
  {
    q: "Who can see what?",
    a: "Officers (chairperson, treasurer, secretary) see the chama's full records and member contact details. Members see their own contributions and loans, the chama-wide statement, meetings and the audit log.",
  },
  {
    q: "Can we download our records?",
    a: "Yes. Any member can download their own statement, and the chama statement, as CSV or PDF from the Statements tab.",
  },
  {
    q: "How much does it cost?",
    a: "Small chamas can use the free plan. Larger chamas pay a flat subscription per chama — see Pricing. There are no transaction fees.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 space-y-10">
      <header>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Help</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400">How Pamoja Wealth works, in plain language.</p>
      </header>
      <div className="divide-y divide-gray-200 dark:divide-white/[0.06]">
        {FAQS.map((f, i) => (
          <details key={f.q} className="group py-4" open={i < 2}>
            <summary className="cursor-pointer list-none font-medium text-gray-900 dark:text-white flex justify-between gap-4 focus-ring rounded">
              {f.q}
              <span className="text-gray-400 group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
            </summary>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
      <p className="text-sm text-gray-500">
        See also our <Link to="/terms" className="text-brand-600 hover:underline">Terms</Link> and{" "}
        <Link to="/privacy" className="text-brand-600 hover:underline">Privacy notice</Link>.
      </p>
    </div>
  );
}
