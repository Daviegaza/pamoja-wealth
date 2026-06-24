import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Maximize2 } from "lucide-react";

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
  variant = "default",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: "default" | "glass";
}) {
  return (
    <div className={cn(variant === "glass" ? "card-glass p-5" : "card-hover p-5", className)}>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
          {subtitle && (
            <p className="text-xs font-medium text-gray-500 dark:text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {action ?? (
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
