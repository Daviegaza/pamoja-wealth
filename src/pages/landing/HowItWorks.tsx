import { motion } from "framer-motion";
import { UserPlus, Wallet, LineChart, Users } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create or Join a Chama",
    desc: "Start your own savings group in 2 minutes, or join an existing one with an invite code.",
    gradient: "icon-gradient-brand",
  },
  {
    number: "02",
    icon: Wallet,
    title: "Contribute & Track",
    desc: "Members contribute via M-Pesa, bank, or card. Every shilling is tracked automatically.",
    gradient: "icon-gradient-blue",
  },
  {
    number: "03",
    icon: LineChart,
    title: "Grow & Borrow",
    desc: "Invest collectively in stocks, bonds, and real estate. Access fair loans when you need them.",
    gradient: "icon-gradient-purple",
  },
  {
    number: "04",
    icon: Users,
    title: "Decide Together",
    desc: "Schedule meetings, cast votes, and make decisions as a group — all inside the platform.",
    gradient: "icon-gradient-emerald",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider"
        >
          How It Works
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mt-3 text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight"
        >
          From paper to platform in 4 steps
        </motion.h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STEPS.map((step, idx) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
            className="relative"
          >
            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-brand-200 to-transparent dark:from-brand-500/20" />
            )}
            <div className="card-hover p-6 text-center group">
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${step.gradient} shadow-soft-sm mb-4`}>
                <step.icon className="h-6 w-6" />
              </div>
              <p className="text-[11px] font-bold text-brand-500 dark:text-brand-400 tracking-widest mb-1">
                STEP {step.number}
              </p>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
