import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { joinChama } from "@/api/chama";
import { PageHeader } from "@/components/records/ui";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useChamaStore } from "@/stores/chamaStore";
import { apiErrorCode, apiErrorMessage } from "@/lib/download";

export default function JoinChamaPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const qc = useQueryClient();
  const setActiveChama = useChamaStore((s) => s.setActiveChama);
  const [code, setCode] = useState(params.get("code") ?? "");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () => joinChama(code.trim().toUpperCase()),
    onSuccess: (chama) => {
      toast.success(`Welcome to ${chama.name}`);
      setActiveChama(chama.id, chama.name);
      void qc.invalidateQueries({ queryKey: ["chamas", "mine"] });
      navigate(`/chamas/${chama.id}`);
    },
    onError: (err) => {
      setError(
        apiErrorCode(err) === "PLAN_LIMIT"
          ? "This chama has reached its member limit. Ask the chairperson to upgrade its plan."
          : apiErrorMessage(err, "That code did not work. Check it and try again."),
      );
    },
  });

  return (
    <div className="max-w-md">
      <PageHeader title="Join a chama" description="Enter the invite code your chairperson or secretary shared with you." />
      <form
        className="grid gap-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim().length < 4) {
            setError("Enter the full invite code.");
            return;
          }
          setError("");
          mutation.mutate();
        }}
      >
        <Input
          label="Invite code"
          value={code}
          autoCapitalize="characters"
          autoComplete="off"
          className="font-mono tracking-widest uppercase"
          error={error}
          onChange={(e) => setCode(e.target.value)}
        />
        <div><Button type="submit" isLoading={mutation.isPending}>Join chama</Button></div>
      </form>
    </div>
  );
}
