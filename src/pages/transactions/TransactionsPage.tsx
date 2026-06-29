import { ArrowLeftRight } from "lucide-react";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/common/SearchInput";
import { Select } from "@/components/ui/Select";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { useTransactions } from "@/hooks/useTransactions";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import { useSort } from "@/hooks/useSort";
import { usePagination } from "@/hooks/usePagination";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types";
import { useChamaStore } from "@/stores/chamaStore";

const statusVariant: Record<Transaction["status"], "success" | "warning" | "danger" | "default"> = {
  completed: "success", pending: "warning", failed: "danger", reversed: "default",
};

export default function TransactionsPage() {
  const transactions = useTransactions();
  const activeChamaId = useChamaStore((s) => s.activeChamaId);
  const chamas = useChamaStore((s) => s.chamas);
  const activeChama = chamas.find((c) => c.id === activeChamaId);
  const displayTxns = activeChamaId ? transactions.filter((t) => t.chamaId === activeChamaId) : transactions;
  const { query, setQuery, results: searched } = useSearch(displayTxns, ["reference", "description"]);
  const { value, setValue, results: filtered } = useFilter(searched, "type");
  const { sorted, sortKey, direction, toggleSort } = useSort(filtered, "date");
  const { page, totalPages, paginated, goToPage } = usePagination(sorted, 12);

  const columns: Column<Transaction>[] = [
    { key: "reference", header: "Reference", sortable: true },
    { key: "description", header: "Description" },
    { key: "type", header: "Type", render: (t) => <span className="capitalize">{t.type.replace("_", " ")}</span> },
    { key: "amount", header: "Amount", sortable: true, render: (t) => <span className={t.amount < 0 ? "text-red-500" : "text-emerald-600"}>{formatCurrency(t.amount)}</span> },
    { key: "date", header: "Date", sortable: true, render: (t) => formatDate(t.date) },
    { key: "status", header: "Status", render: (t) => <Badge variant={statusVariant[t.status]} className="capitalize">{t.status}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{displayTxns.length.toLocaleString()} transactions in {activeChama?.name ?? "All Chamas"}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by reference or description..." />
        <div className="max-w-xs">
          <Select
            value={value === "all" ? "all" : value}
            onChange={(e) => setValue(e.target.value as typeof value)}
            options={[
              { label: "All types", value: "all" }, { label: "Contribution", value: "contribution" }, { label: "Withdrawal", value: "withdrawal" },
              { label: "Loan Disbursement", value: "loan_disbursement" }, { label: "Loan Repayment", value: "loan_repayment" },
              { label: "Investment", value: "investment" }, { label: "Dividend", value: "dividend" }, { label: "Fee", value: "fee" }, { label: "Transfer", value: "transfer" },
            ]}
          />
        </div>
      </div>

      {paginated.length === 0 ? (
        <EmptyState icon={ArrowLeftRight} title="No transactions" description="Transactions will appear here once you start contributing." />
      ) : (
        <DataTable data={paginated} columns={columns} keyExtractor={(t) => t.id} sortKey={sortKey} sortDirection={direction} onSort={toggleSort} />
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
    </div>
  );
}
