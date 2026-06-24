import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, ShieldAlert, Lock, ServerCog, Users, Building2, TrendingUp,
  AlertTriangle, CheckCircle, XCircle, Download, RefreshCw, UserX, Ban,
  Activity, Globe, Fingerprint, Key, Search, WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/cards/StatCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { RevenueTrendsChart } from "@/components/charts/RevenueTrendsChart";
import { CashFlowChart } from "@/components/charts/CashFlowChart";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { getMockDatabase } from "@/mock";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import type { SecurityLog, SecurityMetrics } from "@/types";

const db = getMockDatabase();

// Simulated security data
const SECURITY_METRICS: SecurityMetrics = {
  totalLoginsToday: 847,
  failedLoginsToday: 23,
  suspiciousIPs: 3,
  lockedAccounts: 2,
  activeSessions: 142,
  lastSecurityAudit: new Date(Date.now() - 86400000 * 2).toISOString(),
  threatLevel: "low",
};

const AUDIT_LOG: SecurityLog[] = [
  { id: "sec_1", event: "login_failed", userId: "usr_42", userName: "Unknown", ipAddress: "197.254.12.34", location: "Lagos, NG", userAgent: "Chrome/125.0", details: "3 consecutive failed attempts — account locked", severity: "high", timestamp: new Date(Date.now() - 300000).toISOString() },
  { id: "sec_2", event: "suspicious_activity", userId: "usr_18", userName: "Otieno Kamau", ipAddress: "41.80.114.9", location: "Nairobi, KE", userAgent: "Firefox/126.0", details: "Unusual withdrawal pattern detected — KES 450K in 24h", severity: "critical", timestamp: new Date(Date.now() - 1200000).toISOString() },
  { id: "sec_3", event: "admin_action", userName: "Amara Okafor", ipAddress: "102.216.201.1", location: "Nairobi, KE", userAgent: "Chrome/126.0", details: "System maintenance mode toggled", severity: "medium", timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: "sec_4", event: "permission_change", userId: "usr_56", userName: "Wanjiku Admin", ipAddress: "102.216.201.1", location: "Nairobi, KE", userAgent: "Chrome/126.0", details: "User role upgraded: member → treasurer", severity: "medium", timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: "sec_5", event: "login_success", userName: "Amara Okafor", ipAddress: "102.216.201.1", location: "Nairobi, KE", userAgent: "Chrome/126.0", details: "Owner login — 2FA verified", severity: "low", timestamp: new Date(Date.now() - 14400000).toISOString() },
  { id: "sec_6", event: "data_export", userId: "usr_12", userName: "Njeri Mwangi", ipAddress: "154.120.88.42", location: "Kampala, UG", userAgent: "Edge/125.0", details: "Exported member list for Umoja Savings Group", severity: "low", timestamp: new Date(Date.now() - 43200000).toISOString() },
  { id: "sec_7", event: "login_failed", userId: undefined, userName: "Unknown", ipAddress: "91.234.56.78", location: "Moscow, RU", userAgent: "Python/3.12", details: "Automated brute force attempt detected — IP blocked", severity: "critical", timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: "sec_8", event: "password_change", userName: "Amara Okafor", ipAddress: "102.216.201.1", location: "Nairobi, KE", userAgent: "Chrome/126.0", details: "Owner password changed successfully", severity: "low", timestamp: new Date(Date.now() - 172800000).toISOString() },
];

const threatVariant: Record<string, "success" | "warning" | "danger"> = {
  low: "success",
  elevated: "warning",
  high: "danger",
  critical: "danger",
};

const eventIcon: Record<SecurityLog["event"], typeof Shield> = {
  login_success: CheckCircle,
  login_failed: XCircle,
  password_change: Key,
  account_locked: Lock,
  suspicious_activity: AlertTriangle,
  admin_action: ServerCog,
  data_export: Download,
  permission_change: Users,
};

const severityVariant: Record<SecurityLog["severity"], "success" | "warning" | "danger" | "info"> = {
  low: "info",
  medium: "warning",
  high: "warning",
  critical: "danger",
};

