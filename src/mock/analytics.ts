import type { Analytics } from "@/types";
import { randInt, seedRandom } from "./generator";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function generateAnalytics(): Analytics {
  seedRandom(13013);
  let contribBase = 800_000;
  let invBase = 2_000_000;
  let memberBase = 120;
  let revBase = 90_000;

  const contributionGrowth = MONTHS.map((month) => {
    contribBase += randInt(20_000, 120_000);
    return { month, amount: contribBase };
  });

  const investmentGrowth = MONTHS.map((month) => {
    invBase += randInt(-50_000, 250_000);
    return { month, amount: Math.max(invBase, 500_000) };
  });

  const cashFlow = MONTHS.map((month) => ({
    month,
    inflow: randInt(300_000, 1_200_000),
    outflow: randInt(150_000, 800_000),
  }));

  const memberGrowth = MONTHS.map((month) => {
    memberBase += randInt(2, 20);
    return { month, count: memberBase };
  });

  const revenueTrends = MONTHS.map((month) => {
    revBase += randInt(-5_000, 25_000);
    return { month, revenue: Math.max(revBase, 10_000) };
  });

  const loanDistribution = [
    { category: "Business", value: randInt(20, 40) },
    { category: "Education", value: randInt(10, 25) },
    { category: "Medical", value: randInt(5, 20) },
    { category: "Agriculture", value: randInt(10, 25) },
    { category: "Other", value: randInt(5, 15) },
  ];

  const portfolioAllocation = [
    { name: "Money Market", value: randInt(20, 35) },
    { name: "Treasury Bills", value: randInt(15, 30) },
    { name: "Real Estate", value: randInt(10, 25) },
    { name: "Stocks", value: randInt(5, 20) },
    { name: "SACCO", value: randInt(5, 15) },
  ];

  return { contributionGrowth, investmentGrowth, cashFlow, loanDistribution, memberGrowth, revenueTrends, portfolioAllocation };
}
