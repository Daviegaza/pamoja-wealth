import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeMode } from "@/types";

interface ThemeState {
  mode: ThemeMode;
  resolvedMode: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  applyToDocument: () => void;
}

function resolve(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "system",
      resolvedMode: "light",
      setMode: (mode) => {
        const resolvedMode = resolve(mode);
        set({ mode, resolvedMode });
        get().applyToDocument();
      },
      toggle: () => {
        const next = get().resolvedMode === "dark" ? "light" : "dark";
        get().setMode(next);
      },
      applyToDocument: () => {
        const resolvedMode = resolve(get().mode);
        document.documentElement.classList.toggle("dark", resolvedMode === "dark");
      },
    }),
    { name: "pamoja-theme" }
  )
);
