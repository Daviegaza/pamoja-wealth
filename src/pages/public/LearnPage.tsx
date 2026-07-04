/**
 * Micro-lessons index + reader. 90-second reads, bilingual EN + SW.
 *
 * Route: /learn
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Clock, CheckCircle2, ArrowLeft, Languages } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { listLessons, getLesson, completeLesson, type LessonSummary } from "@/api/impact";

const CATEGORY_LABEL: Record<LessonSummary["category"], string> = {
  basics: "Basics",
  chama: "Chamas",
  loans: "Loans",
  investing: "Investing",
  safety: "Safety",
};

export default function LearnPage() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "sw">("en");
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const indexQ = useQuery({ queryKey: ["lessons"], queryFn: listLessons, staleTime: 60 * 60 * 1000 });
  const lessonQ = useQuery({
    queryKey: ["lesson", openSlug],
    queryFn: () => getLesson(openSlug!),
    enabled: !!openSlug,
  });

  async function markDone() {
    if (!openSlug) return;
    await completeLesson(openSlug).catch(() => null);
    setCompleted((prev) => new Set(prev).add(openSlug));
    toast.success("Lesson completed");
  }

  const lessons = indexQ.data ?? [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            <BookOpen className="h-3.5 w-3.5" /> Money school · 90 seconds each
          </p>
          <h1 className="mt-1.5 text-3xl font-bold text-gray-900 dark:text-white">Learn</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Short, plain-English + Swahili lessons. Read one on your commute.
          </p>
        </div>
        <button
          onClick={() => setLang((l) => (l === "en" ? "sw" : "en"))}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/[0.08] px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-white/[0.04]"
        >
          <Languages className="h-3.5 w-3.5" />
          {lang === "en" ? "Swahili" : "English"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {lessons.map((lesson) => (
          <motion.button
            key={lesson.slug}
            whileHover={{ y: -2 }}
            onClick={() => setOpenSlug(lesson.slug)}
            className="text-left rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-gray-200/70 dark:ring-white/[0.06] p-4 shadow-[var(--shadow-1)] hover:shadow-[var(--shadow-2)] transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <Badge variant="default">{CATEGORY_LABEL[lesson.category]}</Badge>
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                <Clock className="h-3 w-3" /> {lesson.minutes}m
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {lang === "en" ? lesson.title : lesson.titleSw}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{lesson.action}</p>
            {completed.has(lesson.slug) && (
              <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="h-3 w-3" /> Completed
              </p>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {openSlug && lessonQ.data && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-start justify-center p-4 pt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-md" onClick={() => setOpenSlug(null)} />
            <motion.div
              className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-2xl ring-1 ring-gray-200/70 dark:ring-white/[0.06] max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
            >
              <button
                onClick={() => setOpenSlug(null)}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white mb-4"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> All lessons
              </button>
              <Badge variant="default" className="mb-3">{CATEGORY_LABEL[lessonQ.data.category]}</Badge>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {lang === "en" ? lessonQ.data.title : lessonQ.data.titleSw}
              </h2>
              <p className="mt-4 text-base text-gray-700 dark:text-gray-200 leading-relaxed">
                {lang === "en" ? lessonQ.data.body : lessonQ.data.bodySw}
              </p>
              <div className="mt-6 rounded-xl bg-brand-50/60 dark:bg-brand-500/[0.06] p-4">
                <p className="text-xs uppercase tracking-wider font-semibold text-brand-700 dark:text-brand-300 mb-2">Key points</p>
                <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-100">
                  {lessonQ.data.keyPoints.map((kp, i) => <li key={i}>• {kp}</li>)}
                </ul>
              </div>
              <div className="mt-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-500/[0.06] p-4">
                <p className="text-xs uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-300 mb-1">Do this today</p>
                <p className="text-sm text-gray-800 dark:text-gray-100">{lessonQ.data.action}</p>
              </div>
              <div className="mt-6 flex justify-end">
                <Button variant="premium" leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />} onClick={markDone}>
                  Mark completed
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
