import { Outlet, useLocation, Link } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { CommandPalette } from "@/components/navigation/CommandPalette";
import { FloatingMenu } from "@/components/navigation/FloatingMenu";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, Users, Wallet, Calendar } from "lucide-react";
import { listMyChamas } from "@/api/chama";
import { useChamaStore } from "@/stores/chamaStore";
import { useAuthStore } from "@/stores/authStore";
import type { Chama } from "@/types";

const mobileNav = [
  { label: "Home", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Chamas", icon: Users, path: "/chamas" },
  { label: "Wallet", icon: Wallet, path: "/wallet" },
  { label: "Meetings", icon: Calendar, path: "/meetings" },
];

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

export function DashboardLayout() {
  useCommandPalette();
  const location = useLocation();
  const setChamas = useChamaStore((s) => s.setChamas);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("pamoja_token");
  const chamasQuery = useQuery({
    queryKey: ["chamas", "mine"],
    queryFn: () => listMyChamas({ pageSize: 50 }),
    enabled: isAuthenticated && hasToken,
    staleTime: 60_000,
    retry: (count, err) => {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403) return false;
      return count < 2;
    },
  });

  useEffect(() => {
    const items = chamasQuery.data?.items;
    if (!items) return;
    const mapped: Chama[] = items.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description ?? "",
      category: c.category,
      privacy: c.privacy,
      logoUrl: c.logoUrl ?? undefined,
      location: c.location ?? undefined,
      totalFunds: c.totalFunds,
      monthlyContribution: c.monthlyContribution,
      memberCount: c.memberCount ?? 0,
      status: (c.status as Chama["status"]) ?? "active",
      createdAt: c.createdAt,
      nextMeetingDate: "",
      growthRate: 0,
    } as unknown as Chama));
    setChamas(mapped);
  }, [chamasQuery.data, setChamas]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-canvas dark:bg-neutral-950">
      <Sidebar />
      <MobileSidebar />
      <CommandPalette />
      <div className="flex-1 min-w-0 pb-16 lg:pb-0">
        <Navbar />
        <main className="p-3 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <div className="mb-4 hidden sm:block">
            <Breadcrumbs />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200/60 dark:border-white/[0.05] bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          {mobileNav.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`focus-ring flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-medium transition-colors ${
                  isActive
                    ? "text-brand-600 dark:text-brand-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-brand-600 dark:text-brand-400" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <FloatingMenu />
    </div>
  );
}
