/**
 * Pending-payouts multi-sig panel.
 *
 * Lists PayoutRequest rows in `awaiting_signatures` for the chama. Officers
 * can sign (biometric attestation captured client-side as a placeholder blob
 * until WebAuthn lands) or cancel. When sig count hits threshold, backend
 * auto-enqueues the dividend-payout worker.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/common/EmptyState";
import { listPendingPayouts, signPayout, cancelPayout } from "@/api/payouts";
import { isWebAuthnSupported, signChallenge } from "@/lib/webauthn";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Props {
  chamaId: string;
}

// Real WebAuthn assertion when available + server returns options; fall back
// to a session-only placeholder blob (audit-only, no crypto verify) if the
// authenticator or server plugin is unavailable.
async function collectBiometricToken(): Promise<string> {
  if (isWebAuthnSupported()) {
    try {
      return await signChallenge();
    } catch (err) {
      const msg = (err as { response?: { status?: number } }).response?.status;
      if (msg && msg !== 503) throw err;
      // 503 = WebAuthn peer dep missing on server — fall through to placeholder.
    }
  }
  return `webauthn-stub-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function PayoutSignaturesPanel({ chamaId }: Props) {
  const qc = useQueryClient();
  const pendingQuery = useQuery({
    queryKey: ["payouts-pending", chamaId],
    queryFn: () => listPendingPayouts(chamaId),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  const signMut = useMutation({
    mutationFn: async (id: string) => {
      const token = await collectBiometricToken();
      return signPayout(id, token);
    },
    onSuccess: (result) => {
      if (result.enqueued) {
        toast.success(`Threshold met · payout queued for disbursement`);
      } else {
        toast.success(`Signed · ${result.signaturesCollected}/${result.threshold} collected`);
      }
      qc.invalidateQueries({ queryKey: ["payouts-pending", chamaId] });
    },
    onError: (err: Error) => toast.error(err.message ?? "Sign failed"),
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => cancelPayout(id),
    onSuccess: () => {
      toast.success("Payout cancelled");
      qc.invalidateQueries({ queryKey: ["payouts-pending", chamaId] });
    },
    onError: (err: Error) => toast.error(err.message ?? "Cancel failed"),
  });

  const payouts = pendingQuery.data ?? [];

  if (pendingQuery.isLoading) return null;

  if (payouts.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No pending payouts"
        description="Multi-sig payouts awaiting officer signatures will appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {payouts.map((p) => {
        const collected = p.signatures.length;
        const filled = p.requiredSignatures > 0 ? (collected / p.requiredSignatures) * 100 : 0;
        const kes = Number(p.amount);
        return (
          <div key={p.id} className="card-base p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {p.recipient?.fullName ?? p.recipientUserId.slice(0, 8)}
                  </p>
                  <Badge variant={p.status === "pending" ? "success" : "default"}>{p.status.replace("_", " ")}</Badge>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {p.purpose} · {formatCurrency(kes)} · {formatDate(p.createdAt)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: `${Math.min(100, filled)}%` }} />
                  </div>
                  <span className="text-[11px] font-mono text-gray-500">{collected}/{p.requiredSignatures}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Button
                  size="sm"
                  variant="premium"
                  leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  onClick={() => signMut.mutate(p.id)}
                  isLoading={signMut.isPending}
                  disabled={p.status !== "awaiting_signatures"}
                >
                  Sign
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<XCircle className="h-3.5 w-3.5" />}
                  onClick={() => cancelMut.mutate(p.id)}
                  isLoading={cancelMut.isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
            {p.signatures.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1 pt-2 border-t border-gray-100 dark:border-white/[0.05]">
                {p.signatures.map((s) => (
                  <span key={s.signerUserId} className="text-[10px] font-mono text-gray-500 bg-gray-50 dark:bg-white/[0.03] rounded px-1.5 py-0.5">
                    {s.signer?.fullName ?? s.signerUserId.slice(0, 8)}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
