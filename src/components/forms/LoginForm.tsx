import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { loginSchema, type LoginFormValues } from "@/schemas/auth.schema";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { useAuth } from "@/hooks/useAuth";

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "amara@pamoja.app", password: "Demo1234!" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
      toast.success("Welcome back to Pamoja Wealth!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || err?.message || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email address"
        type="email"
        placeholder="you@example.com"
        leftIcon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        autoFocus
        {...register("email")}
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        leftIcon={<Lock className="h-4 w-4" />}
        error={errors.password?.message}
        {...register("password")}
      />
      <div className="flex items-center justify-between text-sm">
        <Checkbox label="Remember me" />
        <Link to="/forgot-password" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting} variant="premium">
        Sign in
      </Button>
    </form>
  );
}
