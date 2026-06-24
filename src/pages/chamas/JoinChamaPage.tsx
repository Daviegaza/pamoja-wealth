import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { joinChamaSchema, type JoinChamaFormValues } from "@/schemas/chama.schema";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ChamaCard } from "@/components/cards/ChamaCard";
import { useChamaStore } from "@/stores/chamaStore";
import { Search } from "lucide-react";

export default function JoinChamaPage() {
  const navigate = useNavigate();
  const chamas = useChamaStore((s) => s.chamas);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JoinChamaFormValues>({
    resolver: zodResolver(joinChamaSchema),
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Join request sent! You will be notified once approved.");
    navigate("/chamas");
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
