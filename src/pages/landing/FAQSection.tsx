import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "What is a chama and how does Pamoja Wealth help?",
    a: "A chama is a savings or investment group common across East Africa. Pamoja Wealth digitizes contributions, loans, investments and meetings for these groups in one secure platform.",
  },
  {
    q: "Is my financial data secure?",
    a: "Yes. We use bank-grade encryption, two-factor authentication and role-based access control to keep your group's data safe.",
  },
  {
    q: "Can multiple chamas be managed from one account?",
    a: "Absolutely. You can join or manage multiple chamas and switch between them from your dashboard.",
  },
  {
    q: "Does Pamoja Wealth integrate with M-Pesa and banks?",
    a: "Yes, contributions, withdrawals and loan disbursements can sync with M-Pesa, major banks, and card payments.",
  },
  {
    q: "What happens if a member misses a contribution?",
    a: "Members receive automated reminders and the platform tracks contribution streaks transparently for the whole group.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <div className="text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider"
        >
          FAQ
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mt-3 text-3xl font-bold text-gray-900 dark:text-white tracking-tight"
        >
          Frequently asked questions
        </motion.h2>
      </div>
      <div className="mt-12 space-y-3">
        {FAQS.map((faq, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className={cn(
              "card-base overflow-hidden transition-all duration-200",
              open === idx && "border-l-4 border-l-brand-500 shadow-soft-md"
            )}
          >
            <button
              onClick={() => setOpen(open === idx ? null : idx)}
              className="flex w-full items-center justify-between p-5 text-left gap-4"
            >
              <span
                className={cn(
                  "font-medium text-sm transition-colors",
                  open === idx ? "text-brand-600 dark:text-brand-400" : "text-gray-900 dark:text-white"
                )}
              >
                {faq.q}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 transition-all duration-200",
                  open === idx ? "rotate-180 text-brand-500" : "text-gray-400"
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {open === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
