import { useMemo, useState } from "react";
import { Plus, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MeetingCard } from "@/components/cards/MeetingCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { MiniCalendar } from "@/components/common/MiniCalendar";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/dialogs/Modal";
import { useAuth } from "@/hooks/useAuth";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import { useChamaStore } from "@/stores/chamaStore";
import {
  createMeeting,
  listMeetings,
  rsvp as rsvpApi,
  type ListMeetingsParams,
  type MeetingDTO,
  type MeetingStatus,
} from "@/api/meetings";
import type { Meeting } from "@/types";

function toDomainMeeting(m: MeetingDTO): Meeting {
  return {
    id: m.id,
    chamaId: m.chamaId,
    title: m.title,
    description: m.description ?? "",
    date: m.date,
    time: m.time,
    location: m.location,
    isVirtual: m.isVirtual,
    status: m.status,
    agenda: m.agenda ?? [],
    attendeesCount: m.attendeesCount ?? 0,
    totalInvited: m.totalInvited ?? 0,
  };
}

function extractErrorMessage(err: unknown): string {
  const e = err as { response?: { data?: { error?: { message?: string }; message?: string } }; message?: string };
  return e?.response?.data?.error?.message ?? e?.response?.data?.message ?? e?.message ?? "Something went wrong.";
}

export default function MeetingsPage() {
  const activeChamaId = useChamaStore((s) => s.activeChamaId);
  const chamas = useChamaStore((s) => s.chamas);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", time: "", location: "" });

  const filters: ListMeetingsParams = useMemo(
    () => (activeChamaId ? { chamaId: activeChamaId } : {}),
    [activeChamaId]
  );

  const meetingsQuery = useQuery({
    queryKey: ["meetings", filters],
    queryFn: () => listMeetings(filters),
  });

  const rsvpMutation = useMutation({
    mutationFn: (vars: { id: string; status: "attending" | "declined" }) =>
      rsvpApi(vars.id, { status: vars.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err));
    },
  });

  const createMutation = useMutation({
    mutationFn: createMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      setForm({ title: "", date: "", time: "", location: "" });
      setModalOpen(false);
      toast.success("Meeting scheduled! Members will be notified.");
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err));
    },
  });

  const displayMeetings: Meeting[] = useMemo(
    () => (meetingsQuery.data?.items ?? []).map(toDomainMeeting),
    [meetingsQuery.data]
  );

  const activeChama = activeChamaId ? chamas.find((c) => c.id === activeChamaId) : null;
  const { value, setValue, results } = useFilter(displayMeetings, "status");
  const { page, totalPages, paginated, goToPage } = usePagination(results, 6);

  const handleSchedule = () => {
    if (!form.title || !form.date || !form.time) return;
    const chamaId = activeChamaId ?? chamas[0]?.id ?? "";
    if (!chamaId) {
      toast.error("Select a chama before scheduling a meeting.");
      return;
    }
    createMutation.mutate({
      chamaId,
      title: form.title,
      date: form.date,
      time: form.time,
      location: form.location || "TBD",
    });
  };

  const isLoading = meetingsQuery.isLoading;
  const isError = meetingsQuery.isError;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meetings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isLoading
              ? "Loading meetings..."
              : `${displayMeetings.length.toLocaleString()} meeting${displayMeetings.length !== 1 ? "s" : ""}${activeChama ? ` in ${activeChama.name}` : ""}`}
          </p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>Schedule Meeting</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="max-w-xs">
            <Select
              label="Filter by status"
              value={value === "all" ? "all" : value}
              onChange={(e) => setValue(e.target.value as MeetingStatus | "all")}
              options={[
                { label: "All statuses", value: "all" }, { label: "Scheduled", value: "scheduled" }, { label: "Ongoing", value: "ongoing" },
                { label: "Completed", value: "completed" }, { label: "Cancelled", value: "cancelled" },
              ]}
            />
          </div>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">Loading meetings...</div>
            ) : isError ? (
              <EmptyState
                icon={Calendar}
                title="Couldn't load meetings"
                description={extractErrorMessage(meetingsQuery.error)}
                actionLabel="Retry"
                onAction={() => meetingsQuery.refetch()}
              />
            ) : paginated.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No meetings scheduled yet"
                description="Schedule your first meeting."
                actionLabel="Schedule Meeting"
                onAction={() => setModalOpen(true)}
              />
            ) : (
              paginated.map((m) => (
                <MeetingCard
                  key={m.id}
                  meeting={m}
                  onRsvp={(status) => {
                    if (!user?.id) return;
                    rsvpMutation.mutate({ id: m.id, status });
                  }}
                  userRsvp={null}
                />
              ))
            )}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
        </div>
        <MiniCalendar
          highlightDates={displayMeetings.filter((m) => m.status === "scheduled").map((m) => m.date)}
        />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Meeting" description="Fill in the details to schedule a new meeting.">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Monthly contribution meeting" />
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Input label="Time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Online or venue address" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSchedule} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Scheduling..." : "Schedule Meeting"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
