import { motion } from "framer-motion";
import { Users, Building2, Wallet, Shield } from "lucide-react";

const STATS = [
  { value: "1,000+", label: "Active members", icon: Users },
  { value: "200+", label: "Chamas managed", icon: Building2 },
  { value: "KES 2.4B+", label: "Wealth tracked", icon: Wallet },
  { value: "99.95%", label: "Platform uptime", icon: Shield },
];

export function StatsSection() {
  return (
    <section className="border-y border-gray-100/60 dark:border-white/[0.04] bg-gradient-to-r from-gray-50/80 via-white to-gray-50/80 dark:from-neutral-950 dark:via-white/[0.01] dark:to-neutral-950">
      <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {STATS.map((s, idx) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08, duration: 0.4 }}
            className="text-center group"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/[0.06] text-brand-600 dark:text-brand-400 mb-3 group-hover:scale-110 transition-transform duration-200">
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {s.value}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
