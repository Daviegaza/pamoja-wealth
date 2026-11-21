import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useChamaContext } from "./ChamaWorkspace";
import { createGoal, deleteGoal, listGoals } from "@/api/goals";
import { Empty, LoadError, Loading, PageHeader } from "@/components/records/ui";
import { Modal } from "@/components/dialogs/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatDay, formatKes, todayIso } from "@/lib/format";
import { isMoneyOfficer } from "@/lib/roles";
import { apiErrorMessage } from "@/lib/download";

export default function GoalsTab() {
  const { chama, role } = useChamaContext();
  const canEdit = isMoneyOfficer(role);
  const qc = useQueryClient();
  const goals = useQuery({ queryKey: ["goals", chama.id], queryFn: () => listGoals(chama.id) });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", targetAmount: "", targetDate: "" });

  const create = useMutation({
    mutationFn: () => createGoal(chama.id, { name: form.name.trim(), targetAmount: Number(form.targetAmount), targetDate: form.targetDate }),
    onSuccess: () => {
      toast.success("Goal added");
      setForm({ name: "", targetAmount: "", targetDate: "" });
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["goals", chama.id] });
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not add goal.")),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteGoal(chama.id, id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["goals", chama.id] }),
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals"
        description="Progress counts recorded contributions that the treasurer linked to each goal (voided entries excluded)."
        actions={canEdit && <Button onClick={() => setOpen(true)}>Add goal</Button>}
      />
      {goals.isLoading ? (
        <Loading />
      ) : goals.isError ? (
        <LoadError message={apiErrorMessage(goals.error, "Could not load goals.")} onRetry={() => goals.refetch()} />
      ) : (goals.data?.length ?? 0) === 0 ? (
        <Empty title="No goals yet">{canEdit ? "Add a goal such as “School fees fund” or “Year-end target”." : undefined}</Empty>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {goals.data!.map((g) => {
            const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
            return (
              <li key={g.id} className="py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-gray-900 dark:text-white">{g.name}</p>
                  <p className="text-sm text-gray-500 tabular-nums">
                    {formatKes(g.currentAmount)} of {formatKes(g.targetAmount)} · by {formatDay(g.targetDate)}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1"><ProgressBar value={pct} /></div>
                  <span className="text-xs font-medium tabular-nums text-gray-500 w-10 text-right">{pct}%</span>
                  {canEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      isLoading={remove.isPending && remove.variables === g.id}
                      onClick={() => {
                        if (window.confirm(`Delete the goal “${g.name}”? Contributions stay recorded.`)) remove.mutate(g.id);
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {canEdit && (
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Add goal">
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (form.name.trim().length < 2 || !(Number(form.targetAmount) > 0) || !form.targetDate) {
                toast.error("Enter a name, a target amount and a date.");
                return;
              }
              create.mutate();
            }}
          >
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Target (KES)" type="number" min={1} value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} />
            <Input label="Target date" type="date" min={todayIso()} value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={create.isPending}>Add goal</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
