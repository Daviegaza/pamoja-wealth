import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useChamaContext } from "./ChamaWorkspace";
import {
  cancelSubscription, getSubscription, listInvoices, listPlans, startCheckout,
  type BillingCadence, type BillingProvider,
} from "@/api/billing";
import { Empty, LoadError, Loading, Notice, PageHeader, SectionTitle, Table, td, th } from "@/components/records/ui";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { formatDay, formatKes, statusLabel, statusVariant } from "@/lib/format";
import { isChair, isMoneyOfficer } from "@/lib/roles";
import { apiErrorMessage } from "@/lib/download";
import { cn } from "@/lib/utils";

export default function BillingTab() {
  const { chama, role } = useChamaContext();
  const qc = useQueryClient();
  const canPay = isMoneyOfficer(role);
  const plans = useQuery({ queryKey: ["plans"], queryFn: listPlans, staleTime: 5 * 60_000 });
  const sub = useQuery({ queryKey: ["subscription", chama.id], queryFn: () => getSubscription(chama.id) });
  const invoices = useQuery({ queryKey: ["invoices", chama.id], queryFn: () => listInvoices(chama.id) });
  const [cadence, setCadence] = useState<BillingCadence>("monthly");
  const [provider, setProvider] = useState<BillingProvider>("flutterwave");

  const checkout = useMutation({
    mutationFn: (planCode: string) => startCheckout(chama.id, { planCode, cadence, provider }),
    onSuccess: (res) => {
      // Hand off to the provider's hosted page. The plan is only activated
      // after the server verifies the payment with the provider.
      window.location.assign(res.checkoutUrl);
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not start checkout.")),
  });

  const cancel = useMutation({
    mutationFn: () => cancelSubscription(chama.id),
    onSuccess: () => {
      toast.success("Subscription will not renew.");
      void qc.invalidateQueries({ queryKey: ["subscription", chama.id] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  return (
    <div className="space-y-8">
      <PageHeader title="Billing" description="Pamoja charges a flat subscription per chama. No transaction fees, no cut of contributions or loans." />

      <section>
        <SectionTitle>Current plan</SectionTitle>
        {sub.isLoading ? (
          <Loading />
        ) : sub.isError || !sub.data ? (
          <LoadError message={apiErrorMessage(sub.error, "Could not load subscription.")} onRetry={() => sub.refetch()} />
        ) : (
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
            <p><span className="text-gray-500">Plan </span><span className="font-semibold capitalize">{sub.data.planCode}</span></p>
            <p><span className="text-gray-500">Status </span><Badge variant={statusVariant(sub.data.status)}>{statusLabel(sub.data.status)}</Badge></p>
            <p><span className="text-gray-500">Members </span>{sub.data.memberCount}{sub.data.memberCap ? ` of ${sub.data.memberCap}` : ""}</p>
            {sub.data.currentPeriodEnd && <p><span className="text-gray-500">Paid until </span>{formatDay(sub.data.currentPeriodEnd)}</p>}
            {isChair(role) && sub.data.planCode !== "free" && sub.data.status === "active" && (
              <Button size="sm" variant="ghost" isLoading={cancel.isPending} onClick={() => {
                if (window.confirm("Stop renewing this subscription? The chama keeps its plan until the paid period ends.")) cancel.mutate();
              }}>
                Cancel renewal
              </Button>
            )}
          </div>
        )}
      </section>

      <section>
        <SectionTitle
          actions={
            canPay && (
              <div className="flex gap-2">
                <div className="w-36">
                  <Select aria-label="Billing period" value={cadence} onChange={(e) => setCadence(e.target.value as BillingCadence)} options={[{ value: "monthly", label: "Monthly" }, { value: "annual", label: "Yearly" }]} />
                </div>
                <div className="w-40">
                  <Select aria-label="Pay with" value={provider} onChange={(e) => setProvider(e.target.value as BillingProvider)} options={[{ value: "flutterwave", label: "Flutterwave" }, { value: "paystack", label: "Paystack" }]} />
                </div>
              </div>
            )
          }
        >
          Plans
        </SectionTitle>
        {!canPay && <p className="mb-3 text-sm text-gray-500">Only the chairperson or treasurer can change the plan.</p>}
        {plans.isLoading ? (
          <Loading />
        ) : plans.isError ? (
          <LoadError message={apiErrorMessage(plans.error, "Could not load plans.")} onRetry={() => plans.refetch()} />
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {(plans.data ?? []).map((p) => {
              const current = sub.data?.planCode === p.code;
              const price = cadence === "annual" ? p.annualPriceKes : p.monthlyPriceKes;
              return (
                <li key={p.code} className={cn("flex flex-wrap items-center justify-between gap-3 py-4", current && "")}>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {p.name} {current && <Badge variant="brand" className="ml-1">Current</Badge>}
                    </p>
                    <p className="text-sm text-gray-500">
                      {p.memberCap ? `Up to ${p.memberCap} members` : "Unlimited members"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm tabular-nums">
                      {price === 0 ? "Free" : `${formatKes(price)} / ${cadence === "annual" ? "year" : "month"}`}
                    </p>
                    {canPay && !current && price > 0 && (
                      <Button size="sm" isLoading={checkout.isPending && checkout.variables === p.code} disabled={checkout.isPending} onClick={() => checkout.mutate(p.code)}>
                        Choose
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-4">
          <Notice>You will pay Pamoja's subscription on Flutterwave's or Paystack's secure page. Your plan switches on only after we confirm the payment with them.</Notice>
        </div>
      </section>

      <section>
        <SectionTitle>Invoices</SectionTitle>
        {invoices.isLoading ? (
          <Loading />
        ) : invoices.isError ? (
          <LoadError message={apiErrorMessage(invoices.error, "Could not load invoices.")} onRetry={() => invoices.refetch()} />
        ) : (invoices.data?.length ?? 0) === 0 ? (
          <Empty title="No invoices yet" />
        ) : (
          <Table caption="Subscription invoices">
            <thead>
              <tr>
                <th className={th}>Number</th>
                <th className={th}>Period</th>
                <th className={th}>Amount</th>
                <th className={th}>Status</th>
                <th className={th}>Paid</th>
              </tr>
            </thead>
            <tbody>
              {invoices.data!.map((i) => (
                <tr key={i.id}>
                  <td className={`${td} font-mono text-xs`}>{i.number}</td>
                  <td className={td}>{formatDay(i.periodStart)} – {formatDay(i.periodEnd)}</td>
                  <td className={`${td} tabular-nums`}>{formatKes(i.totalKes)}</td>
                  <td className={td}><Badge variant={statusVariant(i.status)}>{statusLabel(i.status)}</Badge></td>
                  <td className={td}>{formatDay(i.paidAt)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>
    </div>
  );
}
