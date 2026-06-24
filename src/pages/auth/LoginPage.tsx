import { Link } from "react-router-dom";
import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
      <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">Sign in to continue managing your chama and wealth.</p>
      <div className="mt-8">
        <LoginForm />
      </div>
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">Create one</Link>
      </p>
    </div>
  );
}
