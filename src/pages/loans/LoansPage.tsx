import { useState, useMemo } from "react";
import { Plus, Check, X, CreditCard, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { LoanCard } from "@/components/cards/LoanCard";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/dialogs/Modal";
import { LoanApplicationForm } from "@/components/forms/LoanApplicationForm";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { usePagination } from "@/hooks/usePagination";
import { useChamaStore } from "@/stores/chamaStore";
import {
  listLoans,
  approveLoan,
  rejectLoan,
  getRepayments,
  type LoanDTO,
  type LoanStatus,
} from "@/api/loans";
import { formatCurrency, formatDate } from "@/lib/utils";

const MANAGEMENT_ROLES = ["owner", "admin", "chairperson"];
type StatusFilter = LoanStatus | "all";

function LoanCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] p-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-white/[0.06]" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 rounded bg-gray-200 dark:bg-white/[0.06]" />
          <div className="h-2 w-32 rounded bg-gray-200 dark:bg-white/[0.06]" />
        </div>
      </div>
      <div className="mt-4 h-6 w-1/2 rounded bg-gray-200 dark:bg-white/[0.06]" />
      <div className="mt-3 h-2 w-full rounded bg-gray-200 dark:bg-white/[0.06]" />
    </div>
  );
}

function RepaymentSchedule({ loanId }: { loanId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["loans", loanId, "repayments"],
    queryFn: () => getRepayments(loanId),
  });

  if (isLoading) {
    return <p className="text-xs text-gray-500 dark:text-gray-400 p-3">Loading schedule...</p>;
  }
  if (error) {
    return <p className="text-xs text-red-500 p-3">Could not load repayment schedule.</p>;
  }
  if (!data || data.length === 0) {
    return <p className="text-xs text-gray-500 dark:text-gray-400 p-3">No repayments scheduled yet.</p>;
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-white/[0.06] divide-y divide-gray-100 dark:divide-white/[0.04] mt-2">
      {data.map((r) => (
        <div key={r.id} className="flex items-center justify-between px-3 py-2 text-xs">
          <span className="text-gray-600 dark:text-gray-300">{formatDate(r.dueDate)}</span>
          <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(r.amount)}</span>
          <span className="capitalize text-gray-500 dark:text-gray-400">{r.status}</span>
        </div>
      ))}
    </div>
  );
}

export default function LoansPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const activeChamaId = useChamaStore((s) => s.activeChamaId);
  const chamas = useChamaStore((s) => s.chamas);
  const storeMembers = useChamaStore((s) => s.members);

  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const myMemberRecords = storeMembers.filter((m) => m.userId === user?.id);
  const myChamaIds = useMemo(
    () => new Set(myMemberRecords.map((m) => m.chamaId)),
    [myMemberRecords]
  );
  const activeMembership = myMemberRecords.find((m) => m.chamaId === activeChamaId);
  const canManageActive = activeMembership
    ? MANAGEMENT_ROLES.includes(activeMembership.role)
    : false;
  const activeChama = activeChamaId ? chamas.find((c) => c.id === activeChamaId) : null;

  const filters = useMemo(
    () => ({
      chamaId: activeChamaId ?? undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      page: 1,
      pageSize: 100,
    }),
    [activeChamaId, statusFilter]
  );

  const loansQuery = useQuery({
    queryKey: ["loans", filters],
    queryFn: () => listLoans(filters),
  });

  const approveMut = useMutation({
    mutationFn: (id: string) => approveLoan(id),
    onSuccess: () => {
      toast.success("Loan approved.");
      qc.invalidateQueries({ queryKey: ["loans"] });
    },
    onError: () => toast.error("Failed to approve loan."),
  });

  const rejectMut = useMutation({
    mutationFn: (id: string) => rejectLoan(id),
    onSuccess: () => {
      toast.success("Loan rejected.");
      qc.invalidateQueries({ queryKey: ["loans"] });
    },
    onError: () => toast.error("Failed to reject loan."),
  });

  const loans: LoanDTO[] = loansQuery.data?.items ?? [];
  const { page, totalPages, paginated, goToPage } = usePagination(loans, 9);

  if (myChamaIds.size === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loans</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Apply for loans and manage repayments
          </p>
        </div>
        <EmptyState
          icon={CreditCard}
          title="No chamas yet"
          description="Join or create a chama to apply for loans."
          actionLabel="View Chamas"
          onAction={() => (window.location.href = "/chamas")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loans</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {loans.length} loan{loans.length !== 1 ? "s" : ""}
            {activeChama
              ? ` in ${activeChama.name}`
              : ` across your ${myChamaIds.size} chama${myChamaIds.size !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>
          Apply for Loan
        </Button>
      </div>

      <div className="max-w-xs">
        <Select
          label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          options={[
            { label: "All statuses", value: "all" },
            { label: "Pending", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Active", value: "active" },
            { label: "Completed", value: "completed" },
            { label: "Defaulted", value: "defaulted" },
            { label: "Rejected", value: "rejected" },
          ]}
        />
      </div>

      {loansQuery.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoanCardSkeleton key={i} />
          ))}
        </div>
      ) : loansQuery.isError ? (
        <EmptyState
          icon={CreditCard}
          title="Could not load loans"
          description="Please try again in a moment."
          actionLabel="Retry"
          onAction={() => loansQuery.refetch()}
        />
      ) : paginated.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No loans yet"
          description="No loans yet - apply to get started."
          actionLabel="Apply for Loan"
          onAction={() => setOpen(true)}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginated.map((loan) => (
              <div key={loan.id} className="relative">
                <div
                  onClick={() => setExpandedId(expandedId === loan.id ? null : loan.id)}
                  className="cursor-pointer"
                >
                  <LoanCard loan={loan as never} />
                </div>
                <button
                  type="button"
                  aria-label="Toggle repayment schedule"
                  className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  onClick={() =>
                    setExpandedId(expandedId === loan.id ? null : loan.id)
                  }
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      expandedId === loan.id ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {expandedId === loan.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <RepaymentSchedule loanId={loan.id} />
                    </motion.div>
                  )}
                </AnimatePresence>
                {canManageActive && loan.status === "pending" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 flex gap-2"
                  >
                    <Button
                      size="sm"
                      variant="success"
                      leftIcon={<Check className="h-3.5 w-3.5" />}
                      onClick={() => approveMut.mutate(loan.id)}
                      isLoading={approveMut.isPending}
                      className="flex-1"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      leftIcon={<X className="h-3.5 w-3.5" />}
                      onClick={() => rejectMut.mutate(loan.id)}
                      isLoading={rejectMut.isPending}
                      className="flex-1"
                    >
                      Reject
                    </Button>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
        </>
      )}

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Apply for a loan"
        description="Fill in the details below to submit your loan application for review."
      >
        <LoanApplicationForm onSuccess={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
