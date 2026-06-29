import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Landmark, Briefcase, Heart, Building, ShieldCheck, TrendingUp } from "lucide-react";

const USE_CASES = [
  {
    icon: Users,
    title: "Chama Members",
    desc: "Track your contributions in real time, apply for loans when you need them, participate in group votes, and see exactly where every shilling goes. No more WhatsApp receipts or paper ledgers.",
  },
  {
    icon: Landmark,
    title: "Treasurers",
    desc: "Manage the group treasury with professional tools — automated contribution tracking, instant reports, payment reminders, and full audit trails. Spend less time on spreadsheets and more time growing wealth.",
  },
  {
    icon: Briefcase,
    title: "Chairpersons & Secretaries",
    desc: "Schedule meetings, set agendas, run secure votes, and keep minutes — all in one place. Every decision is documented and every member has a voice.",
  },
  {
    icon: TrendingUp,
    title: "Investment Clubs",
    desc: "Pool funds and invest collectively in stocks, bonds, treasury bills, real estate, and SACCOs. Track portfolio performance, ROI, and asset allocation with professional-grade analytics.",
  },
  {
    icon: Heart,
    title: "Welfare Groups",
    desc: "Manage emergency funds, social contributions, and welfare payouts with transparency. Set contribution rules, track balances, and disburse funds when members need them most.",
  },
  {
    icon: Building,
    title: "SACCO & Network Owners",
    desc: "Oversee multiple chamas from a single dashboard. Monitor treasury health, member growth, loan performance, and group activity across your entire network.",
  },
];

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl px-6 py-16 lg:py-24 space-y-20"
    >
      {/* Hero */}
      <section className="text-center space-y-6">
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
          Building Wealth,{" "}
          <span className="bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent">
            Together
          </span>
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Pamoja Wealth was built to modernize how chamas, savings groups, and investment clubs
          across East Africa manage their money. We replace paper ledgers, WhatsApp threads, and
          spreadsheets with a single, secure platform designed for collective wealth building.
        </p>
      </section>

      {/* Mission */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
        <div className="card-hover p-6 space-y-3">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Across East Africa, millions of people save and invest together through chamas —
            informal savings and investment groups that pool resources for collective benefit.
            These groups manage billions of shillings, yet most still rely on pen and paper,
            scattered WhatsApp messages, and spreadsheets shared between members.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Pamoja Wealth brings these groups into the modern age with a platform that handles
            contributions, loans, investments, meetings, votes, and reporting — all in one place.
            We believe that when groups have better tools, they build more wealth, and when more
            wealth is built collectively, entire communities rise.
          </p>
        </div>
      </section>

      {/* Use Cases */}
      <section className="space-y-6" id="use-cases">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Who is Pamoja Wealth for?</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Designed for every role in the chama ecosystem
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {USE_CASES.map((uc) => (
            <motion.div
              key={uc.title}
              whileHover={{ y: -2 }}
              className="card-hover p-5 group"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/[0.08] text-brand-600 dark:text-brand-400 group-hover:scale-105 transition-transform">
                  <uc.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{uc.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{uc.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-5 bg-gradient-to-br from-brand-50 to-emerald-50 dark:from-brand-500/[0.04] dark:to-emerald-500/[0.04] rounded-3xl p-10">
        <ShieldCheck className="h-10 w-10 mx-auto text-brand-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ready to modernize your chama?</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Join 200+ groups already using Pamoja Wealth to track contributions, manage loans, and
          grow investments together.
        </p>
        <Link
          to="/register"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 text-sm font-semibold text-white hover:from-brand-700 hover:to-brand-600 transition-all shadow-lg shadow-brand-500/25"
        >
          Create a free account
        </Link>
      </section>
    </motion.div>
  );
}
