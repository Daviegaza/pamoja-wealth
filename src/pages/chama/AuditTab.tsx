import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useChamaContext } from "./ChamaWorkspace";
import { listAudit, type AuditDTO } from "@/api/audit";
import { Empty, LoadError, Loading, PageHeader, Table, td, th } from "@/components/records/ui";
import { Button } from "@/components/ui/Button";
import { apiErrorMessage } from "@/lib/download";

function describe(a: AuditDTO): string {
  const words = a.action.replace(/[._]/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function detailsText(details: AuditDTO["details"]): string {
  if (!details) return "";
  return Object.entries(details)
    .filter(([, v]) => v !== null && v !== undefined && typeof v !== "object")
    .slice(0, 4)
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join(" · ");
}

export default function AuditTab() {
  const { chama } = useChamaContext();
  const [page, setPage] = useState(1);
  const audit = useQuery({ queryKey: ["audit", chama.id, page], queryFn: () => listAudit(chama.id, page, 25) });
  const totalPages = audit.data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit log"
        description="Every change to your chama's records — who did it and when. Entries cannot be edited or deleted."
      />
      {audit.isLoading ? (
        <Loading />
      ) : audit.isError ? (
        <LoadError message={apiErrorMessage(audit.error, "Could not load the audit log.")} onRetry={() => audit.refetch()} />
      ) : (audit.data?.items.length ?? 0) === 0 ? (
        <Empty title="Nothing logged yet" />
      ) : (
        <>
          <Table caption="Audit log">
            <thead>
              <tr>
                <th className={th}>When</th>
                <th className={th}>Who</th>
                <th className={th}>What</th>
                <th className={th}>Details</th>
              </tr>
            </thead>
            <tbody>
              {audit.data!.items.map((a) => (
                <tr key={a.id}>
                  <td className={`${td} whitespace-nowrap`}>{new Date(a.createdAt).toLocaleString("en-KE")}</td>
                  <td className={td}>{a.actorName ?? "System"}</td>
                  <td className={td}>{describe(a)}</td>
                  <td className={`${td} text-xs text-gray-500`}>{detailsText(a.details)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Page {page} of {totalPages}</span>
              <span className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
