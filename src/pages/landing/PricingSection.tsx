import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listPlans } from "@/api/billing";
import { Button } from "@/components/ui/Button";
import { formatKes } from "@/lib/format";

/** Plans come from the backend (GET /billing/plans) — no prices are hard-coded here. */
export function PricingSection({ standalone = false }: { standalone?: boolean }) {
  const plans = useQuery({ queryKey: ["plans"], queryFn: listPlans, staleTime: 5 * 60_000 });
  const Heading = standalone ? "h1" : "h2";

  return (
    <section id="pricing" className="border-t border-gray-100 dark:border-white/[0.05]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <Heading className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Pricing</Heading>
        <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl">
          One flat subscription per chama. No transaction fees, and no cut of your contributions or loans — that money never
          passes through us.
        </p>

        {plans.isLoading ? (
          <p className="mt-8 text-sm text-gray-500" role="status">Loading plans…</p>
        ) : plans.isError || (plans.data?.length ?? 0) === 0 ? (
          <p className="mt-8 text-sm text-gray-500">Plans could not be loaded right now. Sign up free and see plans under Billing.</p>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <caption className="sr-only">Subscription plans</caption>
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200 dark:border-white/[0.08]">
                  <th className="py-2 pr-4">Plan</th>
                  <th className="py-2 pr-4">Members</th>
                  <th className="py-2 pr-4">Monthly</th>
                  <th className="py-2">Yearly</th>
                </tr>
              </thead>
              <tbody>
                {plans.data!.map((p) => (
                  <tr key={p.code} className="border-b border-gray-100 dark:border-white/[0.05]">
                    <td className="py-3 pr-4 font-semibold text-gray-900 dark:text-white">{p.name}</td>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{p.memberCap ? `Up to ${p.memberCap}` : "Unlimited"}</td>
                    <td className="py-3 pr-4 tabular-nums">{p.monthlyPriceKes === 0 ? "Free" : formatKes(p.monthlyPriceKes)}</td>
                    <td className="py-3 tabular-nums">{p.annualPriceKes === 0 ? "Free" : formatKes(p.annualPriceKes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Link to="/register" className="mt-8 inline-block">
          <Button>Start free</Button>
        </Link>
      </div>
    </section>
  );
}
