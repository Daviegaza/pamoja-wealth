import { api } from "./axios";
import type { Envelope } from "./http-types";

export type ChamaCategory = "savings" | "welfare" | "mixed" | "investment";

export interface ChamaDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: ChamaCategory;
  location: string | null;
  monthlyContribution: number;
  paymentInstructions: string | null;
  status: string;
  memberCount: number;
  myRole: string | null;
  currentPlanCode: string;
  createdAt: string;
}

export interface ChamaInput {
  name: string;
  description?: string;
  category: ChamaCategory;
  location?: string;
  monthlyContribution?: number;
  paymentInstructions?: string;
}

export interface MemberDTO {
  membershipId: string;
  userId: string;
  fullName: string;
  phone: string | null;
  role: string;
  status: string;
  joinedAt: string;
}

export interface InviteCodeDTO {
  code: string;
  expiresAt: string | null;
}

export async function listMyChamas() {
  const r = await api.get<Envelope<ChamaDTO[]>>("/chamas");
  return r.data.data;
}

export async function getChama(chamaId: string) {
  const r = await api.get<Envelope<ChamaDTO>>(`/chamas/${chamaId}`);
  return r.data.data;
}

export async function createChama(input: ChamaInput) {
  const r = await api.post<Envelope<ChamaDTO>>("/chamas", input);
  return r.data.data;
}

export async function updateChama(chamaId: string, input: Partial<ChamaInput>) {
  const r = await api.patch<Envelope<ChamaDTO>>(`/chamas/${chamaId}`, input);
  return r.data.data;
}

export async function archiveChama(chamaId: string) {
  await api.delete(`/chamas/${chamaId}`);
}

export async function listMembers(chamaId: string) {
  const r = await api.get<Envelope<MemberDTO[]>>(`/chamas/${chamaId}/members`);
  return r.data.data;
}

export async function changeMemberRole(chamaId: string, userId: string, role: string) {
  const r = await api.patch<Envelope<MemberDTO>>(`/chamas/${chamaId}/members/${userId}`, { role });
  return r.data.data;
}

export async function removeMember(chamaId: string, userId: string) {
  await api.delete(`/chamas/${chamaId}/members/${userId}`);
}

export async function createInviteCode(chamaId: string, expiresInDays?: number) {
  const r = await api.post<Envelope<InviteCodeDTO>>(
    `/chamas/${chamaId}/invite-codes`,
    expiresInDays ? { expiresInDays } : {},
  );
  return r.data.data;
}

export async function listInviteCodes(chamaId: string) {
  const r = await api.get<Envelope<InviteCodeDTO[]>>(`/chamas/${chamaId}/invite-codes`);
  return r.data.data;
}

export async function joinChama(code: string) {
  const r = await api.post<Envelope<ChamaDTO>>("/chamas/join", { code });
  return r.data.data;
}
