import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { getCurrentUser } from "@/mock";
import * as authApi from "@/api/auth";

const USE_MOCKS = (import.meta.env.VITE_USE_MOCKS ?? "false") === "true";

interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  username?: string;
  password: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

function mapAuthUserToUser(u: authApi.AuthUser): User {
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    avatarUrl: u.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${u.email}`,
    role: "member",
    permissions: ["view_dashboard"],
    createdAt: u.createdAt,
    isVerified: u.isVerified,
    twoFactorEnabled: u.twoFactorEnabled,
    lastLoginAt: u.lastLoginAt || u.createdAt,
    nationalId: u.nationalId || undefined,
    location: u.location || "",
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email, password) => {
        if (USE_MOCKS) {
          await new Promise((r) => setTimeout(r, 400));
          set({ user: getCurrentUser(), isAuthenticated: true });
          return;
        }
        const res = await authApi.login(email, password);
        localStorage.setItem("pamoja_token", res.accessToken);
        localStorage.setItem("pamoja_refresh", res.refreshToken);
        set({ user: mapAuthUserToUser(res.user), isAuthenticated: true });
      },
      register: async ({ fullName, email, phone, username, password }) => {
        if (USE_MOCKS) {
          await new Promise((r) => setTimeout(r, 400));
          const base = getCurrentUser();
          set({ user: { ...base, fullName, email, phone }, isAuthenticated: true });
          return;
        }
        const res = await authApi.register({ fullName, email, phone, username, password });
        localStorage.setItem("pamoja_token", res.accessToken);
        localStorage.setItem("pamoja_refresh", res.refreshToken);
        set({ user: mapAuthUserToUser(res.user), isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem("pamoja_token");
        localStorage.removeItem("pamoja_refresh");
        if (!USE_MOCKS) authApi.logout().catch(() => undefined);
        set({ user: null, isAuthenticated: false });
      },
      setUser: (user) => set({ user }),
    }),
    { name: "pamoja-auth" }
  )
);
