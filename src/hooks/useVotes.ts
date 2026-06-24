import { useMeetingStore } from "@/stores/meetingStore";

export function useVotes() {
  const { votes, castVote } = useMeetingStore();
  return { votes, castVote };
}
