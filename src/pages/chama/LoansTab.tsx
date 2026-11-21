import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useChamaContext } from "./ChamaWorkspace";
import { getLoan, listLoans, recordLoan, recordRepayment, setLoanStatus, type LoanDTO } from "@/api/loans";
import { listMembers } from "@/api/chama";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/api/http-types";
import { Empty, LoadError, Loading, Notice, PageHeader, Table, Textarea, td, th } from "@/components/records/ui";
import { Modal } from "@/components/dialogs/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { LOAN_REGISTER_STATEMENT } from "@/lib/copy";
import {
  formatDay, formatKes, isValidMpesaReceipt, normalizeMpesaReceipt, statusLabel, statusVariant, todayIso,
} from "@/lib/format";
import { isChair, isMoneyOfficer, isOfficer } from "@/lib/roles";
import { apiErrorMessage } from "@/lib/download";

export default function LoansTab() {
  const { chama, role } = useChamaContext();
  const canRecord = isMoneyOfficer(role);
  const loans = useQuery({ queryKey: ["loans", chama.id], queryFn: () => listLoans(chama.id) });
  const [recordOpen, setRecordOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Loan register"
        description={isOfficer(role) ? "All loans your chama has recorded." : "Loans recorded in your name."}
        actions={canRecord && <Button onClick={() => setRecordOpen(true)}>Record loan</Button>}
      />
      <Notice>{LOAN_REGISTER_STATEMENT}</Notice>

      {loans.isLoading ? (
        <Loading />
      ) : loans.isError ? (
        <LoadError message={apiErrorMessage(loans.error, "Could not load the loan register.")} onRetry={() => loans.refetch()} />
      ) : (loans.data?.length ?? 0) === 0 ? (
        <Empty title="No loans recorded">{canRecord ? "Record a loan after the chama has paid it out from its own account." : undefined}</Empty>
      ) : (
        <Table caption="Loan register">
          <thead>
            <tr>
              <th className={th}>Borrower</th>
              <th className={th}>Issued</th>
              <th className={th}>Due</th>
              <th className={th}>Principal</th>
              <th className={th}>Repaid</th>
              <th className={th}>Balance</th>
              <th className={th}>Status</th>
              <th className={th}><span className="sr-only">Open</span></th>
            </tr>
          </thead>
          <tbody>
            {loans.data!.map((l) => (
              <tr key={l.id}>
                <td className={td}>
                  {l.borrowerName}
                  <p className="text-xs text-gray-500">{l.purpose}</p>
                </td>
                <td className={td}>{formatDay(l.issuedOn)}</td>
                <td className={td}>{formatDay(l.dueDate)}</td>
                <td className={`${td} tabular-nums`}>{formatKes(l.principal)}</td>
                <td className={`${td} tabular-nums`}>{formatKes(l.amountRepaid)}</td>
                <td className={`${td} tabular-nums font-medium`}>{formatKes(l.balance)}</td>
                <td className={td}><Badge variant={statusVariant(l.status)}>{statusLabel(l.status)}</Badge></td>
                <td className={`${td} text-right`}>
                  <Button size="sm" variant="ghost" onClick={() => setSelected(l.id)}>Details</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {canRecord && <RecordLoanModal isOpen={recordOpen} onClose={() => setRecordOpen(false)} />}
      {selected && <LoanDetailModal loanId={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function RecordLoanModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { chama } = useChamaContext();
  const qc = useQueryClient();
  const members = useQuery({ queryKey: ["members", chama.id], queryFn: () => listMembers(chama.id), enabled: isOpen });
  const empty = { borrowerId: "", principal: "", agreedRepayable: "", issuedOn: todayIso(), dueDate: "", purpose: "", notes: "" };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () =>
      recordLoan(chama.id, {
        borrowerId: form.borrowerId,
        principal: Number(form.principal),
        agreedRepayable: form.agreedRepayable ? Number(form.agreedRepayable) : undefined,
        issuedOn: form.issuedOn,
        dueDate: form.dueDate,
        purpose: form.purpose.trim(),
        notes: form.notes.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Loan recorded");
      setForm(empty);
      void qc.invalidateQueries({ queryKey: ["loans", chama.id] });
      onClose();
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not record this loan.")),
  });

  const submit = () => {
    const e: Record<string, string> = {};
    if (!form.borrowerId) e.borrowerId = "Choose the borrower.";
    const p = Number(form.principal);
    if (!(p > 0)) e.principal = "Enter the amount the chama lent.";
    if (form.agreedRepayable && Number(form.agreedRepayable) < p) e.agreedRepayable = "Cannot be less than the principal.";
    if (!form.issuedOn) e.issuedOn = "Required.";
    if (!form.dueDate) e.dueDate = "Required.";
    else if (form.dueDate < form.issuedOn) e.dueDate = "Due date must be after the issue date.";
    if (form.purpose.trim().length < 3) e.purpose = "Add a short purpose.";
    setErrors(e);
    if (Object.keys(e).length === 0) mutation.mutate();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record loan" description="Record a loan the chama already paid out from its own account.">
      <form className="grid gap-4" noValidate onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <Select
          label="Borrower"
          value={form.borrowerId}
          error={errors.borrowerId}
          onChange={(e) => setForm({ ...form, borrowerId: e.target.value })}
          options={[
            { value: "", label: members.isLoading ? "Loading members…" : "Choose member" },
            ...(members.data ?? []).filter((m) => m.status === "active").map((m) => ({ value: m.userId, label: m.fullName })),
          ]}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Principal (KES)" type="number" min={1} value={form.principal} error={errors.principal} onChange={(e) => setForm({ ...form, principal: e.target.value })} />
          <Input
            label="Total to repay (optional)"
            type="number"
            min={1}
            value={form.agreedRepayable}
            error={errors.agreedRepayable}
            hint="As agreed under your chama's own rules."
            onChange={(e) => setForm({ ...form, agreedRepayable: e.target.value })}
          />
          <Input label="Issued on" type="date" max={todayIso()} value={form.issuedOn} error={errors.issuedOn} onChange={(e) => setForm({ ...form, issuedOn: e.target.value })} />
          <Input label="Due date" type="date" value={form.dueDate} error={errors.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </div>
        <Input label="Purpose" value={form.purpose} error={errors.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
        <Textarea label="Notes (optional)" rows={2} maxLength={500} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>Save loan</Button>
        </div>
      </form>
    </Modal>
  );
}

function LoanDetailModal({ loanId, onClose }: { loanId: string; onClose: () => void }) {
  const { chama, role } = useChamaContext();
  const qc = useQueryClient();
  const loan = useQuery({ queryKey: ["loan", chama.id, loanId], queryFn: () => getLoan(chama.id, loanId) });
  const [form, setForm] = useState({ amount: "", paidOn: todayIso(), method: "mpesa" as PaymentMethod, mpesaReceipt: "", note: "" });
  const [error, setError] = useState("");

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["loan", chama.id, loanId] });
    void qc.invalidateQueries({ queryKey: ["loans", chama.id] });
  };

  const repay = useMutation({
    mutationFn: () =>
      recordRepayment(chama.id, loanId, {
        amount: Number(form.amount),
        paidOn: form.paidOn,
        method: form.method,
        mpesaReceipt: form.mpesaReceipt ? normalizeMpesaReceipt(form.mpesaReceipt) : undefined,
        note: form.note.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Repayment recorded");
      setForm({ amount: "", paidOn: todayIso(), method: "mpesa", mpesaReceipt: "", note: "" });
      refresh();
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not record repayment.")),
  });

  const status = useMutation({
    mutationFn: (s: "active" | "defaulted") => setLoanStatus(chama.id, loanId, s),
    onSuccess: () => {
      toast.success("Loan status updated");
      refresh();
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const l: LoanDTO | undefined = loan.data;

  return (
    <Modal isOpen onClose={onClose} title="Loan details" size="lg">
      {loan.isLoading ? (
        <Loading />
      ) : loan.isError || !loan.data ? (
        <LoadError message={apiErrorMessage(loan.error, "Could not load this loan.")} onRetry={() => loan.refetch()} />
      ) : (
        <div className="space-y-6">
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div><dt className="text-gray-500">Borrower</dt><dd className="font-medium">{l!.borrowerName}</dd></div>
            <div><dt className="text-gray-500">Principal</dt><dd>{formatKes(l!.principal)}</dd></div>
            <div><dt className="text-gray-500">Agreed total</dt><dd>{l!.agreedRepayable != null ? formatKes(l!.agreedRepayable) : "—"}</dd></div>
            <div><dt className="text-gray-500">Repaid</dt><dd>{formatKes(l!.amountRepaid)}</dd></div>
            <div><dt className="text-gray-500">Balance</dt><dd className="font-semibold">{formatKes(l!.balance)}</dd></div>
            <div><dt className="text-gray-500">Status</dt><dd><Badge variant={statusVariant(l!.status)}>{statusLabel(l!.status)}</Badge></dd></div>
            <div><dt className="text-gray-500">Issued</dt><dd>{formatDay(l!.issuedOn)}</dd></div>
            <div><dt className="text-gray-500">Due</dt><dd>{formatDay(l!.dueDate)}</dd></div>
            <div className="col-span-2 sm:col-span-1"><dt className="text-gray-500">Purpose</dt><dd>{l!.purpose}</dd></div>
          </dl>
          {l!.notes && <p className="text-sm text-gray-600 dark:text-gray-300">{l!.notes}</p>}

          <div>
            <h3 className="text-sm font-semibold mb-2">Repayments</h3>
            {loan.data.repayments.length === 0 ? (
              <p className="text-sm text-gray-500">No repayments recorded yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-white/[0.05] text-sm">
                {loan.data.repayments.map((r) => (
                  <li key={r.id} className="flex justify-between gap-3 py-2">
                    <span>
                      {formatDay(r.paidOn)} · {PAYMENT_METHOD_LABELS[r.method]}
                      {r.mpesaReceipt && <span className="ml-1 font-mono text-xs text-gray-500">{r.mpesaReceipt}</span>}
                      <span className="block text-xs text-gray-400">Recorded by {r.recordedByName}</span>
                    </span>
                    <span className="tabular-nums font-medium">{formatKes(r.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {isMoneyOfficer(role) && l!.status !== "completed" && (
            <form
              className="grid gap-3 border-t border-gray-100 dark:border-white/[0.06] pt-4"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                if (!(Number(form.amount) > 0)) return setError("Enter an amount greater than 0.");
                if (form.paidOn > todayIso()) return setError("The payment date cannot be in the future.");
                if (form.mpesaReceipt && !isValidMpesaReceipt(form.mpesaReceipt)) return setError("M-Pesa codes are 10 letters/digits.");
                setError("");
                repay.mutate();
              }}
            >
              <h3 className="text-sm font-semibold">Record a repayment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input label="Amount (KES)" type="number" min={1} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                <Input label="Date paid" type="date" max={todayIso()} value={form.paidOn} onChange={(e) => setForm({ ...form, paidOn: e.target.value })} />
                <Select
                  label="Method"
                  value={form.method}
                  onChange={(e) => setForm({ ...form, method: e.target.value as PaymentMethod })}
                  options={(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((m) => ({ value: m, label: PAYMENT_METHOD_LABELS[m] }))}
                />
              </div>
              {form.method === "mpesa" && (
                <Input label="M-Pesa receipt code (optional)" value={form.mpesaReceipt} onChange={(e) => setForm({ ...form, mpesaReceipt: e.target.value })} />
              )}
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              <div><Button type="submit" isLoading={repay.isPending}>Save repayment</Button></div>
            </form>
          )}

          {isChair(role) && l!.status !== "completed" && (
            <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 dark:border-white/[0.06] pt-4 text-sm">
              <span className="text-gray-500">Chairperson:</span>
              {l!.status === "active" ? (
                <Button size="sm" variant="outline" isLoading={status.isPending} onClick={() => status.mutate("defaulted")}>Mark as defaulted</Button>
              ) : (
                <Button size="sm" variant="outline" isLoading={status.isPending} onClick={() => status.mutate("active")}>Mark as active again</Button>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
