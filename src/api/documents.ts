import { api } from "./axios";

export interface DocumentDTO {
  id: string;
  name: string;
  type: "pdf" | "doc" | "image" | "sheet";
  sizeKb: number;
  uploadedBy: string;
  uploadedByName?: string;
  uploadedAt: string;
}

interface Envelope<T> {
  success: true;
  data: T;
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
}

export async function listDocuments(params?: { chamaId?: string; search?: string; page?: number; pageSize?: number }) {
  const r = await api.get<Envelope<DocumentDTO[]>>("/documents", { params });
  return { items: r.data.data, meta: r.data.meta };
}

export async function uploadDocument(file: File, meta?: { chamaId?: string }) {
  const form = new FormData();
  form.append("file", file);
  if (meta?.chamaId) form.append("chamaId", meta.chamaId);
  const r = await api.post<Envelope<DocumentDTO>>("/documents/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return r.data.data;
}

export async function downloadDocument(id: string): Promise<string> {
  const base = (api.defaults.baseURL ?? "").replace(/\/$/, "");
  const token = localStorage.getItem("pamoja_token");
  const url = `${base}/documents/${id}/download`;
  return token ? `${url}?token=${encodeURIComponent(token)}` : url;
}

export async function deleteDocument(id: string) {
  const r = await api.delete<Envelope<{ id: string }>>(`/documents/${id}`);
  return r.data.data;
}
