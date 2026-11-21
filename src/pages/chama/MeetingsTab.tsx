import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useChamaContext } from "./ChamaWorkspace";
import { createMeeting, listMeetings, rsvp, saveMinutes, updateMeeting, type MeetingDTO, type RsvpStatus } from "@/api/meetings";
import { Empty, LoadError, Loading, PageHeader, Textarea } from "@/components/records/ui";
import { Modal } from "@/components/dialogs/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatDay, statusLabel, statusVariant, todayIso } from "@/lib/format";
import { isSecretarial } from "@/lib/roles";
import { apiErrorMessage } from "@/lib/download";

export default function MeetingsTab() {
  const { chama, role } = useChamaContext();
  const canManage = isSecretarial(role);
  const meetings = useQuery({ queryKey: ["meetings", chama.id], queryFn: () => listMeetings(chama.id) });
  const [createOpen, setCreateOpen] = useState(false);
  const [minutesFor, setMinutesFor] = useState<MeetingDTO | null>(null);
  const qc = useQueryClient();

  const reply = useMutation({
    mutationFn: (v: { id: string; status: RsvpStatus }) => rsvp(chama.id, v.id, v.status),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["meetings", chama.id] }),
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const markDone = useMutation({
    mutationFn: (id: string) => updateMeeting(chama.id, id, { status: "completed" }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["meetings", chama.id] }),
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const sorted = [...(meetings.data ?? [])].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meetings & minutes"
        description="Schedule meetings, collect RSVPs and keep the minutes in one place."
        actions={canManage && <Button onClick={() => setCreateOpen(true)}>Schedule meeting</Button>}
      />

      {meetings.isLoading ? (
        <Loading />
      ) : meetings.isError ? (
        <LoadError message={apiErrorMessage(meetings.error, "Could not load meetings.")} onRetry={() => meetings.refetch()} />
      ) : sorted.length === 0 ? (
        <Empty title="No meetings yet" />
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {sorted.map((m) => (
            <li key={m.id} className="py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {m.title} <Badge variant={statusVariant(m.status)} className="ml-1">{statusLabel(m.status)}</Badge>
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDay(m.date)} at {m.time} · {m.isVirtual ? "Online" : m.location}
                  </p>
                  {m.agenda.length > 0 && (
                    <ol className="mt-2 list-decimal pl-5 text-sm text-gray-700 dark:text-gray-300">
                      {m.agenda.map((a, i) => <li key={i}>{a}</li>)}
                    </ol>
                  )}
                  {m.minutes && (
                    <details className="mt-2 text-sm">
                      <summary className="cursor-pointer font-medium text-brand-700 dark:text-brand-400">Minutes</summary>
                      <p className="mt-2 whitespace-pre-line text-gray-700 dark:text-gray-300">{m.minutes}</p>
                    </details>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {m.status === "scheduled" &&
                    (["attending", "tentative", "declined"] as RsvpStatus[]).map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={m.myRsvp === s ? "primary" : "outline"}
                        aria-pressed={m.myRsvp === s}
                        disabled={reply.isPending}
                        onClick={() => reply.mutate({ id: m.id, status: s })}
                      >
                        {s === "attending" ? "Attending" : s === "tentative" ? "Maybe" : "Can't make it"}
                      </Button>
                    ))}
                  {canManage && (
                    <Button size="sm" variant="ghost" onClick={() => setMinutesFor(m)}>
                      {m.minutes ? "Edit minutes" : "Add minutes"}
                    </Button>
                  )}
                  {canManage && m.status === "scheduled" && (
                    <Button size="sm" variant="ghost" isLoading={markDone.isPending && markDone.variables === m.id} onClick={() => markDone.mutate(m.id)}>
                      Mark held
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {canManage && <CreateMeetingModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />}
      {minutesFor && <MinutesModal meeting={minutesFor} onClose={() => setMinutesFor(null)} />}
    </div>
  );
}

function CreateMeetingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { chama } = useChamaContext();
  const qc = useQueryClient();
  const empty = { title: "", date: todayIso(), time: "14:00", location: "", isVirtual: false, agenda: "" };
  const [form, setForm] = useState(empty);
  const mutation = useMutation({
    mutationFn: () =>
      createMeeting(chama.id, {
        title: form.title.trim(),
        date: form.date,
        time: form.time,
        location: form.isVirtual ? "Online" : form.location.trim(),
        isVirtual: form.isVirtual,
        agenda: form.agenda.split("\n").map((s) => s.trim()).filter(Boolean),
      }),
    onSuccess: () => {
      toast.success("Meeting scheduled");
      setForm(empty);
      void qc.invalidateQueries({ queryKey: ["meetings", chama.id] });
      onClose();
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not schedule meeting.")),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule meeting">
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (form.title.trim().length < 3 || (!form.isVirtual && form.location.trim().length < 2)) {
            toast.error("Add a title and a location.");
            return;
          }
          mutation.mutate();
        }}
      >
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Input label="Time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input type="checkbox" checked={form.isVirtual} onChange={(e) => setForm({ ...form, isVirtual: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
          Online meeting
        </label>
        {!form.isVirtual && <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />}
        <Textarea label="Agenda (one item per line)" rows={4} value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>Schedule</Button>
        </div>
      </form>
    </Modal>
  );
}

function MinutesModal({ meeting, onClose }: { meeting: MeetingDTO; onClose: () => void }) {
  const { chama } = useChamaContext();
  const qc = useQueryClient();
  const [text, setText] = useState(meeting.minutes ?? "");
  const mutation = useMutation({
    mutationFn: () => saveMinutes(chama.id, meeting.id, text.trim()),
    onSuccess: () => {
      toast.success("Minutes saved");
      void qc.invalidateQueries({ queryKey: ["meetings", chama.id] });
      onClose();
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Could not save minutes.")),
  });
  return (
    <Modal isOpen onClose={onClose} title={`Minutes — ${meeting.title}`} size="lg">
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) {
            toast.error("Minutes cannot be empty.");
            return;
          }
          mutation.mutate();
        }}
      >
        <Textarea label="Minutes" rows={12} maxLength={20000} value={text} onChange={(e) => setText(e.target.value)} hint="Every edit is kept in the audit log." />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>Save minutes</Button>
        </div>
      </form>
    </Modal>
  );
}
