import { AnimatePresence, motion } from "framer-motion";
import { LogOut, X } from "lucide-react";
import { PRIMARY_NAV, SECONDARY_NAV, chamaNav } from "@/constants/nav";
import { useUIStore } from "@/stores/uiStore";
import { useAuth } from "@/hooks/useAuth";
import { useChamaStore } from "@/stores/chamaStore";
import { Avatar } from "@/components/ui/Avatar";
import { NavList } from "@/components/layout/NavList";

export function MobileSidebar() {
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const { user, logout } = useAuth();
  const activeChamaId = useChamaStore((s) => s.activeChamaId);
  const activeChamaName = useChamaStore((s) => s.activeChamaName);
  const close = () => setMobileMenuOpen(false);

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={close}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative h-full w-72 bg-white dark:bg-neutral-950 p-4 overflow-y-auto flex flex-col"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl icon-gradient-brand font-bold text-sm">P</div>
                <span className="font-bold text-sm text-gray-900 dark:text-white">Pamoja Wealth</span>
              </div>
              <button onClick={close} aria-label="Close menu" className="focus-ring rounded-lg p-2 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav aria-label="Main" className="flex-1 space-y-5">
              <NavList items={PRIMARY_NAV} onNavigate={close} />
              {activeChamaId && (
                <div>
                  <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 truncate">
                    {activeChamaName ?? "Current chama"}
                  </p>
                  <NavList items={chamaNav(activeChamaId)} onNavigate={close} />
                </div>
              )}
              <NavList items={SECONDARY_NAV} onNavigate={close} />
            </nav>

            {user && (
              <div className="border-t border-gray-100 dark:border-white/[0.05] pt-4 mt-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar src={user.avatarUrl} name={user.fullName} size="md" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.fullName}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    close();
                  }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/[0.06] transition-colors w-full focus-ring"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
