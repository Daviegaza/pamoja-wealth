import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown, BookOpen, MessageCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const FAQS = [
  {
    q: "What is a chama?",
    a: "A chama is an informal savings and investment group common across East Africa. Members contribute regularly to a shared pool, which is then used for loans, investments, or distributed as dividends. Chamas are also known as savings groups, merry-go-rounds, or investment clubs.",
  },
  {
    q: "How do I create or join a chama on Pamoja Wealth?",
    a: "To create a chama, sign up and go to My Chamas → Create Chama. Fill in your chama name, category, contribution amount, and location. To join an existing chama, use an invite code from a current member or browse public chamas from the Join Chama page.",
  },
  {
    q: "How do contributions work?",
    a: "Members contribute via M-Pesa (Paybill 247247), bank transfer, or card. Contributions are auto-detected or manually recorded by the treasurer. Every contribution is logged with a date, amount, method, and status — visible to all chama members for full transparency.",
  },
  {
    q: "Can I apply for a loan through the platform?",
    a: "Yes. From the Loans page, you can submit a loan application specifying the amount, purpose, and term. Your application is reviewed by chama officials. Approved loans appear on your dashboard with repayment schedules. Loan terms (interest, duration, guarantors) are set by your chama.",
  },
  {
    q: "How does voting work?",
    a: "Chama officials can create votes for group decisions — from electing officials to approving loans or changing contribution amounts. Members cast their votes on the Voting page. Results are tallied automatically and visible to all members once the vote closes.",
  },
  {
    q: "Is Pamoja Wealth a bank or SACCO?",
    a: "No. Pamoja Wealth is a management and record-keeping platform. We do not hold, custody, or transfer funds. All money movement happens through licensed payment providers (M-Pesa, banks). We provide the tools to track and manage your chama's finances — not the financial services themselves.",
  },
  {
    q: "Is my data secure?",
    a: "We use encryption in transit and at rest, access controls, and follow security best practices. Our full security practices are detailed on the Security page. Note: This is currently a demonstration platform — production security infrastructure will be deployed before handling real financial data.",
  },
  {
    q: "Can I use Pamoja Wealth on my phone?",
    a: "Yes. The platform is designed to work on mobile browsers and will be available as a native app on Android (Google Play) and iOS (App Store). The mobile experience includes all desktop features optimized for smaller screens.",
  },
  {
    q: "How much does it cost?",
    a: "Pamoja Wealth offers a free Starter plan for small groups (up to 15 members). The Growth plan at KES 2,500/month supports larger groups with advanced analytics and priority support. Enterprise plans with custom features and dedicated support are available for SACCOs and networks.",
  },
];

const GUIDES = [
  { title: "Getting Started Guide", desc: "Set up your account, create or join a chama, and make your first contribution.", icon: BookOpen },
  { title: "Treasury Management", desc: "Track contributions, manage group funds, generate reports, and handle disbursements.", icon: BookOpen },
  { title: "Loan Management", desc: "Configure loan policies, review applications, track repayments, and manage defaults.", icon: BookOpen },
  { title: "Meetings & Voting", desc: "Schedule meetings, set agendas, create votes, and record minutes.", icon: BookOpen },
  { title: "Investment Tracking", desc: "Add investments, monitor performance, track ROI, and manage portfolio allocation.", icon: BookOpen },
  { title: "Security & Permissions", desc: "Manage member roles, set permissions, enable 2FA, and review audit logs.", icon: BookOpen },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl px-6 py-16 lg:py-24 space-y-16"
    >
      {/* Hero */}
      <section className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-500/[0.08] text-brand-600">
            <HelpCircle className="h-6 w-6" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Help & Guides</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Everything you need to get the most out of Pamoja Wealth for your chama.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to="/support"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <MessageCircle className="h-4 w-4" /> Contact Support
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-brand-500" /> Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="card-hover overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="font-medium text-sm text-gray-900 dark:text-white pr-4">{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${openFaq === idx ? "rotate-180" : ""}`}
                />
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
                    <p className="px-4 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Guides */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-brand-500" /> Platform Guides
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {GUIDES.map((guide) => (
            <motion.div key={guide.title} whileHover={{ y: -2 }} className="card-hover p-5 group cursor-pointer">
              <div className="flex items-start gap-3">
                <guide.icon className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {guide.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{guide.desc}</p>
                  <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-brand-600">
                    Read guide <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
