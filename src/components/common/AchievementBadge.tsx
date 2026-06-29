import { motion } from "framer-motion";
import { Check, Lock, Trophy, Star, Flame, CreditCard, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Member, Loan } from "@/types";

export function AchievementBadge({
  icon,
  label,
  earned,
  date,
}: {
  icon: React.ReactNode;
  label: string;
  earned: boolean;
  date?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      className={cn(
        "relative flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 min-w-0",
        earned
          ? "bg-gradient-to-br from-amber-50 to-amber-50/50 dark:from-amber-500/[0.06] dark:to-amber-400/[0.03] border-amber-200 dark:border-amber-500/[0.12]"
          : "bg-gray-50/50 dark:bg-white/[0.02] border-gray-100 dark:border-white/[0.04] opacity-60"
      )}
    >
      {/* Earned glow */}
      {earned && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/[0.03] to-transparent pointer-events-none" />
      )}

      {/* Icon container */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
          earned
            ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-glow-sm"
            : "bg-gray-200 dark:bg-white/[0.06] text-gray-400 dark:text-gray-500"
        )}
      >
        {earned ? icon : <Lock className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-xs font-semibold truncate",
            earned ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"
          )}
        >
          {label}
        </p>
        {earned && date && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{date}</p>
        )}
        {!earned && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Not yet earned</p>
        )}
      </div>

      {/* Status indicator */}
      {earned && (
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 dark:bg-emerald-400/10">
          <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
        </div>
      )}
    </motion.div>
  );
}

export interface Achievement {
  icon: React.ReactNode;
  label: string;
  earned: boolean;
  date?: string;
}

/**
 * Computes all achievements for a given member.
 *
 * @param member - The member record (contains contributionStreak, totalContributions, chamaId).
 * @param userId - The member's userId for cross-referencing loans and RSVPs.
 * @param loans  - All loans in the system (used to check for completed loans by this user).
 * @param members - All members in the system (used to determine top 20% contributors in the same chama).
 * @param rsvps  - RSVPs record from the meeting store.
 */
export function getAchievements(
  member: Member,
  userId: string,
  loans: Loan[],
  members: Member[],
  rsvps: Record<string, { attending: string[]; declined: string[] }>
): Achievement[] {
  const myLoans = loans.filter((l) => l.borrowerId === userId);
  const hasCompletedLoan = myLoans.some((l) => l.status === "completed");

  // Top 20% contributor in same chama
  const peers = members.filter((m) => m.chamaId === member.chamaId);
  const sorted = [...peers].sort((a, b) => b.totalContributions - a.totalContributions);
  const top20Index = Math.max(Math.ceil(sorted.length * 0.2) - 1, 0);
  const top20Threshold = sorted[top20Index]?.totalContributions ?? 0;
  const isTopContributor = member.totalContributions >= top20Threshold && peers.length > 1;

  // Meeting attendance count from RSVPs
  const attendedCount = Object.values(rsvps).filter((r) => r.attending.includes(userId)).length;
  const isMeetingRegular = attendedCount >= 5;

  function formatDate(ts: string): string {
    return new Date(ts).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
  }

  return [
    {
      icon: <Trophy className="h-4 w-4" />,
      label: "First Contribution",
      earned: member.totalContributions > 0,
      date: member.totalContributions > 0 ? formatDate(member.joinedAt) : undefined,
    },
    {
      icon: <Flame className="h-4 w-4" />,
      label: "3-Month Streak",
      earned: member.contributionStreak >= 3,
    },
    {
      icon: <Flame className="h-4 w-4" />,
      label: "6-Month Streak",
      earned: member.contributionStreak >= 6,
    },
    {
      icon: <Star className="h-4 w-4" />,
      label: "12-Month Streak",
      earned: member.contributionStreak >= 12,
    },
    {
      icon: <CreditCard className="h-4 w-4" />,
      label: "Loan Repaid",
      earned: hasCompletedLoan,
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: "Top Contributor",
      earned: isTopContributor,
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      label: "Meeting Regular",
      earned: isMeetingRegular,
    },
  ];
}
