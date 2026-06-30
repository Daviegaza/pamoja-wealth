// ===== Enums / Unions =====

export type Role = "owner" | "member" | "treasurer" | "secretary" | "chairperson" | "admin" | "super_admin";

export type Permission =
  | "view_dashboard"
  | "manage_members"
  | "manage_treasury"
  | "approve_loans"
  | "create_meetings"
  | "manage_votes"
  | "manage_settings"
  | "view_analytics"
  | "manage_billing";

export type LoanStatus = "pending" | "approved" | "active" | "completed" | "defaulted" | "rejected";

export type InvestmentStatus = "active" | "matured" | "closed" | "pending";

export type TransactionType = "contribution" | "withdrawal" | "loan_disbursement" | "loan_repayment" | "investment" | "dividend" | "fee" | "transfer";

export type TransactionStatus = "completed" | "pending" | "failed" | "reversed";

export type MeetingStatus = "scheduled" | "ongoing" | "completed" | "cancelled";

export type VoteStatus = "open" | "closed" | "passed" | "rejected";

export type NotificationType = "info" | "success" | "warning" | "error" | "loan" | "meeting" | "vote" | "wallet";

export type ThemeMode = "light" | "dark" | "system";

export type ChamaCategory = "savings" | "investment" | "welfare" | "mixed";

// ===== Core Entities =====

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  role: Role;
  permissions: Permission[];
  createdAt: string;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: string;
  nationalId?: string;
  location: string;
}

export interface Member {
  id: string;
  userId: string;
  chamaId: string;
  fullName: string;
  avatarUrl: string;
  role: Role;
  joinedAt: string;
  totalContributions: number;
  shares: number;
  status: "active" | "inactive" | "suspended";
  contributionStreak: number;
}

export interface Chama {
  id: string;
  name: string;
  description: string;
  category: ChamaCategory;
  logoUrl: string;
  memberCount: number;
  totalFunds: number;
  monthlyContribution: number;
  createdAt: string;
  nextMeetingDate: string;
  growthRate: number;
  status: "active" | "dormant" | "archived";
  location: string;
}


export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  pendingBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  lastTransactionAt: string;
}

export interface WalletHistoryPoint {
  date: string;
  balance: number;
}

export interface Loan {
  id: string;
  chamaId: string;
  borrowerId: string;
  borrowerName: string;
  borrowerAvatar: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  status: LoanStatus;
  purpose: string;
  appliedDate: string;
  approvedDate?: string;
  dueDate: string;
  amountRepaid: number;
  guarantors: string[];
}


export interface Investment {
  id: string;
  chamaId: string;
  name: string;
  type: "real_estate" | "stocks" | "bonds" | "treasury_bills" | "money_market" | "sacco";
  amountInvested: number;
  currentValue: number;
  roi: number;
  status: InvestmentStatus;
  startDate: string;
  maturityDate?: string;
  riskLevel: "low" | "medium" | "high";
}

export interface Transaction {
  id: string;
  userId: string;
  chamaId?: string;
  type: TransactionType;
  amount: number;
  date: string;
  status: TransactionStatus;
  description: string;
  reference: string;
  balanceAfter: number;
}

export interface Meeting {
  id: string;
  chamaId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  isVirtual: boolean;
  status: MeetingStatus;
  agenda: string[];
  attendeesCount: number;
  totalInvited: number;
}

export interface VoteOption {
  id: string;
  label: string;
  count: number;
}

export interface Vote {
  id: string;
  chamaId: string;
  title: string;
  description: string;
  options: VoteOption[];
  status: VoteStatus;
  createdAt: string;
  closesAt: string;
  totalVotes: number;
  createdBy: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
}


export interface Analytics {
  contributionGrowth: { month: string; amount: number }[];
  investmentGrowth: { month: string; amount: number }[];
  cashFlow: { month: string; inflow: number; outflow: number }[];
  loanDistribution: { category: string; value: number }[];
  memberGrowth: { month: string; count: number }[];
  revenueTrends: { month: string; revenue: number }[];
  portfolioAllocation: { name: string; value: number }[];
}

export interface ActivityItem {
  id: string;
  actorName: string;
  actorAvatar: string;
  action: string;
  target: string;
  timestamp: string;
  icon: NotificationType;
}


