import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Meeting, Vote } from "@/types";
import { getMockDatabase } from "@/mock";

interface MeetingState {
  meetings: Meeting[];
  votes: Vote[];
  rsvps: Record<string, { attending: string[]; declined: string[] }>;
  castVote: (voteId: string, optionId: string) => void;
  addMeeting: (data: { chamaId: string; title: string; date: string; time: string; location: string }) => void;
  addVote: (data: { chamaId: string; title: string; description: string; options: string[]; createdBy: string }) => void;
  rsvp: (meetingId: string, userId: string, status: "attending" | "declined") => void;
}

export const useMeetingStore = create<MeetingState>()(
  persist(
    (set, get) => ({
      meetings: getMockDatabase().meetings,
      votes: getMockDatabase().votes,
      rsvps: {},
      castVote: (voteId, optionId) =>
        set({
          votes: get().votes.map((v) =>
            v.id === voteId
              ? { ...v, totalVotes: v.totalVotes + 1, options: v.options.map((o) => (o.id === optionId ? { ...o, count: o.count + 1 } : o)) }
              : v
          ),
        }),
      addMeeting: (data) =>
        set({
          meetings: [
            {
              id: `meeting_${Date.now()}`,
              chamaId: data.chamaId,
              title: data.title,
              description: "",
              date: data.date,
              time: data.time,
              location: data.location,
              isVirtual: false,
              status: "scheduled",
              agenda: [],
              attendeesCount: 0,
              totalInvited: 0,
            },
            ...get().meetings,
          ],
        }),
      addVote: (data) =>
        set({
          votes: [
            {
              id: `vote_${Date.now()}`,
              chamaId: data.chamaId,
              title: data.title,
              description: data.description,
              options: data.options.map((label, i) => ({ id: `opt_${Date.now()}_${i}`, label, count: 0 })),
              status: "open",
              createdAt: new Date().toISOString(),
              closesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              totalVotes: 0,
              createdBy: data.createdBy,
            },
            ...get().votes,
          ],
        }),
      rsvp: (meetingId, userId, status) =>
        set((state) => {
          const prev = state.rsvps[meetingId] ?? { attending: [], declined: [] };
          const wasAttending = prev.attending.includes(userId);
          let attendeesDelta = 0;

          if (status === "attending") {
            if (!wasAttending) attendeesDelta = 1;
          } else {
            if (wasAttending) attendeesDelta = -1;
          }

          return {
            rsvps: {
              ...state.rsvps,
              [meetingId]: {
                attending:
                  status === "attending"
                    ? [...prev.attending.filter((id) => id !== userId), userId]
                    : prev.attending.filter((id) => id !== userId),
                declined:
                  status === "declined"
                    ? [...prev.declined.filter((id) => id !== userId), userId]
                    : prev.declined.filter((id) => id !== userId),
              },
            },
            meetings: state.meetings.map((m) =>
              m.id === meetingId ? { ...m, attendeesCount: m.attendeesCount + attendeesDelta } : m
            ),
          };
        }),
    }),
    { name: "pamoja-meetings" }
  )
);
