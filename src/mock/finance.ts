import type { Chama, Investment, Loan, Transaction, TransactionStatus, TransactionType, User } from "@/types";
import { LOAN_PURPOSES, pick, pickMany, randFloat, randInt, randomDateBetween, seedRandom } from "./generator";

const NOW = new Date();
const TODAY_TS = NOW.getTime();
const DAY_MS = 86400000;

function daysAgo(n: number): Date {
  return new Date(TODAY_TS - n * DAY_MS);
}

function daysFromNow(n: number): Date {
  return new Date(TODAY_TS + n * DAY_MS);
}

const TX_TYPES: TransactionType[] = ["contribution", "withdrawal", "loan_disbursement", "loan_repayment", "investment", "dividend", "fee", "transfer"];
const TX_STATUSES: TransactionStatus[] = ["completed", "completed", "completed", "completed", "pending", "failed"];

const TX_DESCRIPTIONS: Record<TransactionType, string[]> = {
  contribution: ["Monthly contribution", "Catch-up contribution", "Special levy contribution"],
  withdrawal: ["Emergency withdrawal", "Approved member withdrawal", "Welfare payout"],
  loan_disbursement: ["Business loan disbursed", "Emergency loan disbursed", "Education loan disbursed"],
  loan_repayment: ["Loan installment payment", "Loan balance settlement"],
  investment: ["Treasury bills purchase", "Money market allocation", "Real estate contribution"],
  dividend: ["Quarterly dividend payout", "Investment returns distribution"],
  fee: ["Processing fee", "Late payment fee", "Service charge"],
  transfer: ["Inter-chama transfer", "Wallet top-up", "Bank transfer"],
};

export function generateTransactions(users: User[], chamas: Chama[], count: number): Transaction[] {
  seedRandom(4004);
  const transactions: Transaction[] = [];
  for (let i = 0; i < count; i++) {
    const type = pick(TX_TYPES);
    const isOutflow = type === "withdrawal" || type === "loan_disbursement" || type === "fee";
    const amount = randInt(500, 500_000);
    transactions.push({
      id: `txn_${i + 1}`,
      userId: pick(users).id,
      chamaId: pick(chamas).id,
      type,
      amount: isOutflow ? -amount : amount,
      date: randomDateBetween(daysAgo(90), NOW),
      status: pick(TX_STATUSES),
      description: pick(TX_DESCRIPTIONS[type]),
      reference: `PW${randInt(100000, 999999)}`,
      balanceAfter: randInt(10_000, 5_000_000),
    });
  }
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function generateLoans(users: User[], chamas: Chama[], count: number): Loan[] {
  seedRandom(5005);
  const loans: Loan[] = [];
  const statuses: Loan["status"][] = ["pending", "approved", "active", "active", "completed", "defaulted", "rejected"];
  for (let i = 0; i < count; i++) {
    const borrower = pick(users);
    const amount = randInt(5_000, 1_500_000);
    const status = pick(statuses);
    const applied = randomDateBetween(daysAgo(180), daysAgo(1));
    const appliedDate = new Date(applied);
    loans.push({
      id: `loan_${i + 1}`,
      chamaId: pick(chamas).id,
      borrowerId: borrower.id,
      borrowerName: borrower.fullName,
      borrowerAvatar: borrower.avatarUrl,
      amount,
      interestRate: randFloat(5, 18, 1),
      termMonths: pick([3, 6, 12, 18, 24, 36]),
      status,
      purpose: pick(LOAN_PURPOSES),
      appliedDate: applied,
      approvedDate: status !== "pending" && status !== "rejected" ? randomDateBetween(appliedDate, NOW) : undefined,
      dueDate: randomDateBetween(NOW, daysFromNow(365)),
      amountRepaid: status === "completed" ? amount : status === "active" ? randInt(0, amount) : 0,
      guarantors: pickMany(users, randInt(0, 3)).map((u) => u.fullName),
    });
  }
  return loans;
}

const INVESTMENT_TYPES: Investment["type"][] = ["real_estate", "stocks", "bonds", "treasury_bills", "money_market", "sacco"];
const INVESTMENT_NAMES: Record<Investment["type"], string[]> = {
  real_estate: ["Kiambu Land Parcel", "Westlands Apartment Block", "Athi River Commercial Plot"],
  stocks: ["Safaricom PLC Shares", "EABL Equity Holding", "KCB Group Shares"],
  bonds: ["Infrastructure Bond Series 14", "Corporate Bond — East Africa Breweries"],
  treasury_bills: ["91-Day Treasury Bill", "182-Day Treasury Bill", "364-Day Treasury Bill"],
  money_market: ["CIC Money Market Fund", "Sanlam Money Market Fund", "NCBA Money Market Fund"],
  sacco: ["Stima Sacco Deposits", "Mwalimu National Sacco Shares"],
};

export function generateInvestments(chamas: Chama[], count: number): Investment[] {
  seedRandom(6006);
  const investments: Investment[] = [];
  const statuses: Investment["status"][] = ["active", "active", "active", "matured", "closed", "pending"];
  for (let i = 0; i < count; i++) {
    const type = pick(INVESTMENT_TYPES);
    const invested = randInt(20_000, 3_000_000);
    const roi = randFloat(-5, 35, 1);
    investments.push({
      id: `inv_${i + 1}`,
      chamaId: pick(chamas).id,
      name: pick(INVESTMENT_NAMES[type]),
      type,
      amountInvested: invested,
      currentValue: Math.round(invested * (1 + roi / 100)),
      roi,
      status: pick(statuses),
      startDate: randomDateBetween(daysAgo(365), daysAgo(1)),
      maturityDate: randomDateBetween(NOW, daysFromNow(730)),
      riskLevel: pick(["low", "medium", "high"]),
    });
  }
  return investments;
}
