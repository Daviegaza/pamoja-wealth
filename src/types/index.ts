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
