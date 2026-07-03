/**
 * ShareLinkPage — chama-owner UI to create + manage shareable donate/invest links.
 * QR is generated inline via qrcode.react.
 */
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Share2, Trash2, Plus, Link2 } from "lucide-react";
import { api } from "@/api/axios";

interface Link {
  token: string;
  kind: "donate" | "invest" | "join";
  chamaId: string;
  title?: string;
  description?: string;
  targetAmountKes?: number;
  minAmountKes?: number;
  createdAt: string;
  disabled?: boolean;
}

async function listLinks(chamaId: string): Promise<Link[]> {
  const r = await api.get<{ success: true; data: Link[] }>(`/shareable-links`, { params: { chamaId } });
  return r.data.data;
}

async function createLink(body: Partial<Link> & { chamaId: string; kind: Link["kind"] }): Promise<{ link: Link; publicUrl: string; qrDataUrl: string }> {
  const r = await api.post<{ success: true; data: { link: Link; publicUrl: string; qrDataUrl: string } }>(`/shareable-links`, body);
  return r.data.data;
}

async function disableLink(token: string): Promise<void> {
  await api.delete(`/shareable-links/${token}`);
}

function publicUrl(token: string, kind: Link["kind"]): string {
  const origin = window.location.origin;
  const path = kind === "invest" ? "invest" : "give";
  return `${origin}/${path}/${token}`;
}

export default function ShareLinkPage() {
  const { id: chamaId = "" } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetKes, setTargetKes] = useState<string>("");
  const [minKes, setMinKes] = useState<string>("");
  const [kind, setKind] = useState<Link["kind"]>("donate");

  const linksQuery = useQuery({
    queryKey: ["share-links", chamaId],
    queryFn: () => listLinks(chamaId),
    enabled: !!chamaId,
  });

  const createMut = useMutation({
    mutationFn: () => createLink({
      chamaId,
      kind,
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      targetAmountKes: targetKes ? Number(targetKes) : undefined,
      minAmountKes: minKes ? Number(minKes) : undefined,
    }),
    onSuccess: () => {
      toast.success("Link created — share it!");
      setTitle(""); setDescription(""); setTargetKes(""); setMinKes("");
      qc.invalidateQueries({ queryKey: ["share-links", chamaId] });
    },
    onError: (err) => {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? "Create failed";
      toast.error(msg);
    },
  });

  const disableMut = useMutation({
    mutationFn: disableLink,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["share-links", chamaId] }),
  });

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); toast.success("Copied"); }
    catch { toast.error("Copy failed"); }
  };

  const share = async (url: string, title?: string) => {
    if (navigator.share) {
      try { await navigator.share({ title: title ?? "Support this cause", url }); } catch { /* cancel */ }
    } else copy(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
          <Link2 className="h-3.5 w-3.5" /> Shareable Links
        </div>
        <h1 className="mt-1.5 text-3xl font-bold text-gray-900 dark:text-white">Fundraise + invest with one link</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
          Generate a link + QR code anyone can open — no account, no forms, just amount + M-Pesa phone.
          Great for social broadcasts, printed posters, WhatsApp status.
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-6 mb-8">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Create new link</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</span>
            <select value={kind} onChange={(e) => setKind(e.target.value as Link["kind"])} className="rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-3 py-2 text-sm">
              <option value="donate">Donation (fundraiser)</option>
              <option value="invest">Investment (equity shares)</option>
              <option value="join">Join chama (invite)</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. School fees emergency" className="rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-3 py-2 text-sm" />
          </label>
          <label className="md:col-span-2 flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Tell donors why" className="rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Target amount (KES, optional)</span>
            <input type="number" value={targetKes} onChange={(e) => setTargetKes(e.target.value)} placeholder="100000" className="rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Minimum donation (KES, optional)</span>
            <input type="number" value={minKes} onChange={(e) => setMinKes(e.target.value)} placeholder="50" className="rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-3 py-2 text-sm" />
          </label>
        </div>
        <button onClick={() => createMut.mutate()} disabled={createMut.isPending} className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 px-4 py-2.5 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" /> Generate link + QR
        </button>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Existing links</h2>
        {linksQuery.isLoading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : (linksQuery.data ?? []).length === 0 ? (
          <p className="text-sm text-gray-500">No links yet. Create one above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(linksQuery.data ?? []).map((l) => {
              const url = publicUrl(l.token, l.kind);
              return (
                <div key={l.token} className={`rounded-2xl border p-5 bg-white dark:bg-white/[0.02] ${l.disabled ? "border-gray-100 opacity-50" : "border-gray-200 dark:border-white/[0.06]"}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="inline-block rounded-full bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                        {l.kind}
                      </span>
                      <h3 className="mt-1.5 text-sm font-semibold text-gray-900 dark:text-white">{l.title ?? "(no title)"}</h3>
                      {l.targetAmountKes ? <p className="text-xs text-gray-500 mt-0.5">Target: KES {l.targetAmountKes.toLocaleString("en-KE")}</p> : null}
                    </div>
                    <QRCodeSVG value={url} size={80} bgColor="#ffffff" fgColor="#059669" level="M" />
                  </div>
                  <p className="text-[11px] font-mono text-gray-500 break-all bg-gray-50 dark:bg-white/[0.03] rounded-lg px-2 py-1.5">{url}</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => copy(url)} className="flex-1 rounded-lg border border-gray-200 dark:border-white/[0.08] px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-white/[0.04] inline-flex items-center justify-center gap-1">
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </button>
                    <button onClick={() => share(url, l.title)} className="flex-1 rounded-lg bg-brand-600 hover:bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white inline-flex items-center justify-center gap-1">
                      <Share2 className="h-3.5 w-3.5" /> Share
                    </button>
                    <button onClick={() => disableMut.mutate(l.token)} aria-label="Disable link" className="rounded-lg border border-gray-200 dark:border-white/[0.08] px-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
