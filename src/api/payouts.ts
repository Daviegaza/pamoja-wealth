/**
 * Payout multi-sig client.
 *
 *   GET  /chamas/:id/payouts/pending
 *   GET  /payouts/:id
 *   POST /payouts/:id/sign     — body: { biometricToken }
 *   POST /payouts/:id/cancel
 */
import { api } from "./axios";

interface Envelope<T> { success: true; data: T; }

export type PayoutStatus =
  | "pending"
  | "awaiting_signatures"
  | "approved"
  | "disbursing"
  | "disbursed"
  | "failed"
  | "cancelled";

export interface PayoutSignatureDTO {
  signerUserId: string;
  signedAt: string;
  signer?: { fullName: string };
}

export interface PayoutRequestDTO {
  id: string;
  chamaId: string;
  recipientUserId: string;
  recipient?: { fullName: string; avatarUrl?: string | null };
  chama?: { id: string; name: string };
  amount: string;
  currency: string;
  purpose: string;
  requiredSignatures: number;
  status: PayoutStatus;
  mpesaConversationId: string | null;
  createdAt: string;
  signatures: PayoutSignatureDTO[];
}

export async function listPendingPayouts(chamaId: string): Promise<PayoutRequestDTO[]> {
  const r = await api.get<Envelope<PayoutRequestDTO[]>>(`/chamas/${chamaId}/payouts/pending`);
  return r.data.data;
}

export async function getPayout(id: string): Promise<PayoutRequestDTO> {
  const r = await api.get<Envelope<PayoutRequestDTO>>(`/payouts/${id}`);
  return r.data.data;
}

export interface SignResult {
  payoutId: string;
  signaturesCollected: number;
  threshold: number;
  status: PayoutStatus;
  enqueued: boolean;
}

export async function signPayout(id: string, biometricToken: string): Promise<SignResult> {
  const r = await api.post<Envelope<SignResult>>(`/payouts/${id}/sign`, { biometricToken });
  return r.data.data;
}

export async function cancelPayout(id: string): Promise<void> {
  await api.post(`/payouts/${id}/cancel`);
}
