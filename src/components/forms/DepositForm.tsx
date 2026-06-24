import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { depositSchema, type DepositFormValues } from "@/schemas/wallet.schema";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useWallet } from "@/hooks/useWallet";

export function DepositForm({ onSuccess }: { onSuccess?: () => void }) {
  const { deposit } = useWallet();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: { method: "mpesa" },
  });

  const onSubmit = async (values: DepositFormValues) => {
    await new Promise((r) => setTimeout(r, 500));
    deposit(values.amount);
    toast.success(`Wallet topped up with KES ${values.amount.toLocaleString()}`);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Amount (KES)" type="number" placeholder="5000" error={errors.amount?.message} {...register("amount")} />
      <Select label="Payment method" options={[{ label: "M-Pesa", value: "mpesa" }, { label: "Bank Transfer", value: "bank" }, { label: "Card", value: "card" }]} {...register("method")} />
      <Button type="submit" className="w-full" isLoading={isSubmitting}>Top up wallet</Button>
    </form>
  );
}
