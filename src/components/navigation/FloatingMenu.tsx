import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageSquare, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";

export function FloatingMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2"
          >
            <Link
              to="/ai-assistant"
              className="flex items-center gap-3 rounded-2xl bg-white dark:bg-neutral-900 shadow-soft-lg border border-gray-100 dark:border-white/[0.06] px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:shadow-soft-xl hover:-translate-y-0.5 transition-all duration-200 backdrop-blur-sm"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg icon-gradient-cyan">
                <Bot className="h-4 w-4" />
              </div>
              AI Assistant
            </Link>
            <Link
              to="/support"
              className="flex items-center gap-3 rounded-2xl bg-white dark:bg-neutral-900 shadow-soft-lg border border-gray-100 dark:border-white/[0.06] px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:shadow-soft-xl hover:-translate-y-0.5 transition-all duration-200 backdrop-blur-sm"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg icon-gradient-purple">
                <MessageSquare className="h-4 w-4" />
              </div>
              Support
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-glow-lg hover:shadow-glow-xl hover:from-brand-700 hover:to-brand-600 focus-ring transition-all duration-200 active:scale-[0.95]"
      >
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {open ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </motion.div>
      </button>
    </div>
  );
}
