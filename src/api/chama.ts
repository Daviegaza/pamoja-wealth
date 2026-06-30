import { api } from "./axios";

export type Privacy = "public" | "private" | "invite_only";
export type ChamaKind = "chama" | "fundraiser";
export type Category = "savings" | "investment" | "welfare" | "mixed";

export interface ChamaDTO {
  id: string;
  name: string;
  slug?: string;
  description: string | null;
  category: Category;
  type: ChamaKind;
  privacy: Privacy;
  logoUrl: string | null;
  coverImageUrl?: string | null;
  location: string | null;
  tags?: string[];
  memberCount?: number;
  donationCount?: number;
  totalFunds: number;
  monthlyContribution: number;
  targetAmount?: number | null;
  raisedAmount?: number;
  deadline?: string | null;
  status?: string;
  createdAt: string;
}

interface Envelope<T> { success: true; data: T; meta?: { total: number; page: number; pageSize: number; totalPages: number }; }

export async function listMyChamas(params?: { search?: string; category?: string; page?: number; pageSize?: number }) {
  const r = await api.get<Envelope<ChamaDTO[]>>("/chamas", { params });
  return { items: r.data.data, meta: r.data.meta };
}

export async function discover(params?: { search?: string; category?: Category; type?: ChamaKind; location?: string; tag?: string; page?: number; pageSize?: number }) {
  const r = await api.get<Envelope<ChamaDTO[]>>("/chamas/discover", { params });
  return { items: r.data.data, meta: r.data.meta };
}

export async function getChama(id: string) {
  const r = await api.get<Envelope<{ chama: ChamaDTO; members: unknown[]; stats: unknown }>>(`/chamas/${id}`);
  return r.data.data;
}

export async function createChama(data: {
  name: string;
  description?: string;
  category: Category;
  type?: ChamaKind;
  privacy?: Privacy;
  monthlyContribution: number;
  location?: string;
  tags?: string[];
  coverImageUrl?: string;
  targetAmount?: number;
  deadline?: string;
  requireKyc?: boolean;
  maxMembers?: number;
}) {
  const r = await api.post<Envelope<{ chama: ChamaDTO; inviteCode: string }>>("/chamas", data);
  return r.data.data;
}

export async function joinChama(id: string, body: { inviteCode?: string; invitationToken?: string; message?: string }) {
  const r = await api.post<Envelope<unknown>>(`/chamas/${id}/join`, body);
  return r.data.data;
}

export async function inviteToChama(id: string, body: {
  method: "phone" | "email" | "username" | "link" | "qr";
  phone?: string;
  email?: string;
  username?: string;
  message?: string;
  expiresInDays?: number;
}) {
  const r = await api.post<Envelope<{ invitationId?: string; token: string; link: string; expiresAt: string; inviteCode?: string }>>(
    `/chamas/${id}/invite`, body
  );
  return r.data.data;
}

export async function searchUsersForInvite(chamaId: string, q: string) {
  const r = await api.get<Envelope<Array<{ id: string; username: string | null; fullName: string; phone: string; email: string; avatarUrl: string | null; location: string | null }>>>(
    `/chamas/${chamaId}/search-users`, { params: { q } }
  );
  return r.data.data;
}

export async function myInvitations() {
  const r = await api.get<Envelope<unknown[]>>("/chamas/my-invitations");
  return r.data.data;
}

export async function acceptInvitation(token: string) {
  const r = await api.post<Envelope<unknown>>("/chamas/invitations/accept", { token });
  return r.data.data;
}

export async function declineInvitation(token: string) {
  const r = await api.post<Envelope<unknown>>("/chamas/invitations/decline", { token });
  return r.data.data;
}

export async function listJoinRequests(chamaId: string) {
  const r = await api.get<Envelope<unknown[]>>(`/chamas/${chamaId}/join-requests`);
  return r.data.data;
}

export async function decideJoinRequest(chamaId: string, requestId: string, decision: "approved" | "rejected", reason?: string) {
  const r = await api.post<Envelope<unknown>>(`/chamas/${chamaId}/join-requests/${requestId}/decision`, { decision, reason });
  return r.data.data;
}

export async function donate(chamaId: string, data: {
  amount: number;
  message?: string;
  isAnonymous?: boolean;
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  paymentMethod?: "mpesa" | "bank" | "card" | "cash";
}) {
  const r = await api.post<Envelope<unknown>>(`/chamas/${chamaId}/donate`, data);
  return r.data.data;
}

export async function listDonations(chamaId: string, page = 1, pageSize = 20) {
  const r = await api.get<Envelope<unknown[]>>(`/chamas/${chamaId}/donations`, { params: { page, pageSize } });
  return { items: r.data.data, meta: r.data.meta };
}
