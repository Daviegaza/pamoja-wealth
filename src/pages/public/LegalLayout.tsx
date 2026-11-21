import type { ReactNode } from "react";

/** Shared shell for legal pages, with the "draft pending legal review" notice. */
export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 space-y-8">
      <header>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: {updated}</p>
      </header>
      <div role="note" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/[0.06] dark:text-amber-200">
        <strong>Draft.</strong> This document is a draft and is pending review by a Kenyan advocate. It may change before Pamoja Wealth
        launches publicly.
      </div>
      <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-gray-900 dark:[&_h2]:text-white [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        {children}
      </div>
    </div>
  );
}
