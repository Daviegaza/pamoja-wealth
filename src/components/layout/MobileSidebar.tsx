import { AnimatePresence, motion } from "framer-motion";
import { X, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { PRIMARY_NAV, SECONDARY_NAV } from "@/constants/nav";
import { useUIStore } from "@/stores/uiStore";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useChamaStore } from "@/stores/chamaStore";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

const ROLE_RANK: Record<Role, number> = {
  member: 0, secretary: 1, treasurer: 2, chairperson: 3, admin: 4, owner: 5, super_admin: 6,
};

export function MobileSidebar() {
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const { user, logout } = useAuth();
  const { can } = usePermissions();
  const storeMembers = useChamaStore((s) => s.members);
  const allNav = [...PRIMARY_NAV, ...SECONDARY_NAV].filter(
    (item) => !item.permission || can(item.permission)
  );

  // Derive display role from chama memberships, not global user.role
  const displayRole = ((): string => {
    if (!user) return "Member";
    const myMemberships = storeMembers.filter((m) => m.userId === user.id);
    if (myMemberships.length === 0) return "New Member";
    let best: Role = "member";
    for (const m of myMemberships) {
      if (ROLE_RANK[m.role] > ROLE_RANK[best]) best = m.role;
    }
    return best.replace("_", " ");
  })();

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative h-full w-72 bg-white dark:bg-neutral-950 p-5 overflow-y-auto flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl icon-gradient-brand font-bold text-sm">
                  P
                </div>
                <span className="font-bold text-sm text-gray-900 dark:text-white">Pamoja Wealth</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="focus-ring rounded-xl p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-1">
              {allNav.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-brand-50 dark:bg-brand-500/[0.08] text-brand-700 dark:text-brand-400"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.03] hover:text-gray-900 dark:hover:text-white"
                    )
                  }
                >
                  <item.icon className="h-[18px] w-[18px]" /> {item.label}
                </NavLink>
              ))}
            </nav>

            {/* User section */}
            {user && (
              <div className="border-t border-gray-100 dark:border-white/[0.05] pt-4 mt-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar src={user.avatarUrl} name={user.fullName} size="md" status="online" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.fullName}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{displayRole}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/[0.06] transition-colors w-full"
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
