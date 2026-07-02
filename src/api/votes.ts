import { api } from "./axios";

export type VoteStatus = "open" | "closed" | "passed" | "rejected";

export interface VoteOptionDTO {
  id: string;
  label: string;
  count: number;
}

export interface VoteDTO {
  id: string;
  chamaId: string;
  title: string;
  description: string | null;
  options: VoteOptionDTO[];
  status: VoteStatus;
  createdAt: string;
  closesAt: string;
  totalVotes: number;
  createdBy: string;
  userVote?: string | null;
}

export interface VoteResultsDTO {
  id: string;
  title: string;
  status: VoteStatus;
  options: VoteOptionDTO[];
  totalVotes: number;
  winner: string | null;
}

export interface ListVotesParams {
  chamaId?: string;
  status?: VoteStatus;
  page?: number;
  pageSize?: number;
}

export interface CreateVotePayload {
  chamaId: string;
  title: string;
  description?: string;
  options: string[];
  closesAt: string;
}

export interface CastVotePayload {
  optionId: string;
}

interface Envelope<T> {
  success: true;
  data: T;
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
}

export async function listVotes(params?: ListVotesParams) {
  const r = await api.get<Envelope<VoteDTO[]>>("/votes", { params });
  return { items: r.data.data, meta: r.data.meta };
}

export async function getVote(id: string) {
  const r = await api.get<Envelope<VoteDTO>>(`/votes/${id}`);
  return r.data.data;
}

export async function getResults(id: string) {
  const r = await api.get<Envelope<VoteResultsDTO>>(`/votes/${id}/results`);
  return r.data.data;
}

export async function createVote(payload: CreateVotePayload) {
  const r = await api.post<Envelope<VoteDTO>>("/votes", payload);
  return r.data.data;
}

export async function castVote(id: string, payload: CastVotePayload) {
  const r = await api.post<Envelope<{ success: true }>>(`/votes/${id}/cast`, payload);
  return r.data.data;
}

export async function closeVote(id: string) {
  const r = await api.post<Envelope<VoteDTO>>(`/votes/${id}/close`);
  return r.data.data;
}
