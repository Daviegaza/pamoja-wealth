import { useMemo, useState } from "react";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/common/SearchInput";
import { Select } from "@/components/ui/Select";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { useSearch } from "@/hooks/useSearch";
import { useSort } from "@/hooks/useSort";
import { usePagination } from "@/hooks/usePagination";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types";
import { useChamaStore } from "@/stores/chamaStore";
import { listTransactions, type WalletTransactionDTO, type TxType } from "@/api/wallet";

const statusVariant: Record<Transaction["status"], "success" | "warning" | "danger" | "default"> = {
  completed: "success", pending: "warning", failed: "danger", reversed: "default",
};

type TypeFilter = "all" | TxType;

function mapTransaction(dto: WalletTransactionDTO): Transaction {
  return {
    id: dto.id,
    userId: dto.userId,
    chamaId: dto.chamaId ?? undefined,
    type: dto.type,
    amount: dto.amount,
    date: dto.createdAt,
    status: dto.status,
    description: dto.description,
    reference: dto.reference,
    balanceAfter: dto.balanceAfter,
  };
}

export default function TransactionsPage() {
  const activeChamaId = useChamaStore((s) => s.activeChamaId);
  const chamas = useChamaStore((s) => s.chamas);

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const params = useMemo(
    () => ({
      page,
      pageSize,
      ...(typeFilter !== "all" ? { type: typeFilter } : {}),
      ...(activeChamaId ? { chamaId: activeChamaId } : {}),
    }),
    [page, typeFilter, activeChamaId]
  );

  const txnsQuery = useQuery({
    queryKey: ["wallet", "transactions", params],
    queryFn: () => listTransactions(params),
  });

  const items: Transaction[] = useMemo(
    () => (txnsQuery.data?.items ?? []).map(mapTransaction),
    [txnsQuery.data]
  );
  const total = txnsQuery.data?.meta?.total ?? items.length;
  const totalPages = txnsQuery.data?.meta?.totalPages ?? 1;

  const activeChama = activeChamaId ? chamas.find((c) => c.id === activeChamaId) : null;
  const { query, setQuery, results: searched } = useSearch(items, ["reference", "description"]);
  const { sorted, sortKey, direction, toggleSort } = useSort(searched, "date");
  const { paginated } = usePagination(sorted, pageSize);

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
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {total.toLocaleString()} transaction{total !== 1 ? "s" : ""}{activeChama ? ` in ${activeChama.name}` : ""}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by reference or description..." />
        <div className="max-w-xs">
          <Select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as TypeFilter); setPage(1); }}
            options={[
              { label: "All types", value: "all" }, { label: "Contribution", value: "contribution" }, { label: "Withdrawal", value: "withdrawal" },
              { label: "Loan Disbursement", value: "loan_disbursement" }, { label: "Loan Repayment", value: "loan_repayment" },
              { label: "Investment", value: "investment" }, { label: "Dividend", value: "dividend" }, { label: "Fee", value: "fee" }, { label: "Transfer", value: "transfer" },
            ]}
          />
        </div>
      </div>

      {txnsQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 py-8 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading transactions...
        </div>
      ) : txnsQuery.isError ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="Failed to load transactions"
          description="We couldn't reach the server. Please try again."
          actionLabel="Retry"
          onAction={() => txnsQuery.refetch()}
        />
      ) : paginated.length === 0 ? (
        <EmptyState icon={ArrowLeftRight} title="No transactions" description="Transactions will appear here once you start contributing." />
      ) : (
        <DataTable data={paginated} columns={columns} keyExtractor={(t) => t.id} sortKey={sortKey} sortDirection={direction} onSort={toggleSort} />
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
