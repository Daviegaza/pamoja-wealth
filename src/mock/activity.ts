import type {
  ActivityItem, Chama, DocumentItem, Meeting, Notification, NotificationType,
  User, Vote, VoteOption, WalletHistoryPoint,
} from "@/types";
import { pick, randFloat, randInt, randomDateBetween, randomFullName, seedRandom } from "./generator";

const NOW = new Date();
const TODAY_TS = NOW.getTime();
const DAY_MS = 86400000;

function daysAgo(n: number): Date {
  return new Date(TODAY_TS - n * DAY_MS);
}

function daysFromNow(n: number): Date {
  return new Date(TODAY_TS + n * DAY_MS);
}

const AGENDAS = [
  ["Opening prayer", "Approval of previous minutes", "Treasurer's report", "Loan applications review", "AOB"],
  ["Welcome & roll call", "Investment performance update", "New member onboarding", "Closing remarks"],
  ["Quarterly financial review", "Vote on new project proposal", "Welfare fund update", "Date of next meeting"],
];

export function generateMeetings(chamas: Chama[], count: number): Meeting[] {
  seedRandom(7007);
  const meetings: Meeting[] = [];
  const statuses: Meeting["status"][] = ["scheduled", "scheduled", "ongoing", "completed", "completed", "cancelled"];
  for (let i = 0; i < count; i++) {
    // Scheduled/ongoing = upcoming, completed = past
    const st = pick(statuses);
    const date =
      st === "completed" || st === "cancelled"
        ? randomDateBetween(daysAgo(60), daysAgo(1))
        : randomDateBetween(NOW, daysFromNow(45));
    meetings.push({
      id: `mtg_${i + 1}`,
      chamaId: pick(chamas).id,
      title: pick(["Monthly General Meeting", "Quarterly AGM", "Special Investment Review", "Emergency Committee Meeting", "Loan Review Session"]),
      description: "Routine assembly to review group progress, finances and key decisions.",
      date,
      time: `${randInt(9, 18)}:${pick(["00", "30"])}`,
      location: pick(["Zoom Meeting", "Google Meet", "Community Hall, Nairobi", "Members' WhatsApp Call", "Chama HQ Boardroom"]),
      isVirtual: randInt(0, 1) === 1,
      status: st,
      agenda: pick(AGENDAS),
      attendeesCount: randInt(5, 70),
      totalInvited: randInt(70, 90),
    });
  }
  return meetings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function generateVotes(chamas: Chama[], users: User[], count: number): Vote[] {
  seedRandom(8008);
  const votes: Vote[] = [];
  const statuses: Vote["status"][] = ["open", "open", "closed", "passed", "rejected"];
  const titles = [
    "Approve FY2026 Investment Strategy", "Increase Monthly Contribution to KES 5,000",
    "Elect New Treasurer", "Approve Land Purchase in Kiambu", "Adjust Loan Interest Rate to 12%",
    "Approve Welfare Fund Disbursement Policy", "Onboard New Members Batch 7",
  ];
  for (let i = 0; i < count; i++) {
    const optionLabels = pick([["Yes", "No"], ["Approve", "Reject", "Abstain"], ["Option A", "Option B", "Option C"]]);
    const options: VoteOption[] = optionLabels.map((label, idx) => ({ id: `opt_${i}_${idx}`, label, count: randInt(0, 60) }));
    votes.push({
      id: `vote_${i + 1}`,
      chamaId: pick(chamas).id,
      title: pick(titles),
      description: "Members are required to cast their vote before the closing deadline. Quorum rules apply.",
      options,
      status: pick(statuses),
      createdAt: randomDateBetween(daysAgo(45), daysAgo(1)),
      closesAt: randomDateBetween(NOW, daysFromNow(14)),
      totalVotes: options.reduce((sum, o) => sum + o.count, 0),
      createdBy: pick(users).fullName,
    });
  }
  return votes;
}

const NOTIF_TEMPLATES: { type: NotificationType; title: string; message: string }[] = [
  { type: "loan", title: "Loan Application Update", message: "Your loan application has moved to the next approval stage." },
  { type: "meeting", title: "Upcoming Meeting Reminder", message: "Your chama meeting starts in 24 hours." },
  { type: "vote", title: "New Vote Created", message: "A new proposal is open for voting — cast your vote now." },
  { type: "wallet", title: "Wallet Top-up Successful", message: "Your wallet has been credited successfully." },
  { type: "success", title: "Contribution Received", message: "Your monthly contribution was received and recorded." },
  { type: "warning", title: "Payment Due Soon", message: "Your loan installment is due in 3 days." },
  { type: "info", title: "New Investment Opportunity", message: "A new investment opportunity matching your risk profile is available." },
  { type: "error", title: "Transaction Failed", message: "A recent transaction could not be processed. Please retry." },
];

export function generateNotifications(users: User[], count: number): Notification[] {
  seedRandom(9009);
  const notifications: Notification[] = [];
  for (let i = 0; i < count; i++) {
    const t = pick(NOTIF_TEMPLATES);
    notifications.push({
      id: `notif_${i + 1}`,
      userId: pick(users).id,
      type: t.type,
      title: t.title,
      message: t.message,
      createdAt: randomDateBetween(daysAgo(14), NOW),
      isRead: randInt(0, 10) > 4,
    });
  }
  return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function generateActivity(count: number): ActivityItem[] {
  seedRandom(10010);
  const actions = [
    { action: "made a contribution of", target: "KES 5,000", icon: "success" as NotificationType },
    { action: "applied for a loan of", target: "KES 80,000", icon: "loan" as NotificationType },
    { action: "voted on", target: "Investment Strategy Proposal", icon: "vote" as NotificationType },
    { action: "joined", target: "Umoja Savings Group", icon: "info" as NotificationType },
    { action: "scheduled", target: "Quarterly AGM", icon: "meeting" as NotificationType },
    { action: "topped up wallet by", target: "KES 12,000", icon: "wallet" as NotificationType },
  ];
  const items: ActivityItem[] = [];
  for (let i = 0; i < count; i++) {
    const name = randomFullName();
    const a = pick(actions);
    items.push({
      id: `act_${i + 1}`,
      actorName: name,
      actorAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=16A34A&color=fff`,
      action: a.action,
      target: a.target,
      timestamp: randomDateBetween(daysAgo(7), NOW),
      icon: a.icon,
    });
  }
  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function generateDocuments(count: number): DocumentItem[] {
  seedRandom(11011);
  const names = ["AGM Minutes", "Constitution", "Loan Policy", "Financial Statement FY2025", "Audit Report", "Membership Form", "Investment Prospectus"];
  const types: DocumentItem["type"][] = ["pdf", "doc", "sheet", "image"];
  const docs: DocumentItem[] = [];
  for (let i = 0; i < count; i++) {
    docs.push({
      id: `doc_${i + 1}`,
      name: `${pick(names)} ${randInt(1, 12)}`,
      type: pick(types),
      sizeKb: randInt(80, 5000),
      uploadedBy: randomFullName(),
      uploadedAt: randomDateBetween(daysAgo(90), daysAgo(1)),
      url: "#",
    });
  }
  return docs;
}

export function generateWalletHistory(days: number): WalletHistoryPoint[] {
  seedRandom(12012);
  const points: WalletHistoryPoint[] = [];
  let balance = 50_000;
  for (let i = days; i >= 0; i--) {
    const date = daysAgo(i);
    balance += randInt(-3000, 8000);
    balance = Math.max(balance, 5000);
    points.push({ date: date.toISOString(), balance });
  }
  return points;
}

export function _round(n: number): number {
  return Math.round(n * 100) / 100;
}

export const _randFloatRef = randFloat;
