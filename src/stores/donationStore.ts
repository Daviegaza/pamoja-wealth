import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Donation } from "@/types";
import { getMockDatabase } from "@/mock";

interface DonationState {
  donationsByGroup: Record<string, Donation[]>;
  addDonation: (donation: Donation) => void;
  totalForGroup: (groupId: string) => number;
}

const { donations } = getMockDatabase();

const seed: Record<string, Donation[]> = {};
for (const d of donations) {
  if (!seed[d.groupId]) seed[d.groupId] = [];
  seed[d.groupId].push(d);
}
for (const id of Object.keys(seed)) {
  seed[id].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export const useDonationStore = create<DonationState>()(
  persist(
    (set, get) => ({
      donationsByGroup: seed,
      addDonation: (donation) => {
        const existing = get().donationsByGroup[donation.groupId] ?? [];
        set({
          donationsByGroup: {
            ...get().donationsByGroup,
            [donation.groupId]: [donation, ...existing],
          },
        });
      },
      totalForGroup: (groupId) => {
        const arr = get().donationsByGroup[groupId] ?? [];
        return arr.reduce((sum, d) => sum + d.amount, 0);
      },
    }),
    { name: "pamoja-donations" }
  )
);
