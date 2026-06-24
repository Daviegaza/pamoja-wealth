import { useState, useRef, useEffect } from "react";
import { Bell, Menu, Moon, Plus, Search, Sun, CreditCard, UserPlus, Vote, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/stores/uiStore";
import { useTheme } from "@/hooks/useTheme";
import { useNotification } from "@/hooks/useNotification";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const QUICK_ACTIONS = [
  { label: "New Loan", icon: CreditCard, path: "/loans", shortcut: "L" },
  { label: "Top Up Wallet", icon: Wallet, path: "/wallet", shortcut: "W" },
  { label: "Invite Member", icon: UserPlus, path: "/members", shortcut: "M" },
  { label: "Create Vote", icon: Vote, path: "/voting", shortcut: "V" },
];

export function Navbar() {
  const { setMobileMenuOpen, setCommandPaletteOpen } = useUIStore();
  const { resolvedMode, toggle } = useTheme();
  const { unreadCount } = useNotification();
  const { user } = useAuth();
  const [quickOpen, setQuickOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setQuickOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 sm:gap-3 border-b border-gray-200/40 dark:border-white/[0.04] bg-white/80 dark:bg-neutral-950/75 backdrop-blur-2xl px-3 sm:px-4 lg:px-6">
      {/* Mobile menu toggle */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden rounded-xl p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-white/[0.04] focus-ring transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Logo on mobile */}
      <Link to="/dashboard" className="lg:hidden flex items-center gap-1.5 mr-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg icon-gradient-brand font-bold text-[10px]">P</div>
      </Link>

      {/* Enhanced Search Bar */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="hidden md:flex items-center gap-2 rounded-xl border border-gray-200/40 dark:border-white/[0.05] bg-gray-50/60 dark:bg-white/[0.03] px-3.5 py-2 text-sm text-gray-400 hover:border-gray-300/60 dark:hover:border-white/[0.1] hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all duration-200 focus-ring w-full max-w-sm group"
      >
        <Search className="h-4 w-4 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors" />
        <span className="flex-1 text-left text-gray-400 dark:text-gray-500">Search anything...</span>
        <kbd className="rounded-lg border border-gray-200/60 dark:border-white/[0.06] bg-white dark:bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 hidden lg:block">
          ⌘K
        </kbd>
      </button>

      <div className="flex-1" />

      {/* Quick Action Button with Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setQuickOpen(!quickOpen)}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-3.5 py-2 text-sm font-semibold text-white hover:from-brand-700 hover:to-brand-600 shadow-soft-md hover:shadow-glow-md transition-all duration-200 focus-ring active:scale-[0.97]"
        >
          <Plus className="h-4 w-4" /> Quick Action
        </button>
        <AnimatePresence>
          {quickOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/[0.06] shadow-soft-xl p-2 z-50"
            >
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.label}
                  to={action.path}
                  onClick={() => setQuickOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-brand-600 dark:hover:text-brand-400 transition-all duration-150"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/[0.08] text-brand-600 dark:text-brand-400">
                    <action.icon className="h-4 w-4" />
                  </div>
                  {action.label}
                  <kbd className="ml-auto text-[10px] font-semibold text-gray-400">{action.shortcut}</kbd>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Quick Action */}
      <button
        onClick={() => setQuickOpen(!quickOpen)}
        className="sm:hidden rounded-xl p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50/80 dark:hover:bg-white/[0.04] transition-all duration-200 focus-ring"
      >
        <Plus className="h-5 w-5" />
      </button>

      {/* Theme Toggle with animated icon */}
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className="rounded-xl p-2 sm:p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50/80 dark:hover:bg-white/[0.04] transition-all duration-200 focus-ring"
      >
        <motion.div
          key={resolvedMode}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {resolvedMode === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </motion.div>
      </button>

      {/* Notifications */}
      <Link
        to="/notifications"
        className="relative rounded-xl p-2 sm:p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50/80 dark:hover:bg-white/[0.04] transition-all duration-200 focus-ring"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-1 top-1 sm:right-1.5 sm:top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </Link>

      {/* User Avatar */}
      <Link to="/profile" className="rounded-full focus-ring hidden sm:block">
        {user && <Avatar src={user.avatarUrl} name={user.fullName} size="sm" status="online" />}
      </Link>
    </header>
  );
}
