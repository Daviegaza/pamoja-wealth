import { api } from "./axios";
import type { Envelope, PaymentMethod } from "./http-types";

export type ContributionStatus = "recorded" | "confirmed" | "disputed" | "voided";
export type ScheduleFrequency = "weekly" | "monthly" | "one_off";

export interface ScheduleDTO {
  id: string;
  name: string;
  amount: number;
  frequency: ScheduleFrequency;
  startDate: string;
  dueDay: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface ScheduleInput {
  name: string;
  amount: number;
  frequency: ScheduleFrequency;
  startDate: string;
  dueDay?: number | null;
  isActive?: boolean;
}

export interface ContributionDTO {
  id: string;
  chamaId: string;
  memberId: string;
  memberName: string;
  amount: number;
  paidOn: string;
  method: PaymentMethod;
  mpesaReceipt: string | null;
  note: string | null;
  scheduleId: string | null;
  goalId: string | null;
  status: ContributionStatus;
  disputeReason: string | null;
  voidReason: string | null;
  recordedById: string;
  recordedByName: string;
  confirmedAt: string | null;
  createdAt: string;
}

export interface ContributionInput {
  memberId: string;
  amount: number;
  paidOn: string;
  method: PaymentMethod;
  mpesaReceipt?: string;
  note?: string;
  scheduleId?: string;
  goalId?: string;
}

export interface ContributionSummary {
  totalConfirmed: number;
  totalRecorded: number;
  totalDisputed: number;
  count: number;
  byMember: { memberId: string; fullName: string; total: number }[];
}

export interface ContributionQuery {
  memberId?: string;
  status?: ContributionStatus;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

const base = (chamaId: string) => `/chamas/${chamaId}`;

export async function listSchedules(chamaId: string) {
  const r = await api.get<Envelope<ScheduleDTO[]>>(`${base(chamaId)}/contribution-schedules`);
  return r.data.data;
}

export async function createSchedule(chamaId: string, input: ScheduleInput) {
  const r = await api.post<Envelope<ScheduleDTO>>(`${base(chamaId)}/contribution-schedules`, input);
  return r.data.data;
}

export async function updateSchedule(chamaId: string, scheduleId: string, input: Partial<ScheduleInput>) {
  const r = await api.patch<Envelope<ScheduleDTO>>(`${base(chamaId)}/contribution-schedules/${scheduleId}`, input);
  return r.data.data;
}

export async function listContributions(chamaId: string, query: ContributionQuery = {}) {
  const r = await api.get<Envelope<ContributionDTO[]>>(`${base(chamaId)}/contributions`, { params: query });
  return { items: r.data.data, meta: r.data.meta };
}

export async function recordContribution(chamaId: string, input: ContributionInput) {
  const r = await api.post<Envelope<ContributionDTO>>(`${base(chamaId)}/contributions`, input);
  return r.data.data;
}

export async function confirmContribution(chamaId: string, id: string) {
  const r = await api.post<Envelope<ContributionDTO>>(`${base(chamaId)}/contributions/${id}/confirm`);
  return r.data.data;
}

export async function disputeContribution(chamaId: string, id: string, reason: string) {
  const r = await api.post<Envelope<ContributionDTO>>(`${base(chamaId)}/contributions/${id}/dispute`, { reason });
  return r.data.data;
}

export async function voidContribution(chamaId: string, id: string, reason: string) {
  const r = await api.post<Envelope<ContributionDTO>>(`${base(chamaId)}/contributions/${id}/void`, { reason });
  return r.data.data;
}

export async function getContributionSummary(chamaId: string) {
  const r = await api.get<Envelope<ContributionSummary>>(`${base(chamaId)}/contributions/summary`);
  return r.data.data;
}
