import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChamaRuleVersion } from "@/types";
import { getMockDatabase } from "@/mock";
import {
  listRuleVersions as apiList,
  getActiveRules as apiActive,
  saveRuleVersion as apiSave,
  type ChamaRuleVersion as ApiChamaRuleVersion,
} from "@/api/chama";

// The API returns ruleDoc as unknown; app types use RuleDoc. Cast at the boundary.
function toDomain(v: ApiChamaRuleVersion | null): ChamaRuleVersion | null {
  return v as unknown as ChamaRuleVersion | null;
}
function toDomainList(arr: ApiChamaRuleVersion[]): ChamaRuleVersion[] {
  return arr as unknown as ChamaRuleVersion[];
}

import { USE_MOCKS } from "@/lib/env";
void USE_MOCKS;

interface RuleState {
  rulesByGroup: Record<string, ChamaRuleVersion[]>;
  isLoading: boolean;
  activeRule: (groupId: string) => ChamaRuleVersion | undefined;
  syncGroup: (groupId: string) => Promise<void>;
  addRuleVersion: (version: ChamaRuleVersion) => void;
  publishRules: (groupId: string, ruleDoc: unknown, sourceText?: string) => Promise<ChamaRuleVersion>;
  getHistory: (groupId: string) => ChamaRuleVersion[];
}

const { ruleVersions } = getMockDatabase();

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
      isLoading: false,

      activeRule: (groupId) => {
        const versions = get().rulesByGroup[groupId];
        if (!versions || versions.length === 0) return undefined;
        const active = versions.find((v) => !v.supersededAt);
        return active ?? versions[0];
      },

      syncGroup: async (groupId) => {
        if (USE_MOCKS) return;
        set({ isLoading: true });
        try {
          const [rawList, rawActive] = await Promise.all([
            apiList(groupId).catch(() => [] as ApiChamaRuleVersion[]),
            apiActive(groupId).catch(() => null),
          ]);
          const list = toDomainList(rawList);
          const active = toDomain(rawActive);
          const merged: ChamaRuleVersion[] = active
            ? [active, ...list.filter((v) => v.version !== active.version)]
            : list;
          merged.sort((a, b) => b.version - a.version);
          set({
            rulesByGroup: { ...get().rulesByGroup, [groupId]: merged },
          });
        } catch (err) {
          console.warn("[ruleStore] syncGroup failed", err);
        } finally {
          set({ isLoading: false });
        }
      },

      addRuleVersion: (version) => {
        const existing = get().rulesByGroup[version.chamaId] ?? [];
        const now = new Date().toISOString();
        const updated = existing.map((v) => (v.supersededAt ? v : { ...v, supersededAt: now }));
        set({
          rulesByGroup: {
            ...get().rulesByGroup,
            [version.chamaId]: [version, ...updated],
          },
        });
      },

      publishRules: async (groupId, ruleDoc, sourceText) => {
        const rawSaved = await apiSave(groupId, ruleDoc, sourceText);
        const saved = toDomain(rawSaved) as ChamaRuleVersion;
        get().addRuleVersion(saved);
        return saved;
      },

      getHistory: (groupId) => get().rulesByGroup[groupId] ?? [],
    }),
    { name: "pamoja-rules" }
  )
);
