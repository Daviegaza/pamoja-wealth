import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { profileSchema, type ProfileFormValues } from "@/schemas/profile.schema";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/api/axios";

export function ProfileForm() {
  const { user } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: user ? { fullName: user.fullName, email: user.email, phone: user.phone, location: user.location, bio: "" } : undefined,
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await api.patch("/users/me", data);
      if (user) setUser({ ...user, fullName: data.fullName, email: data.email, phone: data.phone, location: data.location });
      toast.success("Profile updated successfully.");
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error(msg || "Failed to update profile. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Full name" error={errors.fullName?.message} {...register("fullName")} />
        <Input label="Email address" type="email" error={errors.email?.message} {...register("email")} />
        <Input label="Phone number" error={errors.phone?.message} {...register("phone")} />
        <Input label="Location" error={errors.location?.message} {...register("location")} />
      </div>
      <Input label="Bio" placeholder="Tell us about yourself" error={errors.bio?.message} {...register("bio")} />
      <Button type="submit" isLoading={isSubmitting}>Save changes</Button>
    </form>
  );
}
