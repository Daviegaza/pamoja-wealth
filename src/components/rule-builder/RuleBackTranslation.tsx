import { Languages } from "lucide-react";

interface BackTranslation {
  en: string;
  sw: string;
}

/** Side-by-side bilingual back-translation panel for member confirmation. */
export function RuleBackTranslation({ translation }: { translation: BackTranslation | null }) {
  if (!translation) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/[0.08] p-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Click <em>Back-translate</em> to generate a plain-language summary in English and Swahili.
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 dark:border-white/[0.05]">
        <Languages className="h-4 w-4 text-brand-500" />
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Plain language summary</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-white/[0.05]">
        <section className="p-4">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">English</p>
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
            {translation.en}
          </p>
        </section>
        <section className="p-4">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">Kiswahili</p>
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
            {translation.sw}
          </p>
        </section>
      </div>
    </div>
  );
}
