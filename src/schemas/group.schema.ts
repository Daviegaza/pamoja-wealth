import { z } from "zod";

// ===== Shared primitives =====

const groupKindSchema = z.enum(["chama", "harambee", "pot", "savings_loan"]);
const groupVisibilitySchema = z.enum(["public", "private", "invite_only"]);
const groupStatusSchema = z.enum(["draft", "active", "dormant", "archived", "completed"]);
const chamaCategorySchema = z.enum(["savings", "investment", "welfare", "mixed"]);
const harambeeCauseSchema = z.enum([
  "medical",
  "wedding",
  "funeral",
  "education",
  "emergency",
  "community",
  "other",
]);
const potSplitModeSchema = z.enum(["equal", "custom", "open"]);
const paymentMethodSchema = z.enum(["bank", "mpesa", "card", "cash"]);
const roleSchema = z.enum([
  "owner",
  "member",
  "treasurer",
  "secretary",
  "chairperson",
  "admin",
  "super_admin",
]);

// ===== Rule engine schemas =====

export const contributionRuleSchema = z.object({
  amountKes: z.coerce.number().min(1, "Amount must be positive"),
  cadence: z.enum(["weekly", "biweekly", "monthly", "quarterly", "annual"]),
  dueDay: z.coerce.number().int().min(1).max(31),
  graceDays: z.coerce.number().int().min(0).max(60),
});

export const eligibilityRuleSchema = z.object({
  minAge: z.coerce.number().int().min(0).max(120).optional(),
  maxAge: z.coerce.number().int().min(0).max(120).optional(),
  genders: z.array(z.enum(["male", "female", "any"])).optional(),
  location: z.string().optional(),
  employer: z.string().optional(),
  custom: z.string().optional(),
});

export const vettingRuleSchema = z.object({
  sponsorRequired: z.boolean(),
  sponsorCount: z.coerce.number().int().min(0).max(20),
  voteThresholdPct: z.coerce.number().min(0).max(100),
  manualReviewByRoles: z.array(roleSchema),
});

export const votingRuleSchema = z.object({
  quorumPct: z.coerce.number().min(0).max(100),
  passThresholdPct: z.coerce.number().min(0).max(100),
  weightedByContribution: z.boolean(),
  weightedByTenureMonths: z.boolean(),
});

export const payoutOrderSchema = z.object({
  mode: z.enum(["rotational", "by_need", "by_vote", "lump_sum_at_term"]),
  rotationSeed: z.array(z.string()).optional(),
});

export const exitRuleSchema = z.object({
  trigger: z.object({
    missedContributions: z.coerce.number().int().min(0).optional(),
    window: z.enum(["rolling-6m", "rolling-12m", "absolute"]).optional(),
    manual: z.boolean().optional(),
  }),
  penalty: z.object({
    forfeitEntryBond: z.boolean().optional(),
    forfeitPctOfShares: z.coerce.number().min(0).max(100).optional(),
    refundDelayDays: z.coerce.number().int().min(0).optional(),
  }),
  proRated: z.boolean(),
});

export const dividendRuleSchema = z.object({
  policy: z.enum(["equal", "by_shares", "by_contribution", "by_tenure", "reinvest"]),
  payoutCadence: z.enum(["monthly", "quarterly", "annual", "at_term"]),
});

export const entryDepositRuleSchema = z.object({
  amountKes: z.coerce.number().min(0),
  refundableOnExit: z.boolean(),
  payableIn: z.coerce.number().int().min(1).max(24),
});

export const ruleDocSchema = z.object({
  version: z.coerce.number().int().min(1),
  entryDeposit: entryDepositRuleSchema.optional(),
  contribution: contributionRuleSchema,
  eligibility: eligibilityRuleSchema.optional(),
  vetting: vettingRuleSchema.optional(),
  voting: votingRuleSchema,
  payoutOrder: payoutOrderSchema.optional(),
  exit: exitRuleSchema.optional(),
  dividend: dividendRuleSchema.optional(),
  custom: z.record(z.string(), z.unknown()).optional(),
});

