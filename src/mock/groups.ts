import type {
  Chama,
  ChamaCategory,
  ChamaGroup,
  ChamaRuleVersion,
  Donation,
  Group,
  HarambeeGroup,
  PaymentMethodType,
  PotGroup,
  RuleDoc,
  SavingsLoanGroup,
  User,
} from "@/types";
import {
  CHAMA_NAMES,
  LOCATIONS,
  avatarUrl,
  pick,
  randFloat,
  randInt,
  randomDateBetween,
  seedRandom,
} from "./generator";

const NOW = new Date();
const TODAY_TS = NOW.getTime();
const DAY_MS = 86400000;

function daysAgo(n: number): Date {
  return new Date(TODAY_TS - n * DAY_MS);
}
function daysFromNow(n: number): Date {
  return new Date(TODAY_TS + n * DAY_MS);
}

function slugify(name: string, idx: number): string {
  return `${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${idx}`;
}

// ===== Re-shape legacy Chama into ChamaGroup =====

export function chamasToGroups(chamas: Chama[]): ChamaGroup[] {
  return chamas.map((c, idx) => ({
    id: `grp_cha_${idx + 1}`,
    kind: "chama" as const,
    visibility: "private" as const,
    status: c.status,
    name: c.name,
    slug: slugify(c.name, idx + 1),
    description: c.description,
    logoUrl: c.logoUrl,
    location: c.location,
    tags: [c.category],
    createdAt: c.createdAt,
    updatedAt: c.createdAt,
    memberCount: c.memberCount,
    totalFunds: c.totalFunds,
    requireKyc: true,
    allowDiscovery: false,
    category: c.category,
    monthlyContribution: c.monthlyContribution,
    entryDeposit: randInt(0, 5000),
    maxMembers: 100,
    nextMeetingDate: c.nextMeetingDate,
    growthRate: c.growthRate,
  }));
}

// ===== Harambees =====

const HARAMBEE_CAUSES: HarambeeGroup["cause"][] = [
  "medical",
  "wedding",
  "funeral",
  "education",
  "emergency",
  "community",
  "other",
];

const HARAMBEE_TITLES: Record<HarambeeGroup["cause"], string[]> = {
  medical: [
    "Help Baby Joy fight leukemia",
    "Surgery for Mama Akinyi",
    "ICU bills for Onyango",
    "Cancer treatment for Brian",
  ],
  wedding: [
    "Esther & Kevin wedding fund",
    "Kuoyo dowry contribution",
    "Naliaka traditional ceremony",
  ],
  funeral: [
    "Sendoff for Mzee Kamau",
    "Burial expenses for Late Achieng",
    "Casket and transport for Baba Otieno",
  ],
  education: [
    "School fees for Wanjiku",
    "University funds for Brian",
    "Laptop for Margaret's coding bootcamp",
  ],
  emergency: [
    "Fire victims of Kibera block 7",
    "Flood relief for Budalangi",
    "Roof repair after the storm",
  ],
  community: [
    "Borehole for Kajiado village",
    "Library books for Mtopanga primary",
    "Football kits for Kibera youth",
  ],
  other: ["Mama Otieno's chai shop launch", "Helping Said move to Eldoret"],
};

export function generateHarambees(count: number): HarambeeGroup[] {
  seedRandom(5005);
  const out: HarambeeGroup[] = [];
  for (let i = 0; i < count; i++) {
    const cause = pick(HARAMBEE_CAUSES);
    const title = pick(HARAMBEE_TITLES[cause]);
    const target = randInt(20_000, 3_000_000);
    const raisedPct = randFloat(0.05, 1.4, 2);
    const raised = Math.min(target * 2, Math.round(target * raisedPct));
    const memberCount = randInt(5, 800);
    out.push({
      id: `grp_har_${i + 1}`,
      kind: "harambee",
      visibility: pick(["public", "public", "invite_only"] as const),
      status: raised >= target ? "completed" : "active",
      name: title,
      slug: slugify(title, i + 1),
      description: `Asante kwa kusaidia. ${title}. Every shilling counts.`,
      logoUrl: avatarUrl(title, i),
      coverImageUrl: `https://picsum.photos/seed/har${i}/800/400`,
      location: pick(LOCATIONS),
      tags: [cause, "harambee"],
      createdAt: randomDateBetween(daysAgo(120), daysAgo(2)),
      updatedAt: randomDateBetween(daysAgo(7), NOW),
      memberCount,
      totalFunds: raised,
      paybillAccountNumber: `HAR-${randInt(1000, 9999)}${String.fromCharCode(65 + randInt(0, 25))}`,
      requireKyc: false,
      allowDiscovery: true,
      cause,
      targetAmount: target,
      raisedAmount: raised,
      deadline: randomDateBetween(daysFromNow(1), daysFromNow(90)),
      beneficiaryName: pick([
        "Akinyi Otieno",
        "Brian Kamau",
        "Family of the deceased",
        "Mama Wanjiku",
      ]),
      organizerVerified: randInt(0, 10) > 3,
    });
  }
  return out;
}

