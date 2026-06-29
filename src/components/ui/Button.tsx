import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "ghost-brand" | "danger" | "success" | "premium";
  size?: "sm" | "md" | "lg" | "xl" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:from-brand-700 hover:to-brand-600 shadow-soft-sm hover:shadow-soft-md active:shadow-none border border-brand-400/20",
  premium:
    "bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 text-white hover:from-brand-700 hover:via-brand-600 hover:to-accent-600 shadow-glow-md hover:shadow-glow-lg active:shadow-none border border-white/10",
  secondary:
    "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 shadow-soft-sm",
  outline:
    "border border-gray-300 dark:border-white/[0.12] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:border-gray-400 dark:hover:border-white/[0.18]",
  ghost:
    "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white",
  "ghost-brand":
    "text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/[0.08] hover:text-brand-700 dark:hover:text-brand-300",
  danger:
    "bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 shadow-soft-sm border border-red-400/20",
  success:
    "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600 shadow-soft-sm border border-emerald-400/20",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-11 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-11 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2 rounded-xl",
  xl: "h-14 px-8 text-base gap-3 rounded-xl",
  icon: "h-11 w-11 p-0 justify-center rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none focus-ring select-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
