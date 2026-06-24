import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
}

export function Tabs({
  items,
  defaultValue,
  variant = "underline",
}: {
  items: TabItem[];
  defaultValue?: string;
  variant?: "underline" | "pill";
}) {
  const [active, setActive] = useState(defaultValue ?? items[0]?.value);

  return (
    <div>
      <div
        className={cn(
          "flex gap-1 overflow-x-auto",
          variant === "underline" && "border-b border-gray-200 dark:border-white/[0.06]",
          variant === "pill" && "rounded-xl bg-gray-100 dark:bg-white/[0.04] p-1"
        )}
      >
        {items.map((item) => (
          <button
            key={item.value}
            onClick={() => setActive(item.value)}
            className={cn(
              "relative whitespace-nowrap text-sm font-medium transition-colors focus-ring",
              variant === "underline" && "px-4 py-2.5 rounded-t-lg",
              variant === "pill" && "px-4 py-2 rounded-lg flex-1",
              active === item.value
                ? variant === "underline"
                  ? "text-brand-600 dark:text-brand-400"
                  : "bg-white dark:bg-white/[0.08] text-gray-900 dark:text-white shadow-soft-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            )}
          >
            {item.label}
            {active === item.value && variant === "underline" && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-brand-600 dark:bg-brand-400"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
      <div className="pt-5">{items.find((i) => i.value === active)?.content}</div>
    </div>
  );
}
