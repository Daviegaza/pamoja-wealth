import { type InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "default" | "filled";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, variant = "default", ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");
    const errorId = useId();

    const baseClasses =
      variant === "filled"
        ? "h-11 w-full rounded-xl border border-transparent bg-gray-100/80 dark:bg-white/[0.05] px-3.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-inner transition-all duration-200 hover:bg-gray-100 focus:border-brand-500 dark:focus:border-brand-500 focus:bg-white dark:focus:bg-white/[0.07] focus:ring-4 focus:ring-brand-500/15 dark:focus:ring-brand-400/15 focus:outline-none focus:shadow-none"
        : "h-11 w-full rounded-xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-3.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-soft-sm transition-all duration-200 hover:border-gray-300 dark:hover:border-white/[0.14] focus:border-brand-500 dark:focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 dark:focus:ring-brand-400/15 focus:outline-none";

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors peer-focus:text-brand-500">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={!!error}
            className={cn(
              baseClasses,
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "!border-red-400 focus:!ring-red-500/20 focus:!border-red-500",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p id={errorId} className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-500">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
