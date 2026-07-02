import { useCallback, useEffect, useState, type ReactNode } from "react";
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

  useEffect(() => {
    if (defaultValue && items.some((it) => it.value === defaultValue) && active !== defaultValue) {
      setActive(defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue, items.length]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = items.findIndex((item) => item.value === active);
      let newIndex = currentIndex;

      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        newIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        newIndex = currentIndex >= items.length - 1 ? 0 : currentIndex + 1;
      } else if (e.key === "Home") {
        newIndex = 0;
      } else if (e.key === "End") {
        newIndex = items.length - 1;
      }

      if (newIndex !== currentIndex) {
        e.preventDefault();
        setActive(items[newIndex].value);
      }
    },
    [active, items]
  );

  return (
    <div>
      <div
        role="tablist"
        onKeyDown={handleKeyDown}
        className={cn(
          "flex gap-1 overflow-x-auto",
          variant === "underline" && "border-b border-gray-200 dark:border-white/[0.06]",
          variant === "pill" && "rounded-xl bg-gray-100 dark:bg-white/[0.04] p-1"
        )}
      >
        {items.map((item) => {
          const isActive = active === item.value;
          return (
            <button
              key={item.value}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              id={`tab-${item.value}`}
              aria-controls={`panel-${item.value}`}
              onClick={() => setActive(item.value)}
              className={cn(
                "relative whitespace-nowrap text-sm font-medium transition-colors focus-ring",
                variant === "underline" && "px-4 py-2.5 rounded-t-lg",
                variant === "pill" && "px-4 py-2 rounded-lg flex-1",
                isActive
                  ? variant === "underline"
                    ? "text-brand-600 dark:text-brand-400"
                    : "bg-white dark:bg-white/[0.08] text-gray-900 dark:text-white shadow-soft-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              )}
            >
              {item.label}
              {isActive && variant === "underline" && (
                <motion.span
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-brand-600 dark:bg-brand-400"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
      <div
        className="pt-5"
        role="tabpanel"
        id={`panel-${items.find((i) => i.value === active)?.value}`}
        aria-labelledby={`tab-${active}`}
        tabIndex={0}
      >
        {items.find((i) => i.value === active)?.content}
      </div>
    </div>
  );
}
