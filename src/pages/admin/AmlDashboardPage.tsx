/**
 * AML Dashboard — Compliance officer view.
 *
 * Tabs: STRs (open/submitted/closed), Screening, Lists (refresh + PEP import).
 * Each STR row → click opens SAR draft modal.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, RefreshCw, FileText, Upload, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/dialogs/Modal";
import { EmptyState } from "@/components/common/EmptyState";
import {
  listStrs, draftSar, submitStr, closeStr,
  refreshLists, importPep, screenMe,
  type StrStatus, type SarDraft, type ScreenResult,
} from "@/api/aml";
import { formatDate } from "@/lib/utils";

export default function AmlDashboardPage() {
  const [tab, setTab] = useState<StrStatus>("open");
  const qc = useQueryClient();
  const strsQuery = useQuery({ queryKey: ["aml-strs", tab], queryFn: () => listStrs(tab) });

  const [sarOpen, setSarOpen] = useState(false);
  const [sar, setSar] = useState<SarDraft | null>(null);
  const [pepText, setPepText] = useState("");
  const [screen, setScreen] = useState<ScreenResult | null>(null);

  const draftMut = useMutation({
    mutationFn: (id: string) => draftSar(id),
    onSuccess: (d) => { setSar(d); setSarOpen(true); },
    onError: (e: Error) => toast.error(e.message),
  });
  const submitMut = useMutation({
    mutationFn: (id: string) => submitStr(id),
    onSuccess: () => { toast.success("STR submitted"); qc.invalidateQueries({ queryKey: ["aml-strs"] }); },
  });
  const closeMut = useMutation({
    mutationFn: (id: string) => closeStr(id),
    onSuccess: () => { toast.success("STR closed"); qc.invalidateQueries({ queryKey: ["aml-strs"] }); },
  });
  const refreshMut = useMutation({
    mutationFn: () => refreshLists(),
    onSuccess: (rows) => {
      const total = rows.reduce((s, r) => s + r.count, 0);
      toast.success(`Refreshed ${rows.filter((r) => r.ok).length} sources · ${total.toLocaleString("en-KE")} names loaded`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const pepMut = useMutation({
    mutationFn: (names: string[]) => importPep(names),
    onSuccess: (r) => { toast.success(`Imported ${r.imported} PEP names`); setPepText(""); },
    onError: (e: Error) => toast.error(e.message),
  });
  const screenMut = useMutation({
    mutationFn: () => screenMe(),
    onSuccess: (r) => setScreen(r),
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = strsQuery.data ?? [];

  function renderStrTable(status: StrStatus) {
    if (strsQuery.isLoading) return <div className="text-sm text-gray-500 p-6">Loading…</div>;
    if (rows.length === 0) {
      return <EmptyState icon={Shield} title={`No ${status.replace("_", " ")} STRs`} description="Rules that fire will surface here for review." />;
    }
    return (
      <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-white/[0.06]">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-white/[0.03] text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="text-left px-3 py-2 font-semibold">When</th>
              <th className="text-left px-3 py-2 font-semibold">Subject</th>
              <th className="text-left px-3 py-2 font-semibold">Rule</th>
              <th className="text-left px-3 py-2 font-semibold">Reason</th>
              <th className="text-right px-3 py-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                <td className="px-3 py-2 text-xs font-mono">{r.subject?.fullName ?? r.subjectUserId.slice(0, 8)}</td>
                <td className="px-3 py-2"><Badge variant="danger">{r.ruleTriggered}</Badge></td>
                <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">{r.reason}</td>
                <td className="px-3 py-2 text-right">
                  <div className="inline-flex gap-1">
                    <Button size="sm" variant="outline" leftIcon={<FileText className="h-3.5 w-3.5" />} onClick={() => draftMut.mutate(r.id)}>SAR</Button>
                    {status === "open" && (
                      <>
                        <Button size="sm" variant="premium" onClick={() => submitMut.mutate(r.id)} isLoading={submitMut.isPending}>Submit</Button>
                        <Button size="sm" variant="ghost" onClick={() => closeMut.mutate(r.id)}>Dismiss</Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const FILTERS: Array<{ value: StrStatus; label: string }> = [
    { value: "open", label: "Open" },
    { value: "submitted", label: "Submitted" },
    { value: "closed_false_positive", label: "Closed" },
  ];

  return (
    <div className="space-y-6">
      <div className="card-base p-5">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-brand-500" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">AML Command Center</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Sanctions screening · Transaction monitoring · SAR drafting</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-base p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Refresh sanction lists</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Pulls OFAC · UN · EU into Redis</p>
          </div>
          <Button size="sm" variant="outline" leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${refreshMut.isPending ? "animate-spin" : ""}`} />} onClick={() => refreshMut.mutate()} isLoading={refreshMut.isPending} className="w-full">
            Refresh now
          </Button>
        </div>

        <div className="card-base p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Import PEP names</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">One name per line</p>
          </div>
          <textarea
            value={pepText}
            onChange={(e) => setPepText(e.target.value)}
            className="w-full h-20 rounded-lg border border-gray-200 dark:border-white/[0.08] bg-transparent p-2 text-xs font-mono"
            placeholder="Jane Doe&#10;John Smith"
          />
          <Button size="sm" variant="outline" leftIcon={<Upload className="h-3.5 w-3.5" />} onClick={() => pepMut.mutate(pepText.split("\n").map((s) => s.trim()).filter(Boolean))} isLoading={pepMut.isPending} className="w-full">
            Import
          </Button>
        </div>

        <div className="card-base p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Screen my account</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Check name against loaded lists</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => screenMut.mutate()} isLoading={screenMut.isPending} className="w-full">
            Run check
          </Button>
          {screen && (
            <div className={`text-[11px] rounded-lg p-2 ${screen.matched ? "bg-red-50 dark:bg-red-500/[0.08] text-red-700 dark:text-red-300" : "bg-emerald-50 dark:bg-emerald-500/[0.08] text-emerald-700 dark:text-emerald-300"}`}>
              {screen.matched
                ? <span className="inline-flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Hits: {screen.lists.join(", ")} · score {screen.score}</span>
                : <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> No matches · score {screen.score}</span>}
            </div>
          )}
        </div>
      </div>

      <div className="card-base p-5 space-y-3">
        <div className="flex gap-1 border-b border-gray-100 dark:border-white/[0.06] pb-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setTab(f.value)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                tab === f.value
                  ? "bg-brand-500 text-white"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.04]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {renderStrTable(tab)}
      </div>

      <Modal isOpen={sarOpen} onClose={() => setSarOpen(false)} title={sar ? `SAR draft — ${sar.reportId}` : "SAR draft"} size="lg">
        {sar && (
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Subject</p>
              <p className="font-mono">{sar.subject.fullName} · {sar.subject.phone}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Rules triggered</p>
              <div className="flex gap-1">{sar.rulesTriggered.map((r) => <Badge key={r} variant="danger">{r}</Badge>)}</div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Narrative</p>
              <pre className="whitespace-pre-wrap text-xs bg-gray-50 dark:bg-white/[0.03] rounded-lg p-3">{sar.narrative}</pre>
            </div>
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => {
                const blob = new Blob([JSON.stringify(sar, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = `${sar.reportId}.json`; a.click();
                URL.revokeObjectURL(url);
              }}>Download JSON</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
