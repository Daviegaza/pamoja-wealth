import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loanApplicationSchema, type LoanApplicationFormValues } from "@/schemas/loan.schema";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useLoans } from "@/hooks/useLoans";
import { useAuth } from "@/hooks/useAuth";
import { useChamaStore } from "@/stores/chamaStore";

export function LoanApplicationForm({ onSuccess }: { onSuccess?: () => void }) {
  const { applyForLoan } = useLoans();
  const { user } = useAuth();
  const activeChamaId = useChamaStore((s) => s.activeChamaId);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoanApplicationFormValues>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: { termMonths: 6 },
  });

  const onSubmit = async (values: LoanApplicationFormValues) => {
    applyForLoan({
      chamaId: activeChamaId ?? "cha_1",
      borrowerId: user?.id ?? "usr_1",
      borrowerName: user?.fullName ?? "You",
      borrowerAvatar: user?.avatarUrl ?? "",
      amount: values.amount,
      interestRate: 12,
      termMonths: values.termMonths,
      purpose: values.purpose,
      appliedDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + values.termMonths * 30 * 86400000).toISOString(),
      guarantors: [],
    });
    toast.success("Loan application submitted for review.");
    onSuccess?.();
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
      <Button type="submit" className="w-full" isLoading={isSubmitting}>Submit application</Button>
    </form>
  );
}
