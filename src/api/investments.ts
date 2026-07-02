import { api } from "./axios";

export type InvestmentType =
  | "real_estate"
  | "stocks"
  | "bonds"
  | "treasury_bills"
  | "money_market"
  | "sacco";
export type InvestmentStatus = "active" | "matured" | "closed" | "pending";
export type RiskLevel = "low" | "medium" | "high";

export interface InvestmentDTO {
  id: string;
  chamaId: string;
  name: string;
  type: InvestmentType;
  amountInvested: number;
  currentValue: number;
  roi: number;
  status: InvestmentStatus;
  startDate: string;
  maturityDate?: string;
  riskLevel: RiskLevel;
}

export interface InvestmentListParams {
  chamaId?: string;
  type?: InvestmentType;
  status?: InvestmentStatus;
  page?: number;
  pageSize?: number;
}

export interface CreateInvestmentPayload {
  chamaId: string;
  name: string;
  type: InvestmentType;
  amountInvested: number;
  riskLevel: RiskLevel;
  startDate: string;
  maturityDate?: string;
}

interface Envelope<T> {
  success: true;
  data: T;
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
}

export async function listInvestments(params?: InvestmentListParams) {
  const r = await api.get<Envelope<InvestmentDTO[]>>("/investments", { params });
  return { items: r.data.data, meta: r.data.meta };
}

export async function getInvestment(id: string) {
  const r = await api.get<Envelope<InvestmentDTO>>(`/investments/${id}`);
  return r.data.data;
}

export async function createInvestment(payload: CreateInvestmentPayload) {
  const r = await api.post<Envelope<InvestmentDTO>>("/investments", payload);
  return r.data.data;
}
