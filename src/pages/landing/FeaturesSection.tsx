import { motion } from "framer-motion";
import { BarChart3, Bot, CreditCard, ShieldCheck, Users, Wallet } from "lucide-react";

const FEATURES = [
  {
    icon: Wallet,
    title: "Smart Treasury",
    desc: "Track every shilling with real-time contribution and treasury management built for groups.",
    gradient: "icon-gradient-brand",
  },
  {
    icon: CreditCard,
    title: "Instant Loans",
    desc: "Apply, approve, and disburse member loans with automated interest and repayment tracking.",
    gradient: "icon-gradient-blue",
  },
  {
    icon: BarChart3,
    title: "Investment Analytics",
    desc: "Visualize portfolio performance across stocks, bonds, real estate and money markets.",
    gradient: "icon-gradient-purple",
  },
  {
    icon: Users,
    title: "Member Management",
    desc: "Onboard, manage roles, and track shares and contributions for every member effortlessly.",
    gradient: "icon-gradient-amber",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    desc: "Get instant, intelligent answers about your chama's finances, contributions, and trends.",
    gradient: "icon-gradient-cyan",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    desc: "Bank-grade encryption, role-based access, and two-factor authentication for peace of mind.",
    gradient: "icon-gradient-emerald",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider"
        >
          Everything you need
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mt-3 text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight"
        >
          One platform, complete chama control
        </motion.h2>
      </div>
      <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((f, idx) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.06, duration: 0.35 }}
            className="card-hover p-6 group"
          >
            <div className={f.gradient + " flex h-12 w-12 items-center justify-center rounded-xl shadow-soft-sm"}>
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-base font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {f.title}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
