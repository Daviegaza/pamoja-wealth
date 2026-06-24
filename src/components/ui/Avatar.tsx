import { cn, initials } from "@/lib/utils";

export interface AvatarProps {
  src?: string;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  ring?: boolean | "brand" | "white";
  status?: "online" | "offline" | "away";
}

const sizes: Record<NonNullable<AvatarProps["size"]>, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

export function Avatar({ src, name, size = "md", className, ring, status }: AvatarProps) {
  const ringClass =
    ring === "brand"
      ? "ring-2 ring-brand-500/30 dark:ring-brand-400/30"
      : ring === "white"
        ? "ring-2 ring-white dark:ring-neutral-800"
        : ring
          ? "ring-2 ring-white dark:ring-neutral-950"
          : "";

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-100 to-brand-200 font-semibold text-brand-700 dark:from-brand-500/20 dark:to-brand-400/10 dark:text-brand-400",
        sizes[size],
        ringClass,
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="select-none">{initials(name)}</span>
      )}
      {status && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-neutral-950",
            status === "online" && "bg-emerald-500",
            status === "away" && "bg-amber-400",
            status === "offline" && "bg-gray-400",
            status === "online" && "animate-pulse-soft"
          )}
          aria-label={status}
        />
      )}
    </div>
  );
}
