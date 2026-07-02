import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Users, Network, UserPlus, Building2,
  Handshake, MessageCircle, ArrowRight,
  Star, ShieldCheck, AlertCircle,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/common/SearchInput";
import { getConnections, getNetworkStats, type NetworkConnectionDTO } from "@/api/network";

const connectionLabels: Record<string, { label: string; icon: typeof Users; color: string }> = {
  chama_mate: { label: "Chama Mate", icon: Building2, color: "text-brand-600 bg-brand-50 dark:bg-brand-500/[0.08]" },
  guarantor: { label: "Guarantor", icon: ShieldCheck, color: "text-amber-600 bg-amber-50 dark:bg-amber-500/[0.08]" },
  borrower: { label: "Borrower", icon: Handshake, color: "text-purple-600 bg-purple-50 dark:bg-purple-500/[0.08]" },
  transaction: { label: "Transaction", icon: ArrowRight, color: "text-blue-600 bg-blue-50 dark:bg-blue-500/[0.08]" },
  meeting_attendee: { label: "Meeting", icon: MessageCircle, color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-500/[0.08]" },
};

function getTypeInfo(type: string) {
  return connectionLabels[type] ?? { label: type, icon: Users, color: "text-gray-600 bg-gray-50 dark:bg-white/[0.04]" };
}

export default function NetworkPage() {
  const [query, setQuery] = useState("");

  const connectionsQuery = useQuery({
    queryKey: ["network", "connections"],
    queryFn: () => getConnections(),
  });

  const statsQuery = useQuery({
    queryKey: ["network", "stats"],
    queryFn: getNetworkStats,
  });

  const connections: NetworkConnectionDTO[] = connectionsQuery.data?.items ?? [];
  const stats = statsQuery.data;

  const filtered = connections.filter((c) =>
    c.fullName.toLowerCase().includes(query.toLowerCase()) ||
    c.chamaName?.toLowerCase().includes(query.toLowerCase()) ||
    getTypeInfo(c.connectionType).label.toLowerCase().includes(query.toLowerCase())
  );

  const isLoading = connectionsQuery.isLoading || statsQuery.isLoading;
  const isError = connectionsQuery.isError || statsQuery.isError;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg icon-gradient-brand">
              <Network className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Network</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {stats ? `${stats.totalConnections} connections across ${stats.chamaCount} chamas` : "Loading network..."}
          </p>
        </div>
        <Link to="/chamas/join">
          <Button size="sm" variant="premium" leftIcon={<UserPlus className="h-3.5 w-3.5" />}>Join New Chama</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Connections", value: stats?.totalConnections ?? 0, icon: Users, color: "icon-gradient-brand" },
          { label: "Strong Ties", value: stats?.strongTies ?? 0, icon: Star, color: "icon-gradient-amber" },
          { label: "Verified", value: stats?.verifiedCount ?? 0, icon: ShieldCheck, color: "icon-gradient-emerald" },
          { label: "My Chamas", value: stats?.chamaCount ?? 0, icon: Building2, color: "icon-gradient-blue" },
        ].map((s) => (
          <div key={s.label} className="card-hover p-4 text-center">
            <div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-xl ${s.color} shadow-soft-sm`}>
              <s.icon className="h-4 w-4" />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{s.value}</p>
            <p className="text-[11px] text-gray-400 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <SearchInput value={query} onChange={setQuery} placeholder="Search connections by name, chama, or type..." />
        </div>

        {isLoading && (
          <div className="text-center py-12 text-gray-400 text-sm">Loading connections...</div>
        )}

        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Failed to load your network. Please try again.
            </p>
            <Button size="sm" variant="ghost" onClick={() => { connectionsQuery.refetch(); statsQuery.refetch(); }}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && connections.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Your network is empty &mdash; grow it by joining chamas
          </div>
        )}

        {!isLoading && !isError && connections.length > 0 && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((conn, idx) => {
                const typeInfo = getTypeInfo(conn.connectionType);
                return (
                  <motion.div
                    key={conn.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="card-hover p-4 group"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={conn.avatarUrl ?? undefined}
                        name={conn.fullName}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {conn.fullName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${typeInfo.color}`}>
                            <typeInfo.icon className="h-2.5 w-2.5" />
                            {typeInfo.label}
                          </span>
                          <span className="text-[11px] text-gray-400 capitalize">{conn.role?.replace("_", " ")}</span>
                        </div>
                        {conn.chamaName && (
                          <p className="text-[11px] text-gray-400 mt-1 truncate">
                            <Building2 className="h-2.5 w-2.5 inline mr-0.5" />
                            {conn.chamaName}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">
                No connections match your search.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
