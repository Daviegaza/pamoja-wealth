import { useState } from "react";
import { Plus } from "lucide-react";
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
import { CreditCard } from "lucide-react";

export default function LoansPage() {
  const { loans } = useLoans();
  const [open, setOpen] = useState(false);
  const { value, setValue, results } = useFilter(loans, "status");
  const { page, totalPages, paginated, goToPage } = usePagination(results, 9);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loans</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{loans.length.toLocaleString()} loan records across the platform</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>Apply for Loan</Button>
      </div>

      <div className="max-w-xs">
        <Select
          label="Filter by status"
          value={value === "all" ? "all" : value}
          onChange={(e) => setValue(e.target.value as typeof value)}
          options={[
            { label: "All statuses", value: "all" }, { label: "Pending", value: "pending" }, { label: "Approved", value: "approved" },
            { label: "Active", value: "active" }, { label: "Completed", value: "completed" }, { label: "Defaulted", value: "defaulted" }, { label: "Rejected", value: "rejected" },
          ]}
        />
      </div>

      {paginated.length === 0 ? (
        <EmptyState icon={CreditCard} title="No loans found" description="No loans match this filter yet." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginated.map((loan) => <LoanCard key={loan.id} loan={loan} />)}
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
