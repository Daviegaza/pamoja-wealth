import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Settings } from "@/types";

interface SettingsState extends Settings {
  update: (patch: Partial<Settings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      language: "en",
      currency: "KES",
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: false,
      twoFactorEnabled: false,
      update: (patch) => set((s) => ({ ...s, ...patch })),
    }),
    { name: "pamoja-settings" }
  )
);
