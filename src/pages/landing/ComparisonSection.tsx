import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

type FeatureStatus = "yes" | "no" | "soon";

interface FeatureRow {
  feature: string;
  pamoja: FeatureStatus;
  zenlipa: FeatureStatus;
  chamasoft: FeatureStatus;
  chamabox: FeatureStatus;
}

const FEATURES: FeatureRow[] = [
  { feature: "Analytics & Charts", pamoja: "yes", zenlipa: "yes", chamasoft: "yes", chamabox: "no" },
  { feature: "Investment Tracking", pamoja: "yes", zenlipa: "no", chamasoft: "no", chamabox: "no" },
  { feature: "AI-Powered Insights", pamoja: "yes", zenlipa: "no", chamasoft: "no", chamabox: "no" },
  { feature: "Loan Management", pamoja: "yes", zenlipa: "yes", chamasoft: "yes", chamabox: "yes" },
  { feature: "Voting System", pamoja: "yes", zenlipa: "no", chamasoft: "yes", chamabox: "no" },
  { feature: "Role-Based Access", pamoja: "yes", zenlipa: "yes", chamasoft: "no", chamabox: "no" },
  { feature: "Dark Mode", pamoja: "yes", zenlipa: "no", chamasoft: "no", chamabox: "no" },
  { feature: "Document Management", pamoja: "yes", zenlipa: "yes", chamasoft: "yes", chamabox: "yes" },
  { feature: "Meeting Management", pamoja: "yes", zenlipa: "no", chamasoft: "yes", chamabox: "no" },
  { feature: "Mobile App", pamoja: "yes", zenlipa: "soon", chamasoft: "no", chamabox: "yes" },
  { feature: "Free Tier", pamoja: "yes", zenlipa: "soon", chamasoft: "yes", chamabox: "no" },
];

const COLUMN_HEADERS = ["Pamoja Wealth", "Zenlipa", "Chamasoft", "ChamaBox"];

function StatusIcon({ status }: { status: FeatureStatus }) {
  if (status === "yes") {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
      </span>
    );
  }
  if (status === "soon") {
    return (
      <span className="inline-flex items-center justify-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">
          Soon
        </span>
      </span>
    );
  }
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-white/[0.04]">
      <X className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" strokeWidth={2} />
    </span>
  );
}

export function ComparisonSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-2xl mx-auto"
      >
        <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
          Why Pamoja Wealth?
        </p>
        <h2 className="mt-3 text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
          See how we compare to other chama platforms
        </h2>
      </motion.div>

      {/* Desktop table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="mt-14 overflow-x-auto hidden md:block"
      >
        <table className="w-full min-w-[640px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white dark:bg-neutral-950 text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-white/[0.06]">
                Feature
              </th>
              {COLUMN_HEADERS.map((header) => (
                <th
                  key={header}
                  className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider border-b border-gray-200 dark:border-white/[0.06]"
                >
                  <span
                    className={
                      header === "Pamoja Wealth"
                        ? "text-brand-600 dark:text-brand-400"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  >
                    {header}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((row, idx) => (
              <tr
                key={row.feature}
                className={
                  "group transition-colors duration-150 " +
                  (idx % 2 === 0
                    ? "bg-gray-50/40 dark:bg-white/[0.01]"
                    : "bg-white dark:bg-transparent") +
                  " hover:bg-brand-50/40 dark:hover:bg-brand-500/[0.03]"
                }
              >
                <td className="sticky left-0 bg-inherit px-5 py-4 text-sm font-medium text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-white/[0.03] whitespace-nowrap">
                  {row.feature}
                </td>
                {(["pamoja", "zenlipa", "chamasoft", "chamabox"] as const).map((key) => (
                  <td
                    key={key}
                    className="px-5 py-4 text-center border-b border-gray-100 dark:border-white/[0.03]"
                  >
                    <div className="flex justify-center">
                      <StatusIcon status={row[key]} />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {/* Highlight bar at the bottom */}
          <tfoot>
            <tr>
              <td className="px-5 py-4 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-white/[0.06]">
              </td>
              {COLUMN_HEADERS.map((header, idx) => (
                <td
                  key={header}
                  className="px-5 py-4 text-center border-t border-gray-200 dark:border-white/[0.06]"
                >
                  <span
                    className={
                      "inline-flex items-center gap-1 text-xs font-semibold " +
                      (idx === 0
                        ? "text-brand-600 dark:text-brand-400"
                        : "text-gray-400 dark:text-gray-500")
                    }
                  >
                    {idx === 0 && <Check className="h-3 w-3" strokeWidth={3} />}
                    {idx === 0 ? "Best Pick" : "Partial"}
                  </span>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </motion.div>

      {/* Mobile cards */}
      <div className="mt-10 space-y-4 md:hidden">
        {FEATURES.map((row, idx) => (
          <motion.div
            key={row.feature}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.04 }}
            className="card-hover p-4"
          >
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              {row.feature}
            </p>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
              {(["pamoja", "zenlipa", "chamasoft", "chamabox"] as const).map((key, ci) => (
                <div key={key} className="flex items-center gap-2">
                  <StatusIcon status={row[key]} />
                  <span
                    className={
                      "font-medium " +
                      (ci === 0
                        ? "text-brand-600 dark:text-brand-400"
                        : "text-gray-500 dark:text-gray-400")
                    }
                  >
                    {COLUMN_HEADERS[ci]}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
