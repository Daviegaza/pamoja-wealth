import { create } from "zustand";
import type { Chama, Member } from "@/types";
import { getMockDatabase } from "@/mock";

interface ChamaState {
  chamas: Chama[];
  members: Member[];
  activeChamaId: string | null;
  setActiveChama: (id: string) => void;
  getChamaById: (id: string) => Chama | undefined;
  getMembersByChamaId: (id: string) => Member[];
}

const { chamas, members } = getMockDatabase();

export const useChamaStore = create<ChamaState>((set, get) => ({
  chamas,
  members,
  activeChamaId: chamas[0]?.id ?? null,
  setActiveChama: (id) => set({ activeChamaId: id }),
  getChamaById: (id) => get().chamas.find((c) => c.id === id),
  getMembersByChamaId: (id) => get().members.filter((m) => m.chamaId === id),
}));
