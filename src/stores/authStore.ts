import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { getCurrentUser } from "@/mock";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async () => {
        await new Promise((r) => setTimeout(r, 600));
        set({ user: getCurrentUser(), isAuthenticated: true });
      },
      register: async (fullName) => {
        await new Promise((r) => setTimeout(r, 600));
        const base = getCurrentUser();
        set({ user: { ...base, fullName }, isAuthenticated: true });
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      setUser: (user) => set({ user }),
    }),
    { name: "pamoja-auth" }
  )
);
