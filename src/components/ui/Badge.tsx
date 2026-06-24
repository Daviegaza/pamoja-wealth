import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "brand" | "premium";
  dot?: boolean;
}

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-gray-100 text-gray-700 dark:bg-white/[0.06] dark:text-gray-300",
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/[0.08] dark:text-emerald-400",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-500/[0.08] dark:text-amber-400",
  danger: "bg-red-50 text-red-700 dark:bg-red-500/[0.08] dark:text-red-400",
  info: "bg-blue-50 text-blue-700 dark:bg-blue-500/[0.08] dark:text-blue-400",
  brand: "bg-brand-50 text-brand-700 dark:bg-brand-500/[0.08] dark:text-brand-400",
  premium: "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-glow-sm border border-brand-400/20",
};

export function Badge({ className, variant = "default", dot, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors duration-150",
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            variant === "success" && "bg-emerald-500",
            variant === "warning" && "bg-amber-500",
            variant === "danger" && "bg-red-500",
            variant === "info" && "bg-blue-500",
            variant === "brand" && "bg-brand-500",
            variant === "premium" && "bg-white",
            variant === "default" && "bg-gray-500"
          )}
        />
      )}
      {children}
    </span>
  );
}
