import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { usePermissions } from "@/hooks/usePermissions";
import { PRIMARY_NAV, SECONDARY_NAV } from "@/constants/nav";

export function CommandPalette() {
  const { isOpen, setOpen } = useCommandPalette();
  const { can } = usePermissions();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const items = useMemo(
    () =>
      [...PRIMARY_NAV, ...SECONDARY_NAV].filter(
        (item) => !item.permission || can(item.permission)
      ),
    [can]
  );
  const filtered = items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-start justify-center pt-24 px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.97 }}
          className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden"
        >
          <div className="flex items-center gap-2.5 border-b border-gray-100 dark:border-white/10 px-4 py-3.5">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages, members, loans..."
              className="flex-1 bg-transparent text-sm outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
            />
            <kbd className="rounded-md border border-gray-200 dark:border-white/10 px-1.5 py-0.5 text-[10px] text-gray-400">ESC</kbd>
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {filtered.map((item) => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setOpen(false); setQuery(""); }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 focus-ring"
              >
                <item.icon className="h-4 w-4 text-gray-400" /> {item.label}
              </button>
            ))}
            {filtered.length === 0 && <p className="px-3 py-6 text-center text-sm text-gray-400">No results found</p>}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
