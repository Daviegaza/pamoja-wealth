import { type ReactNode, useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const applyToDocument = useThemeStore((s) => s.applyToDocument);

  useEffect(() => {
    applyToDocument();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyToDocument();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [applyToDocument]);

  return <>{children}</>;
}
