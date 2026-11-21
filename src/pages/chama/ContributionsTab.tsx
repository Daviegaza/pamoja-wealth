import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useChamaContext } from "./ChamaWorkspace";
import {
  confirmContribution, createSchedule, disputeContribution, listContributions, listSchedules,
  recordContribution, updateSchedule, voidContribution,
  type ContributionDTO, type ContributionStatus, type ScheduleFrequency,
} from "@/api/contributions";
import { listMembers } from "@/api/chama";
import { listGoals } from "@/api/goals";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/api/http-types";
import {
  Empty, LoadError, Loading, Notice, PageHeader, SectionTitle, Table, Textarea, td, th,
} from "@/components/records/ui";
import { Modal } from "@/components/dialogs/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { NON_CUSTODIAL_STATEMENT } from "@/lib/copy";
import {
  formatDay, formatKes, isValidMpesaReceipt, normalizeMpesaReceipt, statusLabel, statusVariant, todayIso,
} from "@/lib/format";
import { isMoneyOfficer, isOfficer } from "@/lib/roles";
import { apiErrorMessage } from "@/lib/download";

const PAGE_SIZE = 25;

export default function ContributionsTab() {
  const { chama, role } = useChamaContext();
  const { user } = useAuth();
  const qc = useQueryClient();
  const canRecord = isMoneyOfficer(role);
  const [status, setStatus] = useState<ContributionStatus | "">("");
  const [page, setPage] = useState(1);
  const [recordOpen, setRecordOpen] = useState(false);
  const [reasonFor, setReasonFor] = useState<{ entry: ContributionDTO; kind: "dispute" | "void" } | null>(null);

  const list = useQuery({
    queryKey: ["contributions", chama.id, status, page],
    queryFn: () => listContributions(chama.id, { status: status || undefined, page, pageSize: PAGE_SIZE }),
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["contributions", chama.id] });
    void qc.invalidateQueries({ queryKey: ["contrib-summary", chama.id] });
    void qc.invalidateQueries({ queryKey: ["goals", chama.id] });
  };

  const confirm = useMutation({
    mutationFn: (id: string) => confirmContribution(chama.id, id),
    onSuccess: () => {
      toast.success("Thanks — entry confirmed");
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not confirm this entry.")),
  });

  const totalPages = list.data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Contributions"
        description={
          canRecord
            ? "Record each payment after you see it in the chama's own M-Pesa or bank statement. The member then confirms or disputes it."
            : "Payments the treasurer has recorded for you. Confirm the ones that are right, or dispute any that are wrong."
        }
        actions={canRecord && <Button onClick={() => setRecordOpen(true)}>Record contribution</Button>}
      />

      <Notice>{NON_CUSTODIAL_STATEMENT}</Notice>

      <SchedulesSection />

      <section>
        <SectionTitle
          actions={
            <div className="w-44">
              <Select
                aria-label="Filter by status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as ContributionStatus | "");
                  setPage(1);
                }}
                options={[
                  { value: "", label: "All statuses" },
                  { value: "recorded", label: "Awaiting confirmation" },
                  { value: "confirmed", label: "Confirmed" },
                  { value: "disputed", label: "Disputed" },
                  { value: "voided", label: "Voided" },
                ]}
              />
            </div>
          }
        >
          {isOfficer(role) ? "All recorded payments" : "Your recorded payments"}
        </SectionTitle>

        {list.isLoading ? (
          <Loading />
        ) : list.isError ? (
          <LoadError message={apiErrorMessage(list.error, "Could not load contributions.")} onRetry={() => list.refetch()} />
        ) : (list.data?.items.length ?? 0) === 0 ? (
          <Empty title="No contributions recorded yet">
            {canRecord ? "Use “Record contribution” after a member pays into the chama's account." : "Entries appear here once the treasurer records them."}
          </Empty>
        ) : (
          <>
            <Table caption="Recorded contributions">
              <thead>
                <tr>
                  <th className={th}>Date paid</th>
                  <th className={th}>Member</th>
                  <th className={th}>Amount</th>
                  <th className={th}>Method / proof</th>
                  <th className={th}>Status</th>
                  <th className={th}><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {list.data!.items.map((c) => {
                  const mine = c.memberId === user?.id;
                  return (
                    <tr key={c.id}>
                      <td className={td}>{formatDay(c.paidOn)}</td>
                      <td className={td}>
                        {c.memberName}
                        <p className="text-xs text-gray-400">Recorded by {c.recordedByName}</p>
                      </td>
                      <td className={`${td} tabular-nums font-medium`}>{formatKes(c.amount)}</td>
                      <td className={td}>
                        {PAYMENT_METHOD_LABELS[c.method]}
                        {c.mpesaReceipt && <p className="font-mono text-xs text-gray-500">{c.mpesaReceipt}</p>}
                        {c.note && <p className="text-xs text-gray-500">{c.note}</p>}
                      </td>
                      <td className={td}>
                        <Badge variant={statusVariant(c.status)}>{c.status === "recorded" ? "Awaiting confirmation" : statusLabel(c.status)}</Badge>
                        {c.disputeReason && <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">“{c.disputeReason}”</p>}
                        {c.voidReason && <p className="mt-1 text-xs text-gray-500">Voided: {c.voidReason}</p>}
                      </td>
                      <td className={`${td} text-right whitespace-nowrap`}>
                        {mine && c.status === "recorded" && (
                          <span className="inline-flex gap-1">
                            <Button size="sm" variant="outline" isLoading={confirm.isPending && confirm.variables === c.id} onClick={() => confirm.mutate(c.id)}>
                              Confirm
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setReasonFor({ entry: c, kind: "dispute" })}>
                              Dispute
                            </Button>
                          </span>
                        )}
                        {canRecord && c.status !== "voided" && (
                          <Button size="sm" variant="ghost" onClick={() => setReasonFor({ entry: c, kind: "void" })}>
                            Void
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>Page {page} of {totalPages}</span>
                <span className="flex gap-2">
                  <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                  <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
                </span>
              </div>
            )}
          </>
        )}
      </section>

      {canRecord && <RecordContributionModal isOpen={recordOpen} onClose={() => setRecordOpen(false)} onSaved={invalidate} />}
      {reasonFor && (
        <ReasonModal
          kind={reasonFor.kind}
          entry={reasonFor.entry}
          onClose={() => setReasonFor(null)}
          onDone={() => {
            setReasonFor(null);
            invalidate();
          }}
        />
      )}
    </div>
  );
}

function RecordContributionModal({ isOpen, onClose, onSaved }: { isOpen: boolean; onClose: () => void; onSaved: () => void }) {
  const { chama } = useChamaContext();
  const members = useQuery({ queryKey: ["members", chama.id], queryFn: () => listMembers(chama.id), enabled: isOpen });
  const schedules = useQuery({ queryKey: ["schedules", chama.id], queryFn: () => listSchedules(chama.id), enabled: isOpen });
  const goals = useQuery({ queryKey: ["goals", chama.id], queryFn: () => listGoals(chama.id), enabled: isOpen });
  const empty = { memberId: "", amount: "", paidOn: todayIso(), method: "mpesa" as PaymentMethod, mpesaReceipt: "", note: "", scheduleId: "", goalId: "" };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () =>
      recordContribution(chama.id, {
        memberId: form.memberId,
        amount: Number(form.amount),
        paidOn: form.paidOn,
        method: form.method,
        mpesaReceipt: form.mpesaReceipt ? normalizeMpesaReceipt(form.mpesaReceipt) : undefined,
        note: form.note.trim() || undefined,
        scheduleId: form.scheduleId || undefined,
        goalId: form.goalId || undefined,
      }),
    onSuccess: () => {
      toast.success("Contribution recorded. The member will be asked to confirm it.");
      setForm(empty);
      onSaved();
      onClose();
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not record this contribution.")),
  });

  const submit = () => {
    const e: Record<string, string> = {};
    if (!form.memberId) e.memberId = "Choose the member who paid.";
    const amt = Number(form.amount);
    if (!Number.isFinite(amt) || amt <= 0) e.amount = "Enter an amount greater than 0.";
    if (!form.paidOn) e.paidOn = "Enter the date the money reached the chama's account.";
    else if (form.paidOn > todayIso()) e.paidOn = "The payment date cannot be in the future.";
    if (form.mpesaReceipt && !isValidMpesaReceipt(form.mpesaReceipt)) e.mpesaReceipt = "M-Pesa codes are 10 letters/digits, e.g. SAB1C2D3E4.";
    setErrors(e);
    if (Object.keys(e).length === 0) mutation.mutate();
  };

  const activeMembers = (members.data ?? []).filter((m) => m.status === "active");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record contribution" description="Record a payment the member made into the chama's own account.">
      <form
        className="grid gap-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Select
          label="Member"
          value={form.memberId}
          error={errors.memberId}
          disabled={members.isLoading}
          onChange={(e) => setForm({ ...form, memberId: e.target.value })}
          options={[
            { value: "", label: members.isLoading ? "Loading members…" : "Choose member" },
            ...activeMembers.map((m) => ({ value: m.userId, label: m.fullName })),
          ]}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Amount (KES)" type="number" inputMode="decimal" min={1} value={form.amount} error={errors.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Input label="Date paid" type="date" max={todayIso()} value={form.paidOn} error={errors.paidOn} onChange={(e) => setForm({ ...form, paidOn: e.target.value })} />
        </div>
        <Select
          label="Method"
          value={form.method}
          onChange={(e) => setForm({ ...form, method: e.target.value as PaymentMethod })}
          options={(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((m) => ({ value: m, label: PAYMENT_METHOD_LABELS[m] }))}
        />
        {form.method === "mpesa" && (
          <Input
            label="M-Pesa receipt code (optional)"
            placeholder="e.g. SAB1C2D3E4"
            autoCapitalize="characters"
            value={form.mpesaReceipt}
            error={errors.mpesaReceipt}
            hint="Copy it from the chama's M-Pesa statement as proof."
            onChange={(e) => setForm({ ...form, mpesaReceipt: e.target.value })}
          />
        )}
        {(schedules.data?.length ?? 0) > 0 && (
          <Select
            label="Schedule (optional)"
            value={form.scheduleId}
            onChange={(e) => setForm({ ...form, scheduleId: e.target.value })}
            options={[{ value: "", label: "None" }, ...schedules.data!.filter((s) => s.isActive).map((s) => ({ value: s.id, label: s.name }))]}
          />
        )}
        {(goals.data?.length ?? 0) > 0 && (
          <Select
            label="Counts towards goal (optional)"
            value={form.goalId}
            onChange={(e) => setForm({ ...form, goalId: e.target.value })}
            options={[{ value: "", label: "None" }, ...goals.data!.map((g) => ({ value: g.id, label: g.name }))]}
          />
        )}
        <Textarea label="Note (optional)" rows={2} maxLength={500} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>Save record</Button>
        </div>
      </form>
    </Modal>
  );
}

function ReasonModal({
  kind,
  entry,
  onClose,
  onDone,
}: {
  kind: "dispute" | "void";
  entry: ContributionDTO;
  onClose: () => void;
  onDone: () => void;
}) {
  const { chama } = useChamaContext();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const mutation = useMutation({
    mutationFn: () =>
      kind === "dispute" ? disputeContribution(chama.id, entry.id, reason.trim()) : voidContribution(chama.id, entry.id, reason.trim()),
    onSuccess: () => {
      toast.success(kind === "dispute" ? "Dispute sent to the treasurer" : "Entry voided");
      onDone();
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={kind === "dispute" ? "Dispute this entry" : "Void this entry"}
      description={`${formatKes(entry.amount)} on ${formatDay(entry.paidOn)} for ${entry.memberName}.`}
    >
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (reason.trim().length < 3) {
            setError("Please give a short reason.");
            return;
          }
          mutation.mutate();
        }}
      >
        <Textarea
          label="Reason"
          rows={3}
          maxLength={500}
          value={reason}
          error={error}
          hint={kind === "void" ? "Voided entries stay in the audit log. Record a corrected entry afterwards if needed." : "e.g. wrong amount, wrong date, I did not make this payment."}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant={kind === "void" ? "danger" : "primary"} isLoading={mutation.isPending}>
            {kind === "dispute" ? "Send dispute" : "Void entry"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function SchedulesSection() {
  const { chama, role } = useChamaContext();
  const qc = useQueryClient();
  const canEdit = isMoneyOfficer(role);
  const schedules = useQuery({ queryKey: ["schedules", chama.id], queryFn: () => listSchedules(chama.id) });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", amount: "", frequency: "monthly" as ScheduleFrequency, startDate: todayIso(), dueDay: "" });

  const create = useMutation({
    mutationFn: () =>
      createSchedule(chama.id, {
        name: form.name.trim(),
        amount: Number(form.amount),
        frequency: form.frequency,
        startDate: form.startDate,
        dueDay: form.dueDay ? Number(form.dueDay) : null,
      }),
    onSuccess: () => {
      toast.success("Schedule added");
      setOpen(false);
      setForm({ name: "", amount: "", frequency: "monthly", startDate: todayIso(), dueDay: "" });
      void qc.invalidateQueries({ queryKey: ["schedules", chama.id] });
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not add schedule.")),
  });

  const toggle = useMutation({
    mutationFn: (s: { id: string; isActive: boolean }) => updateSchedule(chama.id, s.id, { isActive: !s.isActive }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["schedules", chama.id] }),
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const freqLabel: Record<ScheduleFrequency, string> = { weekly: "Weekly", monthly: "Monthly", one_off: "One-off" };

  return (
    <section>
      <SectionTitle actions={canEdit && <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Add schedule</Button>}>
        Contribution schedules
      </SectionTitle>
      {schedules.isLoading ? (
        <Loading />
      ) : schedules.isError ? (
        <LoadError message={apiErrorMessage(schedules.error, "Could not load schedules.")} onRetry={() => schedules.refetch()} />
      ) : (schedules.data?.length ?? 0) === 0 ? (
        <p className="text-sm text-gray-500">No schedules yet{canEdit ? " — add one so members know what is expected." : "."}</p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {schedules.data!.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {s.name} {!s.isActive && <Badge className="ml-1">Paused</Badge>}
                </p>
                <p className="text-gray-500">
                  {formatKes(s.amount)} · {freqLabel[s.frequency]}
                  {s.dueDay ? ` · due on day ${s.dueDay}` : ""} · from {formatDay(s.startDate)}
                </p>
              </div>
              {canEdit && (
                <Button size="sm" variant="ghost" isLoading={toggle.isPending && toggle.variables?.id === s.id} onClick={() => toggle.mutate(s)}>
                  {s.isActive ? "Pause" : "Resume"}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Add contribution schedule">
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (form.name.trim().length < 2 || !(Number(form.amount) > 0)) {
                toast.error("Enter a name and an amount greater than 0.");
                return;
              }
              const day = Number(form.dueDay);
              if (form.dueDay && (!Number.isInteger(day) || day < 1 || day > 31)) {
                toast.error("Due day must be between 1 and 31.");
                return;
              }
              create.mutate();
            }}
          >
            <Input label="Name" placeholder="e.g. Monthly savings" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Amount per member (KES)" type="number" min={1} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              <Select
                label="Frequency"
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value as ScheduleFrequency })}
                options={[
                  { value: "monthly", label: "Monthly" },
                  { value: "weekly", label: "Weekly" },
                  { value: "one_off", label: "One-off" },
                ]}
              />
              <Input label="Start date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              <Input label="Due day of month (optional)" type="number" min={1} max={31} value={form.dueDay} onChange={(e) => setForm({ ...form, dueDay: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={create.isPending}>Add schedule</Button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
