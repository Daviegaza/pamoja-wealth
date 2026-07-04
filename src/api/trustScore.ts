import { api } from "./axios";

export type TrustScoreBand = "new" | "building" | "fair" | "strong" | "elite";

export interface TrustScoreBreakdownDTO {
  contributionStreakMonths: number;
  onTimePaymentRate: number;
  disputeCount: number;
  defaultedLoanCount: number;
  kycTier: number;
  chamasActive: number;
  yearsOnPlatform: number;
}

export interface TrustScoreDTO {
  userId: string;
  score: number;
  band: TrustScoreBand;
  breakdown: TrustScoreBreakdownDTO;
  computedAt: string;
  cached: boolean;
}

export interface TrustScorePublicDTO {
  userId: string;
  score: number;
  band: TrustScoreBand;
  computedAt: string;
}

interface Envelope<T> { success: true; data: T; }

export async function getMyTrustScore(): Promise<TrustScoreDTO> {
  const r = await api.get<Envelope<TrustScoreDTO>>("/trust-score/me");
  return r.data.data;
}

export async function getPublicTrustScore(userId: string): Promise<TrustScorePublicDTO> {
  const r = await api.get<Envelope<TrustScorePublicDTO>>(`/trust-score/${userId}`);
  return r.data.data;
}

export async function refreshMyTrustScore(): Promise<TrustScoreDTO> {
  const r = await api.post<Envelope<TrustScoreDTO>>("/trust-score/me/refresh");
  return r.data.data;
}
