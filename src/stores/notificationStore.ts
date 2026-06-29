import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Notification } from "@/types";
import { getMockDatabase } from "@/mock";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const initial = getMockDatabase().notifications.slice(0, 50);

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: initial,
      unreadCount: initial.filter((n) => !n.isRead).length,
      markAsRead: (id) => {
        const updated = get().notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
        set({ notifications: updated, unreadCount: updated.filter((n) => !n.isRead).length });
      },
      markAllAsRead: () => {
        set({ notifications: get().notifications.map((n) => ({ ...n, isRead: true })), unreadCount: 0 });
      },
    }),
    { name: "pamoja-notifications" }
  )
);
