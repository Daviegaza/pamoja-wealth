import { useMeetingStore } from "@/stores/meetingStore";

export function useMeetings() {
  return useMeetingStore((s) => s.meetings);
}
