import { NavLink } from "react-router-dom";
import type { NavItem } from "@/constants/nav";
import { cn } from "@/lib/utils";

export function NavList({
  items,
  collapsed = false,
  onNavigate,
}: {
  items: NavItem[];
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => (
        <li key={item.path}>
          <NavLink
            to={item.path}
            end={item.end}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-ring",
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-500/[0.08] dark:text-brand-400"
                  : "text-gray-600 hover:bg-gray-100/70 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/[0.04] dark:hover:text-gray-100",
              )
            }
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
