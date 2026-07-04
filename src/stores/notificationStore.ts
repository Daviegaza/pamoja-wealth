import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Notification } from "@/types";
import { getMockDatabase } from "@/mock";
import {
  listNotifications as apiList,
  markRead as apiMarkRead,
  markAllRead as apiMarkAllRead,
  deleteNotification as apiDelete,
} from "@/api/notifications";

import { USE_MOCKS } from "@/lib/env";
void USE_MOCKS;

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  sync: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  push: (n: Notification) => void;
}

const initial = getMockDatabase().notifications.slice(0, 50);

function recount(list: Notification[]): number {
  return list.filter((n) => !n.isRead).length;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: initial,
      unreadCount: recount(initial),
      isLoading: false,

      sync: async () => {
        if (USE_MOCKS) return;
        set({ isLoading: true });
        try {
          const { items } = await apiList({ page: 1, pageSize: 50 });
          const mapped: Notification[] = items.map((n) => ({
            id: n.id,
            userId: n.userId,
            type: n.type as Notification["type"],
            title: n.title,
            message: n.message,
            isRead: n.isRead,
            actionUrl: n.actionUrl ?? undefined,
            createdAt: n.createdAt,
          }));
          set({ notifications: mapped, unreadCount: recount(mapped) });
        } catch (err) {
          console.warn("[notificationStore] sync failed", err);
        } finally {
          set({ isLoading: false });
        }
      },

      markAsRead: async (id) => {
        const updated = get().notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
        set({ notifications: updated, unreadCount: recount(updated) });
        if (USE_MOCKS) return;
        try { await apiMarkRead(id); } catch (err) { console.warn("[notificationStore] markRead failed", err); }
      },

      markAllAsRead: async () => {
        const updated = get().notifications.map((n) => ({ ...n, isRead: true }));
        set({ notifications: updated, unreadCount: 0 });
        if (USE_MOCKS) return;
        try { await apiMarkAllRead(); } catch (err) { console.warn("[notificationStore] markAllRead failed", err); }
      },

      remove: async (id) => {
        const filtered = get().notifications.filter((n) => n.id !== id);
        set({ notifications: filtered, unreadCount: recount(filtered) });
        if (USE_MOCKS) return;
        try { await apiDelete(id); } catch (err) { console.warn("[notificationStore] delete failed", err); }
      },

      push: (n) => {
        const list = [n, ...get().notifications];
        set({ notifications: list, unreadCount: recount(list) });
      },
    }),
    { name: "pamoja-notifications" }
  )
);
