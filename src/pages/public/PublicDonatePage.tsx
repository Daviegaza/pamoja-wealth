/**
 * Public donation page — /give/:token
 *
 * Anonymous. No login. One screen: cause preview + amount + phone → STK Push
 * on device. Shareable link designed for social broadcast: WhatsApp, X,
 * SMS, printed QR.
 */
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Heart, Loader2, Share2, Users, Target, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import axios from "axios";

interface Preview {
  ok: boolean;
  link?: { token: string; kind: string; chamaId: string; title?: string; description?: string; targetAmountKes?: number; minAmountKes?: number };
  chama?: { name: string; description: string | null; logoUrl: string | null; category: string };
  progress?: { raisedKes: number; targetKes?: number; donorCount: number };
}

const API = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

async function fetchPreview(token: string): Promise<Preview> {
  const r = await axios.get<{ success: true; data: Preview }>(`${API}/public/link/${token}`);
  return r.data.data;
}

async function submitDonation(token: string, body: { amountKes: number; phone: string; name?: string; email?: string; message?: string; isAnonymous?: boolean }): Promise<{ reference: string }> {
  const r = await axios.post<{ success: true; data: { reference: string } }>(`${API}/public/donate/${token}`, body);
  return r.data.data;
}

function fmt(n: number): string {
  return `KES ${n.toLocaleString("en-KE")}`;
}

const QUICK_AMOUNTS = [100, 500, 1000, 5000, 10000];