// ===== Pots (WhatsApp-style small/short-lived) =====

const POT_PURPOSES = [
  "Sarah's birthday gift",
  "Office samosas",
  "Weekend Naivasha trip",
  "Surprise farewell for Kelvin",
  "Group anniversary cake",
  "Movie night fund",
  "Boda fare to airport",
  "Christmas hamper for watchman",
  "Football match jerseys",
  "Baby shower decor",
];

export function generatePots(count: number): PotGroup[] {
  seedRandom(6006);
  const out: PotGroup[] = [];
  for (let i = 0; i < count; i++) {
    const purpose = pick(POT_PURPOSES);
    const target = randInt(500, 30_000);
    const raised = Math.min(target, randInt(0, target));
    out.push({
      id: `grp_pot_${i + 1}`,
      kind: "pot",
      visibility: "invite_only",
      status: raised >= target ? "completed" : "active",
      name: purpose,
      slug: slugify(purpose, i + 1),
      description: `Quick pot for ${purpose}. Closes when we hit target.`,
      logoUrl: avatarUrl(purpose, i),
      location: pick(LOCATIONS),
      tags: ["pot", "quick"],
      createdAt: randomDateBetween(daysAgo(30), daysAgo(1)),
      updatedAt: randomDateBetween(daysAgo(2), NOW),
      memberCount: randInt(3, 25),
      totalFunds: raised,
      requireKyc: false,
      allowDiscovery: false,
      purpose,
      targetAmount: target,
      raisedAmount: raised,
      splitMode: pick(["equal", "custom", "open"] as const),
    });
  }
  return out;
}

// ===== Savings + loan groups =====

const SL_CATEGORIES: ChamaCategory[] = ["savings", "investment", "mixed"];

export function generateSavingsLoanGroups(count: number): SavingsLoanGroup[] {
  seedRandom(7007);
  const out: SavingsLoanGroup[] = [];
  for (let i = 0; i < count; i++) {
    const name = `${pick(CHAMA_NAMES)} S&L ${i + 1}`;
    out.push({
      id: `grp_sl_${i + 1}`,
      kind: "savings_loan",
      visibility: "private",
      status: "active",
      name,
      slug: slugify(name, i + 1),
      description: `Member-funded savings + lending circle. Monthly contributions earn dividends; loans available at concessional rates.`,
      logoUrl: avatarUrl(name, i),
      location: pick(LOCATIONS),
      tags: ["savings", "loans"],
      createdAt: randomDateBetween(new Date(2021, 0, 1), daysAgo(30)),
      updatedAt: randomDateBetween(daysAgo(14), NOW),
      memberCount: randInt(10, 120),
      totalFunds: randInt(500_000, 60_000_000),
      requireKyc: true,
      allowDiscovery: false,
      category: pick(SL_CATEGORIES),
      monthlyContribution: randInt(2_000, 30_000),
      loansEnabled: true,
      interestRateAnnual: randFloat(8, 18, 1),
    });
  }
  return out;
}

// ===== Rule docs =====
//
// Per docs/RESEARCH_DOSSIER.md §6.10 — natural-language source text is the
// canonical input; structured RuleDoc is the compiled output. Audit-log
// requires we keep BOTH.

const NL_RULE_SOURCES = [
  "Everyone contributes 1000 KES on the 5th of every month. Miss 3 times in 6 months and you're out and lose the entry bond.",
  "Monthly contribution is 2500 on the 1st with 5 days grace. Quorum for any vote is 60% and pass threshold is two-thirds. Rotational payout in join order.",
  "Members pay 5000 weekly every Monday. Three sponsors required to join, and 70% of members must vote yes. Exit returns shares pro-rated by tenure.",
  "Entry deposit 10000 payable in 2 installments, refundable on exit after 90 days. Contribution 3000/month due on the 28th, grace 3 days. Dividends paid quarterly by shares.",
  "Pay 1500 every two weeks on Friday. Vote weighted by contribution. Miss 4 in rolling 12 months triggers automatic exit, forfeit 50% of shares.",
];

