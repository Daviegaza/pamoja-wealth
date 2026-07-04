/**
 * MemberEngagementPanel — Gamification dashboard
 *
 * Shows streaks, milestones, leaderboards, and achievement badges
 * to boost member engagement and retention.
 *
 * Research basis: SACCOs with gamification see 30-40% retention increases.
 * Push notifications + milestones in Swahili drive 45%+ engagement.
 */

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy, Flame, Star, TrendingUp, Users, Calendar, Wallet,
  Award, Target, Gift, Zap, ArrowUp, Medal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import type { Member, Loan } from "@/types";
import { useAuth } from "@/hooks/useAuth";

interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar: string;
  score: number;
  badge: string;
}

interface Props {
  members: Member[];
  loans: Loan[];
  className?: string;
}

export function MemberEngagementPanel({ members, loans, className }: Props) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"streaks" | "leaderboard" | "milestones">("streaks");

  const leaderboard: LeaderboardEntry[] = useMemo(() => {
    return members
      .map((m) => {
        const memberLoans = loans.filter((l) => l.borrowerId === m.userId);
        const completedLoans = memberLoans.filter((l) => l.status === "completed");
        const score =
          (m.contributionStreak ?? 0) * 5 +
          completedLoans.length * 10 +
          Math.floor((m.totalContributions ?? 0) / 1000);
        const badge = score >= 80 ? "Platinum" : score >= 50 ? "Gold" : score >= 30 ? "Silver" : "Bronze";
        return { userId: m.userId, name: m.fullName, avatar: m.avatarUrl ?? "", score, badge };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [members, loans]);

  const myEntry = leaderboard.find((e) => e.userId === user?.id);
  const myRank = myEntry ? leaderboard.indexOf(myEntry) + 1 : null;

  const milestones = useMemo(() => {
    const list: Array<{ icon: typeof Trophy; label: string; achieved: boolean; progress?: number }> = [];
    const me = members.find((m) => m.userId === user?.id);
    if (!me) return list;

    list.push({
      icon: Flame, label: "3-month contribution streak",
      achieved: (me.contributionStreak ?? 0) >= 3,
      progress: Math.min(100, ((me.contributionStreak ?? 0) / 3) * 100),
    });
    list.push({
      icon: Star, label: "6-month contribution streak",
      achieved: (me.contributionStreak ?? 0) >= 6,
      progress: Math.min(100, ((me.contributionStreak ?? 0) / 6) * 100),
    });
    list.push({
      icon: Trophy, label: "12-month contribution streak",
      achieved: (me.contributionStreak ?? 0) >= 12,
      progress: Math.min(100, ((me.contributionStreak ?? 0) / 12) * 100),
    });
    list.push({
      icon: Wallet, label: "KES 100k total contributions",
      achieved: (me.totalContributions ?? 0) >= 100000,
      progress: Math.min(100, ((me.totalContributions ?? 0) / 100000) * 100),
    });
    list.push({
      icon: Gift, label: "First loan fully repaid",
      achieved: loans.some((l) => l.borrowerId === user?.id && l.status === "completed"),
    });
    list.push({
      icon: Target, label: "Attend 5 meetings",
      achieved: false, progress: 0,
    });

    return list;
  }, [members, loans, user?.id]);

  const tabs = [
    { key: "streaks" as const, label: "Streaks", icon: Flame },
    { key: "leaderboard" as const, label: "Top Members", icon: Trophy },
    { key: "milestones" as const, label: "Milestones", icon: Award },
  ];

  return (
    <div className={cn("rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/[0.06] dark:to-orange-500/[0.04] px-5 py-4 border-b border-amber-100 dark:border-amber-500/10">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Community Engagement</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-white/[0.05]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors",
              activeTab === tab.key
                ? "text-amber-700 dark:text-amber-400 border-b-2 border-amber-500"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "streaks" && (
          <div className="space-y-3">
            {members.slice(0, 5).map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
                <span className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                  i === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" :
                  i === 1 ? "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400" :
                  i === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400" :
                  "text-gray-400"
                )}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {m.fullName} {m.userId === user?.id && "(You)"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Flame className="h-3 w-3 text-orange-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {m.contributionStreak ?? 0} month streak
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(m.totalContributions ?? 0)}
                  </p>
                  <p className="text-[10px] text-gray-400">contributed</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="space-y-2">
            {leaderboard.slice(0, 5).map((entry, i) => (
              <div key={entry.userId} className={cn(
                "flex items-center gap-3 rounded-xl p-2.5 transition-colors",
                entry.userId === user?.id && "bg-amber-50 dark:bg-amber-500/[0.06] border border-amber-200 dark:border-amber-500/20"
              )}>
                <div className="relative">
                  <span className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                    i === 0 ? "bg-amber-400 text-white" :
                    i === 1 ? "bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200" :
                    i === 2 ? "bg-orange-300 text-orange-800" :
                    "bg-gray-100 text-gray-500 dark:bg-white/10"
                  )}>
                    {i + 1}
                  </span>
                  {i === 0 && <Medal className="absolute -top-1 -right-1 h-3 w-3 text-amber-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {entry.name} {entry.userId === user?.id && "(You)"}
                  </p>
                  <p className="text-[10px] text-gray-400">{entry.badge} tier</p>
                </div>
                <span className={[
                  "rounded-full px-2 py-0.5 text-[10px] font-bold",
                  entry.badge === "Platinum" ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400" :
                  entry.badge === "Gold" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" :
                  entry.badge === "Silver" ? "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400" :
                  "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
                ].join(" ")}>{entry.score} pts</span>
              </div>
            ))}
            {myRank && myRank > 5 && (
              <div className="flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-500/[0.06] p-2.5 mt-2 border border-amber-200 dark:border-amber-500/20">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">{myRank}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">You</p>
                  <p className="text-[10px] text-gray-400">{myEntry?.badge} tier</p>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">{myEntry?.score} pts</span>
              </div>
            )}
          </div>
        )}

        {activeTab === "milestones" && (
          <div className="space-y-2">
            {milestones.map((m, i) => (
              <div key={i} className={cn(
                "flex items-center gap-3 rounded-xl p-3 transition-colors",
                m.achieved ? "bg-emerald-50 dark:bg-emerald-500/[0.06] border border-emerald-200 dark:border-emerald-500/20" :
                "border border-gray-100 dark:border-white/[0.05]"
              )}>
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  m.achieved ? "bg-emerald-100 dark:bg-emerald-500/[0.15]" : "bg-gray-100 dark:bg-white/[0.05]"
                )}>
                  <m.icon className={cn("h-4 w-4",
                    m.achieved ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-semibold",
                    m.achieved ? "text-emerald-800 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"
                  )}>{m.label}</p>
                  {m.progress !== undefined && !m.achieved && (
                    <div className="mt-1.5 h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-amber-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${m.progress}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  )}
                </div>
                {m.achieved ? (
                  <Zap className="h-4 w-4 text-amber-500" />
                ) : (
                  <span className="text-[10px] text-gray-400">{m.progress ?? 0}%</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MemberEngagementPanel;
