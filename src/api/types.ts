/**
 * Standardized API response types used across the frontend.
 *
 * Every API response from the backend follows this envelope:
 *   { success: true, data: T, meta?: PaginationMeta }
 *   { success: false, error: { code: string, message: string, details?: object } }
 */

// ---------------------------------------------------------------------------
// Envelope types
// ---------------------------------------------------------------------------

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Common domain types (mirrors backend Prisma schema)
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  phone: string;
  username?: string;
  fullName: string;
  avatarUrl?: string;
  isVerified: boolean;
  kycLevel: number;
  createdAt: string;
}

export interface Chama {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: "savings" | "investment" | "welfare" | "mixed";
  type: "chama" | "fundraiser" | "pot";
  privacy: "public" | "private" | "invite_only";
  logoUrl?: string;
  coverImageUrl?: string;
  location?: string;
  monthlyContribution: number;
  totalFunds: number;
  targetAmount?: number;
  raisedAmount: number;
  memberCount?: number;
  status: "active" | "dormant" | "archived";
  createdAt: string;
}

export interface Membership {
  id: string;
  userId: string;
  chamaId: string;
  role: "owner" | "admin" | "chairperson" | "treasurer" | "secretary" | "member";
  totalContributions: number;
  status: "active" | "inactive" | "suspended";
  joinedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  chamaId?: string;
  type: "contribution" | "withdrawal" | "loan_disbursement" | "loan_repayment" | "investment" | "dividend" | "fee" | "transfer";
  amount: number;
  balanceAfter: number;
  method?: "mpesa" | "bank" | "card" | "cash";
  reference: string;
  description?: string;
  status: "completed" | "pending" | "failed" | "reversed";
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
}

export interface Loan {
  id: string;
  chamaId: string;
  borrowerId: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  amountRepaid: number;
  purpose: string;
  status: "pending" | "approved" | "active" | "completed" | "defaulted" | "rejected";
  dueDate: string;
  createdAt: string;
}

export interface Investment {
  id: string;
  chamaId: string;
  type: "real_estate" | "stocks" | "bonds" | "treasury_bills" | "money_market" | "sacco";
  amount: number;
  expectedReturn: number;
  status: "active" | "matured" | "closed" | "pending";
}

export interface Meeting {
  id: string;
  chamaId: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}
