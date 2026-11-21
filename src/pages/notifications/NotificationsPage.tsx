import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteNotification, listNotifications, markAllRead, markRead } from "@/api/notifications";
import { Empty, LoadError, Loading, PageHeader } from "@/components/records/ui";
import { Button } from "@/components/ui/Button";
import { formatRelativeTime } from "@/lib/utils";
import { apiErrorMessage } from "@/lib/download";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const list = useQuery({ queryKey: ["notifications", page], queryFn: () => listNotifications({ page, pageSize: 20 }) });
  const refresh = () => void qc.invalidateQueries({ queryKey: ["notifications"] });

  const readOne = useMutation({ mutationFn: markRead, onSuccess: refresh });
  const readAll = useMutation({
    mutationFn: markAllRead,
    onSuccess: refresh,
    onError: (err) => toast.error(apiErrorMessage(err)),
  });
  const remove = useMutation({
    mutationFn: deleteNotification,
    onSuccess: refresh,
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const totalPages = list.data?.meta?.totalPages ?? 1;

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Notifications"
        actions={<Button variant="outline" size="sm" isLoading={readAll.isPending} onClick={() => readAll.mutate()}>Mark all as read</Button>}
      />
      {list.isLoading ? (
        <Loading />
      ) : list.isError ? (
        <LoadError message={apiErrorMessage(list.error, "Could not load notifications.")} onRetry={() => list.refetch()} />
      ) : (list.data?.items.length ?? 0) === 0 ? (
        <Empty title="You're all caught up" />
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {list.data!.items.map((n) => (
            <li key={n.id} className="flex items-start gap-3 py-3">
              <span className={cn("mt-1.5 h-2 w-2 rounded-full shrink-0", n.isRead ? "bg-transparent" : "bg-brand-500")} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm", n.isRead ? "text-gray-600 dark:text-gray-400" : "font-semibold text-gray-900 dark:text-white")}>
                  {n.actionUrl ? <Link to={n.actionUrl} onClick={() => !n.isRead && readOne.mutate(n.id)} className="hover:underline">{n.title}</Link> : n.title}
                </p>
                <p className="text-sm text-gray-500">{n.message}</p>
                <p className="text-xs text-gray-400">{formatRelativeTime(n.createdAt)}</p>
              </div>
              <div className="flex gap-1">
                {!n.isRead && <Button size="sm" variant="ghost" onClick={() => readOne.mutate(n.id)}>Mark read</Button>}
                <Button size="sm" variant="ghost" aria-label={`Delete notification ${n.title}`} onClick={() => remove.mutate(n.id)}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Page {page} of {totalPages}</span>
          <span className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </span>
        </div>
      )}
    </div>
  );
}
