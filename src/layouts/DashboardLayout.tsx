import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Bell, Building2, LayoutDashboard, Receipt } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { useChamaStore } from "@/stores/chamaStore";

export function DashboardLayout() {
  const location = useLocation();
  const activeChamaId = useChamaStore((s) => s.activeChamaId);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  const mobileNav = [
    { label: "Home", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Chamas", icon: Building2, path: "/chamas" },
    ...(activeChamaId
      ? [{ label: "Records", icon: Receipt, path: `/chamas/${activeChamaId}/contributions` }]
      : []),
    { label: "Alerts", icon: Bell, path: "/notifications" },
  ];

  return (
    <div className="flex min-h-screen bg-canvas dark:bg-neutral-950">
      <Sidebar />
      <MobileSidebar />
      <div className="flex-1 min-w-0 pb-16 lg:pb-0">
        <Navbar />
        <main id="main-content" className="px-4 py-5 sm:px-6 lg:px-8 lg:py-8 max-w-6xl mx-auto">
          <Outlet />
        </main>
      </div>

      <nav
        aria-label="Primary mobile"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200/70 dark:border-white/[0.05] bg-white/95 dark:bg-neutral-950/95"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around py-1.5">
          {mobileNav.map((item) => {
            const isActive =
              location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive ? "page" : undefined}
                className={`focus-ring flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-medium min-w-[56px] min-h-[44px] justify-center ${
                  isActive ? "text-brand-600 dark:text-brand-400" : "text-gray-500 dark:text-gray-500"
                }`}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
