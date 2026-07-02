import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Chama, Member } from "@/types";

interface ChamaState {
  chamas: Chama[];
  members: Member[];
  activeChamaId: string | null;
  setActiveChama: (id: string | null) => void;
  setChamas: (chamas: Chama[]) => void;
  setMembers: (members: Member[]) => void;
  getChamaById: (id: string) => Chama | undefined;
  getMembersByChamaId: (id: string) => Member[];
  addChama: (chama: Chama, member: Member) => void;
  updateChama: (id: string, patch: Partial<Chama>) => void;
}

export const useChamaStore = create<ChamaState>()(
  persist(
    (set, get) => ({
      chamas: [],
      members: [],
      activeChamaId: null,
      setActiveChama: (id) => set({ activeChamaId: id }),
      setChamas: (chamas) => {
        const cur = get().activeChamaId;
        const stillValid = cur && chamas.some((c) => c.id === cur);
        set({ chamas, activeChamaId: stillValid ? cur : chamas[0]?.id ?? null });
      },
      setMembers: (members) => set({ members }),
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
    { name: "pamoja-chamas-v2" }
  )
);
