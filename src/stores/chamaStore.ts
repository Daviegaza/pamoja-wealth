// DEPRECATED — superseded by groupStore. Migration tracked in docs/RESEARCH_DOSSIER.md.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Chama, Member } from "@/types";
import { getMockDatabase } from "@/mock";

interface ChamaState {
  chamas: Chama[];
  members: Member[];
  activeChamaId: string | null;
  setActiveChama: (id: string) => void;
  getChamaById: (id: string) => Chama | undefined;
  getMembersByChamaId: (id: string) => Member[];
  addChama: (chama: Chama, member: Member) => void;
  updateChama: (id: string, patch: Partial<Chama>) => void;
}

const { chamas, members } = getMockDatabase();

export const useChamaStore = create<ChamaState>()(
  persist(
    (set, get) => ({
      chamas,
      members,
      activeChamaId: chamas[0]?.id ?? null,
      setActiveChama: (id) => set({ activeChamaId: id }),
      getChamaById: (id) => get().chamas.find((c) => c.id === id),
      getMembersByChamaId: (id) => get().members.filter((m) => m.chamaId === id),
      addChama: (chama, member) =>
        set({
          chamas: [chama, ...get().chamas],
          members: [member, ...get().members],
          activeChamaId: chama.id,
        }),
      updateChama: (id, patch) =>
        set({
          chamas: get().chamas.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        }),
    }),
    { name: "pamoja-chamas" }
  )
);
