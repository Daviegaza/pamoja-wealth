import type { Member } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";

export function MemberCard({ member }: { member: Member }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="card-hover p-5 flex items-center gap-4">
      <Avatar
        src={member.avatarUrl}
        name={member.fullName}
        size="lg"
        ring="brand"
        status={member.status === "active" ? "online" : "offline"}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{member.fullName}</p>
          <Badge variant={member.status === "active" ? "success" : "default"} className="capitalize">
            {member.status}
          </Badge>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">
          {member.role.replace("_", " ")} · Joined {formatDate(member.joinedAt)}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {member.shares} shares
          </span>
          {member.contributionStreak >= 3 && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Flame className="h-3 w-3" /> {member.contributionStreak}mo streak
            </span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Contributed</p>
        <p className="font-bold text-sm text-gray-900 dark:text-white">{formatCurrency(member.totalContributions)}</p>
      </div>
    </motion.div>
  );
}
