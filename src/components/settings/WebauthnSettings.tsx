/**
 * WebAuthn passkey manager.
 *
 * List / register / delete authenticators for payout signing. If the server
 * plugin isn't installed we surface a friendly note instead of an error toast.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/common/EmptyState";
import { listCredentials, deleteCredential } from "@/api/webauthn";
import { registerCredential, isWebAuthnSupported } from "@/lib/webauthn";
import { formatDate } from "@/lib/utils";

export function WebauthnSettings() {
  const qc = useQueryClient();
  const [label, setLabel] = useState("");
  const [serverDown, setServerDown] = useState(false);

  const q = useQuery({
    queryKey: ["webauthn-credentials"],
    queryFn: listCredentials,
    retry: false,
    staleTime: 30_000,
  });

  const registerMut = useMutation({
    mutationFn: async () => {
      if (!isWebAuthnSupported()) throw new Error("Browser doesn't support WebAuthn");
      return registerCredential(label || undefined);
    },
    onSuccess: (r) => {
      if (r.verified) {
        toast.success("Passkey registered");
        setLabel("");
        qc.invalidateQueries({ queryKey: ["webauthn-credentials"] });
      } else {
        toast.error("Verification failed");
      }
    },
    onError: (e: { response?: { status?: number }; message?: string }) => {
      if (e.response?.status === 503) {
        setServerDown(true);
        toast.error("WebAuthn not enabled on server");
      } else {
        toast.error(e.message ?? "Registration failed");
      }
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCredential(id),
    onSuccess: () => {
      toast.success("Passkey removed");
      qc.invalidateQueries({ queryKey: ["webauthn-credentials"] });
    },
  });

  const creds = q.data ?? [];

  return (
    <div className="card-base p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-brand-500" /> Passkeys
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Sign payouts with your device biometric (Face ID / Touch ID / Windows Hello / hardware key).
          </p>
        </div>
      </div>

      {serverDown ? (
        <div className="text-[11px] text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-500/[0.08] rounded-lg p-3">
          Server WebAuthn plugin not installed. Signing falls back to a session-only token until an admin runs
          <span className="font-mono ml-1">npm i @simplewebauthn/server</span> and sets <span className="font-mono">WEBAUTHN_RP_ID</span>.
        </div>
      ) : (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">Label</label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Pixel 8 · Face Unlock" />
          </div>
          <Button
            variant="premium"
            size="md"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => registerMut.mutate()}
            isLoading={registerMut.isPending}
            disabled={!isWebAuthnSupported()}
          >
            Add passkey
          </Button>
        </div>
      )}

      {creds.length === 0 ? (
        <EmptyState icon={KeyRound} title="No passkeys yet" description="Register one so you can sign multi-sig payouts with biometrics." />
      ) : (
        <div className="rounded-xl border border-gray-100 dark:border-white/[0.06] overflow-hidden">
          <ul className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {creds.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-3 py-3">
                <KeyRound className="h-4 w-4 text-brand-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{c.label ?? "Unnamed passkey"}</p>
                    {c.backedUp && <Badge variant="success">synced</Badge>}
                    <Badge variant="default">{c.deviceType}</Badge>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Added {formatDate(c.createdAt)}
                    {c.lastUsedAt && ` · last used ${formatDate(c.lastUsedAt)}`}
                  </p>
                </div>
                <Button size="sm" variant="ghost" leftIcon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => deleteMut.mutate(c.id)} isLoading={deleteMut.isPending}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
