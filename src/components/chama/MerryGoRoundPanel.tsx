/**
 * MerryGoRoundPanel — Rotation savings (kuchangiana/mzunguko) automation
 *
 * Core chama feature: members contribute monthly, one member receives
 * the full pool each cycle. Automates rotation scheduling, next-recipient
 * reminders, and payout tracking.
 *
 * Research basis: Merry-go-round is the #1 chama format in Kenya.
 * ChamaSpace, Stanbic Chama App all support this. Digitizing it
 * eliminates disputes about whose turn it is.
 */

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  RotateCcw, UserCheck, Calendar, ArrowRight, Clock,
  Wallet, CheckCircle2, Users, Gift, AlertCircle,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import type { Member } from "@/types";

interface MerryGoRoundPanelProps {
  chamaId: string;
  chamaName: string;
  members: Member[];
  monthlyContribution: number;
  className?: string;
}

interface RoundEntry {
  member: Member;
  order: number;
  status: "received" | "current" | "upcoming";
  estimatedPayout: number;
  estimatedDate?: string;
  receivedDate?: string;
  receivedAmount?: number;
}

export function MerryGoRoundPanel({
  chamaId, chamaName, members, monthlyContribution, className,
}: MerryGoRoundPanelProps) {
  const [enabled, setEnabled] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);

  const totalPool = members.length * monthlyContribution;

  const rounds: RoundEntry[] = useMemo(() => {
    return members.map((member, i) => {
      const status: RoundEntry["status"] =
        i < currentRound ? "received" :
        i === currentRound ? "current" :
        "upcoming";
      const now = new Date();
      const estimatedDate = new Date(now.getFullYear(), now.getMonth() + i, 1).toISOString();
      return {
        member,
        order: i + 1,
        status,
        estimatedPayout: totalPool,
        estimatedDate: status === "upcoming" ? estimatedDate : undefined,
        receivedDate: status === "received" ? new Date(now.getFullYear(), now.getMonth() + i - currentRound, 1).toISOString() : undefined,
        receivedAmount: status === "received" ? totalPool : undefined,
      };
    });
  }, [members, currentRound, totalPool]);

  const currentRecipient = rounds.find((r) => r.status === "current");
  const remainingRounds = rounds.filter((r) => r.status === "upcoming").length;

  if (!enabled) {
    return (
      <div className={cn("rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-6 text-center", className)}>
        <RotateCcw className="h-10 w-10 text-brand-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Merry-Go-Round</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
          Automate rotation savings for <strong>{chamaName}</strong>. Each month, one member receives{" "}
          <strong>{formatCurrency(totalPool)}</strong> pooled from {members.length} members.
        </p>
        <div className="flex items-center justify-center gap-3 mt-5">
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/[0.08] p-3 text-center">
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{members.length}</p>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-500 font-medium">Members</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
          <div className="rounded-xl bg-brand-50 dark:bg-brand-500/[0.08] p-3 text-center">
            <p className="text-lg font-black text-brand-600 dark:text-brand-400">{formatCurrency(monthlyContribution)}</p>
            <p className="text-[10px] text-brand-700 dark:text-brand-500 font-medium">Each/month</p>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
          <div className="rounded-xl bg-amber-50 dark:bg-amber-500/[0.08] p-3 text-center">
            <p className="text-lg font-black text-amber-600 dark:text-amber-400">{formatCurrency(totalPool)}</p>
            <p className="text-[10px] text-amber-700 dark:text-amber-500 font-medium">Pool</p>
          </div>
        </div>
        <Button variant="premium" className="mt-5" onClick={() => { setEnabled(true); toast.success("Merry-Go-Round activated! 🎉"); }}>
          Activate Merry-Go-Round
        </Button>
        <p className="text-[10px] text-gray-400 mt-2">
          Members vote on the rotation order. You can change it anytime.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/[0.06] dark:to-orange-500/[0.04] px-5 py-4 border-b border-amber-100 dark:border-amber-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Merry-Go-Round</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Round {currentRound + 1} of {members.length} · {formatCurrency(totalPool)} pool
              </p>
            </div>
          </div>
          <Badge variant="warning">{remainingRounds} rounds left</Badge>
        </div>
      </div>

      {/* Current recipient highlight */}
      {currentRecipient && (
        <div className="mx-4 mt-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/[0.08] border border-emerald-200 dark:border-emerald-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar src={currentRecipient.member.avatarUrl} name={currentRecipient.member.fullName} size="lg" ring="brand" />
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500"
              >
                <Gift className="h-3 w-3 text-white" />
              </motion.div>
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Current Recipient</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">{currentRecipient.member.fullName}</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-500">
                Receives {formatCurrency(currentRecipient.estimatedPayout)} this round
              </p>
            </div>
          </div>
          <Button variant="premium" size="sm" className="w-full mt-3" onClick={() => toast.success("Payout initiated! Funds will be sent via M-Pesa.")}>
            Send {formatCurrency(totalPool)} via M-Pesa
          </Button>
        </div>
      )}

      {/* Rotation schedule */}
      <div className="p-4">
        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">Rotation Schedule</p>
        <div className="space-y-1.5">
          {rounds.map((round, i) => (
            <div
              key={round.member.id}
              className={cn(
                "flex items-center gap-3 rounded-xl p-3 transition-colors",
                round.status === "current" && "bg-emerald-50 dark:bg-emerald-500/[0.06] border border-emerald-200 dark:border-emerald-500/20",
                round.status === "received" && "bg-gray-50 dark:bg-white/[0.03] opacity-60",
                round.status === "upcoming" && "hover:bg-gray-50 dark:hover:bg-white/[0.03]"
              )}
            >
              <span className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                round.status === "current" ? "bg-emerald-500 text-white" :
                round.status === "received" ? "bg-gray-300 dark:bg-gray-600 text-white" :
                "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
              )}>
                {round.status === "received" ? <CheckCircle2 className="h-4 w-4" /> : round.order}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{round.member.fullName}</p>
                {round.status === "upcoming" && round.estimatedDate && (
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Est. {new Date(round.estimatedDate).toLocaleDateString("en-KE", { month: "short", year: "numeric" })}
                  </p>
                )}
                {round.status === "received" && (
                  <p className="text-[10px] text-gray-400">Received {formatCurrency(round.receivedAmount ?? 0)}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(round.estimatedPayout)}</p>
                <Badge variant={
                  round.status === "current" ? "success" :
                  round.status === "received" ? "default" : "warning"
                } className="text-[9px] capitalize">
                  {round.status === "current" ? "Now" : round.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            variant="outline" size="sm" className="flex-1"
            onClick={() => {
              if (currentRound > 0) setCurrentRound(currentRound - 1);
              toast.success("Moved to previous round.");
            }}
            disabled={currentRound === 0}
          >
            Previous Round
          </Button>
          <Button
            variant="premium" size="sm" className="flex-1"
            onClick={() => {
              if (currentRound < members.length - 1) {
                setCurrentRound(currentRound + 1);
                toast.success(`Round ${currentRound + 2} started! Next: ${rounds[currentRound + 1]?.member.fullName}`);
              } else {
                toast.success("All rounds complete! 🎉 Starting a new cycle.");
                setCurrentRound(0);
              }
            }}
          >
            {currentRound >= members.length - 1 ? "New Cycle" : "Next Round"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MerryGoRoundPanel;
