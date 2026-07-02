import { api } from "./axios";

export interface NetworkConnectionDTO {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  connectionType: string;
  chamaName: string;
  chamaId: string;
  role: string;
}

export interface NetworkStatsDTO {
  totalConnections: number;
  strongTies: number;
  verifiedCount: number;
  chamaCount: number;
}

export interface NetworkPrivacyDTO {
  showConnections: boolean;
  showTransactionHistory: boolean;
  showContributionAmount: boolean;
  showLoanDetails: boolean;
  showInvestmentDetails: boolean;
  profileVisibility: string;
}

interface Envelope<T> {
  success: true;
  data: T;
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
}

export async function getConnections(params?: {
  search?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}) {
  const r = await api.get<Envelope<NetworkConnectionDTO[]>>("/network/connections", { params });
  return { items: r.data.data, meta: r.data.meta };
}

export async function getNetworkStats() {
  const r = await api.get<Envelope<NetworkStatsDTO>>("/network/stats");
  return r.data.data;
}

export async function getPrivacy() {
  const r = await api.get<Envelope<NetworkPrivacyDTO>>("/network/privacy");
  return r.data.data;
}
