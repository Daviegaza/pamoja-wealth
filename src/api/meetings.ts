import { api } from "./axios";

export type MeetingStatus = "scheduled" | "ongoing" | "completed" | "cancelled";
export type RsvpStatus = "attending" | "declined" | "tentative";

export interface MeetingDTO {
  id: string;
  chamaId: string;
  title: string;
  description?: string | null;
  date: string;
  time: string;
  location: string;
  isVirtual: boolean;
  status: MeetingStatus;
  agenda?: string[];
  attendeesCount?: number;
  totalInvited?: number;
}

export interface ListMeetingsParams {
  chamaId?: string;
  status?: MeetingStatus;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateMeetingPayload {
  chamaId: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  isVirtual?: boolean;
  agenda?: string[];
}

export interface RsvpPayload {
  status: RsvpStatus;
}

export interface MinutesPayload {
  content: string;
}

interface Envelope<T> {
  success: true;
  data: T;
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
}

export async function listMeetings(params?: ListMeetingsParams) {
  const r = await api.get<Envelope<MeetingDTO[]>>("/meetings", { params });
  return { items: r.data.data, meta: r.data.meta };
}

export async function getMeeting(id: string) {
  const r = await api.get<Envelope<MeetingDTO>>(`/meetings/${id}`);
  return r.data.data;
}

export async function createMeeting(payload: CreateMeetingPayload) {
  const r = await api.post<Envelope<MeetingDTO>>("/meetings", payload);
  return r.data.data;
}

export async function rsvp(id: string, payload: RsvpPayload) {
  const r = await api.post<Envelope<unknown>>(`/meetings/${id}/rsvp`, payload);
  return r.data.data;
}

export async function saveMinutes(id: string, payload: MinutesPayload) {
  const r = await api.post<Envelope<unknown>>(`/meetings/${id}/minutes`, payload);
  return r.data.data;
}
