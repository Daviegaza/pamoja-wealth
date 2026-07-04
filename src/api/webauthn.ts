import { api } from "./axios";

interface Envelope<T> { success: true; data: T; }

export interface WebauthnCredentialRow {
  id: string;
  label: string | null;
  deviceType: string;
  backedUp: boolean;
  lastUsedAt: string | null;
  createdAt: string;
  transports: string | null;
}

export async function listCredentials(): Promise<WebauthnCredentialRow[]> {
  const r = await api.get<Envelope<WebauthnCredentialRow[]>>("/webauthn/credentials");
  return r.data.data;
}

export async function deleteCredential(id: string): Promise<void> {
  await api.delete(`/webauthn/credentials/${id}`);
}
