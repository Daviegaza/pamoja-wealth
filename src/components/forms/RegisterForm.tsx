import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { registerSchema, type RegisterFormValues } from "@/schemas/auth.schema";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registerUser({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
      toast.success("Account created! Welcome to Pamoja Wealth.");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || err?.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Full name" placeholder="Jane Wanjiru" leftIcon={<User className="h-4 w-4" />} error={errors.fullName?.message} autoFocus {...register("fullName")} />
      <Input label="Email address" type="email" placeholder="you@example.com" leftIcon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register("email")} />
      <Input label="Phone number" placeholder="+254 7XX XXX XXX" leftIcon={<Phone className="h-4 w-4" />} error={errors.phone?.message} {...register("phone")} />
      <Input label="Password" type="password" placeholder="••••••••" leftIcon={<Lock className="h-4 w-4" />} error={errors.password?.message} {...register("password")} />
      <Input label="Confirm password" type="password" placeholder="••••••••" leftIcon={<Lock className="h-4 w-4" />} error={errors.confirmPassword?.message} {...register("confirmPassword")} />
      <Checkbox
        label={
          <>
            I agree to the{" "}
            <Link to="/terms" className="font-semibold text-brand-600 hover:text-brand-700">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="font-semibold text-brand-600 hover:text-brand-700">
              Privacy Policy
            </Link>
          </>
        }
        {...register("agreeToTerms")}
      />
      {errors.agreeToTerms && <p className="text-xs text-red-500">{errors.agreeToTerms.message}</p>}
      <Button type="submit" className="w-full" variant="premium" size="lg" isLoading={isSubmitting}>Create account</Button>
    </form>
  );
}
