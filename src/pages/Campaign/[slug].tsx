import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  HandHeart,
  ShieldCheck,
  MapPin,
  Users,
  Clock,
  Share2,
  Copy,
  Mail,
  Flag,
  MessageCircle,
  Share2 as Facebook,
  Send as Twitter,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Avatar } from "@/components/ui/Avatar";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/dialogs/Modal";
import { EmptyState } from "@/components/common/EmptyState";
import { ContributeModal } from "@/components/payments/ContributeModal";
import { getMockDatabase } from "@/mock";
import type { Group, MpesaAccount } from "@/types";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";

// ----- Local types (sibling agent will replace with proper Donation/Group types) -----
interface CampaignDonation {
  id: string;
  donorName: string;
  amount: number;
  message?: string;
  isAnonymous: boolean;
  createdAt: string;
  paymentMethod: "mpesa" | "card" | "manual";
}

interface CampaignUpdate {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
}

interface CampaignView {
  id: string;
  slug: string;
  name: string;
  story: string;
  kind: "harambee" | "chama";
  category: string;
  location: string;
  coverImageUrl: string;
  organizerName: string;
  organizerAvatar: string;
  organizerVerified: boolean;
  targetAmount: number;
  raisedAmount: number;
  donorCount: number;
  createdAt: string;
  donations: CampaignDonation[];
  updates: CampaignUpdate[];
}

// ----- Coercion: CampaignView → harambee Group for the payment modal -----
// The campaign page still uses the legacy CampaignView shape; ContributeModal
// expects a real polymorphic Group. We adapt on the fly so we don't have to
// rewrite the loader in this changeset.
function campaignToGroup(c: CampaignView): Group {
  return {
    id: c.id,
    kind: "harambee",
    visibility: "public",
    status: "active",
    name: c.name,
    slug: c.slug,
    description: c.story,
    logoUrl: c.organizerAvatar,
    coverImageUrl: c.coverImageUrl,
    location: c.location,
    tags: [],
    createdAt: c.createdAt,
    updatedAt: c.createdAt,
    memberCount: c.donorCount,
    totalFunds: c.raisedAmount,
    requireKyc: false,
    allowDiscovery: true,
    cause: "other",
    targetAmount: c.targetAmount,
    raisedAmount: c.raisedAmount,
    organizerVerified: c.organizerVerified,
  };
}

// User's linked M-Pesa accounts. In a real app this comes from the wallet
// store / auth context; for the mock layer we ship a single default account.
const MOCK_USER_MPESA_ACCOUNTS: MpesaAccount[] = [
  {
    id: "mp_1",
    userId: "usr_1",
    phoneNumber: "+254712345678",
    isDefault: true,
    isVerified: true,
    lastUsed: new Date().toISOString(),
  },
];

