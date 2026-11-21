import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import { referenceFromSearch, verifyPayment } from "@/api/billing";
import { Loading, PageHeader } from "@/components/records/ui";
import { Button } from "@/components/ui/Button";
import { formatDay } from "@/lib/format";
import { apiErrorMessage } from "@/lib/download";

/**
 * Landing page after the provider's hosted checkout. We never trust the URL —
 * the server re-checks the payment with the provider (status + amount) before
 * switching the plan on.
 */
export default function BillingReturnPage() {
  const [params] = useSearchParams();
  const chamaId = params.get("chamaId");
  const reference = referenceFromSearch(params);
  const started = useRef(false);

  const verify = useMutation({ mutationFn: () => verifyPayment(chamaId!, reference!) });

  useEffect(() => {
    if (!chamaId || !reference || started.current) return;
    started.current = true;
    verify.mutate();
  }, [chamaId, reference, verify]);

  const back = chamaId ? `/chamas/${chamaId}/billing` : "/chamas";

  return (
    <div className="max-w-xl">
      <PageHeader title="Payment status" />
      {!chamaId || !reference ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          We could not find a payment reference in this link. If you completed a payment, open Billing for your chama to check its status.
        </p>
      ) : verify.isPending || verify.isIdle ? (
        <Loading label="Confirming your payment with the provider…" />
      ) : verify.isError ? (
        <div className="flex gap-3 text-sm">
          <XCircle className="h-5 w-5 text-red-500 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Payment not confirmed</p>
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              {apiErrorMessage(verify.error, "We could not confirm this payment yet.")} If money left your account, keep the reference{" "}
              <span className="font-mono">{reference}</span> and contact support.
            </p>
            <Button className="mt-3" size="sm" variant="outline" onClick={() => verify.mutate()}>Check again</Button>
          </div>
        </div>
      ) : !verify.data.activated ? (
        <div className="flex gap-3 text-sm">
          <XCircle className="h-5 w-5 text-amber-500 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {verify.data.reason === "pending" ? "Payment still processing" : "Payment not confirmed"}
            </p>
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              {verify.data.reason === "pending"
                ? "The payment provider has not confirmed this payment yet. This can take a minute."
                : verify.data.reason === "failed"
                  ? "The payment provider reports that this payment failed. No plan change was made."
                  : "The payment details did not match this invoice, so no plan change was made."}{" "}
              Keep the reference <span className="font-mono">{reference}</span> if you contact support.
            </p>
            {verify.data.reason === "pending" && (
              <Button className="mt-3" size="sm" variant="outline" onClick={() => verify.mutate()}>Check again</Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex gap-3 text-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Payment confirmed</p>
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              Your chama is now on the <span className="capitalize font-medium">{verify.data.subscription.planCode}</span> plan
              {verify.data.subscription.currentPeriodEnd ? `, paid until ${formatDay(verify.data.subscription.currentPeriodEnd)}` : ""}.
            </p>
          </div>
        </div>
      )}
      <Link to={back} className="mt-6 inline-block text-sm font-medium text-brand-600 hover:underline">Back to billing</Link>
    </div>
  );
}