export default function PublicDonatePage() {
  const { token } = useParams<{ token: string }>();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState<string>("500");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<"form" | "waiting" | "done" | "failed">("form");
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchPreview(token).then(setPreview).catch(() => setPreview({ ok: false })).finally(() => setLoading(false));
  }, [token]);

  const progressPct = useMemo(() => {
    const t = preview?.progress?.targetKes;
    const r = preview?.progress?.raisedKes ?? 0;
    if (!t || t === 0) return 0;
    return Math.min(100, Math.round((r / t) * 100));
  }, [preview]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const onNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: preview?.chama?.name ?? "Support this cause", url: shareUrl });
      } catch { /* user cancelled */ }
    } else {
      onCopyLink();
    }
  };

  const onSubmit = async () => {
    if (!token) return;
    const amtNum = Number(amount);
    if (!Number.isFinite(amtNum) || amtNum <= 0) { toast.error("Enter a valid amount"); return; }
    if (!phone.trim()) { toast.error("Enter your M-Pesa phone"); return; }
    setSubmitting(true);
    try {
      const res = await submitDonation(token, {
        amountKes: amtNum,
        phone: phone.trim(),
        name: anonymous ? undefined : (name.trim() || undefined),
        email: anonymous ? undefined : (email.trim() || undefined),
        message: message.trim() || undefined,
        isAnonymous: anonymous,
      });
      setReference(res.reference);
      setStage("waiting");
      // Optimistic: assume success after 45s (real completion via M-Pesa callback + FE polling in prod).
      setTimeout(() => setStage((s) => (s === "waiting" ? "done" : s)), 45_000);
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? "Payment failed";
      toast.error(msg);
      setStage("failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-600" /></div>;
  }
  if (!preview?.ok) {
    return <div className="min-h-screen flex items-center justify-center p-8 text-center">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Link not found</h1>
        <p className="mt-2 text-sm text-gray-500">The donation link is invalid, disabled or expired.</p>
        <Link to="/" className="mt-4 inline-block text-brand-600 hover:underline">Back to Pamoja Wealth</Link>
      </div>
    </div>;
  }

  const { chama, link, progress } = preview;

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Cause card */}
        <div className="rounded-3xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] shadow-sm overflow-hidden">
          {chama?.logoUrl && (
            <img src={chama.logoUrl} alt="" className="w-full h-40 object-cover" />
          )}
          <div className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                  {link?.kind === "donate" ? "Give to this cause" : "Support"}
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {link?.title ?? chama?.name}
                </h1>
                {link?.description || chama?.description ? (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {link?.description ?? chama?.description}
                  </p>
                ) : null}
              </div>
              <button
                onClick={onNativeShare}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-500/15 px-3 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-500/25"
                aria-label="Share this cause"
              >
                <Share2 className="h-3.5 w-3.5" /> Share
              </button>
            </div>

            {progress && (
              <div className="mt-5">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                  <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {progress.donorCount} donors</span>
                  {progress.targetKes ? <span className="inline-flex items-center gap-1"><Target className="h-3 w-3" /> {progressPct}% of {fmt(progress.targetKes)}</span> : null}
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-white/[0.08] overflow-hidden">
                  <div className="h-full bg-brand-500" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="mt-1.5 text-lg font-bold text-gray-900 dark:text-white">{fmt(progress.raisedKes)} raised</p>
              </div>
            )}
          </div>
        </div>

        {/* Donation form / stages */}
        <div className="mt-6 rounded-3xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-6 shadow-sm">
          {stage === "form" && (
            <>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Amount (KES)</label>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {QUICK_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAmount(String(a))}
                    className={`rounded-xl border px-2 py-2 text-sm font-semibold transition-colors ${amount === String(a) ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300" : "border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]"}`}
                  >
                    {a >= 1000 ? `${a / 1000}K` : a}
                  </button>
                ))}
              </div>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Custom amount"
                className="mt-3 w-full rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-lg font-semibold text-gray-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                min={link?.minAmountKes ?? 10}
              />

              <label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">M-Pesa phone</label>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XX or +2547XX"
                autoComplete="tel"
                className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              />

              {!anonymous && (
                <>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name (optional)"
                    className="mt-3 w-full rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email for receipt (optional)"
                    className="mt-2 w-full rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                  />
                </>
              )}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message (optional)"
                rows={2}
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              />

              <label className="mt-3 inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="rounded" />
                Donate anonymously
              </label>

              <button
                onClick={onSubmit}
                disabled={submitting}
                className="mt-6 w-full rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 px-4 py-3 text-white font-semibold shadow-sm inline-flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
                Give {amount ? fmt(Number(amount)) : ""}
              </button>
              <p className="mt-2 text-[11px] text-center text-gray-400">Powered by M-Pesa STK · Instant · No account needed</p>
            </>
          )}

          {stage === "waiting" && (
            <div className="text-center py-8">
              <div className="mx-auto h-14 w-14 rounded-full bg-brand-100 dark:bg-brand-500/15 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-brand-600 animate-spin" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Check your phone</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Enter your M-Pesa PIN to complete the donation of {fmt(Number(amount))}.</p>
              {reference && <p className="mt-3 text-xs font-mono text-gray-400">Ref: {reference}</p>}
            </div>
          )}

          {stage === "done" && (
            <div className="text-center py-8">
              <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center">
                <Check className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Thank you!</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your gift is on the way.</p>
              <button onClick={onNativeShare} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline">
                <Share2 className="h-4 w-4" /> Share with others
              </button>
            </div>
          )}

          {stage === "failed" && (
            <div className="text-center py-6">
              <p className="text-sm text-red-600 dark:text-red-400">Something went wrong. Try again.</p>
              <button onClick={() => setStage("form")} className="mt-3 rounded-lg bg-brand-600 hover:bg-brand-700 px-4 py-2 text-sm text-white font-semibold">Try again</button>
            </div>
          )}
        </div>

        {/* QR + share panel */}
        <details className="mt-6 rounded-3xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-4">
          <summary className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer select-none">Share this link — QR + copy</summary>
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
            <QRCodeSVG value={shareUrl} size={144} bgColor="#ffffff" fgColor="#059669" level="H" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 break-all">{shareUrl}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={onCopyLink} className="flex-1 rounded-lg border border-gray-200 dark:border-white/[0.08] px-3 py-2 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-white/[0.04]">Copy link</button>
                <button onClick={onNativeShare} className="flex-1 rounded-lg bg-brand-600 hover:bg-brand-700 px-3 py-2 text-xs font-semibold text-white">Share</button>
              </div>
            </div>
          </div>
        </details>

        <p className="mt-6 text-center text-[11px] text-gray-400">
          <Link to="/" className="hover:underline">Pamoja Wealth</Link> · Secure. Instant. Anywhere in Kenya.
        </p>
      </div>
    </div>
  );
}
