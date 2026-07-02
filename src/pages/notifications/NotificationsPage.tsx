import { CheckCheck, Bell, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NotificationCard } from "@/components/cards/NotificationCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { usePagination } from "@/hooks/usePagination";
import {
  listNotifications,
  markAllRead,
  markRead,
  type NotificationDTO,
} from "@/api/notifications";
import { useSocketEvent } from "@/lib/socket";
import type { Notification } from "@/types";

function toDomainNotification(n: NotificationDTO): Notification {
  return {
    id: n.id,
    userId: n.userId,
    type: n.type,
    title: n.title,
    message: n.message,
    createdAt: n.createdAt,
    isRead: n.isRead,
    actionUrl: n.actionUrl ?? undefined,
  };
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: () => listNotifications(),
  });

  useSocketEvent("notification:new", () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications: Notification[] = (query.data?.items ?? []).map(toDomainNotification);
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const { page, totalPages, paginated, goToPage } = usePagination(notifications, 12);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {unreadCount} unread notifications
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CheckCheck className="h-4 w-4" />}
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {query.isLoading ? (
        <div className="card-base p-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Loading notifications...
        </div>
      ) : query.isError ? (
        <EmptyState
          icon={AlertCircle}
          title="Could not load notifications"
          description="Please check your connection and try again."
        />
      ) : paginated.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="You're all caught up — no notifications yet"
        />
      ) : (
        <>
          <div className="card-base divide-y divide-gray-100 dark:divide-white/5">
            {paginated.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onClick={() => {
                  if (!n.isRead) markReadMutation.mutate(n.id);
                  if (n.actionUrl) navigate(n.actionUrl);
                }}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
        </>
      )}
    </div>
  );
}
