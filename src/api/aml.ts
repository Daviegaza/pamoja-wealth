import { api } from "./axios";

interface Envelope<T> { success: true; data: T; }

export type StrStatus = "open" | "submitted" | "closed_false_positive";

export interface ScreenResult {
  userId: string;
  matched: boolean;
  lists: string[];
  score: number;
  checkedAt: string;
  cached: boolean;
}

export interface StrRow {
  id: string;
  subjectUserId: string;
  reason: string;
  ruleTriggered: string;
  metadata: Record<string, unknown>;
  status: StrStatus;
  submittedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  subject: { fullName: string; phone: string };
}

export interface SarDraft {
  reportId: string;
  filedBy: string;
  submittedAt: string;
  subject: { userId: string; fullName: string; nationalId: string | null; phone: string };
  transactions: Array<{ id: string; amountKes: number; method: string | null; reference: string; createdAt: string }>;
  narrative: string;
  rulesTriggered: string[];
  frcTemplate: string;
}

export async function screenMe(): Promise<ScreenResult> {
  const r = await api.post<Envelope<ScreenResult>>("/aml/screen/me");
  return r.data.data;
}

export async function screenUser(userId: string): Promise<ScreenResult> {
  const r = await api.post<Envelope<ScreenResult>>(`/aml/screen/${userId}`);
  return r.data.data;
}

export async function refreshLists(): Promise<Array<{ source: string; count: number; ok: boolean }>> {
  const r = await api.post<Envelope<Array<{ source: string; count: number; ok: boolean }>>>("/aml/lists/refresh");
  return r.data.data;
}

export async function importPep(names: string[]): Promise<{ imported: number }> {
  const r = await api.post<Envelope<{ imported: number }>>("/aml/pep/import", { names });
  return r.data.data;
}

export async function listStrs(status: StrStatus = "open"): Promise<StrRow[]> {
  const r = await api.get<Envelope<StrRow[]>>(`/aml/strs?status=${status}`);
  return r.data.data;
}

export async function draftSar(strId: string): Promise<SarDraft> {
  const r = await api.post<Envelope<SarDraft>>(`/aml/strs/${strId}/sar-draft`);
  return r.data.data;
}

export async function submitStr(strId: string): Promise<void> {
  await api.post(`/aml/strs/${strId}/submit`);
}

export async function closeStr(strId: string): Promise<void> {
  await api.post(`/aml/strs/${strId}/close`);
}
