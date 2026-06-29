import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { joinChamaSchema, type JoinChamaFormValues } from "@/schemas/chama.schema";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChamaCard } from "@/components/cards/ChamaCard";
import { useChamaStore } from "@/stores/chamaStore";
import { Search, CheckCircle2, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function JoinChamaPage() {
  const chamas = useChamaStore((s) => s.chamas);
  const [requestStatus, setRequestStatus] = useState<"idle" | "pending" | "done">("idle");
  const [requestedCode, setRequestedCode] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JoinChamaFormValues>({
    resolver: zodResolver(joinChamaSchema),
  });

  const onSubmit = async (values: JoinChamaFormValues) => {
    await new Promise((r) => setTimeout(r, 600));
    setRequestedCode(values.inviteCode);
    setRequestStatus("pending");
    toast.success("Join request sent! You will be notified once approved.");
    // Simulate approval after 2 seconds for demo
    setTimeout(() => {
      setRequestStatus("done");
      toast.success("Your join request has been approved!");
    }, 2000);
  };

  return (
    <div className="space-y-10">
      {/* Invite Code Section */}
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl icon-gradient-blue shadow-glow-sm mb-4">
            <Search className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Join a chama</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-xs mx-auto">
            Enter an invite code shared by your chama administrator.
          </p>
        </div>
        {requestStatus === "idle" ? (
          <form onSubmit={handleSubmit(onSubmit)} className="card-hover p-6 space-y-4">
            <Input
              label="Invite code"
              placeholder="e.g. PW-7K2X9"
              error={errors.inviteCode?.message}
              {...register("inviteCode")}
            />
            <Button type="submit" className="w-full" variant="premium" isLoading={isSubmitting}>
              Request to join
            </Button>
          </form>
        ) : requestStatus === "pending" ? (
          <div className="card-hover p-6 text-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/[0.08] text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Request Pending</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Your request using code <Badge variant="brand">{requestedCode}</Badge> is being reviewed by the chama admin.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setRequestStatus("idle")}>Try another code</Button>
          </div>
        ) : (
          <div className="card-hover p-6 text-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/[0.08] text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Approved!</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                You have been added to the chama. View it on your dashboard.
              </p>
            </div>
            <Link to="/chamas" className="inline-block">
              <Button variant="premium" size="sm">View My Chamas</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Public Chamas */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-1 rounded-full bg-brand-500" />
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Discover Public Chamas</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Browse and request to join open groups</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {chamas.slice(0, 6).map((c) => (
            <ChamaCard key={c.id} chama={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
