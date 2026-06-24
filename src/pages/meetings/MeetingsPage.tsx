import { Plus } from "lucide-react";
import { toast } from "sonner";
import { MeetingCard } from "@/components/cards/MeetingCard";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { MiniCalendar } from "@/components/common/MiniCalendar";
import { Pagination } from "@/components/common/Pagination";
import { useMeetings } from "@/hooks/useMeetings";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";

export default function MeetingsPage() {
  const meetings = useMeetings();
  const { value, setValue, results } = useFilter(meetings, "status");
  const { page, totalPages, paginated, goToPage } = usePagination(results, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meetings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{meetings.length.toLocaleString()} meetings scheduled across all chamas</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => toast.success("Meeting scheduled! Members will be notified.")}>Schedule Meeting</Button>
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
            {paginated.map((m) => <MeetingCard key={m.id} meeting={m} />)}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
        </div>
        <MiniCalendar highlightDates={meetings.filter((m) => m.status === "scheduled").map((m) => m.date)} />
      </div>
    </div>
  );
}
