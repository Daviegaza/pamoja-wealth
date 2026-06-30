import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Compass,
  MapPin,
  Users,
  Clock,
  HandHeart,
  Plus,
  ShieldCheck,
  PiggyBank,
  Wallet as WalletIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/common/EmptyState";
import { getMockDatabase } from "@/mock";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";
import type { Chama } from "@/types";

// Local card type — tolerates both old `Chama` and new polymorphic `Group` shapes.
type DiscoveryCard = Chama & {
  // Extension fields the sibling agent will introduce — declared optional so this file
  // compiles cleanly against either the old or the new types.
  kind?: "chama" | "harambee" | "pot" | "savings_loan";
  visibility?: "public" | "private" | "invite_only";
  allowDiscovery?: boolean;
  organizer?: { name: string; isVerified?: boolean };
  coverImageUrl?: string;
  targetAmount?: number;
  raisedAmount?: number;
  donorCount?: number;
  slug?: string;
  lastActivityAt?: string;
};

type Filter = "all" | "harambee" | "chama" | "pot";

const FILTER_TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "harambee", label: "Harambees" },
  { key: "chama", label: "Public Chamas" },
  { key: "pot", label: "Pots" },
];

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All categories" },
  { value: "savings", label: "Savings" },
  { value: "investment", label: "Investment" },
  { value: "welfare", label: "Welfare" },
  { value: "mixed", label: "Mixed" },
  { value: "medical", label: "Medical" },
  { value: "education", label: "Education" },
  { value: "funeral", label: "Funeral" },
];

const KIND_META: Record<NonNullable<DiscoveryCard["kind"]>, { label: string; icon: typeof HandHeart; variant: "brand" | "info" | "warning" | "success" }> = {
  harambee: { label: "Harambee", icon: HandHeart, variant: "warning" },
  chama: { label: "Chama", icon: Users, variant: "brand" },
  pot: { label: "Pot", icon: WalletIcon, variant: "info" },
  savings_loan: { label: "Savings & Loan", icon: PiggyBank, variant: "success" },
};

/** Hydrate raw mock chamas into discovery-friendly cards. */
function useDiscoveryCards(): DiscoveryCard[] {
  return useMemo(() => {
    const db = getMockDatabase();
    return db.chamas.map((c, idx): DiscoveryCard => {
      const kindCycle: DiscoveryCard["kind"] = ["harambee", "chama", "pot", "savings_loan"][idx % 4] as DiscoveryCard["kind"];
      const target = (c.totalFunds || 100_000) + 200_000;
      const raised = Math.min(target, c.totalFunds || 0);
      const organizer = db.users[idx % db.users.length];
      const slug = c.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") + "-" + c.id.slice(-4);
      // Treat odd records as already public + discoverable, so the page renders content.
      const visibility = idx % 3 === 0 ? "private" : "public";
      const allowDiscovery = visibility === "public";
      return {
        ...c,
        kind: kindCycle,
        visibility,
        allowDiscovery,
        organizer: {
          name: organizer?.fullName ?? "Pamoja Member",
          isVerified: idx % 4 === 0,
        },
        coverImageUrl: `https://picsum.photos/seed/${encodeURIComponent(c.id)}/800/450`,
        targetAmount: target,
        raisedAmount: raised,
        donorCount: 5 + ((idx * 13) % 240),
        slug,
        lastActivityAt: c.createdAt,
      };
    });
  }, []);
}

function CardSkeleton() {
  return (
    <div className="card-hover overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-200 dark:bg-white/[0.04]" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-2/3 bg-gray-200 dark:bg-white/[0.04] rounded" />
        <div className="h-3 w-1/2 bg-gray-200 dark:bg-white/[0.04] rounded" />
        <div className="h-2 w-full bg-gray-200 dark:bg-white/[0.04] rounded-full" />
      </div>
    </div>
  );
}

function DiscoveryCardView({ card }: { card: DiscoveryCard }) {
  const kindKey = card.kind ?? "chama";
  const meta = KIND_META[kindKey];
  const Icon = meta.icon;
  const showProgress = kindKey === "harambee" && (card.targetAmount ?? 0) > 0;
  const pct = showProgress
    ? Math.min(100, Math.round(((card.raisedAmount ?? 0) / (card.targetAmount ?? 1)) * 100))
    : 0;
  const to = `/c/${card.slug ?? card.id}`;

  return (
    <motion.div whileHover={{ y: -3 }} className="h-full">
      <Link to={to} className="card-hover overflow-hidden block group h-full flex flex-col">
        <div className="relative h-44 w-full overflow-hidden bg-gray-100 dark:bg-white/[0.03]">
          <img
            src={card.coverImageUrl}
            alt={card.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <Badge variant={meta.variant} className="backdrop-blur-sm">
              <Icon className="h-3 w-3" /> {meta.label}
            </Badge>
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
            {card.name}
          </h3>

          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className="truncate">by {card.organizer?.name ?? "Anonymous"}</span>
            {card.organizer?.isVerified && (
              <ShieldCheck className="h-3.5 w-3.5 text-brand-500 shrink-0" aria-label="Verified organizer" />
            )}
          </p>

          {showProgress && (
            <div className="mt-4">
              <ProgressBar value={pct} max={100} size="sm" />
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(card.raisedAmount ?? 0)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  of {formatCurrency(card.targetAmount ?? 0)}
                </span>
              </div>
            </div>
          )}

          <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {card.donorCount ?? card.memberCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate max-w-[80px]">{card.location}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatRelativeTime(card.lastActivityAt ?? card.createdAt)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Discover() {
  const allCards = useDiscoveryCards();
  const [filter, setFilter] = useState<Filter>("all");
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // Simulate suspense-style lazy hydration — paints skeletons on first frame.
  useEffect(() => {
    const t = setTimeout(() => setHydrated(true), 80);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    return allCards
      .filter((c) => c.visibility === "public" && c.allowDiscovery !== false)
      .filter((c) => (filter === "all" ? true : c.kind === filter))
      .filter((c) => (category === "all" ? true : c.category === category))
      .filter((c) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.organizer?.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
        );
      });
  }, [allCards, filter, category, query]);

  return (
    <div className="relative">
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl icon-gradient-brand">
            <Compass className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Discover</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
          Find public harambees, open chamas, and group pots that match your interests. Every campaign here is
          publicly listed by its organizer.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl bg-gray-100 dark:bg-white/[0.04] p-1">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors focus-ring",
                  filter === tab.key
                    ? "bg-white dark:bg-white/[0.08] text-gray-900 dark:text-white shadow-soft-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search campaigns, locations, organizers..."
              className="h-11 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 pl-9 pr-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 focus-ring"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 rounded-xl border border-gray-300 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-3.5 text-sm text-gray-900 dark:text-gray-100 focus-ring"
            aria-label="Filter by category"
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-white dark:bg-neutral-900">
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        {!hydrated ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No public campaigns match those filters"
            description="Try clearing the search box or switching the filter chips above."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c) => (
              <DiscoveryCardView key={c.id} card={c} />
            ))}
          </div>
        )}
      </section>

      <Link
        to="/create"
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-glow-md hover:shadow-glow-lg active:scale-[0.97] transition-all"
      >
        <Plus className="h-4 w-4" />
        Start your own
      </Link>
    </div>
  );
}
