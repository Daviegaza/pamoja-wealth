import { generateUsers } from "./users";
import { generateChamas, generateMembers } from "./chamas";
// Re-export the billing mock layer so callers can `import "@/mock/billing"`
// either directly or, in tests, force generation via getMockBilling().
export { getMockBilling, PLANS as MOCK_PLANS, COUPONS as MOCK_COUPONS } from "./billing";
import { generateTransactions, generateLoans, generateInvestments } from "./finance";
import { generateMeetings, generateVotes, generateNotifications, generateActivity, generateDocuments, generateWalletHistory } from "./activity";
import { generateAnalytics } from "./analytics";
import {
  buildGroups,
  generateDonations,
  generateRuleVersions,
} from "./groups";
import type {
  ActivityItem, Chama, ChamaGroup, ChamaRuleVersion, DocumentItem, Donation,
  Group, HarambeeGroup, Investment, Loan, Meeting, Member, Notification,
  PotGroup, SavingsLoanGroup, Transaction, User, Vote, WalletHistoryPoint, Analytics,
} from "@/types";

export interface MockDatabase {
  users: User[];
  chamas: Chama[];
  members: Member[];
  transactions: Transaction[];
  loans: Loan[];
  investments: Investment[];
  meetings: Meeting[];
  votes: Vote[];
  notifications: Notification[];
  activity: ActivityItem[];
  documents: DocumentItem[];
  walletHistory: WalletHistoryPoint[];
  analytics: Analytics;
  // ===== Polymorphic group entities (additive — does not break legacy callers) =====
  groups: Group[];
  chamaGroups: ChamaGroup[];
  harambees: HarambeeGroup[];
  pots: PotGroup[];
  savingsLoanGroups: SavingsLoanGroup[];
  ruleVersions: ChamaRuleVersion[];
  donations: Donation[];
}

let db: MockDatabase | null = null;

/** Counts intentionally mirror the platform spec: 1000 users, 200 chamas, 10000 transactions, etc. */
export function getMockDatabase(): MockDatabase {
  if (db) return db;

  const users = generateUsers(1000);
  const chamas = generateChamas(200);
  const members = generateMembers(users, chamas, 1500);
  const transactions = generateTransactions(users, chamas, 10000);
  const loans = generateLoans(users, chamas, 1000);
  const investments = generateInvestments(chamas, 500);
  const meetings = generateMeetings(chamas, 500);
  const votes = generateVotes(chamas, users, 500);
  const notifications = generateNotifications(users, 1000);
  const activity = generateActivity(60);
  const documents = generateDocuments(80);
  const walletHistory = generateWalletHistory(90);
  const analytics = generateAnalytics();

  // Polymorphic groups: 200 chamas (re-shaped) + 50 harambees + 30 pots + 20 savings_loan
  const { groups, chamaGroups, harambees, pots, savingsLoanGroups } = buildGroups(
    chamas,
    50,
    30,
    20
  );
  const ruleVersions = generateRuleVersions(chamaGroups, savingsLoanGroups, users, 5);
  const donations = generateDonations(harambees, users, 300);

  db = {
    users,
    chamas,
    members,
    transactions,
    loans,
    investments,
    meetings,
    votes,
    notifications,
    activity,
    documents,
    walletHistory,
    analytics,
    groups,
    chamaGroups,
    harambees,
    pots,
    savingsLoanGroups,
    ruleVersions,
    donations,
  };
  return db;
}

/** The currently "logged in" demo user for the prototype. */
export function getCurrentUser(): User {
  return getMockDatabase().users[0];
}
