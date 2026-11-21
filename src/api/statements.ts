import { api } from "./axios";
import type { Envelope } from "./http-types";
import type { ContributionDTO } from "./contributions";
import type { LoanDTO, RepaymentDTO } from "./loans";
import { downloadAuthenticated } from "@/lib/download";

export interface StatementDTO {
  chama: { id: string; name: string };
  member?: { userId: string; fullName: string };
  period: { from: string | null; to: string | null };
  contributions: ContributionDTO[];
  loans: LoanDTO[];
  repayments: (RepaymentDTO & { loanId: string; borrowerName: string })[];
  totals: { contributions: number; loansIssued: number; repayments: number };
}

export interface StatementRange {
  from?: string;
  to?: string;
}

export function statementPath(chamaId: string, userId?: string) {
  return userId ? `/chamas/${chamaId}/statements/members/${userId}` : `/chamas/${chamaId}/statements/chama`;
}

function cleanParams(params: Record<string, string | undefined>) {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));
}

export async function getStatement(chamaId: string, range: StatementRange, userId?: string) {
  const r = await api.get<Envelope<StatementDTO>>(statementPath(chamaId, userId), {
    params: cleanParams({ ...range, format: "json" }),
  });
  return r.data.data;
}

export function downloadStatement(chamaId: string, format: "csv" | "pdf", range: StatementRange, userId?: string) {
  const name = userId ? "member-statement" : "chama-statement";
  return downloadAuthenticated(statementPath(chamaId, userId), { ...range, format }, `${name}.${format}`);
}
