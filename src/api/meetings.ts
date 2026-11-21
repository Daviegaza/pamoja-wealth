import { api } from "./axios";
import type { Envelope } from "./http-types";

export type RsvpStatus = "attending" | "declined" | "tentative";

export interface MeetingDTO {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  location: string;
  isVirtual: boolean;
  status: string;
  agenda: string[];
  minutes: string | null;
  myRsvp: RsvpStatus | null;
  createdAt: string;
}

export interface MeetingInput {
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  isVirtual?: boolean;
  agenda?: string[];
  status?: string;
}

export async function listMeetings(chamaId: string) {
  const r = await api.get<Envelope<MeetingDTO[]>>(`/chamas/${chamaId}/meetings`);
  return r.data.data;
}

export async function createMeeting(chamaId: string, input: MeetingInput) {
  const r = await api.post<Envelope<MeetingDTO>>(`/chamas/${chamaId}/meetings`, input);
  return r.data.data;
}

export async function updateMeeting(chamaId: string, meetingId: string, input: Partial<MeetingInput>) {
  const r = await api.patch<Envelope<MeetingDTO>>(`/chamas/${chamaId}/meetings/${meetingId}`, input);
  return r.data.data;
}

export async function saveMinutes(chamaId: string, meetingId: string, minutes: string) {
  const r = await api.put<Envelope<MeetingDTO>>(`/chamas/${chamaId}/meetings/${meetingId}/minutes`, { minutes });
  return r.data.data;
}

export async function rsvp(chamaId: string, meetingId: string, status: RsvpStatus) {
  const r = await api.post<Envelope<unknown>>(`/chamas/${chamaId}/meetings/${meetingId}/rsvp`, { status });
  return r.data.data;
}
