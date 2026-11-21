import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Remembers which chama the user last opened so the navigation can link
 * straight into its workspace. Chama data itself always comes from the API.
 */
interface ChamaState {
  activeChamaId: string | null;
  activeChamaName: string | null;
  setActiveChama: (id: string | null, name?: string | null) => void;
}

export const useChamaStore = create<ChamaState>()(
  persist(
    (set) => ({
      activeChamaId: null,
      activeChamaName: null,
      setActiveChama: (id, name = null) => set({ activeChamaId: id, activeChamaName: id ? name : null }),
    }),
    { name: "pamoja-active-chama-v3" },
  ),
);
