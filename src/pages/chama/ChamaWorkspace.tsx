import { useEffect } from "react";
import { NavLink, Outlet, useOutletContext, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getChama, type ChamaDTO } from "@/api/chama";
import { useChamaStore } from "@/stores/chamaStore";
import { CHAMA_SECTIONS } from "@/constants/nav";
import { Loading, LoadError } from "@/components/records/ui";
import { Badge } from "@/components/ui/Badge";
import { apiErrorMessage } from "@/lib/download";
import { roleLabel } from "@/lib/roles";
import { cn } from "@/lib/utils";

export interface ChamaContext {
  chama: ChamaDTO;
  role: string;
}

export function useChamaContext() {
  return useOutletContext<ChamaContext>();
}

export default function ChamaWorkspace() {
  const { chamaId = "" } = useParams();
  const setActiveChama = useChamaStore((s) => s.setActiveChama);
  const query = useQuery({ queryKey: ["chama", chamaId], queryFn: () => getChama(chamaId), enabled: !!chamaId });

  const errorStatus = (query.error as { response?: { status?: number } } | null)?.response?.status;
  const notAccessible = errorStatus === 403 || errorStatus === 404;

  useEffect(() => {
    if (query.data) setActiveChama(query.data.id, query.data.name);
  }, [query.data, setActiveChama]);

  useEffect(() => {
    if (notAccessible) setActiveChama(null);
  }, [notAccessible, setActiveChama]);

  if (query.isLoading) return <Loading label="Loading chama…" />;
  if (query.isError || !query.data) {
    return (
      <LoadError
        message={
          notAccessible
            ? "This chama does not exist or you are not a member of it."
            : apiErrorMessage(query.error, "Could not load this chama.")
        }
        onRetry={notAccessible ? undefined : () => query.refetch()}
      />
    );
  }

  const chama = query.data;
  const role = chama.myRole ?? "member";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white mr-1">{chama.name}</h1>
        <Badge variant="brand">{roleLabel(role)}</Badge>
        {chama.status === "archived" && <Badge>Archived</Badge>}
      </div>
      <nav aria-label="Chama sections" className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto border-b border-gray-200/70 dark:border-white/[0.06]">
        <ul className="flex gap-1 min-w-max">
          {CHAMA_SECTIONS.map((s) => (
            <li key={s.segment}>
              <NavLink
                to={s.segment ? `/chamas/${chama.id}/${s.segment}` : `/chamas/${chama.id}`}
                end={s.segment === ""}
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors focus-ring",
                    isActive
                      ? "border-brand-600 text-brand-700 dark:text-brand-400"
                      : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200",
                  )
                }
              >
                {s.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <Outlet context={{ chama, role } satisfies ChamaContext} />
    </div>
  );
}