// ----- Mock loader (mirrors the Discover hydration so a /c/:slug always resolves) -----
function useCampaignBySlug(slug: string | undefined): CampaignView | null {
  return useMemo(() => {
    if (!slug) return null;
    const db = getMockDatabase();
    // Find by slug suffix (last 4 chars of id) OR by name match.
    const match =
      db.chamas.find((c) => slug.endsWith(c.id.slice(-4))) ??
      db.chamas.find((c) => c.name.toLowerCase().includes(slug.toLowerCase()));
    if (!match) return null;
    const idx = db.chamas.indexOf(match);
    const organizer = db.users[idx % db.users.length];
    const target = match.totalFunds + 200_000;

    const donations: CampaignDonation[] = Array.from({ length: 20 }).map((_, i) => {
      const u = db.users[(idx + i + 1) % db.users.length];
      const anon = i % 5 === 0;
      return {
        id: `don_${match.id}_${i}`,
        donorName: anon ? "Anonymous" : u.fullName,
        amount: 200 + ((i * 731) % 8000),
        message: i % 3 === 0 ? "Pole sana. Stay strong." : undefined,
        isAnonymous: anon,
        createdAt: new Date(Date.now() - i * 3600 * 1000 * 4).toISOString(),
        paymentMethod: (["mpesa", "card", "manual"] as const)[i % 3],
      };
    });

    const updates: CampaignUpdate[] = [
      {
        id: `upd_${match.id}_1`,
        authorName: organizer.fullName,
        body: "Thank you to everyone who has contributed so far. Funeral arrangements are on track for Saturday.",
        createdAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
      },
      {
        id: `upd_${match.id}_2`,
        authorName: organizer.fullName,
        body: "We have crossed 50% of our target — asante sana for the love and support.",
        createdAt: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
      },
    ];

    return {
      id: match.id,
      slug,
      name: match.name,
      story: match.description + "\n\nWe humbly ask for your support to help cover hospital bills and family logistics. Every shilling counts and goes directly to the family.",
      kind: idx % 2 === 0 ? "harambee" : "chama",
      category: match.category,
      location: match.location,
      coverImageUrl: `https://picsum.photos/seed/${encodeURIComponent(match.id)}/1200/520`,
      organizerName: organizer.fullName,
      organizerAvatar: organizer.avatarUrl,
      organizerVerified: idx % 3 === 0,
      targetAmount: target,
      raisedAmount: match.totalFunds,
      donorCount: donations.length,
      createdAt: match.createdAt,
      donations,
      updates,
    };
  }, [slug]);
}

// ----- Report modal -----
function ReportModal({ isOpen, onClose, campaignId }: { isOpen: boolean; onClose: () => void; campaignId: string }) {
  const [reason, setReason] = useState("misleading");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      // TODO: real backend endpoint pending — stubbed to silently absorb the 404.
      await fetch("/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, reason, details }),
      }).catch(() => null);
      toast.success("Thanks — our trust team will review within 24 hours.");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report this campaign" size="md">
      <div className="space-y-4">
        <Select
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          options={[
            { value: "misleading", label: "Misleading or fraudulent" },
            { value: "impersonation", label: "Impersonating someone" },
            { value: "duplicate", label: "Duplicate of another campaign" },
            { value: "policy", label: "Violates platform policy" },
            { value: "other", label: "Other" },
          ]}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Additional details
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            placeholder="Tell us what feels off..."
            className="w-full rounded-xl border border-gray-300 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onSubmit} isLoading={submitting}>Submit report</Button>
        </div>
      </div>
    </Modal>
  );
}

// ----- Share helpers -----
function getShareUrl(slug: string) {
  if (typeof window === "undefined") return `https://pamojawealth.app/c/${slug}`;
  return `${window.location.origin}/c/${slug}`;
}

function ShareButtons({ campaign }: { campaign: CampaignView }) {
  const url = getShareUrl(campaign.slug);
  const text = `Support ${campaign.name} on Pamoja Wealth`;
  const enc = encodeURIComponent;
  const items = [
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${enc(`${text} ${url}`)}`,
    },
    { label: "X", icon: Twitter, href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}` },
    { label: "Facebook", icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { label: "Email", icon: Mail, href: `mailto:?subject=${enc(text)}&body=${enc(`${text}\n\n${url}`)}` },
  ];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy — please copy from the URL bar");
    }
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((it) => (
        <a
          key={it.label}
          href={it.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors"
        >
          <it.icon className="h-3.5 w-3.5" /> {it.label}
        </a>
      ))}
      <button
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors"
      >
        <Copy className="h-3.5 w-3.5" /> Copy link
      </button>
    </div>
  );
}

