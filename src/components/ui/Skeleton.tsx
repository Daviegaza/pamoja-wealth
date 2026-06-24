import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  variant = "shimmer",
}: {
  className?: string;
  variant?: "shimmer" | "pulse";
}) {
  return (
    <div
      className={cn(
        "h-4 w-full rounded-lg",
        variant === "shimmer" ? "skeleton" : "skeleton-pulse",
        className
      )}
    />
  );
}
