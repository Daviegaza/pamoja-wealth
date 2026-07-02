import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "brand" | "premium";
  dot?: boolean;
}

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-gray-100/80 text-gray-700 ring-1 ring-inset ring-gray-200/60 dark:bg-white/[0.06] dark:text-gray-300 dark:ring-white/[0.08]",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/50 dark:bg-emerald-500/[0.08] dark:text-emerald-400 dark:ring-emerald-500/20",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200/50 dark:bg-amber-500/[0.08] dark:text-amber-400 dark:ring-amber-500/20",
  danger: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200/50 dark:bg-red-500/[0.08] dark:text-red-400 dark:ring-red-500/20",
  info: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200/50 dark:bg-blue-500/[0.08] dark:text-blue-400 dark:ring-blue-500/20",
  brand: "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200/50 dark:bg-brand-500/[0.08] dark:text-brand-400 dark:ring-brand-500/20",
  premium: "bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-glow-sm ring-1 ring-inset ring-white/20",
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
