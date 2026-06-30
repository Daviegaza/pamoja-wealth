import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Group, GroupKind } from "@/types";
import { getMockDatabase } from "@/mock";

interface GroupState {
  groups: Group[];
  activeGroupId: string | null;
  byId: (id: string) => Group | undefined;
  byKind: (kind: GroupKind) => Group[];
  addGroup: (group: Group) => void;
  updateGroup: (id: string, patch: Partial<Group>) => void;
  setActiveGroup: (id: string) => void;
}

const { groups } = getMockDatabase();

export const useGroupStore = create<GroupState>()(
  persist(
    (set, get) => ({
      groups,
      activeGroupId: groups[0]?.id ?? null,
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
    }),
    { name: "pamoja-group" }
  )
);
