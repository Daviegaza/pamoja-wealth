import { useParams, Link } from "react-router-dom";
import { Users, Wallet, Calendar, TrendingUp, ArrowLeft, Settings } from "lucide-react";
import { useChamaStore } from "@/stores/chamaStore";
import { StatCard } from "@/components/cards/StatCard";
import { MemberCard } from "@/components/cards/MemberCard";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/common/EmptyState";
import { Building2 } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { motion } from "framer-motion";

export default function ChamaDetailPage() {
  const { id } = useParams();
  const { getChamaById, getMembersByChamaId } = useChamaStore();
  const chama = getChamaById(id ?? "");
  const members = getMembersByChamaId(id ?? "");

  if (!chama)
    return (
      <EmptyState
        icon={Building2}
        title="Chama not found"
        description="This chama may have been removed or archived."
        actionLabel="Back to Chamas"
        onAction={() => window.history.back()}
      />
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/chamas"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Chamas
        </Link>
        <Button variant="outline" size="sm" leftIcon={<Settings className="h-3.5 w-3.5" />}>
          Manage
        </Button>
      </div>

      {/* Header */}
      <div className="card-hover p-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <Avatar src={chama.logoUrl} name={chama.name} size="xl" ring="brand" />
        <div className="flex-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{chama.name}</h1>
            <Badge variant={chama.status === "active" ? "success" : "default"} dot={chama.status === "active"} className="capitalize">
              {chama.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{chama.description}</p>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <Badge variant="brand" className="capitalize">{chama.category}</Badge>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{chama.location}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{chama.memberCount} members</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Funds" value={formatCurrency(chama.totalFunds)} icon={Wallet} />
        <StatCard
          label="Members"
          value={String(chama.memberCount)}
          icon={Users}
          iconColor="icon-gradient-blue"
        />
        <StatCard
          label="Growth Rate"
          value={formatPercent(chama.growthRate)}
          icon={TrendingUp}
          iconColor="icon-gradient-emerald"
        />
        <StatCard
          label="Monthly Contribution"
          value={formatCurrency(chama.monthlyContribution)}
          icon={Calendar}
          iconColor="icon-gradient-purple"
        />
      </div>

      {/* Tabs */}
      <Tabs
        items={[
          {
            value: "members",
            label: "Members",
            content: (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {members.slice(0, 10).map((m) => (
                  <MemberCard key={m.id} member={m} />
                ))}
              </div>
            ),
          },
          {
            value: "about",
            label: "About",
            content: (
              <div className="card-hover p-6 max-w-2xl">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">About this Chama</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{chama.description}</p>
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Category</p>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5 capitalize">{chama.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Location</p>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{chama.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Created</p>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{new Date(chama.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Next Meeting</p>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{new Date(chama.nextMeetingDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ),
          },
        ]}
      />
    </motion.div>
  );
}