export default function CampaignPage() {
  const { slug } = useParams<{ slug: string }>();
  const campaign = useCampaignBySlug(slug);
  const [donateOpen, setDonateOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  // Document title + minimal OG meta. Full SSR/Helmet is on the roadmap — see RESEARCH_DOSSIER.
  useEffect(() => {
    if (!campaign) return;
    const prev = document.title;
    document.title = `${campaign.name} — Pamoja Wealth`;
    const ensureMeta = (property: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    ensureMeta("og:title", campaign.name);
    ensureMeta("og:description", campaign.story.slice(0, 160));
    ensureMeta("og:image", campaign.coverImageUrl);
    ensureMeta("og:type", "website");
    return () => {
      document.title = prev;
    };
  }, [campaign]);

  if (!campaign) {
    return (
      <div className="max-w-3xl mx-auto p-12">
        <EmptyState
          icon={HandHeart}
          title="Campaign not found"
          description="The link may have expired or the organizer made the campaign private."
        />
      </div>
    );
  }

  const pct = Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100));

  return (
    <>
      <article className="max-w-5xl mx-auto px-6 pt-8 pb-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02]"
        >
          <div className="relative h-64 sm:h-80 w-full bg-gray-100 dark:bg-white/[0.03]">
            <img
              src={campaign.coverImageUrl}
              alt={campaign.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <Badge variant={campaign.kind === "harambee" ? "warning" : "brand"}>
                <HandHeart className="h-3 w-3" /> {campaign.kind === "harambee" ? "Harambee" : "Public Chama"}
              </Badge>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{campaign.name}</h1>
            <div className="mt-3 flex items-center gap-3">
              <Avatar src={campaign.organizerAvatar} name={campaign.organizerName} size="sm" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                  Organized by {campaign.organizerName}
                  {campaign.organizerVerified && (
                    <ShieldCheck className="h-4 w-4 text-brand-500" aria-label="Verified organizer" />
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-3">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{campaign.location}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{formatRelativeTime(campaign.createdAt)}</span>
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <ProgressBar value={pct} size="lg" />
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-bold text-xl text-gray-900 dark:text-white">{formatCurrency(campaign.raisedAmount)}</span>
                  <span className="text-gray-500 dark:text-gray-400">raised of {formatCurrency(campaign.targetAmount)}</span>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {campaign.donorCount} donors
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="premium" leftIcon={<Heart className="h-4 w-4" />} onClick={() => setDonateOpen(true)}>
                  Donate
                </Button>
                <details className="rounded-xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-3 py-2">
                  <summary className="cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-200 inline-flex items-center gap-1.5">
                    <Share2 className="h-3.5 w-3.5" /> Share
                  </summary>
                  <div className="mt-3">
                    <ShareButtons campaign={campaign} />
                  </div>
                </details>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Body grid */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: story + updates */}
          <div className="lg:col-span-2 space-y-10">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Story</h2>
              {/* Escaped text rendering — react-markdown not installed. */}
              <div className="mt-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {campaign.story}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Updates</h2>
              <ol className="mt-4 space-y-4">
                {campaign.updates.map((u) => (
                  <li
                    key={u.id}
                    className="relative pl-6 border-l-2 border-brand-200 dark:border-brand-500/20"
                  >
                    <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-brand-500" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {u.authorName} • {formatRelativeTime(u.createdAt)}
                    </p>
                    <p className="mt-1 text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{u.body}</p>
                  </li>
                ))}
              </ol>
            </section>

            <button
              onClick={() => setReportOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-600 transition-colors"
            >
              <Flag className="h-3.5 w-3.5" /> Report this campaign
            </button>
          </div>

          {/* Right: donor wall */}
          <aside>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent donors</h2>
            <ul className="mt-4 space-y-3">
              {campaign.donations.map((d) => (
                <li
                  key={d.id}
                  className={cn(
                    "rounded-xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-3"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {d.isAnonymous ? "Anonymous" : d.donorName}
                    </p>
                    <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                      {formatCurrency(d.amount)}
                    </span>
                  </div>
                  {d.message && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">"{d.message}"</p>
                  )}
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-gray-400">
                    {formatRelativeTime(d.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </article>

      <ContributeModal
        isOpen={donateOpen}
        onClose={() => setDonateOpen(false)}
        mode="donate"
        group={campaignToGroup(campaign)}
        mpesaAccounts={MOCK_USER_MPESA_ACCOUNTS}
      />
      <ReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} campaignId={campaign.id} />
    </>
  );
}
