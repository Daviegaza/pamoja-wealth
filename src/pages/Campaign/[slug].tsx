import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar, Heart, MapPin, Share2, ShieldCheck, Users, Flag, Clock,
  Wallet, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ContributeModal } from "@/components/payments/ContributeModal";
import { DonorWall } from "@/components/fundraising/DonorWall";
import { ShareCampaign } from "@/components/fundraising/ShareCampaign";
import * as chamaApi from "@/api/chama";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

interface CampaignDonation {
  id: string;
  donorName: string;
  amount: number;
  message?: string;
  isAnonymous: boolean;
  createdAt: string;
  paymentMethod: string;
}

interface CampaignUpdate {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
}

interface CampaignView {
  id: string;
  name: string;
  slug: string;
  description: string;
  kind: string;
  category: string;
  location: string;
  coverImageUrl?: string;
  targetAmount: number;
  raisedAmount: number;
  donorCount: number;
  memberCount: number;
  organizer: { name: string; isVerified: boolean; avatarUrl?: string };
  createdAt: string;
  endDate?: string;
  donations: CampaignDonation[];
  updates: CampaignUpdate[];
}

function CampaignSkeleton() {
  return (
    <div className="animate-pulse max-w-4xl mx-auto px-6 py-12 space-y-6">
      <div className="h-64 bg-gray-200 dark:bg-white/[0.04] rounded-2xl" />
      <div className="h-8 w-2/3 bg-gray-200 dark:bg-white/[0.04] rounded" />
      <div className="h-4 w-1/2 bg-gray-200 dark:bg-white/[0.04] rounded" />
    </div>
  );
}

