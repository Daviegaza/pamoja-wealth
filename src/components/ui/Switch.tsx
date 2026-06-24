import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked: boolean;
  onChange: (_checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3 select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 rounded-full transition-all duration-200 focus-ring",
          checked
            ? "bg-gradient-to-r from-brand-600 to-brand-500 shadow-glow-sm"
            : "bg-gray-300 dark:bg-white/[0.1]",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200",
            checked && "translate-x-5 shadow-md"
          )}
        />
      </button>
      {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
    </label>
  );
}
