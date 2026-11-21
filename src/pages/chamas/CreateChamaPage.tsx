import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createChama, type ChamaCategory } from "@/api/chama";
import { Notice, PageHeader, Textarea } from "@/components/records/ui";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useChamaStore } from "@/stores/chamaStore";
import { NON_CUSTODIAL_STATEMENT } from "@/lib/copy";
import { apiErrorMessage } from "@/lib/download";

export default function CreateChamaPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const setActiveChama = useChamaStore((s) => s.setActiveChama);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "savings" as ChamaCategory,
    location: "",
    monthlyContribution: "",
    paymentInstructions: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () =>
      createChama({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        category: form.category,
        location: form.location.trim() || undefined,
        monthlyContribution: form.monthlyContribution ? Number(form.monthlyContribution) : undefined,
        paymentInstructions: form.paymentInstructions.trim() || undefined,
      }),
    onSuccess: (chama) => {
      toast.success(`${chama.name} created. You are the chairperson.`);
      setActiveChama(chama.id, chama.name);
      void qc.invalidateQueries({ queryKey: ["chamas", "mine"] });
      navigate(`/chamas/${chama.id}/members`);
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not create the chama.")),
  });

  const submit = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = "Use at least 3 characters.";
    if (form.monthlyContribution && !(Number(form.monthlyContribution) >= 0)) e.monthlyContribution = "Enter a valid amount.";
    setErrors(e);
    if (Object.keys(e).length === 0) mutation.mutate();
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Create a chama" description="You become the chairperson. You can hand roles to your treasurer and secretary next." />
      <form className="grid gap-5" noValidate onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <Input label="Chama name" value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Textarea label="Description (optional)" rows={2} maxLength={500} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Type"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as ChamaCategory })}
            options={[
              { value: "savings", label: "Savings group" },
              { value: "welfare", label: "Welfare group" },
              { value: "mixed", label: "Savings & welfare" },
            ]}
          />
          <Input label="Location (optional)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>
        <Input
          label="Expected monthly contribution per member (KES, optional)"
          type="number"
          min={0}
          value={form.monthlyContribution}
          error={errors.monthlyContribution}
          onChange={(e) => setForm({ ...form, monthlyContribution: e.target.value })}
        />
        <Textarea
          label="Where members pay (optional)"
          rows={3}
          placeholder="e.g. M-Pesa Paybill 123456, Account: JIRANI"
          hint="Your chama's own Paybill/Till or bank account — shown to members. Pamoja never receives this money."
          value={form.paymentInstructions}
          onChange={(e) => setForm({ ...form, paymentInstructions: e.target.value })}
        />
        <Notice>{NON_CUSTODIAL_STATEMENT}</Notice>
        <div className="flex gap-2">
          <Button type="submit" isLoading={mutation.isPending}>Create chama</Button>
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
