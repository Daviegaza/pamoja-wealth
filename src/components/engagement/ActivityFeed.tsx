import { motion } from "framer-motion";
import {
  TrendingUp, Users, Vote, Calendar, Bell, Award,
  HandCoins, MessageCircle, FileText, Heart,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";

type ActivityType =
  | "contribution"
  | "new_member"
  | "loan_approved"
  | "meeting_scheduled"
  | "vote_started"
  | "goal_achieved"
  | "milestone"
  | "donation"
  | "chat_message"
  | "document_added"
  | "reminder";

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  chamaName: string;
  actorName: string;
  actorAvatar?: string;
  amount?: number;
  timestamp: string;
  isRead: boolean;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
}

const activityConfig: Record<ActivityType, { icon: typeof TrendingUp; color: string; bg: string }> = {
  contribution: { icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
  new_member: { icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/30" },
  loan_approved: { icon: HandCoins, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/30" },
  meeting_scheduled: { icon: Calendar, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/30" },
  vote_started: { icon: Vote, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/30" },
  goal_achieved: { icon: Award, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/30" },
  milestone: { icon: Zap, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/30" },
  donation: { icon: Heart, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/30" },
  chat_message: { icon: MessageCircle, color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-900/30" },
  document_added: { icon: FileText, color: "text-gray-600", bg: "bg-gray-50 dark:bg-gray-800" },
  reminder: { icon: Bell, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/30" },
};

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        <Zap className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        No activity yet — start contributing to see your feed!
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {activities.map((activity, i) => {
        const config = activityConfig[activity.type] ?? activityConfig.reminder;
        const Icon = config.icon;
        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className={cn(
              "flex items-start gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-750",
              !activity.isRead && "bg-brand-50/50 dark:bg-brand-900/10",
            )}
          >
            {/* Icon */}
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", config.bg)}>
              <Icon className={cn("w-4 h-4", config.color)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.title}
                </p>
                {!activity.isRead && (
                  <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{activity.description}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-gray-400">{activity.chamaName}</span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span className="text-xs text-gray-400">{formatRelativeTime(activity.timestamp)}</span>
              </div>
            </div>

            {/* Amount badge */}
            {activity.amount && activity.amount > 0 && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg shrink-0">
                +{activity.amount.toLocaleString()} KES
              </span>
            )}
          </motion.div>
        )}
      )}
    </div>
  );
}
