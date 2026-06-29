import { useState, useMemo } from "react";
import { Plus, Calendar } from "lucide-react";
import { toast } from "sonner";
import { MeetingCard } from "@/components/cards/MeetingCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { MiniCalendar } from "@/components/common/MiniCalendar";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/dialogs/Modal";
import { useAuth } from "@/hooks/useAuth";
import { useMeetings } from "@/hooks/useMeetings";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import { useChamaStore } from "@/stores/chamaStore";
import { useMeetingStore } from "@/stores/meetingStore";

export default function MeetingsPage() {
  const meetings = useMeetings();
  const activeChamaId = useChamaStore((s) => s.activeChamaId);
  const chamas = useChamaStore((s) => s.chamas);
  const members = useChamaStore((s) => s.members);
  const { user } = useAuth();
  const addMeeting = useMeetingStore((s) => s.addMeeting);
  const rsvp = useMeetingStore((s) => s.rsvp);
  const rsvps = useMeetingStore((s) => s.rsvps);

  const myMemberRecords = members.filter((m) => m.userId === user?.id);
  const myChamaIds = new Set(myMemberRecords.map((m) => m.chamaId));

  const displayMeetings = useMemo(() => {
    let filtered = meetings.filter((m) => myChamaIds.has(m.chamaId));
    if (activeChamaId) filtered = filtered.filter((m) => m.chamaId === activeChamaId);
    return filtered;
  }, [meetings, myChamaIds, activeChamaId]);

  const activeChama = activeChamaId ? chamas.find((c) => c.id === activeChamaId) : null;
  const { value, setValue, results } = useFilter(displayMeetings, "status");
  const { page, totalPages, paginated, goToPage } = usePagination(results, 6);

  if (myChamaIds.size === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meetings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Schedule and manage chama meetings.</p>
        </div>
        <EmptyState
          icon={Calendar}
          title="No chamas yet"
          description="Join or create a chama to see meetings."
          actionLabel="View Chamas"
          onAction={() => window.location.href = "/chamas"}
        />
      </div>
    );
  }

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", time: "", location: "" });

  const handleSchedule = () => {
    if (!form.title || !form.date || !form.time) return;
    const chamaId = activeChamaId ?? chamas[0]?.id ?? "";
    addMeeting({ chamaId, ...form });
    setForm({ title: "", date: "", time: "", location: "" });
    setModalOpen(false);
    toast.success("Meeting scheduled! Members will be notified.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meetings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{displayMeetings.length.toLocaleString()} meeting{displayMeetings.length !== 1 ? "s" : ""}{activeChama ? ` in ${activeChama.name}` : ` across your ${myChamaIds.size} chama${myChamaIds.size !== 1 ? "s" : ""}`}</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>Schedule Meeting</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="max-w-xs">
            <Select
              label="Filter by status"
              value={value === "all" ? "all" : value}
              onChange={(e) => setValue(e.target.value as typeof value)}
              options={[
                { label: "All statuses", value: "all" }, { label: "Scheduled", value: "scheduled" }, { label: "Ongoing", value: "ongoing" },
                { label: "Completed", value: "completed" }, { label: "Cancelled", value: "cancelled" },
              ]}
            />
          </div>
          <div className="space-y-4">
            {paginated.length === 0 ? (
              <EmptyState icon={Calendar} title="No meetings scheduled" description="Schedule your first meeting." actionLabel="Schedule Meeting" onAction={() => setModalOpen(true)} />
            ) : (
              paginated.map((m) => (
                <MeetingCard
                  key={m.id}
                  meeting={m}
                  onRsvp={(status) => {
                    if (!user?.id) return;
                    rsvp(m.id, user.id, status);
                    toast.success(status === "attending" ? `You're attending ${m.title}` : `You've declined ${m.title}`);
                  }}
                  userRsvp={
                    user?.id
                      ? rsvps[m.id]?.attending.includes(user.id)
                        ? "attending"
                        : rsvps[m.id]?.declined.includes(user.id)
                          ? "declined"
                          : null
                      : null
                  }
                />
              ))
            )}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
        </div>
        <MiniCalendar
          highlightDates={
            user?.id
              ? displayMeetings
                  .filter((m) => {
                    const meetingRsvp = rsvps[m.id];
                    return meetingRsvp ? meetingRsvp.attending.includes(user.id!) : m.status === "scheduled";
                  })
                  .map((m) => m.date)
              : displayMeetings.filter((m) => m.status === "scheduled").map((m) => m.date)
          }
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
            <Button onClick={handleSchedule}>Schedule Meeting</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
