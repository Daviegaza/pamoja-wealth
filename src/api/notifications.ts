import { api } from "./axios";

export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "loan"
  | "meeting"
  | "vote"
  | "wallet";

export interface NotificationDTO {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  actionUrl?: string | null;
}

interface Envelope<T> {
  success: true;
  data: T;
  meta?: { total: number; page: number; pageSize: number; totalPages: number; unreadCount?: number };
}

export interface ListNotificationsParams {
  page?: number;
  pageSize?: number;
  isRead?: boolean;
  type?: NotificationType;
}

export async function listNotifications(params?: ListNotificationsParams) {
  const r = await api.get<Envelope<NotificationDTO[]>>("/notifications", { params });
  return { items: r.data.data, meta: r.data.meta };
}

export async function markRead(id: string) {
  const r = await api.post<Envelope<unknown>>(`/notifications/${id}/read`);
  return r.data.data;
}

export async function markAllRead() {
  const r = await api.post<Envelope<unknown>>("/notifications/read-all");
  return r.data.data;
}

export async function deleteNotification(id: string) {
  const r = await api.delete<Envelope<unknown>>(`/notifications/${id}`);
  return r.data.data;
}
