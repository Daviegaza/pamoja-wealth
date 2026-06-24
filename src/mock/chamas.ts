import type { Chama, ChamaCategory, Member, User } from "@/types";
import { avatarUrl, CHAMA_NAMES, LOCATIONS, pick, randFloat, randInt, randomDateBetween, seedRandom } from "./generator";

const NOW = new Date();
const TODAY_TS = NOW.getTime();
const DAY_MS = 86400000;

function daysAgo(n: number): Date {
  return new Date(TODAY_TS - n * DAY_MS);
}

function daysFromNow(n: number): Date {
  return new Date(TODAY_TS + n * DAY_MS);
}

const CATEGORIES: ChamaCategory[] = ["savings", "investment", "welfare", "mixed"];

export function generateChamas(count: number): Chama[] {
  seedRandom(2002);
  const chamas: Chama[] = [];
  for (let i = 0; i < count; i++) {
    const name = i < CHAMA_NAMES.length ? CHAMA_NAMES[i] : `${pick(CHAMA_NAMES)} ${i}`;
    chamas.push({
      id: `cha_${i + 1}`,
      name,
      description: `A trusted ${pick(CATEGORIES)} group focused on building generational wealth through disciplined contributions and smart investing.`,
      category: pick(CATEGORIES),
      logoUrl: avatarUrl(name, i),
      memberCount: randInt(8, 85),
      totalFunds: randInt(150_000, 24_000_000),
      monthlyContribution: randInt(1000, 25_000),
      createdAt: randomDateBetween(new Date(2020, 0, 1), daysAgo(30)),
      nextMeetingDate: randomDateBetween(NOW, daysFromNow(45)),
      growthRate: randFloat(-4, 22, 1),
      status: randInt(0, 10) > 1 ? "active" : "dormant",
      location: pick(LOCATIONS),
    });
  }
  return chamas;
}

export function generateMembers(users: User[], chamas: Chama[], count: number): Member[] {
  seedRandom(3003);
  const members: Member[] = [];
  for (let i = 0; i < count; i++) {
    const user = pick(users);
    const chama = pick(chamas);
    members.push({
      id: `mem_${i + 1}`,
      userId: user.id,
      chamaId: chama.id,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      role: pick(["member", "member", "member", "treasurer", "secretary", "chairperson"]),
      joinedAt: randomDateBetween(new Date(2021, 0, 1), daysAgo(7)),
      totalContributions: randInt(5_000, 850_000),
      shares: randInt(1, 50),
      status: randInt(0, 10) > 1 ? "active" : "inactive",
      contributionStreak: randInt(0, 36),
    });
  }
  return members;
}