export default function OwnerPage() {
  const { user } = useAuth();

  if (user?.role !== "owner") {
    return <Navigate to="/dashboard" replace />;
  }

  const adminUsers = db.users.filter((u) => ["admin", "super_admin"].includes(u.role));
  const chamas = db.chamas;

  const auditColumns: Column<SecurityLog>[] = [
    {
      key: "event",
      header: "Event",
      render: (log) => {
        const Icon = eventIcon[log.event];
        return (
          <div className="flex items-center gap-2.5">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              log.severity === "critical" ? "bg-red-50 dark:bg-red-500/[0.08] text-red-600" :
              log.severity === "high" ? "bg-amber-50 dark:bg-amber-500/[0.08] text-amber-600" :
              "bg-gray-100 dark:bg-white/[0.04] text-gray-500"
            }`}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">{log.event.replace("_", " ")}</span>
          </div>
        );
      },
    },
    { key: "userName", header: "User" },
    { key: "location", header: "Location", render: (l) => <span className="text-xs">{l.location}</span> },
    {
      key: "severity",
      header: "Severity",
      render: (l) => <Badge variant={severityVariant[l.severity]} dot className="capitalize text-[10px]">{l.severity}</Badge>,
    },
    { key: "timestamp", header: "Time", render: (l) => <span className="text-xs text-gray-400">{formatRelativeTime(l.timestamp)}</span> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Shield className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Owner Command Center</h1>
            <Badge variant="premium">Owner</Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Full platform control, security monitoring, and threat detection.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="danger" leftIcon={<Ban className="h-3.5 w-3.5" />} onClick={() => toast.success("Emergency lockdown activated. All non-admin sessions terminated.")}>
            Lockdown
          </Button>
          <Button size="sm" variant="outline" leftIcon={<Download className="h-3.5 w-3.5" />} onClick={() => toast.success("Full audit report exported.")}>
            Export Audit
          </Button>
        </div>
      </motion.div>

      {/* Threat Level Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border p-5 flex items-center gap-4 ${
          SECURITY_METRICS.threatLevel === "low" ? "bg-emerald-50/50 dark:bg-emerald-500/[0.04] border-emerald-200 dark:border-emerald-500/[0.12]" :
          SECURITY_METRICS.threatLevel === "elevated" ? "bg-amber-50/50 dark:bg-amber-500/[0.04] border-amber-200 dark:border-amber-500/[0.12]" :
          "bg-red-50/50 dark:bg-red-500/[0.04] border-red-200 dark:border-red-500/[0.12]"
        }`}
      >
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
          SECURITY_METRICS.threatLevel === "low" ? "bg-emerald-100 dark:bg-emerald-500/[0.12] text-emerald-600" :
          SECURITY_METRICS.threatLevel === "elevated" ? "bg-amber-100 dark:bg-amber-500/[0.12] text-amber-600" :
          "bg-red-100 dark:bg-red-500/[0.12] text-red-600"
        }`}>
          {SECURITY_METRICS.threatLevel === "low" ? <Shield className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-900 dark:text-white">Threat Level: <span className="capitalize">{SECURITY_METRICS.threatLevel}</span></p>
            <Badge variant={threatVariant[SECURITY_METRICS.threatLevel]} dot>{SECURITY_METRICS.threatLevel.toUpperCase()}</Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Last audit: {formatRelativeTime(SECURITY_METRICS.lastSecurityAudit)} · {SECURITY_METRICS.activeSessions} active sessions · {SECURITY_METRICS.failedLoginsToday} failed logins today
          </p>
        </div>
        <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-3.5 w-3.5" />} onClick={() => toast.success("Security audit initiated. Scanning all systems...")}>
          Run Audit
        </Button>
      </motion.div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Failed Logins Today" value={SECURITY_METRICS.failedLoginsToday.toString()} change={15} icon={XCircle} iconColor="icon-gradient-rose" />
        <StatCard label="Suspicious IPs" value={SECURITY_METRICS.suspiciousIPs.toString()} icon={AlertTriangle} iconColor="icon-gradient-amber" />
        <StatCard label="Locked Accounts" value={SECURITY_METRICS.lockedAccounts.toString()} icon={Lock} iconColor="icon-gradient-purple" />
        <StatCard label="Active Sessions" value={SECURITY_METRICS.activeSessions.toString()} icon={Activity} iconColor="icon-gradient-blue" />
      </div>

      {/* Platform Overview + Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ChartCard title="Platform Revenue — Owner View"><RevenueTrendsChart data={db.analytics.revenueTrends} /></ChartCard>
          <ChartCard title="Global Cash Flow"><CashFlowChart data={db.analytics.cashFlow} /></ChartCard>
        </div>
        <div className="space-y-6">
          {/* Platform Stats */}
          <div className="card-hover p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4 text-brand-500" /> Platform Overview
            </h3>
            <div className="space-y-3">
              {[
                { label: "Total Users", value: db.users.length.toLocaleString(), icon: Users },
                { label: "Total Chamas", value: chamas.length.toLocaleString(), icon: Building2 },
                { label: "Platform Revenue", value: formatCurrency(1_840_000), icon: TrendingUp },
                { label: "System Uptime", value: "99.95%", icon: ServerCog },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/[0.04] last:border-0">
                  <div className="flex items-center gap-2.5">
                    <item.icon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Users */}
          <div className="card-hover p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-brand-500" /> Admin Accounts
            </h3>
            <div className="space-y-2">
              {adminUsers.slice(0, 4).map((admin) => (
                <div key={admin.id} className="flex items-center gap-2.5 py-2">
                  <Avatar src={admin.avatarUrl} name={admin.fullName} size="xs" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{admin.fullName}</p>
                    <p className="text-[11px] text-gray-400 capitalize">{admin.role.replace("_", " ")}</p>
                  </div>
                  <div className="flex-1" />
                  <Button size="sm" variant="ghost" onClick={() => toast.info(`Revoked access for ${admin.fullName}`)}>
                    <UserX className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Security Audit Log */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Search className="h-4 w-4 text-brand-500" /> Security Audit Log
          </h2>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost-brand" onClick={() => toast.success("Audit log filtered.")}>Filter</Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("Audit log exported to CSV.")} leftIcon={<Download className="h-3 w-3" />}>Export</Button>
          </div>
        </div>
        <DataTable data={AUDIT_LOG} columns={auditColumns} keyExtractor={(l) => l.id} />
      </div>

      {/* Quick Security Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Lock, label: "Lock All Accounts", desc: "Freeze all non-admin access", action: () => toast.success("All non-admin accounts locked."), variant: "danger" as const },
          { icon: WifiOff, label: "Go Offline", desc: "Maintenance mode — users see notice", action: () => toast.success("Maintenance mode enabled."), variant: "outline" as const },
          { icon: Download, label: "Full Backup", desc: "Export all platform data", action: () => toast.success("Full backup initiated. You'll receive an email."), variant: "outline" as const },
          { icon: Key, label: "Rotate API Keys", desc: "Invalidate all existing keys", action: () => toast.success("All API keys rotated. Services updated."), variant: "outline" as const },
        ].map((action) => (
          <div key={action.label} className="card-hover p-5 text-center group">
            <div className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl ${
              action.variant === "danger" ? "bg-red-50 dark:bg-red-500/[0.06] text-red-600" :
              "bg-gray-100 dark:bg-white/[0.04] text-gray-500 group-hover:text-brand-600 dark:group-hover:text-brand-400"
            } transition-colors`}>
              <action.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 font-semibold text-sm text-gray-900 dark:text-white">{action.label}</p>
            <p className="mt-1 text-xs text-gray-400">{action.desc}</p>
            <Button
              size="sm"
              variant={action.variant === "danger" ? "danger" : "outline"}
              className="mt-3 w-full"
              onClick={action.action}
            >
              Execute
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
