import { ShieldCheck, Users, Building2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/cards/StatCard";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/common/SearchInput";
import { useChamaStore } from "@/stores/chamaStore";
import { getMockDatabase } from "@/mock";
import { useSearch } from "@/hooks/useSearch";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/common/Pagination";
import type { User } from "@/types";
import { usePermissions } from "@/hooks/usePermissions";
import { Navigate } from "react-router-dom";

const { users } = getMockDatabase();

export default function AdminPage() {
  const { can } = usePermissions();
  const chamas = useChamaStore((s) => s.chamas);
  const { query, setQuery, results } = useSearch(users, ["fullName", "email", "location"]);
  const { page, totalPages, paginated, goToPage } = usePagination(results, 12);

  // Permission guard
  if (!can("manage_settings")) {
    return <Navigate to="/dashboard" replace />;
  }

  const verifiedCount = users.filter((u) => u.isVerified).length;
  const flaggedCount = 12;
  const activeChamas = chamas.filter((c) => c.status === "active").length;

  const columns: Column<User>[] = [
    {
      key: "fullName",
      header: "User",
      render: (u) => (
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => toast.info(`Viewing profile: ${u.fullName}`)}>
          <Avatar src={u.avatarUrl} name={u.fullName} size="sm" />
          <div>
            <span className="font-medium text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400">{u.fullName}</span>
            <p className="text-[11px] text-gray-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: "role", header: "Role", render: (u) => <Badge variant="brand" className="capitalize">{u.role.replace("_", " ")}</Badge> },
    {
      key: "isVerified",
      header: "Status",
      render: (u) => (
        u.isVerified
          ? <Badge variant="success" dot>Verified</Badge>
          : <Badge variant="warning" dot>Pending</Badge>
      ),
    },
    { key: "location", header: "Location" },
    {
      key: "actions",
      header: "Actions",
      render: (u) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost-brand" onClick={() => toast.success(`Verified: ${u.fullName}`)}>
            <CheckCircle className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => toast.info(`Flagged: ${u.fullName}`)}>
            <XCircle className="h-3.5 w-3.5 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Console</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform-wide oversight of users, chamas and compliance.</p>
        </div>
        <Button variant="outline" size="sm" leftIcon={<ShieldCheck className="h-3.5 w-3.5" />} onClick={() => toast.success("Compliance report exported.")}>
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={users.length.toLocaleString()} change={8.2} icon={Users} />
        <StatCard label="Active Chamas" value={activeChamas.toLocaleString()} icon={Building2} iconColor="icon-gradient-blue" />
        <StatCard label="Verified Users" value={`${Math.round((verifiedCount / users.length) * 100)}%`} icon={ShieldCheck} iconColor="icon-gradient-emerald" />
        <StatCard label="Flagged Accounts" value={flaggedCount.toString()} change={-25} icon={AlertTriangle} iconColor="icon-gradient-rose" />
      </div>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Platform Users</h2>
          <div className="w-full sm:w-64">
            <SearchInput value={query} onChange={setQuery} placeholder="Search users..." />
          </div>
        </div>
        <DataTable data={paginated} columns={columns} keyExtractor={(u) => u.id} />
        <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
      </div>
    </div>
  );
}
