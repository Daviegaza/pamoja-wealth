import { useEffect, useState } from "react";
import { ShieldCheck, Wallet, Users, TrendingUp, RefreshCw } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/cards/StatCard";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { ReferralDashboard } from "@/components/referral/ReferralDashboard";
import { TrustScoreCard } from "@/components/trust/TrustScoreCard";
import { useAuth } from "@/hooks/useAuth";
import { useChamaStore } from "@/stores/chamaStore";
import { useWalletStore } from "@/stores/walletStore";
import { useLoanStore } from "@/stores/loanStore";
import { getMyTrustScore, refreshMyTrustScore, type TrustScoreDTO } from "@/api/trustScore";
import { formatCurrency, formatDate } from "@/lib/utils";

import { USE_MOCKS } from "@/lib/env";

export default function ProfilePage() {
  const { user } = useAuth();
  const members = useChamaStore((s) => s.members);
  const wallet = useWalletStore((s) => s.wallet);
  const loans = useLoanStore((s) => s.loans);

  if (!user) return null;

  const chamasJoined = members.filter((m) => m.userId === user.id).length;
  const totalContributed = wallet.totalDeposits;
  const activeLoans = loans.filter((l) => l.borrowerId === user.id && l.status === "active");
  const totalBorrowed = activeLoans.reduce((sum, l) => sum + (l.amount - l.amountRepaid), 0);
  const contributionStreak = Math.max(0, ...members.filter((m) => m.userId === user.id).map((m) => m.contributionStreak));
  const reputationScore = Math.min(100, 50 + chamasJoined * 5 + contributionStreak * 2);

  // Trust score: live from backend, with client-side estimate as fallback so
  // the card never renders blank on cold load or if the endpoint is offline.
  const onTimeRate = activeLoans.length === 0 ? 1 : Math.min(1, 1 - Math.max(0, totalBorrowed) / (wallet.totalDeposits + 1));
  const yearsOnPlatform = Math.max(0, (Date.now() - new Date(user.createdAt).getTime()) / (365 * 86400000));
  const kycTier: 0 | 1 | 2 | 3 = user.isVerified ? 2 : 1;
  const estimatedTrustScore = Math.min(950, 300 + Math.round(
    reputationScore * 3.5 +
    contributionStreak * 8 +
    onTimeRate * 120 +
    kycTier * 40 +
    Math.min(yearsOnPlatform, 5) * 20,
  ));

  const [trustScoreDto, setTrustScoreDto] = useState<TrustScoreDTO | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (USE_MOCKS) return;
    getMyTrustScore().then(setTrustScoreDto).catch(() => { /* stay on client estimate */ });
  }, []);

  async function handleRefresh() {
    if (USE_MOCKS) return;
    setRefreshing(true);
    try {
      const fresh = await refreshMyTrustScore();
      setTrustScoreDto(fresh);
    } catch { /* silent */ }
    finally { setRefreshing(false); }
  }

  const trustScore = trustScoreDto?.score ?? estimatedTrustScore;
  const trustBreakdown = trustScoreDto?.breakdown ?? {
    contributionStreakMonths: contributionStreak,
    onTimePaymentRate: onTimeRate,
    disputeCount: 0,
    defaultedLoanCount: 0,
    kycTier,
    chamasActive: chamasJoined,
    yearsOnPlatform: Math.round(yearsOnPlatform * 10) / 10,
  };

  return (
    <div className="space-y-6">
      <div className="card-base p-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <Avatar src={user.avatarUrl} name={user.fullName} size="xl" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.fullName}</h1>
            {user.isVerified && <Badge variant="success">Verified</Badge>}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user.email} · {user.phone}</p>
          <p className="text-xs text-gray-400 mt-1 capitalize">{user.role.replace("_", " ")} · {user.location} · Joined {formatDate(user.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Chamas Joined" value={String(chamasJoined)} icon={Users} />
        <StatCard label="Total Contributed" value={formatCurrency(totalContributed)} icon={Wallet} iconColor="text-blue-600 bg-blue-50 dark:bg-blue-500/10" />
        <StatCard label="Total Borrowed" value={formatCurrency(totalBorrowed)} icon={TrendingUp} iconColor="text-purple-600 bg-purple-50 dark:bg-purple-500/10" />
        <StatCard label="Reputation Score" value={`${reputationScore}/100`} icon={ShieldCheck} iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" />
      </div>

      <div className="relative">
        <TrustScoreCard
          score={trustScore}
          breakdown={{
            contributionStreakMonths: trustBreakdown.contributionStreakMonths,
            onTimePaymentRate: trustBreakdown.onTimePaymentRate,
            disputeCount: trustBreakdown.disputeCount,
            kycTier: (trustBreakdown.kycTier as 0 | 1 | 2 | 3) ?? 0,
            chamasActive: trustBreakdown.chamasActive,
            yearsOnPlatform: trustBreakdown.yearsOnPlatform,
          }}
        />
        {!USE_MOCKS && (
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {trustScoreDto?.cached && (
              <Badge variant="default" title={`Computed ${new Date(trustScoreDto.computedAt).toLocaleString()}`}>Cached</Badge>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              isLoading={refreshing}
              leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />}
              aria-label="Refresh trust score"
            >
              Refresh
            </Button>
          </div>
        )}
      </div>

      <div className="card-base p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Profile</h2>
        <ProfileForm />
      </div>

      {/* Referral Program */}
      <ReferralDashboard />
    </div>
  );
}
