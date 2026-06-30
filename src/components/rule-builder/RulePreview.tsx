import { Sparkles } from "lucide-react";

/** Pretty-prints the structured RuleDoc as JSON with a soft, scrollable viewer. */
export function RulePreview({ ruleDoc }: { ruleDoc: unknown }) {
  const json = JSON.stringify(ruleDoc, null, 2);
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-gray-950 dark:bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-gray-300">
          <Sparkles className="h-3.5 w-3.5 text-brand-400" />
          Compiled RuleDoc
        </div>
        <span className="text-[10px] uppercase tracking-wider text-gray-500">JSON</span>
      </div>
      <pre className="text-xs leading-relaxed text-gray-200 p-4 overflow-auto max-h-[420px] font-mono">
        <code>{json}</code>
      </pre>
    </div>
  );
}
