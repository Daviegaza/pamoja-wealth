import { api } from "./axios";

export interface ReferralCodeDTO {
  code: string;
  totalReferrals: number;
  totalEarnedKes: number;
  isActive: boolean;
  createdAt: string;
}

export interface ReferralStatsDTO {
  totalReferrals: number;
  totalEarnedKes: number;
  pendingRewardsKes: number;
  recent: Array<{
    id: string;
    referredUserId: string;
    referredName?: string;
    status: string;
    createdAt: string;
    amountKes: number;
  }>;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  totalReferrals: number;
  totalEarnedKes: number;
}

interface Envelope<T> { success: true; data: T; }

export async function getMyReferralCode(): Promise<ReferralCodeDTO> {
  const r = await api.get<Envelope<ReferralCodeDTO>>("/referral/code");
  return r.data.data;
}

export async function getMyReferralStats(): Promise<ReferralStatsDTO> {
  const r = await api.get<Envelope<ReferralStatsDTO>>("/referral/stats");
  return r.data.data;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const r = await api.get<Envelope<LeaderboardEntry[]>>("/referral/leaderboard");
  return r.data.data;
}

export async function validateReferralCode(code: string): Promise<{ valid: boolean; referrerName?: string }> {
  const r = await api.post<Envelope<{ valid: boolean; referrerName?: string }>>("/referral/validate", { code });
  return r.data.data;
}
