import { type ReactNode, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export function Tooltip({ children, content, side = "top" }: { children: ReactNode; content: string; side?: "top" | "bottom" }) {
  const [show, setShow] = useState(false);
  const handleFocus = useCallback(() => setShow(true), []);
  const handleBlur = useCallback(() => setShow(false), []);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} onFocus={handleFocus} onBlur={handleBlur}>
      {children}
      {show && (
        <span
          role="tooltip"
          className={cn(
            "absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg dark:bg-gray-800",
            side === "top" ? "bottom-full mb-2" : "top-full mt-2"
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
