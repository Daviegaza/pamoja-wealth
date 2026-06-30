import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChamaRuleVersion } from "@/types";
import { getMockDatabase } from "@/mock";

interface RuleState {
  rulesByGroup: Record<string, ChamaRuleVersion[]>;
  activeRule: (groupId: string) => ChamaRuleVersion | undefined;
  addRuleVersion: (version: ChamaRuleVersion) => void;
  getHistory: (groupId: string) => ChamaRuleVersion[];
}

const { ruleVersions } = getMockDatabase();

// Seed: group versions by chamaId, newest first
const seed: Record<string, ChamaRuleVersion[]> = {};
for (const rv of ruleVersions) {
  if (!seed[rv.chamaId]) seed[rv.chamaId] = [];
  seed[rv.chamaId].push(rv);
}
for (const id of Object.keys(seed)) {
  seed[id].sort((a, b) => b.version - a.version);
}

export const useRuleStore = create<RuleState>()(
  persist(
    (set, get) => ({
      rulesByGroup: seed,
      activeRule: (groupId) => {
        const versions = get().rulesByGroup[groupId];
        if (!versions || versions.length === 0) return undefined;
        // active = highest version with no supersededAt
        const active = versions.find((v) => !v.supersededAt);
        return active ?? versions[0];
      },
      addRuleVersion: (version) => {
        const existing = get().rulesByGroup[version.chamaId] ?? [];
        // mark prior active as superseded
        const now = new Date().toISOString();
        const updated = existing.map((v) =>
          v.supersededAt ? v : { ...v, supersededAt: now }
        );
        set({
          rulesByGroup: {
            ...get().rulesByGroup,
            [version.chamaId]: [version, ...updated],
          },
        });
      },
      getHistory: (groupId) => get().rulesByGroup[groupId] ?? [],
    }),
    { name: "pamoja-rules" }
  )
);
