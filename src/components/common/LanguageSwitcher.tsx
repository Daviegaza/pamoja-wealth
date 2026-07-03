import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/i18n";

/**
 * Compact language picker for the settings page + top navbar.
 * Persistence handled by i18n bootstrap; no local state needed.
 */
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n } = useTranslation();
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden />
      <span className="sr-only">Language</span>
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
        aria-label="Language"
      >
        {SUPPORTED_LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {compact ? l.code.toUpperCase() : `${l.flag} ${l.label}`}
          </option>
        ))}
      </select>
    </label>
  );
}
