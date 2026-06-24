import { generateUsers } from "./users";
import { generateChamas, generateMembers } from "./chamas";
import { generateTransactions, generateLoans, generateInvestments } from "./finance";
import { generateMeetings, generateVotes, generateNotifications, generateActivity, generateDocuments, generateWalletHistory } from "./activity";
import { generateAnalytics } from "./analytics";
import type {
  ActivityItem, Chama, DocumentItem, Investment, Loan, Meeting, Member,
  Notification, Transaction, User, Vote, WalletHistoryPoint, Analytics,
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

  db = { users, chamas, members, transactions, loans, investments, meetings, votes, notifications, activity, documents, walletHistory, analytics };
  return db;
}

/** The currently "logged in" demo user for the prototype. */
export function getCurrentUser(): User {
  return getMockDatabase().users[0];
}