export default function CampaignPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [contributeOpen, setContributeOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Fetch from API with mock fallback for seamless demo experience
  const { data: campaign, isLoading, isError } = useQuery({
    queryKey: ["campaign", slug],
    queryFn: async () => {
      // Try the API first
      try {
        const res = await chamaApi.discover({ page: 1, pageSize: 100 });
        const items = res?.items ?? [];
        const found = items.find((c: any) => {
          const cSlug = c.slug ?? c.id;
          return cSlug === slug || cSlug.endsWith(slug?.slice(-4) ?? "") ||
            c.name?.toLowerCase().includes((slug ?? "").toLowerCase());
        });
        if (found) {
          const f = found as any;
          let donations: CampaignDonation[] = [];
          try {
            const donRes = await fetch(
              `${import.meta.env.VITE_API_BASE_URL || "/api/v1"}/chamas/${f.id}/donations`,
              { headers: { Authorization: `Bearer ${localStorage.getItem("pamoja_token")}` } },
            );
            if (donRes.ok) {
              const donData = await donRes.json();
              donations = (donData.data?.items ?? donData.data ?? []).map((d: any) => ({
                id: d.id, donorName: d.isAnonymous ? "Anonymous" : (d.donorName ?? "Supporter"),
                amount: Number(d.amount ?? 0), message: d.message, isAnonymous: d.isAnonymous ?? false,
                createdAt: d.createdAt, paymentMethod: d.paymentMethod ?? "mpesa",
              }));
            }
          } catch { /* optional */ }
          return { id: f.id, name: f.name, slug: f.slug ?? f.id, description: f.description ?? "",
            kind: f.type ?? "harambee", category: f.category ?? "general", location: f.location ?? "Kenya",
            coverImageUrl: f.coverImageUrl, targetAmount: Number(f.targetAmount ?? 300000),
            raisedAmount: Number(f.raisedAmount ?? 0), donorCount: f.donorCount ?? 0, memberCount: f.memberCount ?? 0,
            organizer: { name: f.ownerName ?? "Organizer", isVerified: f.ownerVerified ?? false },
            createdAt: f.createdAt, endDate: f.endDate, donations, updates: [] } as CampaignView;
        }
      } catch { /* fall through to mock */ }

      // ── Mock fallback for demos ──
      const { getMockDatabase } = await import("@/mock");
      const db = getMockDatabase();
      const match = db.chamas.find((c: any) =>
        (slug ?? "").endsWith(c.id.slice(-4)) ||
        c.name?.toLowerCase().includes((slug ?? "").toLowerCase())
      ) ?? db.chamas[0];
      const idx = db.chamas.indexOf(match);
      const organizer = db.users[idx % db.users.length];
      const target = (match.totalFunds || 100000) + 200000;
      const raised = Math.min(target, match.totalFunds || 0);

      const mockDonations: CampaignDonation[] = Array.from({ length: 20 }).map((_, i) => {
        const u = db.users[(idx + i + 1) % db.users.length];
        const anon = i % 5 === 0;
        return {
          id: `don_${match.id}_${i}`,
          donorName: anon ? "Anonymous" : u.fullName,
          amount: 200 + ((i * 731) % 8000),
          message: i % 3 === 0 ? ["Keep going!", "God bless you all", "With love", "In solidarity"][i % 4] : undefined,
          isAnonymous: anon,
          createdAt: new Date(Date.now() - i * 3600_000 * 4).toISOString(),
          paymentMethod: (["mpesa", "card", "manual"] as const)[i % 3],
        };
      });

      return {
        id: match.id, name: match.name, slug: slug ?? match.id, description: match.description ?? "A community fundraiser supporting our cause.",
        kind: idx % 2 === 0 ? "harambee" : "chama", category: match.category ?? "general", location: match.location ?? "Nairobi, Kenya",
        coverImageUrl: `https://picsum.photos/seed/${match.id}/1200/600`,
        targetAmount: target, raisedAmount: raised, donorCount: 25 + ((idx * 17) % 200), memberCount: match.memberCount ?? 30,
        organizer: { name: organizer?.fullName ?? "Pamoja Member", isVerified: idx % 4 === 0 },
        createdAt: match.createdAt, endDate: new Date(Date.now() + 14 * 86400_000).toISOString(),
        donations: mockDonations, updates: [{
          id: `upd_1`, authorName: organizer?.fullName ?? "Organizer",
          body: "Thank you to everyone who has contributed so far. We're making great progress! Every donation brings us closer to our goal.",
          createdAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
        }],
      } as CampaignView;
    },
    staleTime: 30_000,
    enabled: !!slug,
  });

  if (isLoading) return <CampaignSkeleton />;

  if (isError || !campaign) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campaign Not Found</h1>
        <p className="mt-2 text-gray-500">This campaign may have been removed or the link is incorrect.</p>
        <Button className="mt-6" onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const pct = campaign.targetAmount > 0
    ? Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100))
    : 0;

  const isHarambee = campaign.kind === "harambee";
  const campaignUrl = `https://pamojawealth.app/c/${campaign.slug}`;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
      {/* Cover Image */}
      {campaign.coverImageUrl && (
        <motion.img
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          src={campaign.coverImageUrl}
          alt={campaign.name}
          className="w-full h-48 md:h-72 object-cover rounded-2xl shadow-lg"
        />
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={isHarambee ? "warning" : "brand"}>
                {isHarambee ? "Harambee" : campaign.kind === "chama" ? "Chama" : "Group"}
              </Badge>
              <Badge variant="info">{campaign.category}</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {campaign.name}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
              <span>by {campaign.organizer.name}</span>
              {campaign.organizer.isVerified && (
                <ShieldCheck className="h-4 w-4 text-brand-500" />
              )}
            </p>
          </div>

          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {campaign.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{campaign.location}</span>
            <span className="flex items-center gap-1"><Users className="h-4 w-4" />{campaign.memberCount} members</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Created {formatRelativeTime(campaign.createdAt)}</span>
            {campaign.endDate && (
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />Ends {new Date(campaign.endDate).toLocaleDateString()}</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setContributeOpen(true)} className="gap-2" size="lg">
              <Heart className="h-5 w-5" /> Contribute Now
            </Button>
            <Button onClick={() => setShareOpen(true)} variant="outline" className="gap-2" size="lg">
              <Share2 className="h-5 w-5" /> Share
            </Button>
            <Button variant="ghost" className="gap-2" size="lg" onClick={() => toast.info("Report feature coming soon")}>
              <Flag className="h-4 w-4" />
            </Button>
          </div>

          {/* Updates */}
          {campaign.updates.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Updates</h2>
              {campaign.updates.map((u) => (
                <div key={u.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{u.authorName}</p>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">{u.body}</p>
                  <p className="mt-2 text-xs text-gray-400">{formatRelativeTime(u.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24">
            <ProgressBar value={pct} max={100} size="lg" />
            <div className="mt-3 flex justify-between text-sm">
              <span className="font-bold text-gray-900 dark:text-white text-lg">
                {formatCurrency(campaign.raisedAmount)}
              </span>
              <span className="text-gray-500">
                of {formatCurrency(campaign.targetAmount)}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">{pct}% funded</p>
            <p className="mt-1 text-sm text-gray-500">{campaign.donorCount} donors</p>

            <Button onClick={() => setContributeOpen(true)} className="w-full mt-4 gap-2" size="lg">
              <Heart className="h-5 w-5" /> Contribute
            </Button>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 space-y-1">
              <p className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-brand-500" />Verified platform</p>
              <p className="flex items-center gap-1"><Wallet className="h-3.5 w-3.5" />M-Pesa & Card accepted</p>
              <p>2.5% platform fee on harambee donations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Donor Wall */}
      <div className="mt-12">
        <DonorWall
          donors={campaign.donations.map(d => ({
            id: d.id, name: d.donorName, amount: d.amount,
            message: d.message, isAnonymous: d.isAnonymous, timestamp: d.createdAt,
          }))}
          totalRaised={campaign.raisedAmount}
          targetAmount={campaign.targetAmount}
          donorCount={campaign.donorCount}
        />
      </div>

      {/* Modals */}
      <ContributeModal
        isOpen={contributeOpen}
        onClose={() => setContributeOpen(false)}
        group={{
          id: campaign.id,
          name: campaign.name,
          kind: (campaign.kind === "harambee" ? "harambee" : "chama") as any,
          type: (campaign.kind === "harambee" ? "harambee" : "chama") as any,
          description: campaign.description || "",
          category: campaign.category || "general",
          privacy: "public",
          location: campaign.location || "Kenya",
          memberCount: campaign.memberCount,
          totalFunds: campaign.raisedAmount,
          createdAt: campaign.createdAt,
        } as any}
        mode={campaign.kind === "harambee" ? "donate" : "contribute"}
        suggestedAmount={500}
      />
      <ShareCampaign
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        campaignTitle={campaign.name}
        campaignUrl={campaignUrl}
        referralCode={user?.id?.slice(0, 8)?.toUpperCase() || "PAMOJA"}
        amountRaised={campaign.raisedAmount}
        targetAmount={campaign.targetAmount}
      />
    </div>
  );
}
