import { Activity, Database, Globe, ServerCog, TrendingUp, Zap } from "lucide-react";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { StatCard } from "@/components/cards/StatCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { RevenueTrendsChart } from "@/components/charts/RevenueTrendsChart";
import { MemberGrowthChart } from "@/components/charts/MemberGrowthChart";
import { CashFlowChart } from "@/components/charts/CashFlowChart";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAnalytics } from "@/hooks/useAnalytics";
import { usePermissions } from "@/hooks/usePermissions";

const SERVICES = [
  { name: "API Gateway", status: "operational" as const, uptime: "99.99%" },
  { name: "Payments Processor", status: "operational" as const, uptime: "99.95%" },
  { name: "Notification Service", status: "operational" as const, uptime: "99.87%" },
  { name: "AI Assistant Engine", status: "degraded" as const, uptime: "97.2%" },
  { name: "Document Storage", status: "operational" as const, uptime: "99.99%" },
  { name: "Auth Service", status: "operational" as const, uptime: "100%" },
];

const REGIONS = [
  { name: "Nairobi", status: "operational" as const, load: 42 },
  { name: "Mombasa", status: "operational" as const, load: 28 },
  { name: "Kampala", status: "operational" as const, load: 35 },
  { name: "Dar es Salaam", status: "operational" as const, load: 19 },
  { name: "Kigali", status: "operational" as const, load: 12 },
  { name: "Lagos", status: "degraded" as const, load: 67 },
];

export default function SuperAdminPage() {
  const analytics = useAnalytics();
  const { can } = usePermissions();

  // Permission guard
  if (!can("manage_billing")) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Super Admin</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Infrastructure health, platform revenue and global metrics.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => toast.success("System health report generated.")}>
            Health Report
          </Button>
          <Button size="sm" variant="premium" onClick={() => toast.success("Maintenance mode toggled.")}>
            <Zap className="h-3.5 w-3.5" /> Maintenance
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Platform Uptime" value="99.95%" icon={ServerCog} />
        <StatCard label="Active Regions" value="6" icon={Globe} iconColor="icon-gradient-blue" />
        <StatCard label="DB Load" value="42%" icon={Database} iconColor="icon-gradient-purple" />
        <StatCard label="API Requests/min" value="18.4K" change={5.2} icon={Activity} iconColor="icon-gradient-emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ChartCard title="Platform Revenue Trends"><RevenueTrendsChart data={analytics.revenueTrends} /></ChartCard>
          <ChartCard title="Global Member Growth"><MemberGrowthChart data={analytics.memberGrowth} /></ChartCard>
        </div>
        <ChartCard title="Platform Cash Flow"><CashFlowChart data={analytics.cashFlow} /></ChartCard>
      </div>

      {/* System Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-hover p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">System Services</h3>
          <div className="space-y-3">
            {SERVICES.map((s) => (
              <div key={s.name} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-white/[0.04] last:border-0 last:pb-0">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{s.name}</span>
                  <p className="text-[11px] text-gray-400 mt-0.5">Uptime: {s.uptime}</p>
                </div>
                <Badge variant={s.status === "operational" ? "success" : "warning"} dot={s.status === "operational"}>
                  {s.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Load */}
        <div className="card-hover p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Regional Load</h3>
          <div className="space-y-4">
            {REGIONS.map((r) => (
              <div key={r.name}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{r.name}</span>
                  <span className={r.load > 50 ? "text-red-500 font-semibold" : "text-gray-400"}>{r.load}%</span>
                </div>
                <ProgressBar value={r.load} size="sm" colorClassName={r.load > 50 ? "bg-gradient-to-r from-red-500 to-red-600" : "bg-gradient-to-r from-brand-500 to-brand-600"} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card-hover p-5 flex flex-wrap items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <span className="text-gray-500 dark:text-gray-400">Monthly Revenue: <span className="font-semibold text-gray-900 dark:text-white">KES 184K</span></span>
        </div>
        <span className="text-gray-300">·</span>
        <span className="text-gray-500 dark:text-gray-400">Active Users (24h): <span className="font-semibold text-gray-900 dark:text-white">847</span></span>
        <span className="text-gray-300">·</span>
        <span className="text-gray-500 dark:text-gray-400">Avg Response Time: <span className="font-semibold text-gray-900 dark:text-white">124ms</span></span>
        <span className="text-gray-300">·</span>
        <span className="text-gray-500 dark:text-gray-400">Error Rate: <span className="font-semibold text-emerald-600">0.02%</span></span>
      </div>
    </div>
  );
}
