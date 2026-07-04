import { api } from "./axios";

export type KycDocumentType = "national_id" | "passport" | "selfie" | "proof_of_address";
export type KycStatus = "pending_verification" | "verified" | "rejected";

export interface KycStatusDTO {
  tier: 0 | 1 | 2 | 3;
  level: number;
  isVerified: boolean;
  idVerified: boolean;
  selfieVerified: boolean;
  addressVerified: boolean;
  pepScreened: boolean;
  sanctionsScreened: boolean;
  lastKycAt: string | null;
  dailyLimitKes: number;
  monthlyLimitKes: number;
  documents: Array<{
    id: string;
    documentType: KycDocumentType;
    status: KycStatus;
    createdAt: string;
    verifiedAt: string | null;
  }>;
}

export interface KycUploadResultDTO {
  id: string;
  documentType: KycDocumentType;
  status: KycStatus;
  storageKey: string;
  createdAt: string;
}

export interface CanContributeResultDTO {
  allowed: boolean;
  reason?: string;
  currentTier: number;
  requiredTier?: number;
  dailyUsedKes: number;
  dailyLimitKes: number;
  monthlyUsedKes: number;
  monthlyLimitKes: number;
}

interface Envelope<T> { success: true; data: T; }

export async function getKycStatus(): Promise<KycStatusDTO> {
  const r = await api.get<Envelope<KycStatusDTO>>("/kyc/status");
  return r.data.data;
}

export async function checkKycLimit(amount: number): Promise<CanContributeResultDTO> {
  const r = await api.post<Envelope<CanContributeResultDTO>>("/kyc/check-limit", { amount });
  return r.data.data;
}

export async function uploadKycDocument(
  file: File,
  documentType: KycDocumentType,
): Promise<KycUploadResultDTO> {
  const form = new FormData();
  form.append("file", file);
  form.append("documentType", documentType);
  const r = await api.post<Envelope<KycUploadResultDTO>>("/kyc/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return r.data.data;
}

export async function screenPep(): Promise<{ pepMatch: boolean; sanctionsMatch: boolean; screenedAt: string }> {
  const r = await api.post<Envelope<{ pepMatch: boolean; sanctionsMatch: boolean; screenedAt: string }>>("/kyc/screen");
  return r.data.data;
}

export async function exportUserData(): Promise<Blob> {
  const r = await api.get("/kyc/export", { responseType: "blob" });
  return r.data as Blob;
}

export async function eraseAccount(confirmation: "DELETE_MY_DATA"): Promise<void> {
  await api.delete("/kyc/erase", { data: { confirmation } });
}
