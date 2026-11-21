import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { listMyChamas } from "@/api/chama";
import { Empty, LoadError, Loading, Notice, PageHeader } from "@/components/records/ui";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useChamaStore } from "@/stores/chamaStore";
import { useAuth } from "@/hooks/useAuth";
import { NON_CUSTODIAL_STATEMENT } from "@/lib/copy";
import { formatKes } from "@/lib/format";
import { roleLabel } from "@/lib/roles";
import { apiErrorMessage } from "@/lib/download";

export function ChamaList() {
  const navigate = useNavigate();
  const setActiveChama = useChamaStore((s) => s.setActiveChama);
  const chamas = useQuery({ queryKey: ["chamas", "mine"], queryFn: listMyChamas });

  if (chamas.isLoading) return <Loading />;
  if (chamas.isError) return <LoadError message={apiErrorMessage(chamas.error, "Could not load your chamas.")} onRetry={() => chamas.refetch()} />;
  if ((chamas.data?.length ?? 0) === 0)
    return (
      <Empty title="You are not in a chama yet">
        Create one for your group, or join with the invite code your chairperson or secretary shared.
        <div className="mt-4 flex justify-center gap-2">
          <Button onClick={() => navigate("/chamas/create")}>Create a chama</Button>
          <Button variant="outline" onClick={() => navigate("/chamas/join")}>Join with a code</Button>
        </div>
      </Empty>
    );

  return (
    <ul className="divide-y divide-gray-100 dark:divide-white/[0.05] border-y border-gray-100 dark:border-white/[0.05]">
      {chamas.data!.map((c) => (
        <li key={c.id}>
          <Link
            to={`/chamas/${c.id}`}
            onClick={() => setActiveChama(c.id, c.name)}
            className="flex items-center gap-4 py-4 px-1 hover:bg-gray-50/70 dark:hover:bg-white/[0.02] focus-ring rounded-lg"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/[0.08] font-bold text-brand-700 dark:text-brand-400">
              {c.name.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate font-semibold text-gray-900 dark:text-white">{c.name}</span>
                <Badge variant="brand">{roleLabel(c.myRole)}</Badge>
                {c.status === "archived" && <Badge>Archived</Badge>}
              </span>
              <span className="block text-sm text-gray-500">
                {c.memberCount} member{c.memberCount === 1 ? "" : "s"}
                {c.monthlyContribution > 0 ? ` · ${formatKes(c.monthlyContribution)} expected monthly` : ""}
                {c.location ? ` · ${c.location}` : ""}
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function MyChamasPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <PageHeader
        title={user ? `Karibu, ${user.fullName.split(" ")[0]}` : "My chamas"}
        description="Open a chama to record contributions, loans and meetings."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate("/chamas/join")}>Join with a code</Button>
            <Button onClick={() => navigate("/chamas/create")}>Create a chama</Button>
          </>
        }
      />
      <ChamaList />
      <Notice>{NON_CUSTODIAL_STATEMENT}</Notice>
    </div>
  );
}
