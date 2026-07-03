import { motion } from "framer-motion";
import {
  Award, Flame, Star, Shield, Target, Gift, Zap,
  Users, Wallet, TrendingUp, Heart, Clock, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
  progress?: number; // 0-100
  isEarned: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface AchievementBadgesProps {
  badges: Badge[];
  className?: string;
}

const iconMap: Record<string, typeof Award> = {
  flame: Flame, star: Star, shield: Shield, target: Target,
  gift: Gift, zap: Zap, users: Users, wallet: Wallet,
  trending: TrendingUp, heart: Heart, clock: Clock, award: Award,
};

const rarityColors: Record<string, string> = {
  common: "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
  rare: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  epic: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
  legendary: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
};

const rarityGlow: Record<string, string> = {
  common: "",
  rare: "shadow-blue-200 dark:shadow-blue-900/50",
  epic: "shadow-purple-200 dark:shadow-purple-900/50",
  legendary: "shadow-amber-200 dark:shadow-amber-900/50 shadow-lg",
};

export function AchievementBadges({ badges, className }: AchievementBadgesProps) {
  const earned = badges.filter((b) => b.isEarned);
  const locked = badges.filter((b) => !b.isEarned);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Earned badges grid */}
      {earned.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {earned.map((badge) => {
            const Icon = iconMap[badge.icon] ?? Award;
            return (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.1, y: -2 }}
                className={cn(
                  "relative flex flex-col items-center gap-1 p-3 rounded-xl border text-center cursor-default",
                  rarityColors[badge.rarity],
                  rarityGlow[badge.rarity],
                )}
              >
                <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">
                  {badge.name}
                </span>
                {badge.rarity === "legendary" && (
                  <span className="absolute -top-1 -right-1 text-xs">✨</span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Locked badges */}
      {locked.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Badges to unlock
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {locked.map((badge) => {
              const Icon = iconMap[badge.icon] ?? Award;
              return (
                <div
                  key={badge.id}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-center opacity-50"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className="text-xs font-medium text-gray-400 leading-tight">
                    {badge.name}
                  </span>
                  {badge.progress !== undefined && badge.progress > 0 && (
                    <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
