import type { Permission, Role, User } from "@/types";
import { avatarUrl, pick, randInt, randomDateBetween, randomFullName, seedRandom, LOCATIONS } from "./generator";

const NOW = new Date();
const TODAY_TS = NOW.getTime();
const DAY_MS = 86400000;

function daysAgo(n: number): Date {
  return new Date(TODAY_TS - n * DAY_MS);
}

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: ["view_dashboard", "manage_members", "manage_treasury", "approve_loans", "create_meetings", "manage_votes", "view_analytics", "manage_settings", "manage_billing"],
  member: ["view_dashboard"],
  treasurer: ["view_dashboard", "manage_treasury", "view_analytics"],
  secretary: ["view_dashboard", "create_meetings", "manage_votes"],
  chairperson: ["view_dashboard", "manage_members", "approve_loans", "create_meetings", "manage_votes", "view_analytics"],
  admin: ["view_dashboard", "manage_members", "manage_treasury", "approve_loans", "create_meetings", "manage_votes", "view_analytics", "manage_settings"],
  super_admin: ["view_dashboard", "manage_members", "manage_treasury", "approve_loans", "create_meetings", "manage_votes", "view_analytics", "manage_settings", "manage_billing"],
};

const ROLE_WEIGHTS: Role[] = [
  "member", "member", "member", "member", "member", "member", "member",
  "treasurer", "secretary", "chairperson", "admin",
];

export function generateUsers(count: number): User[] {
  seedRandom(1001);
  const users: User[] = [];
  for (let i = 0; i < count; i++) {
    const name = randomFullName();
    const role = i === 0 ? "owner" : pick(ROLE_WEIGHTS);
    users.push({
      id: `usr_${i + 1}`,
      fullName: i === 0 ? "Amara Okafor" : name,
      email: `${name.toLowerCase().replace(/\s/g, ".")}${i}@pamoja.app`,
      phone: `+254 7${randInt(10, 99)} ${randInt(100, 999)} ${randInt(100, 999)}`,
      avatarUrl: avatarUrl(name, i),
      role,
      permissions: ROLE_PERMISSIONS[role],
      createdAt: randomDateBetween(new Date(2021, 0, 1), daysAgo(7)),
      isVerified: randInt(0, 10) > 1,
      twoFactorEnabled: randInt(0, 10) > 5,
      lastLoginAt: randomDateBetween(daysAgo(2), NOW),
      location: pick(LOCATIONS),
    });
  }
  return users;
}
