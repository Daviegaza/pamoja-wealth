import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createChamaSchema, type CreateChamaFormValues } from "@/schemas/chama.schema";
import { useChamaStore } from "@/stores/chamaStore";
import { useAuth } from "@/hooks/useAuth";
import type { Chama, Member } from "@/types";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export function CreateChamaForm() {
  const navigate = useNavigate();
  const addChama = useChamaStore((s) => s.addChama);
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateChamaFormValues>({
    resolver: zodResolver(createChamaSchema),
  });

  const onSubmit = async (values: CreateChamaFormValues) => {
    await new Promise((r) => setTimeout(r, 600));
    const id = `cha_${Date.now()}`;
    const newChama: Chama = {
      id,
      name: values.name,
      description: values.description,
      category: values.category,
      logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(values.name)}&background=059669&color=fff&size=128`,
      memberCount: 1,
      totalFunds: 0,
      monthlyContribution: values.monthlyContribution,
      createdAt: new Date().toISOString(),
      nextMeetingDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      growthRate: 0,
      status: "active",
      location: values.location,
    };
    const newMember: Member = {
      id: `mem_${Date.now()}`,
      userId: user?.id ?? "usr_1",
      chamaId: id,
      fullName: user?.fullName ?? "Member",
      avatarUrl: user?.avatarUrl ?? "",
      role: user?.role ?? "member",
      joinedAt: new Date().toISOString(),
      totalContributions: 0,
      shares: 1,
      status: "active",
      contributionStreak: 0,
    };
    addChama(newChama, newMember);
    toast.success(`"${values.name}" was created successfully!`);
    navigate(`/chamas/${id}`);
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
