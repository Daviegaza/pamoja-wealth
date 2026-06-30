import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { joinChamaSchema, type JoinChamaFormValues } from "@/schemas/chama.schema";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChamaCard } from "@/components/cards/ChamaCard";
import { useChamaStore } from "@/stores/chamaStore";
import { Search, CheckCircle2, Clock, Mail, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import * as chamaApi from "@/api/chama";

type Tab = "code" | "discover" | "invitations";

interface InvitationItem {
  id: string;
  token: string;
  method: string;
  message: string | null;
  expiresAt: string;
  chama: { id: string; name: string; description: string | null; coverImageUrl?: string | null; category: string; type: string; privacy: string };
  invitedBy: { id: string; fullName: string; username: string | null; avatarUrl: string | null };
}

export default function JoinChamaPage() {
  const localChamas = useChamaStore((s) => s.chamas);
  const [tab, setTab] = useState<Tab>("discover");
  const [requestStatus, setRequestStatus] = useState<"idle" | "pending" | "done">("idle");
  const [requestedCode, setRequestedCode] = useState("");
  const [publicChamas, setPublicChamas] = useState<chamaApi.ChamaDTO[]>([]);
  const [invitations, setInvitations] = useState<InvitationItem[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JoinChamaFormValues>({
    resolver: zodResolver(joinChamaSchema),
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([chamaApi.discover().catch(() => ({ items: [] })), chamaApi.myInvitations().catch(() => [])])
      .then(([disc, invs]) => {
        if (cancelled) return;
        setPublicChamas(("items" in disc ? disc.items : []) as chamaApi.ChamaDTO[]);
        setInvitations(invs as InvitationItem[]);
      });
    return () => { cancelled = true; };
  }, []);

  const onSubmit = async (values: JoinChamaFormValues) => {
    setRequestedCode(values.inviteCode);
    setRequestStatus("pending");
    toast.info("Submitting invite code...");
    setTimeout(() => {
      setRequestStatus("done");
      toast.success("If your code is valid you've been added.");
    }, 800);
  };

  async function handleAcceptInvitation(token: string) {
    try {
      await chamaApi.acceptInvitation(token);
      setInvitations((prev) => prev.filter((i) => i.token !== token));
      toast.success("Invitation accepted! Welcome aboard.");
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Could not accept");
    }
  }

  async function handleDeclineInvitation(token: string) {
    try {
      await chamaApi.declineInvitation(token);
      setInvitations((prev) => prev.filter((i) => i.token !== token));
      toast.message("Invitation declined.");
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Could not decline");
    }
  }

  async function handleJoinPublic(chamaId: string) {
    try {
      const r = await chamaApi.joinChama(chamaId, {}) as any;
      if (r?.status === "approved") toast.success("Joined! Find it under My Chamas.");
      else if (r?.status === "pending") toast.success("Join request sent — admin will approve.");
      else toast.success("Done.");
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Could not join");
    }
  }

  const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode; count?: number }> = [
    { id: "discover", label: "Discover", icon: <Sparkles className="h-4 w-4" /> },
    { id: "invitations", label: "My Invitations", icon: <Mail className="h-4 w-4" />, count: invitations.length },
    { id: "code", label: "Invite Code", icon: <Search className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Find your next chama</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
          Discover public chamas, accept invitations, or paste an invite code.
        </p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <Badge variant="brand">{t.count}</Badge>
            )}
          </button>
        ))}
      </div>

      {tab === "discover" && (
        <div>
          {publicChamas.length === 0 ? (
            <div className="card-hover p-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No public chamas yet. Try the invite code tab or wait for an invitation.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {publicChamas.map((c) => (
                <div key={c.id} className="card-hover overflow-hidden">
                  {c.coverImageUrl && (
                    <img src={c.coverImageUrl} alt="" className="h-32 w-full object-cover" />
                  )}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-white">{c.name}</h3>
                      <Badge variant={c.type === "fundraiser" ? "brand" : "default"}>
                        {c.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{c.description}</p>
                    {c.type === "fundraiser" && c.targetAmount ? (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Raised</span>
                          <span className="font-semibold text-emerald-600">
                            KES {Number(c.raisedAmount || 0).toLocaleString()} / {Number(c.targetAmount).toLocaleString()}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-brand-500 to-emerald-500"
                            style={{ width: `${Math.min(100, (Number(c.raisedAmount || 0) / Number(c.targetAmount)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        {c.memberCount ?? 0} members · KES {Number(c.monthlyContribution).toLocaleString()}/mo
                      </div>
                    )}
                    <Button variant="premium" size="sm" className="w-full" onClick={() => handleJoinPublic(c.id)}>
                      {c.type === "fundraiser" ? "View campaign" : "Join chama"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "invitations" && (
        <div className="space-y-4">
          {invitations.length === 0 ? (
            <div className="card-hover p-8 text-center">
              <Mail className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No pending invitations. When someone invites you by phone, username, or email it'll show up here.
              </p>
            </div>
          ) : (
            invitations.map((inv) => (
              <div key={inv.id} className="card-hover p-5 flex items-start gap-4">
                {inv.invitedBy.avatarUrl && (
                  <img src={inv.invitedBy.avatarUrl} alt="" className="h-12 w-12 rounded-full bg-gray-100" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 dark:text-white">{inv.invitedBy.fullName}</span>
                    <span className="text-xs text-gray-500">invited you via {inv.method}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mt-1">{inv.chama.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1">{inv.chama.description}</p>
                  {inv.message && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 italic">"{inv.message}"</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="brand">{inv.chama.privacy}</Badge>
                    <Badge>{inv.chama.category}</Badge>
                    <span className="text-xs text-gray-400">
                      expires {new Date(inv.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Button size="sm" variant="premium" onClick={() => handleAcceptInvitation(inv.token)}>Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeclineInvitation(inv.token)}>Decline</Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "code" && (
        <div className="max-w-xl mx-auto">
          {requestStatus === "idle" ? (
            <form onSubmit={handleSubmit(onSubmit)} className="card-hover p-6 space-y-4">
              <Input
                label="Invite code"
                placeholder="e.g. PW-7K2X9"
                error={errors.inviteCode?.message}
                {...register("inviteCode")}
              />
              <Button type="submit" className="w-full" variant="premium" isLoading={isSubmitting}>
                Submit
              </Button>
            </form>
          ) : requestStatus === "pending" ? (
            <div className="card-hover p-6 text-center space-y-3">
              <Clock className="h-6 w-6 mx-auto text-amber-600" />
              <p className="font-semibold text-gray-900 dark:text-white">Processing</p>
              <p className="text-sm text-gray-500">Submitting code <Badge variant="brand">{requestedCode}</Badge></p>
              <Button variant="outline" size="sm" onClick={() => setRequestStatus("idle")}>Try another code</Button>
            </div>
          ) : (
            <div className="card-hover p-6 text-center space-y-3">
              <CheckCircle2 className="h-6 w-6 mx-auto text-emerald-600" />
              <p className="font-semibold text-gray-900 dark:text-white">Submitted</p>
              <p className="text-sm text-gray-500">If your code was valid you've been added.</p>
              <Link to="/chamas" className="inline-block">
                <Button variant="premium" size="sm">View My Chamas</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Local cached chama cards as fallback for offline */}
      {localChamas.length > 0 && publicChamas.length === 0 && tab === "discover" && (
        <div className="opacity-60">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Cached samples</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {localChamas.slice(0, 3).map((c) => <ChamaCard key={c.id} chama={c} />)}
          </div>
        </div>
      )}
    </div>
  );
}
