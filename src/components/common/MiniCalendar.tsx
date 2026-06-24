import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function MiniCalendar({ highlightDates = [] }: { highlightDates?: string[] }) {
  const today = new Date();
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const highlighted = new Set(highlightDates.map((d) => {
    const dt = new Date(d);
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).toDateString();
  }));

  const goToPrev = () => setCurrent(new Date(year, month - 1, 1));
  const goToNext = () => setCurrent(new Date(year, month + 1, 1));
  const goToToday = () => setCurrent(new Date(today.getFullYear(), today.getMonth(), 1));

  return (
    <div className="card-hover p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {current.toLocaleString("en-US", { month: "long", year: "numeric" })}
        </p>
        <div className="flex items-center gap-1">
          <button onClick={goToPrev} className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-white/[0.04] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={goToToday} className="rounded-lg px-2 py-1 text-[11px] font-medium text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/[0.06] transition-colors">
            Today
          </button>
          <button onClick={goToNext} className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-white/[0.04] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-gray-400 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="py-0.5">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center text-sm">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          const dateStr = date.toDateString();
          const isToday = dateStr === today.toDateString();
          const isHighlighted = highlighted.has(dateStr);

          return (
            <div
              key={day}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full mx-auto text-xs font-medium transition-colors",
                isToday && "bg-brand-600 text-white font-bold shadow-glow-sm",
                !isToday && isHighlighted && "bg-brand-100 dark:bg-brand-500/[0.12] text-brand-700 dark:text-brand-400 font-semibold",
                !isToday && !isHighlighted && "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04]"
              )}
            >
              {day}
            </div>
          );
        })}
      </div>

      {highlightDates.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/[0.04] flex items-center gap-2 text-[11px] text-gray-400">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-100 dark:bg-brand-500/[0.12]" />
          {highlightDates.length} upcoming meeting{highlightDates.length > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
