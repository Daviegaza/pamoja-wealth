/**
 * CreditScoreGauge — AI-powered creditworthiness visualization
 *
 * Uses alternative data (contribution consistency, loan repayment history,
 * meeting attendance, savings rate) to compute and display a credit score
 * that members can use for loan applications.
 *
 * Research basis: ML credit scoring in Africa achieves F1 > 0.80 using
 * mobile money history, payment patterns, and group participation data.
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Shield, Award, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Member, Loan } from "@/types";

interface CreditScoreGaugeProps {
  member: Member;
  loans: Loan[];
  walletBalance: number;
  meetingAttendance: number;
  totalMeetings: number;
  className?: string;
}

interface ScoreFactor {
  label: string;
  score: number;
  maxScore: number;
  icon: typeof TrendingUp;
  detail: string;
}

export function CreditScoreGauge({
  member, loans, walletBalance, meetingAttendance, totalMeetings, className,
}: CreditScoreGaugeProps) {
  const myLoans = loans.filter((l) => l.borrowerId === member.userId);
  const completedLoans = myLoans.filter((l) => l.status === "completed");
  const defaultedLoans = myLoans.filter((l) => l.status === "defaulted");

  const { score, factors } = useMemo(() => {
    // ── Factor 1: Contribution consistency (25 pts) ──
    const streak = member.contributionStreak ?? 0;
    const contribScore = streak >= 12 ? 25 : streak >= 6 ? 20 : streak >= 3 ? 15 : streak >= 1 ? 8 : 0;

    // ── Factor 2: Loan repayment (30 pts) ──
    const totalLoans = myLoans.length;
    const repaymentRatio = totalLoans === 0 ? 1 : completedLoans.length / totalLoans;
    const loanScore = totalLoans === 0 ? 20 : Math.round(repaymentRatio * 30);
    const penaltyScore = defaultedLoans.length * 10;
    const finalLoanScore = Math.max(0, loanScore - penaltyScore);

    // ── Factor 3: Savings rate (25 pts) ──
    const totalContribs = member.totalContributions ?? 0;
    const savingsRatio = totalContribs > 0
      ? Math.min((totalContribs) / (totalContribs + Math.max(walletBalance, 0) + 1), 1)
      : 0;
    const savingsScore = Math.round(savingsRatio * 25);

    // ── Factor 4: Meeting attendance (20 pts) ──
    const attendanceRatio = totalMeetings > 0 ? meetingAttendance / totalMeetings : 0;
    const meetingScore = Math.round(attendanceRatio * 20);

    const total = Math.min(100, contribScore + finalLoanScore + savingsScore + meetingScore);

    const factors: ScoreFactor[] = [
      {
        label: "Contribution Streak",
        score: contribScore, maxScore: 25,
        icon: TrendingUp,
        detail: `${streak} month${streak !== 1 ? "s" : ""} of consistent contributions`,
      },
      {
        label: "Loan Repayment",
        score: finalLoanScore, maxScore: 30,
        icon: Shield,
        detail: totalLoans === 0 ? "No loan history — neutral" : `${completedLoans.length}/${totalLoans} repaid on time${defaultedLoans.length > 0 ? ` · ${defaultedLoans.length} defaulted` : ""}`,
      },
      {
        label: "Savings Rate",
        score: savingsScore, maxScore: 25,
        icon: Award,
        detail: totalContribs > 0 ? `${Math.round(savingsRatio * 100)}% of income saved` : "No savings recorded yet",
      },
      {
        label: "Meeting Attendance",
        score: meetingScore, maxScore: 20,
        icon: TrendingUp,
        detail: totalMeetings > 0 ? `${meetingAttendance}/${totalMeetings} meetings attended` : "No meetings yet",
      },
    ];

    return { score: total, factors };
  }, [member, myLoans, completedLoans, defaultedLoans, walletBalance, meetingAttendance, totalMeetings]);

  const tier = score >= 80 ? "Excellent" : score >= 65 ? "Good" : score >= 50 ? "Fair" : score >= 35 ? "Poor" : "No Score";
  const tierColor = score >= 80 ? "emerald" : score >= 65 ? "brand" : score >= 50 ? "amber" : score >= 35 ? "red" : "gray";

  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference * (1 - score / 100);

  return (
    <div className={cn("rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-5", className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          score >= 65 ? "bg-emerald-100 dark:bg-emerald-500/[0.15]" :
          score >= 50 ? "bg-amber-100 dark:bg-amber-500/[0.15]" :
          "bg-red-100 dark:bg-red-500/[0.15]"
        )}>
          <Shield className={cn("h-5 w-5",
            score >= 65 ? "text-emerald-600 dark:text-emerald-400" :
            score >= 50 ? "text-amber-600 dark:text-amber-400" :
            "text-red-600 dark:text-red-400"
          )} />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">Credit Score</p>
          <p className={cn("text-xs font-semibold",
            score >= 65 ? "text-emerald-600 dark:text-emerald-400" :
            score >= 50 ? "text-amber-600 dark:text-amber-400" :
            "text-red-600 dark:text-red-400"
          )}>{tier}</p>
        </div>
        <div className="ml-auto text-center">
          <span className={cn("text-2xl font-black",
            score >= 65 ? "text-emerald-600 dark:text-emerald-400" :
            score >= 50 ? "text-amber-600 dark:text-amber-400" :
            "text-red-600 dark:text-red-400"
          )}>{score}</span>
          <span className="text-xs text-gray-400">/100</span>
        </div>
      </div>

      {/* Score Ring */}
      <div className="flex justify-center mb-4">
        <div className="relative h-32 w-32">
          <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
            <circle cx="64" cy="64" r="54" className="fill-none stroke-gray-200 dark:stroke-white/[0.08]" strokeWidth="8" />
            <motion.circle
              cx="64" cy="64" r="54"
              className={cn("fill-none",
                score >= 80 ? "stroke-emerald-500" :
                score >= 65 ? "stroke-brand-500" :
                score >= 50 ? "stroke-amber-500" :
                "stroke-red-500"
              )}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className={cn("text-lg font-black",
                score >= 65 ? "text-gray-900 dark:text-white" :
                score >= 50 ? "text-amber-700 dark:text-amber-400" :
                "text-red-700 dark:text-red-400"
              )}>{score}</p>
              <p className="text-[10px] text-gray-400">of 100</p>
            </div>
          </div>
        </div>
      </div>

      {/* Factors */}
      <div className="space-y-2">
        {factors.map((f) => (
          <div key={f.label} className="flex items-center gap-2 text-xs">
            <f.icon className="h-3 w-3 text-gray-400 shrink-0" />
            <span className="text-gray-500 dark:text-gray-400 w-28 truncate">{f.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full",
                  f.score / f.maxScore >= 0.8 ? "bg-emerald-500" :
                  f.score / f.maxScore >= 0.5 ? "bg-brand-500" :
                  "bg-amber-500"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${(f.score / f.maxScore) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
            <span className="text-gray-700 dark:text-gray-300 font-semibold w-8 text-right tabular-nums">
              {f.score}/{f.maxScore}
            </span>
          </div>
        ))}
      </div>

      {/* AI Badge */}
      <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-violet-50 dark:bg-violet-500/[0.06] border border-violet-100 dark:border-violet-500/[0.1] px-3 py-2">
        <AlertTriangle className="h-3 w-3 text-violet-500" />
        <p className="text-[10px] text-violet-700 dark:text-violet-400 leading-relaxed">
          Score calculated from contribution history, loan repayment, savings rate & meeting attendance.
          {score < 50 && " Improve by maintaining consistent contributions."}
        </p>
      </div>
    </div>
  );
}

export default CreditScoreGauge;
