/**
 * PremiumCard — elevation-layered card using shadow + motion tokens.
 *
 * Drop-in replacement for `.card-base` when a component needs depth-based
 * hover, focus-visible ring, or state-based elevation animation.
 *
 * Props:
 *   elevation: 1 | 2 | 3 | 4   (maps to --shadow-1 … --shadow-4)
 *   hoverLift: raises to next elevation on hover
 *   interactive: renders as button for a11y
 */
import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Common {
  elevation?: 1 | 2 | 3 | 4;
  hoverLift?: boolean;
  className?: string;
  children?: ReactNode;
}

type NonInteractiveProps = Common & Omit<HTMLAttributes<HTMLDivElement>, "children" | "className"> & { interactive?: false };
type InteractiveProps = Common & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & { interactive: true };
export type PremiumCardProps = NonInteractiveProps | InteractiveProps;

const ELEVATION_STYLE: Record<1 | 2 | 3 | 4, string> = {
  1: "shadow-[var(--shadow-1)]",
  2: "shadow-[var(--shadow-2)]",
  3: "shadow-[var(--shadow-3)]",
  4: "shadow-[var(--shadow-4)]",
};

const HOVER_LIFT: Record<1 | 2 | 3 | 4, string> = {
  1: "hover:shadow-[var(--shadow-2)]",
  2: "hover:shadow-[var(--shadow-3)]",
  3: "hover:shadow-[var(--shadow-4)]",
  4: "hover:shadow-[var(--shadow-4)]",
};

export const PremiumCard = forwardRef<HTMLElement, PremiumCardProps>(function PremiumCard(props, ref) {
  const { elevation = 1, hoverLift = false, className, children, ...rest } = props;
  const base = cn(
    "rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-gray-200/70 dark:ring-white/[0.06] p-5",
    "transition-[transform,box-shadow] duration-[var(--motion-sm)]",
    ELEVATION_STYLE[elevation],
    hoverLift && HOVER_LIFT[elevation],
    hoverLift && "hover:-translate-y-0.5",
    className,
  );
  if ("interactive" in rest && rest.interactive) {
    const { interactive: _, ...btnRest } = rest as InteractiveProps;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={cn(base, "text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500")}
        {...btnRest}
      >
        {children}
      </button>
    );
  }
  const { interactive: _ignored, ...divRest } = rest as NonInteractiveProps;
  void _ignored;
  return (
    <div ref={ref as React.Ref<HTMLDivElement>} className={base} {...divRest}>
      {children}
    </div>
  );
});
