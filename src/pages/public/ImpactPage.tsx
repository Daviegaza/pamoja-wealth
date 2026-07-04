/**
 * Public impact scoreboard page. Doubles as SEO landing.
 *
 * Route: /impact
 */
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Coins, HandCoins, Globe, TrendingUp, Heart } from "lucide-react";
import { getImpact } from "@/api/impact";

function formatKes(n: number): string {
  if (n >= 1_000_000_000) return `KES ${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `KES ${(n / 1_000).toFixed(0)}k`;
  return `KES ${n.toLocaleString("en-KE")}`;
}

export default function ImpactPage() {
  const q = useQuery({ queryKey: ["impact"], queryFn: getImpact, staleTime: 5 * 60 * 1000 });
  const s = q.data;

  const stats = s ? [
    { icon: Users, label: "Chamas active", value: s.chamasActive.toLocaleString("en-KE"), color: "text-brand-500" },
    { icon: Heart, label: "Members served", value: s.membersServed.toLocaleString("en-KE"), color: "text-rose-500" },
    { icon: Coins, label: "Contributions moved", value: formatKes(s.contributionsKes), color: "text-emerald-500" },
    { icon: HandCoins, label: "Loans issued", value: formatKes(s.loansIssuedKes), color: "text-amber-500" },
    { icon: TrendingUp, label: "Harambee raised", value: formatKes(s.harambeeRaisedKes), color: "text-purple-500" },
    { icon: Globe, label: "Countries", value: s.countries.toString(), color: "text-cyan-500" },
  ] : [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center max-w-2xl mx-auto">
        <p className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
          <TrendingUp className="h-3.5 w-3.5" /> Live impact scoreboard
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
          Real money moving real lives.
        </h1>
        <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
          Updated every 10 minutes from Pamoja Wealth&rsquo;s ledger. Every KES counted is hash-chained
          to a POCAMLA-compliant audit trail — nothing can be edited retroactively.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
            className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-gray-200/70 dark:ring-white/[0.06] p-5 shadow-[var(--shadow-2)]"
          >
            <stat.icon className={`h-6 w-6 ${stat.color} mb-3`} />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
        {!s && [...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-gray-200/70 dark:ring-white/[0.06] p-5 h-32 animate-pulse" />
        ))}
      </div>

      <div className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
        {s?.cached && "Cached snapshot · "}Verify these numbers yourself — every chama&rsquo;s ledger is exportable, hash-chained, and open to its members.
      </div>
    </div>
  );
}
