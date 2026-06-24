import { useNotificationStore } from "@/stores/notificationStore";

export function useNotification() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
