import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronsLeft, LogOut } from "lucide-react";
import { PRIMARY_NAV, SECONDARY_NAV } from "@/constants/nav";
import { useUIStore } from "@/stores/uiStore";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import { useChamaStore } from "@/stores/chamaStore";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

const ROLE_RANK: Record<Role, number> = {
  member: 0, secretary: 1, treasurer: 2, chairperson: 3, admin: 4, owner: 5, super_admin: 6,
};

function NavSection({ items, collapsed }: { items: typeof PRIMARY_NAV; collapsed: boolean }) {
  const { can } = usePermissions();
  return (
    <nav className="flex flex-col gap-1">
      {items
        .filter((item) => !item.permission || can(item.permission))
        .map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-ring",
                isActive
                  ? "bg-brand-50 dark:bg-brand-500/[0.08] text-brand-700 dark:text-brand-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50/80 dark:hover:bg-white/[0.03] hover:text-gray-900 dark:hover:text-gray-200"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-brand-600 dark:bg-brand-400"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors",
                    isActive && "text-brand-600 dark:text-brand-400"
                  )}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="ml-auto rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
    </nav>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, logout } = useAuth();
  const storeMembers = useChamaStore((s) => s.members);

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
    <motion.aside
      animate={{ width: sidebarCollapsed ? 84 : 272 }}
      transition={{ type: "spring", damping: 26, stiffness: 270 }}
      className="hidden lg:flex h-screen sticky top-0 flex-col border-r border-gray-200/50 dark:border-white/[0.05] bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl overflow-hidden z-30"
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl icon-gradient-brand font-bold text-sm">
          P
        </div>
        {!sidebarCollapsed && (
          <div className="leading-tight">
            <p className="font-bold text-sm text-gray-900 dark:text-white">Pamoja Wealth</p>
            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500">Building Wealth Together</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        <NavSection items={PRIMARY_NAV} collapsed={sidebarCollapsed} />
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/[0.06] to-transparent" />
        <NavSection items={SECONDARY_NAV} collapsed={sidebarCollapsed} />
      </div>

      {/* User + Collapse */}
      <div className="border-t border-gray-100/60 dark:border-white/[0.05] p-3">
        {user && (
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-xl p-2 transition-colors",
              !sidebarCollapsed && "hover:bg-gray-50/80 dark:hover:bg-white/[0.03]"
            )}
          >
            <Avatar src={user.avatarUrl} name={user.fullName} size="sm" status="online" />
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{user.fullName}</p>
                <p className="truncate text-xs text-gray-400 dark:text-gray-500 capitalize">
                  {displayRole}
                </p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button
                onClick={logout}
                aria-label="Log out"
                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 focus-ring rounded-lg p-1.5 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium text-gray-400 dark:text-gray-500 hover:bg-gray-50/80 dark:hover:bg-white/[0.03] hover:text-gray-600 dark:hover:text-gray-300 focus-ring transition-colors"
        >
          <ChevronsLeft className={cn("h-4 w-4 transition-transform duration-200", sidebarCollapsed && "rotate-180")} />
          {!sidebarCollapsed && "Collapse"}
        </button>
      </div>
    </motion.aside>
  );
}
