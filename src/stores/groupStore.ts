import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Group, GroupKind } from "@/types";
import { getMockDatabase } from "@/mock";
import { USE_MOCKS } from "@/lib/env";
import { listMyChamas } from "@/api/chama";

interface GroupState {
  groups: Group[];
  activeGroupId: string | null;
  isLoading: boolean;
  byId: (id: string) => Group | undefined;
  byKind: (kind: GroupKind) => Group[];
  addGroup: (group: Group) => void;
  updateGroup: (id: string, patch: Partial<Group>) => void;
  setActiveGroup: (id: string) => void;
  loadFromApi: () => Promise<void>;
}

function apiChamaToGroup(c: any): Group {
  const kind: GroupKind = c.type === "fundraiser" ? "harambee" : c.type === "pot" ? "pot" : "chama";
  return {
    id: c.id,
    name: c.name,
    slug: c.slug ?? c.id,
    description: c.description ?? "",
    kind,
    visibility: (c.privacy ?? "public") as Group["visibility"],
    status: c.status ?? "active",
    createdAt: c.createdAt,
    updatedAt: c.updatedAt ?? c.createdAt,
    logoUrl: c.logoUrl ?? "",
    coverImageUrl: c.coverImageUrl ?? "",
    location: c.location ?? "",
    tags: c.tags ?? [],
    memberCount: c.memberCount ?? 0,
    totalFunds: Number(c.totalFunds ?? 0),
    requireKyc: c.requireKyc ?? false,
    allowDiscovery: c.allowDiscovery ?? true,
    ...(kind === "chama" ? {
      category: c.category ?? "savings",
      monthlyContribution: Number(c.monthlyContribution ?? 0),
    } : {}),
    ...(kind === "harambee" ? {
      cause: "community" as any,
      targetAmount: c.targetAmount ? Number(c.targetAmount) : 0,
      raisedAmount: c.raisedAmount ? Number(c.raisedAmount) : 0,
      organizerVerified: false,
    } : {}),
  } as Group;
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set, get) => ({
      groups: [],
      activeGroupId: null,
      isLoading: false,

      byId: (id) => get().groups.find((g) => g.id === id),
      byKind: (kind) => get().groups.filter((g) => g.kind === kind),

      addGroup: (group) =>
        set({
          groups: [group, ...get().groups],
          activeGroupId: group.id,
        }),

      updateGroup: (id, patch) =>
        set({
          groups: get().groups.map((g) =>
            g.id === id ? ({ ...g, ...patch } as Group) : g
          ),
        }),

      setActiveGroup: (id) => set({ activeGroupId: id }),

      loadFromApi: async () => {
        if (USE_MOCKS) {
          // Seed with mock data on first load if empty
          if (get().groups.length === 0) {
            const { groups: mockGroups } = getMockDatabase();
            if (mockGroups.length > 0) {
              set({
                groups: mockGroups,
                activeGroupId: get().activeGroupId ?? mockGroups[0]?.id ?? null,
              });
            }
          }
          return;
        }
        set({ isLoading: true });
        try {
          const res = await listMyChamas({ page: 1, pageSize: 100 });
          const items = res?.items ?? [];
          const groups: Group[] = items.map(apiChamaToGroup);
          set({
            groups,
            activeGroupId: get().activeGroupId ?? groups[0]?.id ?? null,
            isLoading: false,
          });
        } catch (err) {
          console.warn("[groupStore] API load failed, keeping local state", err);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "pamoja-group",
      partialize: (state) => ({
        groups: state.groups,
        activeGroupId: state.activeGroupId,
      }),
    }
  )
);

// Auto-load on module init
if (typeof window !== "undefined") {
  setTimeout(() => {
    const store = useGroupStore.getState();
    if (store.groups.length === 0 || !USE_MOCKS) {
      store.loadFromApi();
    }
  }, 100);
}
