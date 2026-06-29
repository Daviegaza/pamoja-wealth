import { ShieldCheck, Wallet, Users, TrendingUp } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/cards/StatCard";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { useAuth } from "@/hooks/useAuth";
import { useChamaStore } from "@/stores/chamaStore";
import { useWalletStore } from "@/stores/walletStore";
import { useLoanStore } from "@/stores/loanStore";
import { formatCurrency, formatDate } from "@/lib/utils";

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

      <div className="card-base p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Profile</h2>
        <ProfileForm />
      </div>
    </div>
  );
}
