import type { Chama } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Users, TrendingUp } from "lucide-react";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function ChamaCard({ chama }: { chama: Chama }) {
  const positive = chama.growthRate >= 0;
  return (
    <motion.div whileHover={{ y: -3 }}>
      <Link
        to={`/chamas/${chama.id}`}
        className="card-hover p-5 block group border-l-4 border-l-brand-500/0 hover:border-l-brand-500/70 transition-all"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar src={chama.logoUrl} name={chama.name} size="lg" ring="brand" />
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {chama.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {chama.category} · {chama.location}
              </p>
            </div>
          </div>
          <Badge variant={chama.status === "active" ? "success" : "default"} dot={chama.status === "active"} className="capitalize">
            {chama.status}
          </Badge>
        </div>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{chama.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Funds</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(chama.totalFunds)}</p>
          </div>
          <div className="text-right">
            <p className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <Users className="h-3.5 w-3.5" /> {chama.memberCount}
            </p>
            <p
              className={cn(
                "inline-flex items-center gap-1 text-xs font-semibold mt-1",
                positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
              )}
            >
              <TrendingUp className="h-3.5 w-3.5" /> {formatPercent(chama.growthRate)}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
