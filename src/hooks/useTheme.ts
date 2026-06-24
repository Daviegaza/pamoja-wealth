import { useThemeStore } from "@/stores/themeStore";

export function useTheme() {
  const { mode, resolvedMode, setMode, toggle } = useThemeStore();
  return { mode, resolvedMode, setMode, toggle };
}
