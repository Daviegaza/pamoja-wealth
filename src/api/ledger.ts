/**
 * Ledger export + audit-trail client.
 *
 * Backend endpoints:
 *   GET /chamas/:id/ledger/export?format=csv|quickbooks|xero
 *   GET /chamas/:id/audit/log
 *   GET /chamas/:id/audit/verify
 */
import { api } from "./axios";

export type ExportFormat = "csv" | "quickbooks" | "xero";

interface Envelope<T> { success: true; data: T; }

export interface AuditLogEntry {
  id: string;
  chamaId: string | null;
  userId: string | null;
  action: string;
  entity: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditVerifyResult {
  ok: boolean;
  checked: number;
  brokenAt: string | null;
}

export async function exportLedger(chamaId: string, format: ExportFormat, opts?: { startDate?: string; endDate?: string }): Promise<Blob> {
  const params = new URLSearchParams({ format });
  if (opts?.startDate) params.set("startDate", opts.startDate);
  if (opts?.endDate) params.set("endDate", opts.endDate);
  const r = await api.get(`/chamas/${chamaId}/ledger/export?${params.toString()}`, {
    responseType: "blob",
  });
  return r.data as Blob;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function getAuditLog(chamaId: string): Promise<AuditLogEntry[]> {
  const r = await api.get<Envelope<AuditLogEntry[]>>(`/chamas/${chamaId}/audit/log`);
  return r.data.data;
}

export async function verifyAuditChain(chamaId: string): Promise<AuditVerifyResult> {
  const r = await api.get<Envelope<AuditVerifyResult>>(`/chamas/${chamaId}/audit/verify`);
  return r.data.data;
}

export interface AuditReportPurchase {
  transactionId: string;
  priceKes: number;
  status: "queued";
  message: string;
}

export async function purchaseAuditReport(chamaId: string, startDate: string, endDate: string): Promise<AuditReportPurchase> {
  const r = await api.post<Envelope<AuditReportPurchase>>(`/chamas/${chamaId}/audit-report/purchase`, {
    startDate,
    endDate,
  });
  return r.data.data;
}
