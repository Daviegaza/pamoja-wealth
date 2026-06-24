import type { ActivityItem } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeTime } from "@/lib/utils";

export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  return (
    <div className="space-y-5">
      {items.map((item, idx) => (
        <div key={item.id} className="flex gap-3">
          <div className="relative flex flex-col items-center">
            <Avatar src={item.actorAvatar} name={item.actorName} size="sm" />
            {idx < items.length - 1 && <div className="w-px flex-1 bg-gray-100 dark:bg-white/10 mt-2" />}
          </div>
          <div className="pb-5">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold text-gray-900 dark:text-white">{item.actorName}</span> {item.action}{" "}
              <span className="font-medium text-gray-900 dark:text-white">{item.target}</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(item.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
