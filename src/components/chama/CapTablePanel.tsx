/**
 * Cap-table admin panel.
 *
 * - Cap table (investor rows: shares, KES, %)
 * - Active offerings list with close button
 * - Create-offering modal
 * - Declare-dividend modal with pro-rata preview
 *
 * Visible to owner/admin/treasurer in ChamaDetailPage.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, DollarSign, PieChart, Users2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/dialogs/Modal";
import { EmptyState } from "@/components/common/EmptyState";
import { PayoutSignaturesPanel } from "@/components/chama/PayoutSignaturesPanel";
import {
  createOffering,
  listOfferings,
  closeOffering,
  getCapTable,
  declareDividend,
  executeDividend,
  type CreateOfferingInput,
  type DividendResult,
} from "@/api/capTable";
import { formatCurrency } from "@/lib/utils";

interface Props {
  chamaId: string;
}

const emptyForm: CreateOfferingInput = {
  title: "",
  description: "",
  totalShares: 100,
  pricePerShareKes: 1000,
};

export function CapTablePanel({ chamaId }: Props) {
  const qc = useQueryClient();
  const [offeringOpen, setOfferingOpen] = useState(false);
  const [dividendOpen, setDividendOpen] = useState(false);
  const [form, setForm] = useState<CreateOfferingInput>(emptyForm);
  const [potKes, setPotKes] = useState<string>("");
  const [preview, setPreview] = useState<DividendResult | null>(null);

  const capQuery = useQuery({
    queryKey: ["cap-table", chamaId],
    queryFn: () => getCapTable(chamaId),
    staleTime: 30_000,
  });
  const offeringsQuery = useQuery({
    queryKey: ["offerings", chamaId],
    queryFn: () => listOfferings(chamaId),
    staleTime: 30_000,
  });

  const createMut = useMutation({
    mutationFn: (input: CreateOfferingInput) => createOffering(chamaId, input),
    onSuccess: () => {
      toast.success("Offering created");
      setOfferingOpen(false);
      setForm(emptyForm);
      qc.invalidateQueries({ queryKey: ["offerings", chamaId] });
    },
    onError: (err: Error) => toast.error(err.message ?? "Create failed"),
  });

  const closeMut = useMutation({
    mutationFn: (offeringId: string) => closeOffering(chamaId, offeringId),
    onSuccess: () => {
      toast.success("Offering closed");
      qc.invalidateQueries({ queryKey: ["offerings", chamaId] });
    },
    onError: (err: Error) => toast.error(err.message ?? "Close failed"),
  });

  const dividendMut = useMutation({
    mutationFn: (kes: number) => declareDividend(chamaId, kes),
    onSuccess: (result) => {
      setPreview(result);
      toast.success(`Preview: ${result.distributed.length} holders share KES ${result.totalKes.toLocaleString("en-KE")}`);
    },
    onError: (err: Error) => toast.error(err.message ?? "Declare failed"),
  });

  const executeMut = useMutation({
    mutationFn: (kes: number) => executeDividend(chamaId, kes),
    onSuccess: (result) => {
      toast.success(`${result.enqueued} payouts queued · KES ${result.totalKes.toLocaleString("en-KE")}${result.skipped > 0 ? ` · ${result.skipped} skipped (no user)` : ""}`);
      setDividendOpen(false);
      setPreview(null);
      setPotKes("");
    },
    onError: (err: Error) => toast.error(err.message ?? "Execute failed"),
  });

  const cap = capQuery.data ?? { totalShares: 0, totalRaisedKes: 0, rows: [] };
  const offerings = offeringsQuery.data ?? [];
  const openOfferings = offerings.filter((o) => o.status === "open");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title required"); return; }
    if (form.totalShares < 1) { toast.error("totalShares must be positive"); return; }
    if (form.pricePerShareKes < 1) { toast.error("pricePerShareKes must be positive"); return; }
    createMut.mutate(form);
  }

  function handleDividendPreview(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(potKes.replace(/[^\d.]/g, ""));
    if (!Number.isFinite(n) || n <= 0) { toast.error("Enter a positive KES pot"); return; }
    dividendMut.mutate(n);
  }

  return (
    <div className="space-y-6">
      {/* Stats header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card-base p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400 mb-1">
            <PieChart className="h-3.5 w-3.5" /> Shares issued
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{cap.totalShares.toLocaleString("en-KE")}</p>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400 mb-1">
            <DollarSign className="h-3.5 w-3.5" /> Total raised
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(cap.totalRaisedKes)}</p>
        </div>
        <div className="card-base p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400 mb-1">
            <Users2 className="h-3.5 w-3.5" /> Holders
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{cap.rows.length}</p>
        </div>
      </div>

      {/* Actions row */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="premium" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setOfferingOpen(true)}>
          New offering
        </Button>
        <Button size="sm" variant="outline" leftIcon={<DollarSign className="h-3.5 w-3.5" />} onClick={() => { setPreview(null); setDividendOpen(true); }} disabled={cap.totalShares === 0}>
          Declare dividend
        </Button>
      </div>

      {/* Active offerings */}
      <section className="card-base p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Offerings</h3>
        {offerings.length === 0 ? (
          <EmptyState icon={PieChart} title="No offerings yet" description="Launch a share offering to raise capital from members or the public." />
        ) : (
          <ul className="space-y-2">
            {offerings.map((o) => {
              const filled = o.totalShares > 0 ? (o.sharesSold / o.totalShares) * 100 : 0;
              return (
                <li key={o.id} className="rounded-xl border border-gray-100 dark:border-white/[0.06] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{o.title}</p>
                        <Badge variant={o.status === "open" ? "success" : "default"}>{o.status}</Badge>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {o.sharesSold.toLocaleString("en-KE")} / {o.totalShares.toLocaleString("en-KE")} shares · KES {o.pricePerShareKes.toLocaleString("en-KE")}/share
                      </p>
                      <div className="mt-2 h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                        <div className="h-full bg-brand-500" style={{ width: `${Math.min(100, filled)}%` }} />
                      </div>
                    </div>
                    {o.status === "open" && (
                      <Button size="sm" variant="ghost" onClick={() => closeMut.mutate(o.id)} isLoading={closeMut.isPending}>
                        Close
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {openOfferings.length > 0 && (
          <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">
            {openOfferings.length} open offering{openOfferings.length === 1 ? "" : "s"} accepting investment via public shareable links.
          </p>
        )}
      </section>

      {/* Cap table */}
      <section className="card-base p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Cap table</h3>
        {cap.rows.length === 0 ? (
          <EmptyState icon={Users2} title="No confirmed holders yet" description="Once investors confirm holdings, they'll appear here with their percentage ownership." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-white/[0.06]">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-white/[0.03] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Investor</th>
                  <th className="text-right px-3 py-2 font-semibold">Shares</th>
                  <th className="text-right px-3 py-2 font-semibold">Invested</th>
                  <th className="text-right px-3 py-2 font-semibold">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {cap.rows.map((r, i) => (
                  <tr key={`${r.investorUserId ?? r.investor}-${i}`} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                    <td className="px-3 py-2 text-gray-900 dark:text-white">{r.investor}</td>
                    <td className="px-3 py-2 text-right font-mono">{r.shares.toLocaleString("en-KE")}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatCurrency(r.amountKes)}</td>
                    <td className="px-3 py-2 text-right font-semibold">{r.percent.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pending signatures */}
      <section className="card-base p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Pending multi-sig payouts</h3>
        <PayoutSignaturesPanel chamaId={chamaId} />
      </section>

      {/* Create-offering modal */}
      <Modal isOpen={offeringOpen} onClose={() => setOfferingOpen(false)} title="Create share offering" size="lg">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 block">Title</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Series A round" required />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 block">Description</label>
            <Input value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What are we raising for?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 block">Total shares</label>
              <Input type="number" min={1} value={form.totalShares} onChange={(e) => setForm({ ...form, totalShares: Number(e.target.value) })} required />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 block">Price / share (KES)</label>
              <Input type="number" min={1} value={form.pricePerShareKes} onChange={(e) => setForm({ ...form, pricePerShareKes: Number(e.target.value) })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 block">Min investment (KES)</label>
              <Input type="number" min={0} value={form.minInvestmentKes ?? ""} onChange={(e) => setForm({ ...form, minInvestmentKes: e.target.value ? Number(e.target.value) : undefined })} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 block">Max investment (KES)</label>
              <Input type="number" min={0} value={form.maxInvestmentKes ?? ""} onChange={(e) => setForm({ ...form, maxInvestmentKes: e.target.value ? Number(e.target.value) : undefined })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 block">Terms (optional)</label>
            <Input value={form.terms ?? ""} onChange={(e) => setForm({ ...form, terms: e.target.value })} placeholder="Link to term sheet or short summary" />
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 rounded-xl bg-brand-50/60 dark:bg-brand-500/[0.06] p-3">
            Total raise: <span className="font-semibold">{formatCurrency(form.totalShares * form.pricePerShareKes)}</span>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOfferingOpen(false)}>Cancel</Button>
            <Button type="submit" variant="premium" isLoading={createMut.isPending}>Create offering</Button>
          </div>
        </form>
      </Modal>

      {/* Declare-dividend modal */}
      <Modal isOpen={dividendOpen} onClose={() => setDividendOpen(false)} title="Declare dividend" description="Preview a pro-rata split of a KES pot across confirmed holders." size="lg">
        <form className="space-y-4" onSubmit={handleDividendPreview}>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 block">Dividend pot (KES)</label>
            <Input type="text" inputMode="numeric" value={potKes} onChange={(e) => setPotKes(e.target.value)} placeholder="e.g. 250000" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setDividendOpen(false)}>Close</Button>
            <Button type="submit" variant="premium" isLoading={dividendMut.isPending} leftIcon={<DollarSign className="h-3.5 w-3.5" />}>
              Preview split
            </Button>
          </div>
          {preview && (
            <div className="mt-2 rounded-xl border border-gray-100 dark:border-white/[0.06] overflow-hidden">
              <div className="px-3 py-2 bg-emerald-50/60 dark:bg-emerald-500/[0.06] text-xs">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  {preview.distributed.length} holders · Total {formatCurrency(preview.totalKes)}
                </span>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-white/[0.03] text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold">Holder</th>
                    <th className="text-right px-3 py-2 font-semibold">%</th>
                    <th className="text-right px-3 py-2 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {preview.distributed.map((d, i) => (
                    <tr key={`${d.investorUserId ?? i}`}>
                      <td className="px-3 py-2 font-mono text-xs">{d.investorUserId?.slice(0, 8) ?? d.investorEmail ?? d.investorPhone ?? `#${i + 1}`}</td>
                      <td className="px-3 py-2 text-right">{d.percent.toFixed(2)}%</td>
                      <td className="px-3 py-2 text-right font-semibold">{formatCurrency(d.amountKes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-3 py-2 text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between gap-2 border-t border-gray-100 dark:border-white/[0.05]">
                <span>Anonymous holders skipped — they must claim via link.</span>
                <Button
                  type="button"
                  size="sm"
                  variant="premium"
                  isLoading={executeMut.isPending}
                  leftIcon={<DollarSign className="h-3.5 w-3.5" />}
                  onClick={() => {
                    const n = Number(potKes.replace(/[^\d.]/g, ""));
                    if (Number.isFinite(n) && n > 0) executeMut.mutate(n);
                  }}
                >
                  Send payouts
                </Button>
              </div>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
