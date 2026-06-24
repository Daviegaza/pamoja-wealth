import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createChamaSchema, type CreateChamaFormValues } from "@/schemas/chama.schema";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export function CreateChamaForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateChamaFormValues>({
    resolver: zodResolver(createChamaSchema),
  });

  const onSubmit = async (values: CreateChamaFormValues) => {
    await new Promise((r) => setTimeout(r, 600));
    toast.success(`"${values.name}" was created successfully!`);
    navigate("/chamas");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Chama name" placeholder="Umoja Savings Group" error={errors.name?.message} {...register("name")} />
      <Input label="Description" placeholder="What is this chama about?" error={errors.description?.message} {...register("description")} />
      <Select
        label="Category"
        options={[
          { label: "Savings", value: "savings" }, { label: "Investment", value: "investment" }, { label: "Welfare", value: "welfare" }, { label: "Mixed", value: "mixed" },
        ]}
        {...register("category")}
      />
      <Input label="Monthly contribution (KES)" type="number" placeholder="5000" error={errors.monthlyContribution?.message} {...register("monthlyContribution")} />
      <Input label="Location" placeholder="Nairobi, Kenya" error={errors.location?.message} {...register("location")} />
      <Button type="submit" className="w-full" isLoading={isSubmitting}>Create chama</Button>
    </form>
  );
}
