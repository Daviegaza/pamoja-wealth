import { api } from "./axios";
import type { Envelope } from "./http-types";

export interface AuditDTO {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  actorName: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

export async function listAudit(chamaId: string, page = 1, pageSize = 25) {
  const r = await api.get<Envelope<AuditDTO[]>>(`/chamas/${chamaId}/audit`, { params: { page, pageSize } });
  return { items: r.data.data, meta: r.data.meta };
}
