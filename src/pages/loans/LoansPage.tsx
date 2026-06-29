import { useState, useMemo } from "react";
import { Plus, Check, X } from "lucide-react";
import { toast } from "sonner";
import { LoanCard } from "@/components/cards/LoanCard";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/dialogs/Modal";
import { LoanApplicationForm } from "@/components/forms/LoanApplicationForm";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { useLoans } from "@/hooks/useLoans";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import { useAuth } from "@/hooks/useAuth";
import { useChamaStore } from "@/stores/chamaStore";
import { useLoanStore } from "@/stores/loanStore";
import { CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const MANAGEMENT_ROLES = ["owner", "admin", "chairperson"];

export default function LoansPage() {
  const { loans } = useLoans();
  const { user } = useAuth();
  const activeChamaId = useChamaStore((s) => s.activeChamaId);
  const chamas = useChamaStore((s) => s.chamas);
  const storeMembers = useChamaStore((s) => s.members);
  const { approveLoan, rejectLoan } = useLoanStore();

  const [open, setOpen] = useState(false);

  // Find which chamas the user belongs to
  const myMemberRecords = storeMembers.filter((m) => m.userId === user?.id);
  const myChamaIds = new Set(myMemberRecords.map((m) => m.chamaId));

  // Check if user can manage the active chama
  const activeMembership = myMemberRecords.find((m) => m.chamaId === activeChamaId);
  const canManageActive = activeMembership ? MANAGEMENT_ROLES.includes(activeMembership.role) : false;

  // Scope loans: only user's chamas. If active chama selected, scope further.
  const scopedLoans = useMemo(() => {
    let filtered = loans.filter((l) => myChamaIds.has(l.chamaId));
    if (activeChamaId) {
      filtered = filtered.filter((l) => l.chamaId === activeChamaId);
    }
    return filtered;
  }, [loans, myChamaIds, activeChamaId]);

  const activeChama = activeChamaId ? chamas.find((c) => c.id === activeChamaId) : null;

  const { value, setValue, results } = useFilter(scopedLoans, "status");
  const { page, totalPages, paginated, goToPage } = usePagination(results, 9);

  const handleApprove = (loanId: string) => {
    approveLoan(loanId);
    toast.success("Loan approved.");
  };

  const handleReject = (loanId: string) => {
    rejectLoan(loanId);
    toast.success("Loan rejected.");
  };

  // No chamas at all
  if (myChamaIds.size === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loans</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Apply for loans and manage repayments</p>
        </div>
        <EmptyState
          icon={CreditCard}
          title="No chamas yet"
          description="Join or create a chama to apply for loans."
          actionLabel="View Chamas"
          onAction={() => window.location.href = "/chamas"}
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
            {scopedLoans.length} loan{scopedLoans.length !== 1 ? "s" : ""}
            {activeChama ? ` in ${activeChama.name}` : ` across your ${myChamaIds.size} chama${myChamaIds.size !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>Apply for Loan</Button>
      </div>

      <div className="max-w-xs">
        <Select
          label="Filter by status"
          value={value === "all" ? "all" : value}
          onChange={(e) => setValue(e.target.value as typeof value)}
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

      {paginated.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title={scopedLoans.length === 0 ? "No loans yet" : "No loans match this filter"}
          description={scopedLoans.length === 0 ? "Apply for your first loan." : "Try a different status filter."}
          actionLabel={scopedLoans.length === 0 ? "Apply for Loan" : undefined}
          onAction={scopedLoans.length === 0 ? () => setOpen(true) : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginated.map((loan) => (
              <div key={loan.id} className="relative">
                <LoanCard loan={loan} />
                {/* Approve/Reject for pending loans when user can manage */}
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
                      onClick={() => handleApprove(loan.id)}
                      className="flex-1"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      leftIcon={<X className="h-3.5 w-3.5" />}
                      onClick={() => handleReject(loan.id)}
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

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Apply for a loan" description="Fill in the details below to submit your loan application for review.">
        <LoanApplicationForm onSuccess={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
