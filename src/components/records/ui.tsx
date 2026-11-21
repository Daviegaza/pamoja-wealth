/**
 * Small, calm building blocks shared by the record-keeping screens.
 * Open layouts: section headings + rules + tables rather than stacks of cards.
 */
import { forwardRef, useId, type ReactNode, type TextareaHTMLAttributes } from "react";
import { AlertTriangle, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-gray-200/70 dark:border-white/[0.06] pb-4 mb-6">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function SectionTitle({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{children}</h2>
      {actions}
    </div>
  );
}

export function Notice({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warning" }) {
  const Icon = tone === "warning" ? AlertTriangle : Info;
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border px-4 py-3 text-sm leading-relaxed",
        tone === "warning"
          ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/[0.06] dark:text-amber-200"
          : "border-brand-200/70 bg-brand-50/60 text-brand-900 dark:border-brand-500/20 dark:bg-brand-500/[0.06] dark:text-brand-200",
      )}
    >
      <Icon className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-2 py-10 justify-center text-sm text-gray-500">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {label}
    </div>
  );
}

export function LoadError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50/60 dark:bg-red-500/[0.05] px-4 py-4 text-sm text-red-800 dark:text-red-200">
      <p>{message}</p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="py-10 text-center">
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</p>
      {children && <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{children}</div>}
    </div>
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, hint, className, id, ...props }, ref) => {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className="w-full">
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <textarea
        ref={ref}
        id={fieldId}
        aria-invalid={!!error}
        className={cn(
          "w-full rounded-xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none",
          error && "!border-red-400",
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
    </div>
  );
});
Textarea.displayName = "Textarea";

/** Simple responsive table wrapper: horizontal scroll on narrow screens only. */
export function Table({ children, caption }: { children: ReactNode; caption: string }) {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="w-full min-w-[640px] text-sm">
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export const th = "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/[0.06]";
export const td = "px-3 py-3 align-top border-b border-gray-100 dark:border-white/[0.04] text-gray-800 dark:text-gray-200";

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-gray-900 dark:text-white">{value}</p>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
