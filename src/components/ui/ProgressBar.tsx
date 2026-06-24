import { cn, clamp } from "@/lib/utils";

export function ProgressBar({
  value,
  max = 100,
  className,
  colorClassName = "bg-gradient-to-r from-brand-500 to-brand-600",
  size = "md",
  showLabel,
  animated,
}: {
  value: number;
  max?: number;
  className?: string;
  colorClassName?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}) {
  const pct = clamp((value / max) * 100, 0, 100);

  const sizes: Record<string, string> = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.06]",
          sizes[size],
          className
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            colorClassName,
            animated && "progress-stripe"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">{Math.round(pct)}%</p>
      )}
    </div>
  );
}
