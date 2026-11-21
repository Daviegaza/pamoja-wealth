import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useChamaContext } from "./ChamaWorkspace";
import { getContributionSummary } from "@/api/contributions";
import { listMeetings } from "@/api/meetings";
import { updateChama, type ChamaCategory } from "@/api/chama";
import { Notice, SectionTitle, Stat, Textarea } from "@/components/records/ui";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { NON_CUSTODIAL_STATEMENT } from "@/lib/copy";
import { formatDay, formatKes } from "@/lib/format";
import { isChair } from "@/lib/roles";
import { apiErrorMessage } from "@/lib/download";

export default function OverviewTab() {
  const { chama, role } = useChamaContext();
  const summary = useQuery({ queryKey: ["contrib-summary", chama.id], queryFn: () => getContributionSummary(chama.id) });
  const meetings = useQuery({ queryKey: ["meetings", chama.id], queryFn: () => listMeetings(chama.id) });
  const [editing, setEditing] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const nextMeeting = (meetings.data ?? [])
    .filter((m) => m.status === "scheduled" && m.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  return (
    <div className="space-y-8">
      <Notice>{NON_CUSTODIAL_STATEMENT}</Notice>

      <section>
        <SectionTitle>Where members pay</SectionTitle>
        {chama.paymentInstructions ? (
          <p className="whitespace-pre-line text-sm text-gray-800 dark:text-gray-200">{chama.paymentInstructions}</p>
        ) : (
          <p className="text-sm text-gray-500">
            No payment details yet.{" "}
            {isChair(role) ? "Add your chama's own Paybill/Till or bank details below." : "Ask your chairperson to add them."}
          </p>
        )}
      </section>

      <section>
        <SectionTitle>At a glance</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <Stat label="Members" value={chama.memberCount} />
          <Stat
            label="Confirmed contributions"
            value={summary.isLoading ? "…" : formatKes(summary.data?.totalConfirmed)}
            hint={role === "member" ? "Your own" : "Whole chama"}
          />
          <Stat label="Awaiting confirmation" value={summary.isLoading ? "…" : formatKes(summary.data?.totalRecorded)} />
          <Stat label="Disputed" value={summary.isLoading ? "…" : formatKes(summary.data?.totalDisputed)} />
        </div>
        {summary.isError && <p className="mt-3 text-sm text-red-600">{apiErrorMessage(summary.error, "Could not load totals.")}</p>}
      </section>

      <section>
        <SectionTitle actions={<Link to={`/chamas/${chama.id}/meetings`} className="text-sm font-medium text-brand-600 hover:underline">All meetings</Link>}>
          Next meeting
        </SectionTitle>
        {nextMeeting ? (
          <p className="text-sm text-gray-800 dark:text-gray-200">
            <span className="font-semibold">{nextMeeting.title}</span> — {formatDay(nextMeeting.date)} at {nextMeeting.time},{" "}
            {nextMeeting.location}
          </p>
        ) : (
          <p className="text-sm text-gray-500">{meetings.isLoading ? "Loading…" : "No upcoming meeting scheduled."}</p>
        )}
      </section>

      {isChair(role) && (
        <section>
          <SectionTitle
            actions={
              !editing && (
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                  Edit details
                </Button>
              )
            }
          >
            Chama details
          </SectionTitle>
          {editing ? <EditChamaForm onDone={() => setEditing(false)} /> : (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div><dt className="text-gray-500">Category</dt><dd className="capitalize">{chama.category}</dd></div>
              <div><dt className="text-gray-500">Location</dt><dd>{chama.location ?? "—"}</dd></div>
              <div><dt className="text-gray-500">Expected monthly contribution</dt><dd>{formatKes(chama.monthlyContribution)}</dd></div>
              <div><dt className="text-gray-500">Plan</dt><dd className="capitalize">{chama.currentPlanCode}</dd></div>
            </dl>
          )}
        </section>
      )}
    </div>
  );
}

function EditChamaForm({ onDone }: { onDone: () => void }) {
  const { chama } = useChamaContext();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: chama.name,
    description: chama.description ?? "",
    category: chama.category,
    location: chama.location ?? "",
    monthlyContribution: String(chama.monthlyContribution ?? 0),
    paymentInstructions: chama.paymentInstructions ?? "",
  });
  const mutation = useMutation({
    mutationFn: () =>
      updateChama(chama.id, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        // Legacy chamas may carry the retired "investment" label; the API only
        // accepts savings/welfare/mixed, so leave it unchanged in that case.
        ...(form.category !== "investment" && { category: form.category }),
        location: form.location.trim() || undefined,
        monthlyContribution: Number(form.monthlyContribution) || 0,
        paymentInstructions: form.paymentInstructions.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Chama details saved");
      void qc.invalidateQueries({ queryKey: ["chama", chama.id] });
      void qc.invalidateQueries({ queryKey: ["chamas", "mine"] });
      onDone();
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not save details.")),
  });

  return (
    <form
      className="grid gap-4 max-w-xl"
      onSubmit={(e) => {
        e.preventDefault();
        if (form.name.trim().length < 3) {
          toast.error("Name must be at least 3 characters.");
          return;
        }
        mutation.mutate();
      }}
    >
      <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <Textarea label="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <Select
        label="Category"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value as ChamaCategory })}
        options={[
          { value: "savings", label: "Savings" },
          { value: "welfare", label: "Welfare" },
          { value: "mixed", label: "Mixed" },
        ]}
      />
      <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
      <Input
        label="Expected monthly contribution (KES)"
        type="number"
        min={0}
        value={form.monthlyContribution}
        onChange={(e) => setForm({ ...form, monthlyContribution: e.target.value })}
      />
      <Textarea
        label="Where members pay"
        rows={3}
        placeholder="e.g. M-Pesa Paybill 123456, Account: JIRANI. Or: Equity Bank, A/C 0123456789, Jirani Women Group."
        hint="Your chama's own Paybill/Till or bank account. Pamoja never receives this money."
        value={form.paymentInstructions}
        onChange={(e) => setForm({ ...form, paymentInstructions: e.target.value })}
      />
      <div className="flex gap-2">
        <Button type="submit" isLoading={mutation.isPending}>Save</Button>
        <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  );
}
