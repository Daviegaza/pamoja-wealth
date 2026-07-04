import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Share2, Copy, Trophy, Users, Coins, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import {
  getMyReferralCode, getMyReferralStats, getLeaderboard,
  type ReferralCodeDTO, type ReferralStatsDTO, type LeaderboardEntry,
} from "@/api/referral";
import { formatCurrency } from "@/lib/utils";

import { USE_MOCKS } from "@/lib/env";

export default function ReferralPage() {
  const [code, setCode] = useState<ReferralCodeDTO | null>(null);
  const [stats, setStats] = useState<ReferralStatsDTO | null>(null);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (USE_MOCKS) {
      setCode({ code: "AMARA123", totalReferrals: 4, totalEarnedKes: 2000, isActive: true, createdAt: new Date().toISOString() });
      setStats({
        totalReferrals: 4, totalEarnedKes: 2000, pendingRewardsKes: 500,
        recent: [
          { id: "r1", referredUserId: "u2", referredName: "Kevin M.", status: "rewarded", createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), amountKes: 500 },
          { id: "r2", referredUserId: "u3", referredName: "Grace W.", status: "rewarded", createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), amountKes: 500 },
          { id: "r3", referredUserId: "u4", referredName: "Peter O.", status: "pending", createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), amountKes: 500 },
        ],
      });
      setBoard([
        { rank: 1, userId: "u10", displayName: "Nyokabi K.", totalReferrals: 47, totalEarnedKes: 23500 },
        { rank: 2, userId: "u11", displayName: "Otieno J.", totalReferrals: 33, totalEarnedKes: 16500 },
        { rank: 3, userId: "u12", displayName: "Wanjiru M.", totalReferrals: 29, totalEarnedKes: 14500 },
      ]);
      return;
    }
    getMyReferralCode().then(setCode).catch(() => {});
    getMyReferralStats().then(setStats).catch(() => {});
    getLeaderboard().then(setBoard).catch(() => {});
  }, []);

  const shareUrl = code ? `${window.location.origin}/register?ref=${code.code}` : "";

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 1800);
    } catch { toast.error("Copy failed"); }
  }

  async function shareNative() {
    if (!shareUrl) return;
    const shareData = {
      title: "Join Pamoja Wealth",
      text: "Best way to run a chama. Try it free.",
      url: shareUrl,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* user cancelled */ }
    } else {
      copyLink();
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
          <Share2 className="h-3.5 w-3.5" /> Referral program
        </div>
        <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">Earn KES 500 per friend</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Share your link. When they join a chama, you both get rewarded.
        </p>
      </div>

      {/* Share card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-brand-200/60 dark:border-brand-500/20 bg-gradient-to-br from-brand-50/50 to-emerald-50/30 dark:from-brand-500/[0.04] dark:to-emerald-500/[0.03] p-6 mb-6"
      >
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Your invite link</div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 rounded-xl border border-gray-300 dark:border-white/[0.07] bg-white dark:bg-white/[0.05] px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100"
          />
          <Button variant="outline" leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} onClick={copyLink}>
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="premium" leftIcon={<Share2 className="h-4 w-4" />} onClick={shareNative}>
            Share
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Users} label="Friends invited" value={stats?.totalReferrals ?? 0} />
        <StatCard icon={Coins} label="Total earned" value={formatCurrency(stats?.totalEarnedKes ?? 0)} />
        <StatCard icon={Trophy} label="Pending rewards" value={formatCurrency(stats?.pendingRewardsKes ?? 0)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent referrals */}
        <div className="rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-white dark:bg-neutral-900/60 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent referrals</h3>
          <div className="space-y-2">
            {stats?.recent.length ? stats.recent.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-white/[0.02] px-3 py-2">
                <div className="flex items-center gap-2">
                  <Avatar name={r.referredName ?? "?"} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{r.referredName ?? "Anonymous"}</p>
                    <p className="text-[10px] text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(r.amountKes)}</p>
                  <Badge variant={r.status === "rewarded" ? "premium" : "default"} className="text-[10px]">{r.status}</Badge>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Invite your first friend</p>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-white dark:bg-neutral-900/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-amber-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Top referrers</h3>
          </div>
          <div className="space-y-2">
            {board.map((e) => (
              <div key={e.userId} className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-white/[0.02] px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 dark:text-gray-500 w-5">#{e.rank}</span>
                  <Avatar src={e.avatarUrl ?? undefined} name={e.displayName} size="sm" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{e.displayName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{e.totalReferrals} refs</p>
                  <p className="text-[10px] text-gray-400">{formatCurrency(e.totalEarnedKes)}</p>
                </div>
              </div>
            ))}
            {board.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Leaderboard warming up</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-white dark:bg-neutral-900/60 p-5">
      <div className="h-8 w-8 rounded-lg bg-brand-50 dark:bg-brand-500/[0.08] flex items-center justify-center text-brand-600 dark:text-brand-400">
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-2xl font-extrabold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500">{label}</p>
    </div>
  );
}
