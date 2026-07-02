import { api } from "./axios";

export type LoanStatus =
  | "pending"
  | "approved"
  | "active"
  | "completed"
  | "defaulted"
  | "rejected";

export interface LoanDTO {
  id: string;
  chamaId: string;
  borrowerId: string;
  borrowerName?: string;
  borrowerAvatar?: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  status: LoanStatus;
  purpose: string;
  appliedDate: string;
  approvedDate?: string;
  dueDate: string;
  amountRepaid: number;
  guarantors?: string[];
}

export interface RepaymentDTO {
  id: string;
  loanId: string;
  amount: number;
  principal?: number;
  interest?: number;
  dueDate: string;
  paidDate?: string;
  status: "pending" | "paid" | "overdue";
}

export interface ListLoansParams {
  chamaId?: string;
  status?: LoanStatus;
  page?: number;
  pageSize?: number;
}

export interface CreateLoanPayload {
  chamaId: string;
  amount: number;
  termMonths: number;
  purpose: string;
  guarantorIds?: string[];
}

export interface RepayLoanPayload {
  amount: number;
}

interface Envelope<T> {
  success: true;
  data: T;
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
}

export async function listLoans(params?: ListLoansParams) {
  const r = await api.get<Envelope<LoanDTO[]>>("/loans", { params });
  return { items: r.data.data, meta: r.data.meta };
}

export async function getRepayments(id: string) {
  const r = await api.get<Envelope<RepaymentDTO[]>>(`/loans/${id}/repayments`);
  return r.data.data;
}

export async function createLoan(payload: CreateLoanPayload) {
  const r = await api.post<Envelope<LoanDTO>>("/loans", payload);
  return r.data.data;
}

export async function approveLoan(id: string) {
  const r = await api.post<Envelope<LoanDTO>>(`/loans/${id}/approve`);
  return r.data.data;
}

export async function rejectLoan(id: string) {
  const r = await api.post<Envelope<LoanDTO>>(`/loans/${id}/reject`);
  return r.data.data;
}

export async function repayLoan(id: string, payload: RepayLoanPayload) {
  const r = await api.post<Envelope<LoanDTO>>(`/loans/${id}/repay`, payload);
  return r.data.data;
}
