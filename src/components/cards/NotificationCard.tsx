import type { Notification } from "@/types";
import { AlertCircle, Bell, CheckCircle2, CreditCard, Info, Vote, Wallet, XCircle } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";

const iconMap = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  error: XCircle,
  loan: CreditCard,
  meeting: Bell,
  vote: Vote,
  wallet: Wallet,
};

const colorMap: Record<string, string> = {
  info: "text-blue-600 bg-blue-50 dark:bg-blue-500/[0.08] ring-blue-500/20",
  success: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/[0.08] ring-emerald-500/20",
  warning: "text-amber-600 bg-amber-50 dark:bg-amber-500/[0.08] ring-amber-500/20",
  error: "text-red-600 bg-red-50 dark:bg-red-500/[0.08] ring-red-500/20",
  loan: "text-purple-600 bg-purple-50 dark:bg-purple-500/[0.08] ring-purple-500/20",
  meeting: "text-cyan-600 bg-cyan-50 dark:bg-cyan-500/[0.08] ring-cyan-500/20",
  vote: "text-orange-600 bg-orange-50 dark:bg-orange-500/[0.08] ring-orange-500/20",
  wallet: "text-brand-600 bg-brand-50 dark:bg-brand-500/[0.08] ring-brand-500/20",
};

const borderColorMap: Record<string, string> = {
  info: "border-l-blue-500",
  success: "border-l-emerald-500",
  warning: "border-l-amber-500",
  error: "border-l-red-500",
  loan: "border-l-purple-500",
  meeting: "border-l-cyan-500",
  vote: "border-l-orange-500",
  wallet: "border-l-brand-500",
};

export function NotificationCard({ notification, onClick }: { notification: Notification; onClick?: () => void }) {
  const Icon = iconMap[notification.type];

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-start gap-3 rounded-xl p-3.5 transition-all duration-200 border-l-4 hover:bg-gray-50 dark:hover:bg-white/[0.04]",
        !notification.isRead
          ? cn("bg-brand-50/30 dark:bg-brand-500/[0.03]", borderColorMap[notification.type])
          : "border-l-transparent"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1",
          colorMap[notification.type]
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{notification.title}</p>
          {!notification.isRead && (
            <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse-soft shrink-0" />
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-[11px] font-medium text-gray-400 mt-1.5">{formatRelativeTime(notification.createdAt)}</p>
      </div>
    </button>
  );
}
