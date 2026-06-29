import { useState } from "react";
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
import { useMeetings } from "@/hooks/useMeetings";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import { useChamaStore } from "@/stores/chamaStore";
import { useMeetingStore } from "@/stores/meetingStore";

export default function MeetingsPage() {
  const meetings = useMeetings();
  const activeChamaId = useChamaStore((s) => s.activeChamaId);
  const chamas = useChamaStore((s) => s.chamas);
  const addMeeting = useMeetingStore((s) => s.addMeeting);
  const activeChama = chamas.find((c) => c.id === activeChamaId);
  const displayMeetings = activeChamaId ? meetings.filter((m) => m.chamaId === activeChamaId) : meetings;
  const { value, setValue, results } = useFilter(displayMeetings, "status");
  const { page, totalPages, paginated, goToPage } = usePagination(results, 6);

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
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{displayMeetings.length.toLocaleString()} meetings in {activeChama?.name ?? "All Chamas"}</p>
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
              paginated.map((m) => <MeetingCard key={m.id} meeting={m} />)
            )}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
        </div>
        <MiniCalendar highlightDates={displayMeetings.filter((m) => m.status === "scheduled").map((m) => m.date)} />
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
