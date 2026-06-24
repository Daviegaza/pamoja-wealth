import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    desc: "For small chamas getting started",
    features: ["Up to 20 members", "Basic treasury tools", "1 active loan pool", "Email support"],
    highlighted: false,
  },
  {
    name: "Growth",
    price: "KES 2,500",
    period: "/month",
    desc: "For growing groups and SACCOs",
    features: ["Up to 200 members", "Advanced analytics", "Unlimited loans", "AI Assistant", "Priority support"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For large cooperatives and networks",
    features: ["Unlimited members", "Custom integrations", "Dedicated account manager", "SLA and compliance tools"],
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider"
        >
          Pricing
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mt-3 text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight"
        >
          Simple, transparent pricing
        </motion.h2>
        <p className="mt-3 text-gray-500 dark:text-gray-400">
          Choose the plan that fits your chama. Upgrade anytime.
        </p>
      </div>
      <div className="mt-14 grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map((plan, idx) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08, duration: 0.35 }}
            className={cn(
              "rounded-2xl p-8 relative",
              plan.highlighted
                ? "gradient-border bg-white dark:bg-neutral-900/50 shadow-glow-lg scale-[1.02] z-10"
                : "bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.05] shadow-soft"
            )}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 text-white text-xs font-semibold px-4 py-1 shadow-glow-sm">
                Most Popular
              </span>
            )}
            <h3 className="font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{plan.desc}</p>
            <div className="mt-5">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{plan.price}</span>
              {plan.period && <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{plan.period}</span>}
            </div>
            <ul className="mt-7 space-y-3.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/[0.08] shrink-0">
                    <Check className="h-3 w-3 text-brand-600 dark:text-brand-400" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/register" className="block mt-8">
              <Button className="w-full" variant={plan.highlighted ? "premium" : "outline"} size="lg">
                Choose {plan.name}
              </Button>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
