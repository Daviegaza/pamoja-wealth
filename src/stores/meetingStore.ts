import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Meeting, Vote } from "@/types";
import { getMockDatabase } from "@/mock";

interface MeetingState {
  meetings: Meeting[];
  votes: Vote[];
  castVote: (voteId: string, optionId: string) => void;
}

export const useMeetingStore = create<MeetingState>()(
  persist(
    (set, get) => ({
      meetings: getMockDatabase().meetings,
      votes: getMockDatabase().votes,
      castVote: (voteId, optionId) =>
        set({
          votes: get().votes.map((v) =>
            v.id === voteId
              ? { ...v, totalVotes: v.totalVotes + 1, options: v.options.map((o) => (o.id === optionId ? { ...o, count: o.count + 1 } : o)) }
              : v
          ),
        }),
    }),
    { name: "pamoja-meetings" }
  )
);
