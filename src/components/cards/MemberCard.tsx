import type { Member, Loan } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn, clamp, formatCurrency, formatDate } from "@/lib/utils";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";

export function computeTrustScore(
  member: Member,
  allLoans: Loan[],
  isVerified: boolean = false
): number {
  // Contribution history: 40 points (based on contributionStreak / 12, scaled)
  const contributionScore = Math.min(40, (member.contributionStreak / 12) * 10);

  // Loan repayment: 30 points (100 if no defaulted loans, scaled down if defaulted)
  const memberLoans = allLoans.filter((l) => l.borrowerId === member.userId);
  const defaultedCount = memberLoans.filter((l) => l.status === "defaulted").length;
  const repaymentScore =
    memberLoans.length === 0
      ? 30
      : 30 * (1 - defaultedCount / memberLoans.length);

  // Account age: 15 points (based on member.joinedAt, more years = more points)
  const msSinceJoined = Date.now() - new Date(member.joinedAt).getTime();
  const yearsSinceJoined = msSinceJoined / (365.25 * 24 * 60 * 60 * 1000);
  const ageScore = Math.min(15, yearsSinceJoined * 5);

  // Verification: 15 points (15 if verified, 0 if not)
  const verificationScore = isVerified ? 15 : 0;

  return Math.round(
    clamp(contributionScore + repaymentScore + ageScore + verificationScore, 0, 100)
  );
}

const trustBadgeVariant = (score: number): "success" | "warning" | "danger" => {
  if (score >= 80) return "success";
  if (score >= 50) return "warning";
  return "danger";
};

const trustDotColor = (score: number): string => {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-500";
};

export function MemberCard({ member, trustScore }: { member: Member; trustScore?: number }) {
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
          {trustScore !== undefined && (
            <span
              className={cn("h-2 w-2 rounded-full shrink-0", trustDotColor(trustScore))}
              title={`Trust: ${trustScore}`}
            />
          )}
          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{member.fullName}</p>
          <Badge variant={member.status === "active" ? "success" : "default"} className="capitalize">
            {member.status}
          </Badge>
          {trustScore !== undefined && (
            <Badge variant={trustBadgeVariant(trustScore)} className="text-[10px]">
              Trust: {trustScore}
            </Badge>
          )}
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
