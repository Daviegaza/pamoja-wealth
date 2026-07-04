/**
 * Ledger export + audit-trail panel.
 *
 * - Three download buttons (CSV / QuickBooks IIF / Xero CSV) that hit the
 *   backend export endpoint and stream the file to the browser.
 * - Live audit log (last 200 entries), refresh button.
 * - "Verify hash chain" button that runs the server-side integrity check
 *   and shows OK / BROKEN + the broken row's id.
 *
 * Renders inside a ChamaDetailPage tab.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, ShieldCheck, RefreshCw, AlertTriangle, CheckCircle2, FileCheck2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/dialogs/Modal";
import { EmptyState } from "@/components/common/EmptyState";
import { exportLedger, downloadBlob, getAuditLog, verifyAuditChain, purchaseAuditReport, type ExportFormat, type AuditVerifyResult } from "@/api/ledger";
import { useSocketEvent } from "@/lib/socket";
import { formatDate } from "@/lib/utils";

const AUDIT_REPORT_PRICE_KES = 1500;

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86400_000).toISOString();
}

interface Props {
  chamaId: string;
  chamaName: string;
}

const FORMATS: Array<{ id: ExportFormat; label: string; ext: string; help: string }> = [
  { id: "csv", label: "CSV", ext: "csv", help: "Universal spreadsheet format" },
  { id: "quickbooks", label: "QuickBooks", ext: "iif", help: "Import into QuickBooks Desktop / Online" },
  { id: "xero", label: "Xero", ext: "csv", help: "Bank statement format" },
];

export function LedgerAuditPanel({ chamaId, chamaName }: Props) {
  const [downloading, setDownloading] = useState<ExportFormat | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<AuditVerifyResult | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportRange, setReportRange] = useState(() => ({
    start: isoDaysAgo(365).slice(0, 10),
    end: new Date().toISOString().slice(0, 10),
  }));
  const [purchasing, setPurchasing] = useState(false);
  const [pendingReport, setPendingReport] = useState<string | null>(null);

  useSocketEvent<{ transactionId: string; storageKey: string; downloadUrl?: string }>(
    "audit-report:ready",
    (payload) => {
      if (!pendingReport) return;
      if (payload.transactionId === pendingReport) {
        if (payload.downloadUrl) {
          toast.success("Audit report ready — opening download.", {
            action: { label: "Open", onClick: () => window.open(payload.downloadUrl, "_blank", "noopener") },
          });
          window.open(payload.downloadUrl, "_blank", "noopener");
        } else {
          toast.success("Audit report ready — check your email for the download link.");
        }
        setPendingReport(null);
      }
    },
  );

  async function handlePurchaseReport() {
    setPurchasing(true);
    try {
      const startIso = new Date(`${reportRange.start}T00:00:00Z`).toISOString();
      const endIso = new Date(`${reportRange.end}T23:59:59Z`).toISOString();
      const result = await purchaseAuditReport(chamaId, startIso, endIso);
      setPendingReport(result.transactionId);
      toast.success(`Queued — pay KES ${result.priceKes.toLocaleString("en-KE")} via M-Pesa prompt.`);
      setReportOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Purchase failed");
    } finally {
      setPurchasing(false);
    }
  }

  const auditQuery = useQuery({
    queryKey: ["chama-audit-log", chamaId],
    queryFn: () => getAuditLog(chamaId),
    staleTime: 30_000,
  });

  async function handleExport(format: ExportFormat, ext: string) {
    setDownloading(format);
    try {
      const blob = await exportLedger(chamaId, format);
      const safe = chamaName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const date = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `${safe}_ledger_${date}.${ext}`);
      toast.success(`${format.toUpperCase()} export downloaded`);
    } catch (err) {
      toast.error(`Export failed: ${err instanceof Error ? err.message : "unknown error"}`);
    } finally {
      setDownloading(null);
    }
  }

  async function handleVerify() {
    setVerifying(true);
    try {
      const result = await verifyAuditChain(chamaId);
      setVerifyResult(result);
      if (result.ok) toast.success(`Hash chain verified · ${result.checked} entries intact`);
      else toast.error(`Chain broken at entry ${result.brokenAt}`);
    } catch (err) {
      toast.error(`Verify failed: ${err instanceof Error ? err.message : "unknown error"}`);
    } finally {
      setVerifying(false);
    }
  }

  const entries = auditQuery.data ?? [];

  return (
    <div className="space-y-6">
      <section className="card-base p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Ledger export</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Download every debit and credit from this chama's double-entry ledger. Ready for your accountant, KRA audit, or tax filing.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FORMATS.map((f) => (
            <div key={f.id} className="rounded-xl border border-gray-100 dark:border-white/[0.06] p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{f.label}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{f.help}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport(f.id, f.ext)}
                isLoading={downloading === f.id}
                leftIcon={<Download className="h-3.5 w-3.5" />}
                className="w-full"
              >
                Download .{f.ext}
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="card-base p-5 border border-brand-200/60 dark:border-brand-500/20 bg-gradient-to-br from-brand-50/60 to-transparent dark:from-brand-500/[0.05]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-brand-500" /> Signed audit report
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-lg">
              Get a PDF audit report — chama summary, ledger integrity check, member list, external-auditor signature line. Deliverable to SACCO regulators or your accountant.
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              KES {AUDIT_REPORT_PRICE_KES.toLocaleString("en-KE")} per report · paid via M-Pesa
            </p>
          </div>
          <Button
            size="sm"
            variant="premium"
            leftIcon={<FileCheck2 className="h-3.5 w-3.5" />}
            onClick={() => setReportOpen(true)}
            isLoading={purchasing}
          >
            {pendingReport ? "Report pending…" : "Buy report"}
          </Button>
        </div>
      </section>

      <section className="card-base p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Audit trail
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Every action is hash-chained. Verify integrity anytime.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {verifyResult && (
              verifyResult.ok
                ? <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Verified · {verifyResult.checked}</Badge>
                : <Badge variant="danger" className="gap-1"><AlertTriangle className="h-3 w-3" /> Broken · {verifyResult.brokenAt}</Badge>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleVerify}
              isLoading={verifying}
              leftIcon={<ShieldCheck className="h-3.5 w-3.5" />}
            >
              Verify chain
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => auditQuery.refetch()}
              isLoading={auditQuery.isFetching}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              aria-label="Refresh audit log"
            >
              Refresh
            </Button>
          </div>
        </div>

        {entries.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No audit entries yet"
            description="Actions taken in this chama will appear here with a cryptographic hash chain."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-white/[0.06]">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-white/[0.03] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">When</th>
                  <th className="text-left px-3 py-2 font-semibold">Action</th>
                  <th className="text-left px-3 py-2 font-semibold">Entity</th>
                  <th className="text-left px-3 py-2 font-semibold">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {entries.slice(0, 100).map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                    <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(e.createdAt)}</td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-900 dark:text-white">{e.action}</td>
                    <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-300">{e.entity ?? "—"}</td>
                    <td className="px-3 py-2 text-xs font-mono text-gray-500 dark:text-gray-400">{e.userId?.slice(0, 8) ?? "system"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {entries.length > 100 && (
              <div className="px-3 py-2 text-[11px] text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-white/[0.05]">
                Showing 100 of {entries.length} — download the CSV export for the full history.
              </div>
            )}
          </div>
        )}
      </section>

      <Modal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Buy signed audit report"
        description={`${chamaName} · KES ${AUDIT_REPORT_PRICE_KES.toLocaleString("en-KE")} · Delivered as PDF`}
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 block">From</label>
              <Input type="date" value={reportRange.start} onChange={(e) => setReportRange({ ...reportRange, start: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 block">To</label>
              <Input type="date" value={reportRange.end} onChange={(e) => setReportRange({ ...reportRange, end: e.target.value })} />
            </div>
          </div>
          <div className="rounded-xl bg-brand-50/60 dark:bg-brand-500/[0.06] p-3 text-[11px] text-gray-600 dark:text-gray-300 space-y-1">
            <p>Report includes financial summary, ledger hash verification, member list, and an external-auditor signature line.</p>
            <p>Payment via M-Pesa STK push. Report queued to your account once payment clears.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setReportOpen(false)}>Cancel</Button>
            <Button variant="premium" onClick={handlePurchaseReport} isLoading={purchasing} leftIcon={<FileCheck2 className="h-3.5 w-3.5" />}>
              Buy for KES {AUDIT_REPORT_PRICE_KES.toLocaleString("en-KE")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
