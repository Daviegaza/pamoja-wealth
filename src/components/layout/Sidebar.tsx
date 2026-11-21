import { ChevronsLeft, LogOut } from "lucide-react";
import { PRIMARY_NAV, SECONDARY_NAV, chamaNav } from "@/constants/nav";
import { useUIStore } from "@/stores/uiStore";
import { useAuth } from "@/hooks/useAuth";
import { useChamaStore } from "@/stores/chamaStore";
import { Avatar } from "@/components/ui/Avatar";
import { NavList } from "@/components/layout/NavList";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, logout } = useAuth();
  const activeChamaId = useChamaStore((s) => s.activeChamaId);
  const activeChamaName = useChamaStore((s) => s.activeChamaName);

  return (
    <aside
      className={cn(
        "hidden lg:flex h-screen sticky top-0 flex-col border-r border-gray-200/60 dark:border-white/[0.05] bg-white dark:bg-neutral-950 z-30 transition-[width] duration-200",
        sidebarCollapsed ? "w-[76px]" : "w-64",
      )}
    >
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl icon-gradient-brand font-bold text-sm">P</div>
        {!sidebarCollapsed && (
          <div className="leading-tight">
            <p className="font-bold text-sm text-gray-900 dark:text-white">Pamoja Wealth</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-500">Chama records</p>
          </div>
        )}
      </div>

      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        <NavList items={PRIMARY_NAV} collapsed={sidebarCollapsed} />
        {activeChamaId && (
          <div>
            {!sidebarCollapsed && (
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 truncate">
                {activeChamaName ?? "Current chama"}
              </p>
            )}
            <NavList items={chamaNav(activeChamaId)} collapsed={sidebarCollapsed} />
          </div>
        )}
        <NavList items={SECONDARY_NAV} collapsed={sidebarCollapsed} />
      </nav>

      <div className="border-t border-gray-100 dark:border-white/[0.05] p-3">
        {user && (
          <div className="flex items-center gap-2.5 rounded-lg p-2">
            <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
            {!sidebarCollapsed && (
              <>
                <p className="flex-1 min-w-0 truncate text-sm font-semibold text-gray-900 dark:text-white">{user.fullName}</p>
                <button
                  onClick={logout}
                  aria-label="Log out"
                  className="text-gray-400 hover:text-red-500 focus-ring rounded-lg p-1.5 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        )}
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.03] hover:text-gray-600 focus-ring transition-colors"
        >
          <ChevronsLeft className={cn("h-4 w-4 transition-transform", sidebarCollapsed && "rotate-180")} />
          {!sidebarCollapsed && "Collapse"}
        </button>
      </div>
    </aside>
  );
}
