import { type InputHTMLAttributes, type ReactNode, forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ className, label, ...props }, ref) => {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 select-none group">
      <span className="relative flex h-5 w-5 items-center justify-center">
        <input ref={ref} type="checkbox" className="peer absolute h-5 w-5 opacity-0" {...props} />
        <span
          className={cn(
            "h-5 w-5 rounded-md border border-gray-300 dark:border-white/[0.12] bg-white dark:bg-white/[0.03] transition-all duration-200 peer-checked:bg-gradient-to-br peer-checked:from-brand-600 peer-checked:to-brand-500 peer-checked:border-brand-600 flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/20 peer-focus-visible:ring-offset-1",
            className
          )}
        >
          <Check className="h-3.5 w-3.5 text-white scale-0 transition-transform duration-200 peer-checked:scale-100" />
        </span>
      </span>
      {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{label}</span>}
    </label>
  );
});
Checkbox.displayName = "Checkbox";