function makeRuleDoc(version: number, src: string): RuleDoc {
  // Lightweight heuristic-style compilation purely for fixtures.
  return {
    version,
    contribution: {
      amountKes: randInt(500, 5000),
      cadence: pick(["weekly", "biweekly", "monthly"] as const),
      dueDay: randInt(1, 28),
      graceDays: randInt(0, 7),
    },
    voting: {
      quorumPct: randInt(40, 80),
      passThresholdPct: randInt(50, 75),
      weightedByContribution: randInt(0, 1) === 1,
      weightedByTenureMonths: randInt(0, 1) === 1,
    },
    entryDeposit: randInt(0, 1) === 1
      ? {
          amountKes: randInt(1000, 20_000),
          refundableOnExit: true,
          payableIn: randInt(1, 4),
        }
      : undefined,
    exit: {
      trigger: {
        missedContributions: randInt(2, 5),
        window: pick(["rolling-6m", "rolling-12m"] as const),
      },
      penalty: {
        forfeitEntryBond: true,
        forfeitPctOfShares: randInt(0, 50),
        refundDelayDays: randInt(0, 90),
      },
      proRated: true,
    },
    dividend: {
      policy: pick(["equal", "by_shares", "by_contribution", "by_tenure", "reinvest"] as const),
      payoutCadence: pick(["monthly", "quarterly", "annual", "at_term"] as const),
    },
    custom: { source: "fixture", note: src.slice(0, 40) },
  };
}

// Tiny deterministic hash for fixtures only (NOT a real cryptographic hash).
function fakeHash(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(16, "0") + "deadbeef";
}

export function generateRuleVersions(
  chamaGroups: ChamaGroup[],
  savingsLoanGroups: SavingsLoanGroup[],
  users: User[],
  versionsPerGroup: number
): ChamaRuleVersion[] {
  seedRandom(8008);
  const out: ChamaRuleVersion[] = [];
  const targets: { id: string }[] = [...chamaGroups, ...savingsLoanGroups];
  for (const group of targets) {
    let prevHash: string | undefined;
    for (let v = 1; v <= versionsPerGroup; v++) {
      const src = pick(NL_RULE_SOURCES);
      const doc = makeRuleDoc(v, src);
      const effectiveAt = randomDateBetween(
        new Date(2023, 0, 1),
        daysAgo(versionsPerGroup - v + 1)
      );
      const id = `rule_${group.id}_v${v}`;
      const hash = fakeHash(`${id}|${v}|${prevHash ?? ""}|${src}`);
      const isLatest = v === versionsPerGroup;
      out.push({
        id,
        chamaId: group.id,
        version: v,
        ruleDoc: doc,
        sourceText: src,
        compiledBy: pick(["human", "claude-sonnet-4-5"] as const),
        effectiveAt,
        supersededAt: isLatest ? undefined : randomDateBetween(new Date(effectiveAt), NOW),
        createdById: pick(users).id,
        approvedByIds: [pick(users).id, pick(users).id],
        prevHash,
        hash,
        createdAt: effectiveAt,
      });
      prevHash = hash;
    }
  }
  return out;
}

// ===== Donations =====

const DONOR_MESSAGES = [
  "Pole sana. Mungu awabariki.",
  "Kidogo lakini kutoka moyoni.",
  "Sending love and prayers.",
  "All the best from the diaspora!",
  "Tuko pamoja.",
  "Get well soon!",
  "",
  "Mafanikio mema.",
];

const PAYMENT_METHODS: PaymentMethodType[] = ["mpesa", "mpesa", "mpesa", "bank", "card"];

export function generateDonations(
  harambees: HarambeeGroup[],
  users: User[],
  count: number
): Donation[] {
  seedRandom(9009);
  const out: Donation[] = [];
  if (harambees.length === 0) return out;
  for (let i = 0; i < count; i++) {
    const group = pick(harambees);
    const anon = randInt(0, 10) > 7;
    const user = anon ? undefined : pick(users);
    out.push({
      id: `don_${i + 1}`,
      groupId: group.id,
      donorUserId: user?.id,
      donorName: anon ? undefined : user?.fullName,
      donorEmail: anon ? undefined : user?.email,
      donorPhone: anon ? undefined : user?.phone,
      amount: randInt(50, 50_000),
      message: pick(DONOR_MESSAGES) || undefined,
      isAnonymous: anon,
      paymentMethod: pick(PAYMENT_METHODS),
      reference: `PW${randInt(100000, 999999)}`,
      createdAt: randomDateBetween(new Date(group.createdAt), NOW),
    });
  }
  return out;
}

// ===== Aggregate helper =====

export function buildGroups(
  legacyChamas: Chama[],
  harambeeCount: number,
  potCount: number,
  savingsLoanCount: number
): {
  groups: Group[];
  chamaGroups: ChamaGroup[];
  harambees: HarambeeGroup[];
  pots: PotGroup[];
  savingsLoanGroups: SavingsLoanGroup[];
} {
  const chamaGroups = chamasToGroups(legacyChamas);
  const harambees = generateHarambees(harambeeCount);
  const pots = generatePots(potCount);
  const savingsLoanGroups = generateSavingsLoanGroups(savingsLoanCount);
  const groups: Group[] = [...chamaGroups, ...harambees, ...pots, ...savingsLoanGroups];
  return { groups, chamaGroups, harambees, pots, savingsLoanGroups };
}