export const chamaRuleVersionSchema = z.object({
  id: z.string(),
  chamaId: z.string(),
  version: z.coerce.number().int().min(1),
  ruleDoc: ruleDocSchema,
  sourceText: z.string().optional(),
  compiledBy: z.enum(["human", "claude-sonnet-4-5"]),
  effectiveAt: z.string(),
  supersededAt: z.string().optional(),
  createdById: z.string(),
  approvedByIds: z.array(z.string()),
  prevHash: z.string().optional(),
  hash: z.string(),
  createdAt: z.string(),
});

// ===== Group create schemas (discriminated union per `kind`) =====

const baseCreateFields = {
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Please provide a short description"),
  visibility: groupVisibilitySchema.default("private"),
  location: z.string().optional(),
  tags: z.array(z.string()).default([]),
  logoUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional(),
  requireKyc: z.boolean().default(false),
  allowDiscovery: z.boolean().default(false),
};

const createChamaSchema = z.object({
  ...baseCreateFields,
  kind: z.literal("chama"),
  category: chamaCategorySchema,
  monthlyContribution: z.coerce.number().min(100, "Minimum contribution is 100"),
  entryDeposit: z.coerce.number().min(0).optional(),
  maxMembers: z.coerce.number().int().min(2).max(500).optional(),
  nextMeetingDate: z.string().optional(),
  bylaws: ruleDocSchema.optional(),
});

const createHarambeeSchema = z.object({
  ...baseCreateFields,
  kind: z.literal("harambee"),
  cause: harambeeCauseSchema,
  targetAmount: z.coerce.number().min(1, "Target amount required"),
  deadline: z.string().optional(),
  beneficiaryName: z.string().optional(),
});

const createPotSchema = z.object({
  ...baseCreateFields,
  kind: z.literal("pot"),
  purpose: z.string().min(3, "Tell us what the pot is for"),
  targetAmount: z.coerce.number().min(0).optional(),
  splitMode: potSplitModeSchema.default("open"),
});

const createSavingsLoanSchema = z.object({
  ...baseCreateFields,
  kind: z.literal("savings_loan"),
  category: chamaCategorySchema,
  monthlyContribution: z.coerce.number().min(100),
  interestRateAnnual: z.coerce.number().min(0).max(100),
  bylaws: ruleDocSchema.optional(),
});

export const createGroupSchema = z.discriminatedUnion("kind", [
  createChamaSchema,
  createHarambeeSchema,
  createPotSchema,
  createSavingsLoanSchema,
]);
export type CreateGroupFormValues = z.infer<typeof createGroupSchema>;

// ===== Update / join / donate =====

export const updateGroupSchema = z
  .object({
    name: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    visibility: groupVisibilitySchema.optional(),
    status: groupStatusSchema.optional(),
    location: z.string().optional(),
    tags: z.array(z.string()).optional(),
    logoUrl: z.string().url().optional(),
    coverImageUrl: z.string().url().optional(),
    requireKyc: z.boolean().optional(),
    allowDiscovery: z.boolean().optional(),
    monthlyContribution: z.coerce.number().min(0).optional(),
    targetAmount: z.coerce.number().min(0).optional(),
    deadline: z.string().optional(),
    nextMeetingDate: z.string().optional(),
    paybillAccountNumber: z.string().optional(),
  })
  .strict();
export type UpdateGroupFormValues = z.infer<typeof updateGroupSchema>;

export const joinGroupSchema = z.object({
  inviteCode: z.string().min(4, "Enter a valid invite code").optional(),
  groupId: z.string().optional(),
  message: z.string().max(500).optional(),
});
export type JoinGroupFormValues = z.infer<typeof joinGroupSchema>;

export const donationSchema = z
  .object({
    groupId: z.string(),
    amount: z.coerce.number().min(1, "Amount must be positive"),
    message: z.string().max(500).optional(),
    isAnonymous: z.boolean().default(false),
    paymentMethod: paymentMethodSchema,
    donorName: z.string().min(2).optional(),
    donorEmail: z.string().email().optional(),
    donorPhone: z.string().min(7).optional(),
  })
  .refine(
    (val) => val.isAnonymous || val.donorName || val.donorEmail || val.donorPhone,
    { message: "Provide a donor name, email, or phone, or mark as anonymous", path: ["donorName"] }
  );
export type DonationFormValues = z.infer<typeof donationSchema>;
