/**
 * Design tokens — single source of truth for all color, spacing, radius, and
 * type values. Consumed by Tailwind (via tailwind.config.js) and CSS vars
 * (via globals.css). Adding a new mode? Extend the `themes` map + add a
 * matching `data-theme` block in globals.css.
 */

export const tokens = {
  color: {
    brand: {
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
      800: "#065f46",
      900: "#064e3b",
      950: "#022c22",
    },
    accent: {
      500: "#f59e0b", // amber for CTA / highlights
      600: "#d97706",
    },
    danger: { 500: "#ef4444", 600: "#dc2626" },
    warning: { 500: "#f59e0b" },
    success: { 500: "#10b981" },
    info: { 500: "#3b82f6" },
  },
  radius: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    "2xl": "24px",
    full: "9999px",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
  },
  font: {
    sans: "'Inter', ui-sans-serif, system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  shadow: {
    xs: "0 1px 2px 0 rgba(0,0,0,0.05)",
    sm: "0 1px 3px 0 rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.10)",
    md: "0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)",
    lg: "0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10)",
    glow: "0 0 32px rgba(16,185,129,0.35)",
  },
  motion: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    base: "250ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "400ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

export type ThemeMode = "light" | "dark" | "high-contrast";

/** Semantic colors keyed by theme mode. CSS-var-friendly (RGB triples). */
export const themes: Record<ThemeMode, Record<string, string>> = {
  light: {
    "--bg": "255 255 255",
    "--bg-elevated": "249 250 251",
    "--surface": "255 255 255",
    "--text": "17 24 39",
    "--text-muted": "107 114 128",
    "--border": "229 231 235",
    "--ring": "5 150 105",
  },
  dark: {
    "--bg": "10 10 15",
    "--bg-elevated": "17 24 39",
    "--surface": "23 32 43",
    "--text": "243 244 246",
    "--text-muted": "156 163 175",
    "--border": "45 55 72",
    "--ring": "52 211 153",
  },
  "high-contrast": {
    "--bg": "0 0 0",
    "--bg-elevated": "0 0 0",
    "--surface": "0 0 0",
    "--text": "255 255 255",
    "--text-muted": "230 230 230",
    "--border": "255 255 255",
    "--ring": "255 255 0",
  },
};
