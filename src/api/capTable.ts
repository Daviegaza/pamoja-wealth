/**
 * Cap-table + share-offering API client.
 *
 * Backend endpoints:
 *   POST   /chamas/:id/offerings            — create offering
 *   GET    /chamas/:id/offerings            — list offerings
 *   POST   /chamas/:id/offerings/:oid/close — close an open offering
 *   GET    /chamas/:id/cap-table            — aggregated cap table
 *   POST   /chamas/:id/dividends/declare    — pro-rata dividend split preview
 */
import { api } from "./axios";

interface Envelope<T> { success: true; data: T; }

export interface ShareOffering {
  id: string;
  chamaId: string;
  createdById: string;
  createdAt: string;
  title: string;
  description?: string;
  totalShares: number;
  pricePerShareKes: number;
  minInvestmentKes?: number;
  maxInvestmentKes?: number;
  closesAt?: string;
  terms?: string;
  sharesSold: number;
  status: "open" | "closed" | "cancelled";
}

export interface CapTableRow {
  investor: string;
  investorUserId?: string;
  shares: number;
  amountKes: number;
  percent: number;
}

export interface CapTable {
  totalShares: number;
  totalRaisedKes: number;
  rows: CapTableRow[];
}

export interface DividendAllocation {
  investorUserId?: string;
  investorPhone?: string;
  investorEmail?: string;
  amountKes: number;
  percent: number;
}

export interface DividendResult {
  distributed: DividendAllocation[];
  totalKes: number;
}

export interface CreateOfferingInput {
  title: string;
  description?: string;
  totalShares: number;
  pricePerShareKes: number;
  minInvestmentKes?: number;
  maxInvestmentKes?: number;
  closesAt?: string;
  terms?: string;
}

export async function createOffering(chamaId: string, input: CreateOfferingInput): Promise<ShareOffering> {
  const r = await api.post<Envelope<ShareOffering>>(`/chamas/${chamaId}/offerings`, { ...input, chamaId });
  return r.data.data;
}

export async function listOfferings(chamaId: string): Promise<ShareOffering[]> {
  const r = await api.get<Envelope<ShareOffering[]>>(`/chamas/${chamaId}/offerings`);
  return r.data.data;
}

export async function closeOffering(chamaId: string, offeringId: string): Promise<void> {
  await api.post(`/chamas/${chamaId}/offerings/${offeringId}/close`);
}

export async function getCapTable(chamaId: string): Promise<CapTable> {
  const r = await api.get<Envelope<CapTable>>(`/chamas/${chamaId}/cap-table`);
  return r.data.data;
}

export async function declareDividend(chamaId: string, potKes: number): Promise<DividendResult> {
  const r = await api.post<Envelope<DividendResult>>(`/chamas/${chamaId}/dividends/declare`, { potKes });
  return r.data.data;
}

export interface ExecuteDividendResult {
  enqueued: number;
  skipped: number;
  totalKes: number;
  payoutIds: string[];
}

export async function executeDividend(chamaId: string, potKes: number, requiredSignatures?: number): Promise<ExecuteDividendResult> {
  const r = await api.post<Envelope<ExecuteDividendResult>>(`/chamas/${chamaId}/dividends/execute`, {
    potKes,
    ...(requiredSignatures !== undefined ? { requiredSignatures } : {}),
  });
  return r.data.data;
}
