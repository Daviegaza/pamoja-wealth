import { motion } from "framer-motion";
import { Trophy, Medal, TrendingUp, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";

interface LeaderboardEntry {
  id: string;
  name: string;
  avatarUrl?: string;
  chamaName: string;
  amount: number;
  rank: number;
  change: "up" | "down" | "same";
  streak: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
  subtitle?: string;
  type?: "contributions" | "savings" | "streaks";
}

const medalColors = [
  "text-amber-500 bg-amber-50 dark:bg-amber-900/30",
  "text-gray-400 bg-gray-50 dark:bg-gray-800",
  "text-orange-600 bg-orange-50 dark:bg-orange-900/30",
];

export function Leaderboard({ entries, title = "Top Contributors", subtitle = "This month", type = "contributions" }: LeaderboardProps) {
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="p-5 grid grid-cols-3 gap-3 text-center">
        {top3.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="space-y-2"
          >
            <div className="relative mx-auto w-12 h-12">
              <Avatar src={entry.avatarUrl} name={entry.name} size="lg" />
              <div
                className={cn(
                  "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white dark:border-gray-800",
                  medalColors[i],
                )}
              >
                {i + 1}
              </div>
            </div>
            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
              {entry.name.split(" ")[0]}
            </p>
            <p className="text-xs text-gray-500 truncate">{entry.chamaName}</p>
            <p className="text-sm font-bold text-emerald-600">
              {type === "streaks" ? `${entry.streak}d 🔥` : formatCurrency(entry.amount)}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Rest of the list */}
      {rest.length > 0 && (
        <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
          {rest.map((entry, i) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-750"
            >
              <span className="w-6 text-center text-sm font-bold text-gray-400">
                {entry.rank}
              </span>
              <Avatar src={entry.avatarUrl} name={entry.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {entry.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{entry.chamaName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {type === "streaks" ? `${entry.streak}d` : formatCurrency(entry.amount)}
                </p>
                <span className="inline-flex items-center gap-0.5 text-xs">
                  {entry.change === "up" && <ArrowUp className="w-3 h-3 text-emerald-500" />}
                  {entry.change === "down" && <ArrowDown className="w-3 h-3 text-red-500" />}
                  {entry.change === "same" && <Minus className="w-3 h-3 text-gray-400" />}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