export interface Settings {
  theme: ThemeMode;
  language: string;
  currency: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  twoFactorEnabled: boolean;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: "pdf" | "doc" | "image" | "sheet";
  sizeKb: number;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface AIChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// ===== API / Pagination / Filters =====



// ===== Banking & Payments =====

export type BankProvider = "equity" | "kcb" | "ncba" | "cooperative" | "absa" | "stanbic" | "dtb" | "family";
export type PaymentMethodType = "bank" | "mpesa" | "card" | "cash";

export interface BankAccount {
  id: string;
  userId: string;
  bankName: BankProvider;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
  isVerified: boolean;
  balance: number;
  lastSynced: string;
  createdAt: string;
}

export interface MpesaAccount {
  id: string;
  userId: string;
  phoneNumber: string;
  isDefault: boolean;
  isVerified: boolean;
  lastUsed: string;
}


export interface ContributionRecord {
  id: string;
  chamaId: string;
  memberId: string;
  memberName: string;
  amount: number;
  month: string;
  status: "paid" | "pending" | "overdue";
  paidAt?: string;
  method: PaymentMethodType;
}

// ===== Connections & Network =====

export type ConnectionType = "chama_mate" | "guarantor" | "borrower" | "transaction" | "meeting_attendee";

export interface MemberConnection {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string;
  connectionType: ConnectionType;
  chamaName?: string;
  chamaId?: string;
  strength: number; // 1-10 based on interaction frequency
  lastInteraction: string;
  mutualConnections: number;
  isVerified: boolean;
  role: Role;
}

export interface PrivacySettings {
  showConnections: boolean;
  showTransactionHistory: boolean;
  showContributionAmount: boolean;
  showLoanDetails: boolean;
  showInvestmentDetails: boolean;
  profileVisibility: "public" | "chama_only" | "private";
}

// ===== Polymorphic Group Domain (chama + harambee + pot + savings_loan) =====
//
// The legacy `Chama` interface above is retained for backwards compatibility.
// New code should target the `Group` discriminated union below. See
// docs/RESEARCH_DOSSIER.md §1 (THE GAP) and §5 for the design rationale —
// one identity, one rule engine, four product surfaces.

export type GroupKind = "chama" | "harambee" | "pot" | "savings_loan";
export type GroupVisibility = "public" | "private" | "invite_only";
export type GroupStatus = "draft" | "active" | "dormant" | "archived" | "completed";

export interface BaseGroup {
  id: string;
  kind: GroupKind;
  visibility: GroupVisibility;
  status: GroupStatus;
  name: string;
  slug: string;
  description: string;
  logoUrl?: string;
  coverImageUrl?: string;
  location?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  totalFunds: number;
  paybillAccountNumber?: string; // e.g. "HAR-7K2L9"
  requireKyc: boolean;
  allowDiscovery: boolean;
}

export interface ChamaGroup extends BaseGroup {
  kind: "chama";
  category: ChamaCategory;
  entryDeposit?: number;
  monthlyContribution: number;
  maxMembers?: number;
  nextMeetingDate?: string;
  growthRate?: number;
  bylaws?: RuleDoc;
}

export interface HarambeeGroup extends BaseGroup {
  kind: "harambee";
  cause: "medical" | "wedding" | "funeral" | "education" | "emergency" | "community" | "other";
  targetAmount: number;
  raisedAmount: number;
  deadline?: string;
  beneficiaryName?: string;
  organizerVerified: boolean;
}

export interface PotGroup extends BaseGroup {
  kind: "pot";
  purpose: string; // "Sarah's bday gift", "Office samosas", etc.
  targetAmount?: number;
  raisedAmount: number;
  splitMode: "equal" | "custom" | "open";
}

export interface SavingsLoanGroup extends BaseGroup {
  kind: "savings_loan";
  category: ChamaCategory;
  monthlyContribution: number;
  loansEnabled: true;
  interestRateAnnual: number;
  bylaws?: RuleDoc;
}

export type Group = ChamaGroup | HarambeeGroup | PotGroup | SavingsLoanGroup;

// ===== Rule Engine =====
//
// Configurable rule engine — the headline differentiator per
// docs/RESEARCH_DOSSIER.md §1 #1 and §6.10. Rule documents are versioned,
// hash-chained, and (for chamas/savings_loan) compiled either by a human or
// by Claude Sonnet from natural-language source text.

export interface ContributionRule {
  amountKes: number;
  cadence: "weekly" | "biweekly" | "monthly" | "quarterly" | "annual";
  dueDay: number; // 1-31 for monthly, 1-7 for weekly (Mon=1)
  graceDays: number;
}

export interface EligibilityRule {
  minAge?: number;
  maxAge?: number;
  genders?: ("male" | "female" | "any")[];
  location?: string; // free text region constraint
  employer?: string;
  custom?: string; // free-text additional criteria
}

export interface VettingRule {
  sponsorRequired: boolean;
  sponsorCount: number;
  voteThresholdPct: number; // 0-100
  manualReviewByRoles: Role[];
}

export interface VotingRule {
  quorumPct: number;
  passThresholdPct: number;
  weightedByContribution: boolean;
  weightedByTenureMonths: boolean;
}

export interface PayoutOrder {
  mode: "rotational" | "by_need" | "by_vote" | "lump_sum_at_term";
  rotationSeed?: string[]; // ordered user ids
}

export interface ExitRule {
  trigger: {
    missedContributions?: number;
    window?: "rolling-6m" | "rolling-12m" | "absolute";
    manual?: boolean;
  };
  penalty: {
    forfeitEntryBond?: boolean;
    forfeitPctOfShares?: number;
    refundDelayDays?: number;
  };
  proRated: boolean;
}

export interface DividendRule {
  policy: "equal" | "by_shares" | "by_contribution" | "by_tenure" | "reinvest";
  payoutCadence: "monthly" | "quarterly" | "annual" | "at_term";
}

export interface EntryDepositRule {
  amountKes: number;
  refundableOnExit: boolean;
  payableIn: number; // installments
}

export interface RuleDoc {
  version: number;
  entryDeposit?: EntryDepositRule;
  contribution: ContributionRule;
  eligibility?: EligibilityRule;
  vetting?: VettingRule;
  voting: VotingRule;
  payoutOrder?: PayoutOrder;
  exit?: ExitRule;
  dividend?: DividendRule;
  // user-defined extension slot
  custom?: Record<string, unknown>;
}

export interface ChamaRuleVersion {
  id: string;
  chamaId: string;
  version: number;
  ruleDoc: RuleDoc;
  sourceText?: string; // raw NL the secretary typed
  compiledBy: "human" | "claude-sonnet-4-5";
  effectiveAt: string;
  supersededAt?: string;
  createdById: string;
  approvedByIds: string[];
  prevHash?: string; // hex
  hash: string; // hex
  createdAt: string;
}

// ===== Donations (harambee + pot use case) =====

export interface Donation {
  id: string;
  groupId: string;
  donorUserId?: string; // null when anonymous
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  message?: string;
  isAnonymous: boolean;
  paymentMethod: PaymentMethodType;
  reference: string;
  createdAt: string;
}
