import { useState } from "react";
import {
  Wallet, TrendingUp, ArrowDownLeft, Users,
  CheckCircle, Clock, AlertTriangle, FileText, Download,
} from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/cards/StatCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { CashFlowChart } from "@/components/charts/CashFlowChart";
import { ContributionGrowthChart } from "@/components/charts/ContributionGrowthChart";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SearchInput } from "@/components/common/SearchInput";
import { Tabs } from "@/components/ui/Tabs";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useTransactions } from "@/hooks/useTransactions";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/common/Pagination";
import { useChamaStore } from "@/stores/chamaStore";
import { getMockDatabase } from "@/mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction, ContributionRecord } from "@/types";

const statusVariant: Record<Transaction["status"], "success" | "warning" | "danger" | "default"> = {
  completed: "success", pending: "warning", failed: "danger", reversed: "default",
};

// Generate contribution records from members
const db = getMockDatabase();
const CONTRIBUTIONS: ContributionRecord[] = db.members.slice(0, 30).map((m, i) => ({
  id: `contrib_${i}`,
  chamaId: m.chamaId,
  memberId: m.id,
  memberName: m.fullName,
  amount: db.chamas.find(c => c.id === m.chamaId)?.monthlyContribution ?? 5000,
  month: new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
  status: (["paid", "paid", "paid", "pending", "overdue"] as const)[i % 5],
  paidAt: i % 5 < 3 ? new Date(Date.now() - i * 86400000).toISOString() : undefined,
  method: (["mpesa", "bank", "cash"] as const)[i % 3],
}));

