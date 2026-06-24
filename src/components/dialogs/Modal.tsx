import { type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const sizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl", xl: "max-w-4xl", "2xl": "max-w-5xl" };

export function Modal({ isOpen, onClose, title, description, children, size = "md" }: ModalProps) {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "relative w-full rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-2xl border border-gray-100 dark:border-white/[0.06] max-h-[90vh] overflow-y-auto",
              sizes[size]
            )}
            role="dialog"
            aria-modal="true"
          >
            {/* Gradient top accent */}
            <div className="absolute top-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-brand-500 via-brand-400 to-transparent opacity-50" />

            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-4 top-4 rounded-xl p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05] focus-ring transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-8">{title}</h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
            )}
            {(title || description) && <div className="mt-5">{children}</div>}
            {!title && !description && children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
