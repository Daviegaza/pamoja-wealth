import { CheckCheck } from "lucide-react";
import { NotificationCard } from "@/components/cards/NotificationCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { useNotification } from "@/hooks/useNotification";
import { Pagination } from "@/components/common/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const { page, totalPages, paginated, goToPage } = usePagination(notifications, 12);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{unreadCount} unread notifications</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" leftIcon={<CheckCheck className="h-4 w-4" />} onClick={markAllAsRead}>Mark all as read</Button>
        )}
      </div>

      {paginated.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="You are all caught up." />
      ) : (
        <>
          <div className="card-base divide-y divide-gray-100 dark:divide-white/5">
            {paginated.map((n) => <NotificationCard key={n.id} notification={n} onClick={() => markAsRead(n.id)} />)}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
        </>
      )}
    </div>
  );
}
