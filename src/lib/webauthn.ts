/**
 * WebAuthn browser helpers.
 *
 * Uses the platform navigator.credentials API. When the backend returns
 * 503 webauthn_not_installed, callers should fall back to the placeholder
 * biometric-token flow.
 *
 * All server DTOs pass through unchanged — they're already in the shape
 * PublicKeyCredential expects (with base64url-encoded buffers).
 */
import { api } from "@/api/axios";

interface Envelope<T> { success: true; data: T; }

function b64uToBuffer(b64u: string): ArrayBuffer {
  const b64 = b64u.replace(/-/g, "+").replace(/_/g, "/");
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(b64 + pad);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) arr[i] = bin.charCodeAt(i);
  return arr.buffer;
}

function bufferToB64u(buf: ArrayBuffer): string {
  const bin = String.fromCharCode(...new Uint8Array(buf));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeOptions<T extends Record<string, unknown>>(opts: T): T {
  const clone: Record<string, unknown> = { ...opts };
  if (typeof clone.challenge === "string") clone.challenge = b64uToBuffer(clone.challenge);
  if (clone.user && typeof (clone.user as { id?: unknown }).id === "string") {
    clone.user = { ...(clone.user as Record<string, unknown>), id: b64uToBuffer((clone.user as { id: string }).id) };
  }
  const cred = clone.allowCredentials ?? clone.excludeCredentials;
  if (Array.isArray(cred)) {
    const decoded = cred.map((c: Record<string, unknown>) => ({ ...c, id: typeof c.id === "string" ? b64uToBuffer(c.id) : c.id }));
    if (clone.allowCredentials) clone.allowCredentials = decoded;
    if (clone.excludeCredentials) clone.excludeCredentials = decoded;
  }
  return clone as T;
}

function serializeAttestation(cred: PublicKeyCredential): Record<string, unknown> {
  const r = cred.response as AuthenticatorAttestationResponse;
  return {
    id: cred.id,
    rawId: bufferToB64u(cred.rawId),
    type: cred.type,
    clientExtensionResults: cred.getClientExtensionResults?.() ?? {},
    response: {
      clientDataJSON: bufferToB64u(r.clientDataJSON),
      attestationObject: bufferToB64u(r.attestationObject),
      transports: r.getTransports?.() ?? [],
    },
  };
}

function serializeAssertion(cred: PublicKeyCredential): Record<string, unknown> {
  const r = cred.response as AuthenticatorAssertionResponse;
  return {
    id: cred.id,
    rawId: bufferToB64u(cred.rawId),
    type: cred.type,
    clientExtensionResults: cred.getClientExtensionResults?.() ?? {},
    response: {
      clientDataJSON: bufferToB64u(r.clientDataJSON),
      authenticatorData: bufferToB64u(r.authenticatorData),
      signature: bufferToB64u(r.signature),
      userHandle: r.userHandle ? bufferToB64u(r.userHandle) : null,
    },
  };
}

export function isWebAuthnSupported(): boolean {
  return typeof window !== "undefined"
    && typeof navigator !== "undefined"
    && !!navigator.credentials?.create
    && !!window.PublicKeyCredential;
}

export async function registerCredential(label?: string): Promise<{ verified: boolean; credentialId?: string }> {
  const optsRes = await api.post<Envelope<PublicKeyCredentialCreationOptions>>("/webauthn/register/options");
  const options = decodeOptions(optsRes.data.data as unknown as Record<string, unknown>) as unknown as PublicKeyCredentialCreationOptions;
  const cred = (await navigator.credentials.create({ publicKey: options })) as PublicKeyCredential | null;
  if (!cred) return { verified: false };
  const attestation = serializeAttestation(cred);
  const verifyRes = await api.post<Envelope<{ verified: boolean; credentialId?: string }>>("/webauthn/register/verify", {
    response: attestation,
    label,
  });
  return verifyRes.data.data;
}

/**
 * Sign a challenge. Returns the assertion payload as a base64url-encoded
 * JSON blob so it can travel through /payouts/:id/sign's biometricToken
 * field without breaking the existing schema.
 */
export async function signChallenge(): Promise<string> {
  const optsRes = await api.post<Envelope<PublicKeyCredentialRequestOptions>>("/webauthn/authenticate/options");
  const options = decodeOptions(optsRes.data.data as unknown as Record<string, unknown>) as unknown as PublicKeyCredentialRequestOptions;
  const cred = (await navigator.credentials.get({ publicKey: options })) as PublicKeyCredential | null;
  if (!cred) throw new Error("WebAuthn signing cancelled");
  const assertion = serializeAssertion(cred);
  const json = JSON.stringify({ webauthn: true, assertion });
  return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
