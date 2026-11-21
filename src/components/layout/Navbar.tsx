import { useEffect, useRef, useState } from "react";
import { Bell, Building2, Check, ChevronDown, Menu, Moon, Sun } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useUIStore } from "@/stores/uiStore";
import { useTheme } from "@/hooks/useTheme";
import { useChamaStore } from "@/stores/chamaStore";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { listMyChamas } from "@/api/chama";
import { listNotifications } from "@/api/notifications";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { setMobileMenuOpen } = useUIStore();
  const { resolvedMode, toggle } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const activeChamaId = useChamaStore((s) => s.activeChamaId);
  const setActiveChama = useChamaStore((s) => s.setActiveChama);
  const [chamaOpen, setChamaOpen] = useState(false);
  const chamaDropdownRef = useRef<HTMLDivElement>(null);

  const chamas = useQuery({ queryKey: ["chamas", "mine"], queryFn: listMyChamas, staleTime: 60_000 });
  const unread = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () => listNotifications({ isRead: false, pageSize: 1 }),
    staleTime: 60_000,
  });
  const unreadCount = unread.data?.meta?.unreadCount ?? unread.data?.meta?.total ?? 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (chamaDropdownRef.current && !chamaDropdownRef.current.contains(e.target as Node)) setChamaOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const myChamas = chamas.data ?? [];
  const activeChama = myChamas.find((c) => c.id === activeChamaId);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 sm:gap-3 border-b border-gray-200/60 dark:border-white/[0.05] bg-white/90 dark:bg-neutral-950/90 backdrop-blur px-3 sm:px-4 lg:px-6">
      <button
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Open menu"
        className="lg:hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.04] focus-ring"
      >
        <Menu className="h-5 w-5" />
      </button>

      {myChamas.length > 0 && (
        <div className="relative" ref={chamaDropdownRef}>
          <button
            onClick={() => setChamaOpen(!chamaOpen)}
            aria-haspopup="listbox"
            aria-expanded={chamaOpen}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/[0.08] px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/[0.03] focus-ring"
          >
            <Building2 className="h-4 w-4 text-brand-600" aria-hidden="true" />
            <span className="max-w-[160px] truncate">{activeChama ? activeChama.name : "Choose chama"}</span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
          </button>
          {chamaOpen && (
            <ul
              role="listbox"
              aria-label="Your chamas"
              className="absolute left-0 mt-2 w-64 rounded-xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/[0.06] shadow-soft-xl p-1.5 z-50"
            >
              {myChamas.map((c) => (
                <li key={c.id}>
                  <button
                    role="option"
                    aria-selected={activeChamaId === c.id}
                    onClick={() => {
                      setActiveChama(c.id, c.name);
                      setChamaOpen(false);
                      navigate(`/chamas/${c.id}`);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-ring",
                      activeChamaId === c.id
                        ? "bg-brand-50 dark:bg-brand-500/[0.08] text-brand-700 dark:text-brand-400"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]",
                    )}
                  >
                    <span className="truncate">{c.name}</span>
                    {activeChamaId === c.id && <Check className="h-4 w-4 ml-auto text-brand-500 shrink-0" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex-1" />

      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className="rounded-lg p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04] focus-ring"
      >
        {resolvedMode === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
      </button>

      <Link
        to="/notifications"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        className="relative rounded-lg p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04] focus-ring"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>

      <Link to="/profile" aria-label="Your profile" className="rounded-full focus-ring hidden sm:block">
        {user && <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />}
      </Link>
    </header>
  );
}
