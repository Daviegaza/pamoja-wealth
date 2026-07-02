import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loanApplicationSchema, type LoanApplicationFormValues } from "@/schemas/loan.schema";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useChamaStore } from "@/stores/chamaStore";
import { createLoan, type CreateLoanPayload } from "@/api/loans";

export function LoanApplicationForm({ onSuccess }: { onSuccess?: () => void }) {
  const qc = useQueryClient();
  const activeChamaId = useChamaStore((s) => s.activeChamaId);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoanApplicationFormValues>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: { termMonths: 6 },
  });

  const createMut = useMutation({
    mutationFn: (payload: CreateLoanPayload) => createLoan(payload),
    onSuccess: () => {
      toast.success("Loan application submitted for review.");
      qc.invalidateQueries({ queryKey: ["loans"] });
      onSuccess?.();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Could not submit loan application.";
      toast.error(msg);
    },
  });

  const onSubmit = async (values: LoanApplicationFormValues) => {
    if (!activeChamaId) {
      toast.error("Select a chama before applying for a loan.");
      return;
    }
    await createMut.mutateAsync({
      chamaId: activeChamaId,
      amount: values.amount,
      termMonths: values.termMonths,
      purpose: values.purpose,
      guarantorIds: [],
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Loan amount (KES)" type="number" placeholder="50000" error={errors.amount?.message} {...register("amount")} />
      <Select
        label="Repayment term"
        options={[
          { label: "3 months", value: "3" }, { label: "6 months", value: "6" }, { label: "12 months", value: "12" }, { label: "24 months", value: "24" },
        ]}
        {...register("termMonths")}
      />
      <Input label="Purpose of loan" placeholder="e.g. Business expansion" error={errors.purpose?.message} {...register("purpose")} />
      <Input label="Guarantor email (optional)" type="email" placeholder="guarantor@example.com" error={errors.guarantorEmail?.message} {...register("guarantorEmail")} />
      <Button type="submit" className="w-full" isLoading={isSubmitting || createMut.isPending}>Submit application</Button>
    </form>
  );
}
