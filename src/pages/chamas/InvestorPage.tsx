/**
 * InvestorPage — cap table + offering management for a chama.
 * Owner creates a ShareOffering (totalShares × priceKes) then generates an
 * /invest/:token link for anyone to buy in.
 */
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PieChart, TrendingUp, Users, Plus, Coins } from "lucide-react";
import { api } from "@/api/axios";

interface Offering {
  id: string;
  chamaId: string;
  title: string;
  description?: string;
  totalShares: number;
  pricePerShareKes: number;
  minInvestmentKes?: number;
  maxInvestmentKes?: number;
  closesAt?: string;
  sharesSold: number;
  status: "open" | "closed" | "cancelled";
}
interface CapRow {
  investor: string;
  shares: number;
  amountKes: number;
  percent: number;
}
interface CapTable { totalShares: number; totalRaisedKes: number; rows: CapRow[]; }

async function listOfferings(chamaId: string): Promise<Offering[]> {
  const r = await api.get<{ success: true; data: Offering[] }>(`/chamas/${chamaId}/offerings`);
  return r.data.data;
}
async function createOffering(chamaId: string, body: Partial<Offering>): Promise<Offering> {
  const r = await api.post<{ success: true; data: Offering }>(`/chamas/${chamaId}/offerings`, { chamaId, ...body });
  return r.data.data;
}
async function fetchCapTable(chamaId: string): Promise<CapTable> {
  const r = await api.get<{ success: true; data: CapTable }>(`/chamas/${chamaId}/cap-table`);
  return r.data.data;
}
async function declareDividend(chamaId: string, potKes: number): Promise<{ distributed: unknown[]; totalKes: number }> {
  const r = await api.post<{ success: true; data: { distributed: unknown[]; totalKes: number } }>(`/chamas/${chamaId}/dividends/declare`, { potKes });
  return r.data.data;
}

function fmt(n: number): string { return `KES ${Math.round(n).toLocaleString("en-KE")}`; }

export default function InvestorPage() {
  const { id: chamaId = "" } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [totalShares, setTotalShares] = useState<string>("1000");
  const [pricePerShare, setPricePerShare] = useState<string>("1000");
  const [potKes, setPotKes] = useState<string>("");

  const offeringsQuery = useQuery({ queryKey: ["offerings", chamaId], queryFn: () => listOfferings(chamaId), enabled: !!chamaId });
  const capQuery = useQuery({ queryKey: ["cap-table", chamaId], queryFn: () => fetchCapTable(chamaId), enabled: !!chamaId });

  const createMut = useMutation({
    mutationFn: () => createOffering(chamaId, {
      title, totalShares: Number(totalShares), pricePerShareKes: Number(pricePerShare),
    }),
    onSuccess: () => {
      toast.success("Offering created");
      setTitle("");
      qc.invalidateQueries({ queryKey: ["offerings", chamaId] });
    },
    onError: (err) => {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? "Create failed";
      toast.error(msg);
    },
  });

  const dividendMut = useMutation({
    mutationFn: (kes: number) => declareDividend(chamaId, kes),
    onSuccess: (data) => {
      toast.success(`Distributed ${fmt(data.totalKes)} across ${data.distributed.length} holders`);
      setPotKes("");
    },
    onError: (err) => {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? "Declare failed";
      toast.error(msg);
    },
  });

  const cap = capQuery.data;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
          <TrendingUp className="h-3.5 w-3.5" /> Investors + Cap Table
        </div>
        <h1 className="mt-1.5 text-3xl font-bold text-gray-900 dark:text-white">Raise capital, allocate shares, pay dividends</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
          Create an offering, share the invest link, watch the cap table fill up. Dividends distribute pro-rata across holders automatically.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-5">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <Coins className="h-3.5 w-3.5" /> Raised
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{fmt(cap?.totalRaisedKes ?? 0)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-5">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <PieChart className="h-3.5 w-3.5" /> Shares issued
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{(cap?.totalShares ?? 0).toLocaleString("en-KE")}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-5">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <Users className="h-3.5 w-3.5" /> Holders
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{(cap?.rows ?? []).length}</p>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-6 mb-8">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Create offering</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex flex-col gap-1.5 md:col-span-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Seed round Q1 2026" className="rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total shares</span>
            <input type="number" value={totalShares} onChange={(e) => setTotalShares(e.target.value)} className="rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Price/share (KES)</span>
            <input type="number" value={pricePerShare} onChange={(e) => setPricePerShare(e.target.value)} className="rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1.5 justify-end">
            <button onClick={() => createMut.mutate()} disabled={!title || createMut.isPending} className="rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 px-4 py-2.5 text-sm font-semibold text-white inline-flex items-center justify-center gap-1.5">
              <Plus className="h-4 w-4" /> Create
            </button>
          </label>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Cap table</h2>
        {(cap?.rows ?? []).length === 0 ? (
          <p className="text-sm text-gray-500">No holders yet. Share the invest link.</p>
        ) : (
          <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-white/[0.03]">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Investor</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Shares</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invested</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">%</th>
                </tr>
              </thead>
              <tbody>
                {(cap?.rows ?? []).map((r, i) => (
                  <tr key={i} className="border-t border-gray-100 dark:border-white/[0.04]">
                    <td className="px-4 py-2.5 text-gray-900 dark:text-white">{r.investor}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700 dark:text-gray-300">{r.shares.toLocaleString("en-KE")}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700 dark:text-gray-300">{fmt(r.amountKes)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-brand-600">{r.percent.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Declare dividend</h2>
        <p className="text-xs text-gray-500 mb-4">Distributes pro-rata across confirmed holders by share count.</p>
        <div className="flex gap-2">
          <input type="number" value={potKes} onChange={(e) => setPotKes(e.target.value)} placeholder="Pot in KES" className="flex-1 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-3 py-2 text-sm" />
          <button onClick={() => dividendMut.mutate(Number(potKes))} disabled={!potKes || dividendMut.isPending} className="rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 px-4 py-2 text-sm font-semibold text-white">
            Declare
          </button>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Live offerings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(offeringsQuery.data ?? []).map((o) => (
            <div key={o.id} className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{o.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{o.sharesSold} / {o.totalShares} sold · {fmt(o.pricePerShareKes)} per share</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${o.status === "open" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-gray-100 text-gray-500"}`}>{o.status}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-gray-100 dark:bg-white/[0.05] overflow-hidden">
                <div className="h-full bg-brand-500" style={{ width: `${(o.sharesSold / o.totalShares) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