export default function TreasuryPage() {
  const analytics = useAnalytics();
  const transactions = useTransactions();
  const chamas = useChamaStore((s) => s.chamas);
  const activeChamaId = useChamaStore((s) => s.activeChamaId);
  const activeChama = chamas.find((c) => c.id === activeChamaId);
  const chamaContribs = activeChamaId ? CONTRIBUTIONS.filter((c) => c.chamaId === activeChamaId) : CONTRIBUTIONS;
  const chamaTxns = activeChamaId ? transactions.filter((t) => t.chamaId === activeChamaId) : transactions;
  const { page, totalPages, paginated, goToPage } = usePagination(chamaTxns.slice(0, 200), 8);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredContributions = chamaContribs.filter((c) => {
    const matchesSearch = c.memberName.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paidCount = chamaContribs.filter((c) => c.status === "paid").length;
  const pendingCount = chamaContribs.filter((c) => c.status === "pending").length;
  const overdueCount = chamaContribs.filter((c) => c.status === "overdue").length;
  const collectionRate = Math.round((paidCount / chamaContribs.length) * 100);
  const totalCollected = chamaContribs.filter(c => c.status === "paid").reduce((s, c) => s + c.amount, 0);

  const txColumns: Column<Transaction>[] = [
    { key: "reference", header: "Ref" },
    { key: "description", header: "Description" },
    {
      key: "amount",
      header: "Amount",
      render: (t) => (
        <span className={`font-semibold text-xs ${t.amount < 0 ? "text-red-500" : "text-emerald-600"}`}>
          {formatCurrency(t.amount)}
        </span>
      ),
    },
    { key: "date", header: "Date", render: (t) => <span className="text-xs">{formatDate(t.date)}</span> },
    {
      key: "status",
      header: "Status",
      render: (t) => <Badge variant={statusVariant[t.status]} dot className="capitalize text-[11px]">{t.status}</Badge>,
    },
  ];

  const contribColumns: Column<ContributionRecord>[] = [
    {
      key: "memberName",
      header: "Member",
      render: (c) => (
        <div className="flex items-center gap-2">
          <Avatar src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.memberName)}&background=16A34A&color=fff`} name={c.memberName} size="xs" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">{c.memberName}</span>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (c) => <span className="font-semibold text-xs">{formatCurrency(c.amount)}</span>,
    },
    { key: "month", header: "Month", render: (c) => <span className="text-xs">{c.month}</span> },
    {
      key: "method",
      header: "Method",
      render: (c) => (
        <Badge variant="default" className="capitalize text-[10px]">
          {c.method === "mpesa" ? "M-Pesa" : c.method === "bank" ? "Bank" : "Cash"}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (c) => (
        <Badge
          variant={c.status === "paid" ? "success" : c.status === "pending" ? "warning" : "danger"}
          dot
          className="capitalize text-[11px]"
        >
          {c.status}
        </Badge>
      ),
    },
    {
      key: "actions" as never,
      header: "",
      render: (c: ContributionRecord) => (
        c.status !== "paid" ? (
          <Button size="sm" variant="ghost-brand" onClick={() => toast.success(`Reminder sent to ${c.memberName}`)}>
            Remind
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Treasury</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activeChama ? `Finances for ${activeChama.name}` : "Monitor contributions, track payments, and manage chama finances."}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" leftIcon={<Download className="h-3.5 w-3.5" />} onClick={() => toast.success("Treasury report exported.")}>
            Export Report
          </Button>
          <Button size="sm" variant="premium" leftIcon={<FileText className="h-3.5 w-3.5" />} onClick={() => toast.success("Statement generated.")}>
            Statement
          </Button>
        </div>
      </div>

      {/* Treasury Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Treasury Balance" value={formatCurrency(activeChama ? activeChama.totalFunds : chamas.reduce((sum, c) => sum + c.totalFunds, 0))} change={5.2} icon={Wallet} />
        <StatCard label="Total Inflow (MTD)" value={formatCurrency(totalCollected)} icon={ArrowDownLeft} iconColor="icon-gradient-emerald" />
        <StatCard label="Collection Rate" value={`${collectionRate}%`} icon={TrendingUp} iconColor="icon-gradient-blue" />
        <StatCard label="Active Chamas" value={chamas.filter(c => c.status === "active").length.toString()} icon={Users} iconColor="icon-gradient-purple" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Contribution Growth"><ContributionGrowthChart data={analytics.contributionGrowth} /></ChartCard>
        <ChartCard title="Cash Flow"><CashFlowChart data={analytics.cashFlow} /></ChartCard>
      </div>

      {/* Contributions + Transactions Tabs */}
      <Tabs
        items={[
          {
            value: "contributions",
            label: "Contributions",
            content: (
              <div className="space-y-4">
                {/* Contribution Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="card-hover p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="text-xs text-gray-400">Collected</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(totalCollected)}</p>
                        <p className="text-[11px] text-gray-400">{paidCount} of {chamaContribs.length} members</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <ProgressBar value={collectionRate} size="sm" colorClassName="bg-gradient-to-r from-emerald-500 to-emerald-600" />
                    </div>
                  </div>
                  <div className="card-hover p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="text-xs text-gray-400">Pending</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(chamaContribs.filter(c => c.status === "pending").reduce((s, c) => s + c.amount, 0))}</p>
                        <p className="text-[11px] text-gray-400">{pendingCount} members</p>
                      </div>
                    </div>
                  </div>
                  <div className="card-hover p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-xs text-gray-400">Overdue</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(chamaContribs.filter(c => c.status === "overdue").reduce((s, c) => s + c.amount, 0))}</p>
                        <p className="text-[11px] text-gray-400">{overdueCount} members</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <SearchInput value={query} onChange={setQuery} placeholder="Search members..." />
                  <div className="flex gap-2">
                    {["all", "paid", "pending", "overdue"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                          statusFilter === s
                            ? "bg-brand-600 text-white"
                            : "bg-gray-100 dark:bg-white/[0.04] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/[0.06]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <DataTable data={filteredContributions} columns={contribColumns} keyExtractor={(c) => c.id} />
              </div>
            ),
          },
          {
            value: "transactions",
            label: "Transactions",
            content: (
              <div>
                <DataTable data={paginated} columns={txColumns} keyExtractor={(t) => t.id} />
                <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
