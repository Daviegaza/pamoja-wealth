import { api } from "./axios";

export interface WalletDTO {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  pendingBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  lastTransactionAt: string | null;
}

export interface WalletHistoryPointDTO {
  date: string;
  balance: number;
}

export type DepositMethod = "mpesa" | "bank" | "card";
export type WithdrawMethod = "mpesa" | "bank";

export type TxType =
  | "contribution" | "withdrawal" | "loan_disbursement" | "loan_repayment"
  | "investment" | "dividend" | "fee" | "transfer";
export type TxStatus = "completed" | "pending" | "failed" | "reversed";

export interface WalletTransactionDTO {
  id: string;
  userId: string;
  chamaId: string | null;
  type: TxType;
  amount: number;
  balanceAfter: number;
  method: string | null;
  reference: string;
  description: string;
  status: TxStatus;
  createdAt: string;
}

export interface DepositPayload {
  amount: number;
  method: DepositMethod;
  chamaId?: string;
  destination?: string;
}

export interface WithdrawPayload {
  amount: number;
  method: WithdrawMethod;
  destination: string;
}

export interface HistoryParams {
  days?: number;
}

export interface TransactionsParams {
  page?: number;
  pageSize?: number;
  type?: TxType;
  status?: TxStatus;
  chamaId?: string;
  days?: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface Envelope<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface DepositResult {
  transaction: {
    id: string;
    reference: string;
    status: TxStatus;
    amount: number;
    type: TxType;
  };
  wallet: { id: string; balance: number };
}

export interface WithdrawResult extends DepositResult {}

export async function getWallet(): Promise<WalletDTO> {
  const r = await api.get<Envelope<WalletDTO>>("/wallet");
  return r.data.data;
}

export async function getHistory(params: HistoryParams = {}): Promise<WalletHistoryPointDTO[]> {
  const r = await api.get<Envelope<{ history: WalletHistoryPointDTO[] }>>("/wallet/history", { params });
  return r.data.data.history;
}

export async function listTransactions(params: TransactionsParams = {}): Promise<{
  items: WalletTransactionDTO[];
  meta?: PaginationMeta;
}> {
  const r = await api.get<Envelope<WalletTransactionDTO[]>>("/wallet/transactions", { params });
  return { items: r.data.data, meta: r.data.meta };
}

export async function deposit(payload: DepositPayload): Promise<DepositResult> {
  const r = await api.post<Envelope<DepositResult>>("/wallet/deposit", payload);
  return r.data.data;
}

export async function withdraw(payload: WithdrawPayload): Promise<WithdrawResult> {
  const r = await api.post<Envelope<WithdrawResult>>("/wallet/withdraw", payload);
  return r.data.data;
}
