/**
 * Global paywall modal.
 *
 * Listens for `pamoja:paywall` CustomEvent (emitted by the axios interceptor
 * on 402 responses) and shows an upgrade CTA. Deep-links to /pricing with
 * the plan preselected.
 *
 * Mounted once at App root — near-zero cost.
 */
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

interface PaywallDetail {
  feature: string;
  requiredPlan: string;
  upgradeUrl: string;
  message: string;
}

export function PaywallModal() {
  const [detail, setDetail] = useState<PaywallDetail | null>(null);

  useEffect(() => {
    function onPaywall(e: Event) {
      const c = e as CustomEvent<PaywallDetail>;
      setDetail(c.detail);
    }
    window.addEventListener("pamoja:paywall", onPaywall);
    return () => window.removeEventListener("pamoja:paywall", onPaywall);
  }, []);

  return (
    <AnimatePresence>
      {detail && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-md" onClick={() => setDetail(null)} />
          <motion.div
            className="relative w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 p-6 shadow-2xl ring-1 ring-gray-200/70 dark:ring-white/[0.06]"
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              onClick={() => setDetail(null)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="h-12 w-12 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-brand-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Upgrade to {detail.requiredPlan.toUpperCase()}</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{detail.message}</p>
            <ul className="mt-4 space-y-1.5 text-[12px] text-gray-500 dark:text-gray-400">
              <li>• Unlock <span className="font-semibold text-gray-900 dark:text-white">{detail.feature.replace(/_/g, " ")}</span></li>
              <li>• Priority support + advanced analytics</li>
              <li>• Cancel anytime · no lock-in</li>
            </ul>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setDetail(null)}>Not now</Button>
              <Link
                to={detail.upgradeUrl}
                onClick={() => setDetail(null)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-3 py-1.5 transition-colors"
              >
                See {detail.requiredPlan} plans
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
