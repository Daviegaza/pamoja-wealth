/**
 * Loan REGISTER. These are records of money a chama lent its own members out
 * of the chama's own account. Pamoja does not lend, disburse or charge interest.
 */
import { api } from "./axios";
import type { Envelope, PaymentMethod } from "./http-types";

export type LoanStatus = "active" | "completed" | "defaulted";

export interface LoanDTO {
  id: string;
  borrowerId: string;
  borrowerName: string;
  principal: number;
  agreedRepayable: number | null;
  amountRepaid: number;
  balance: number;
  issuedOn: string;
  dueDate: string;
  purpose: string;
  notes: string | null;
  status: LoanStatus;
  createdAt: string;
}

export interface RepaymentDTO {
  id: string;
  amount: number;
  paidOn: string;
  method: PaymentMethod;
  mpesaReceipt: string | null;
  note: string | null;
  recordedByName: string;
  createdAt: string;
}

export interface LoanDetailDTO extends LoanDTO {
  repayments: RepaymentDTO[];
}

export interface LoanInput {
  borrowerId: string;
  principal: number;
  issuedOn: string;
  dueDate: string;
  purpose: string;
  agreedRepayable?: number;
  notes?: string;
}

export interface RepaymentInput {
  amount: number;
  paidOn: string;
  method: PaymentMethod;
  mpesaReceipt?: string;
  note?: string;
}

export async function listLoans(chamaId: string) {
  const r = await api.get<Envelope<LoanDTO[]>>(`/chamas/${chamaId}/loans`);
  return r.data.data;
}

export async function getLoan(chamaId: string, loanId: string) {
  const r = await api.get<Envelope<LoanDetailDTO>>(`/chamas/${chamaId}/loans/${loanId}`);
  return r.data.data;
}

export async function recordLoan(chamaId: string, input: LoanInput) {
  const r = await api.post<Envelope<LoanDTO>>(`/chamas/${chamaId}/loans`, input);
  return r.data.data;
}

export async function recordRepayment(chamaId: string, loanId: string, input: RepaymentInput) {
  const r = await api.post<Envelope<LoanDTO>>(`/chamas/${chamaId}/loans/${loanId}/repayments`, input);
  return r.data.data;
}

export async function setLoanStatus(chamaId: string, loanId: string, status: "active" | "defaulted") {
  const r = await api.patch<Envelope<LoanDTO>>(`/chamas/${chamaId}/loans/${loanId}/status`, { status });
  return r.data.data;
}
