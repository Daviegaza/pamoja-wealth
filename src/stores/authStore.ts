import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { getCurrentUser } from "@/mock";
import * as authApi from "@/api/auth";
import { USE_MOCKS } from "@/lib/env";

interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  username?: string;
  password: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  clearError: () => void;
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
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          if (USE_MOCKS) {
            await new Promise((r) => setTimeout(r, 400));
            const mockUser = getCurrentUser();
            set({ user: mockUser, isAuthenticated: true, isLoading: false });
            return;
          }
          const res = await authApi.login(email, password);
          localStorage.setItem("pamoja_token", res.accessToken);
          localStorage.setItem("pamoja_refresh", res.refreshToken);
          set({
            user: mapAuthUserToUser(res.user),
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: any) {
          const msg = err?.response?.data?.error?.message || "Login failed. Check your credentials.";
          set({ error: msg, isLoading: false });
          throw err;
        }
      },

      register: async ({ fullName, email, phone, username, password }) => {
        set({ isLoading: true, error: null });
        try {
          if (USE_MOCKS) {
            await new Promise((r) => setTimeout(r, 400));
            const base = getCurrentUser();
            set({ user: { ...base, fullName, email, phone }, isAuthenticated: true, isLoading: false });
            return;
          }
          const res = await authApi.register({ fullName, email, phone, username, password });
          localStorage.setItem("pamoja_token", res.accessToken);
          localStorage.setItem("pamoja_refresh", res.refreshToken);
          set({
            user: mapAuthUserToUser(res.user),
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: any) {
          const msg = err?.response?.data?.error?.message || "Registration failed. Try again.";
          set({ error: msg, isLoading: false });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem("pamoja_token");
        localStorage.removeItem("pamoja_refresh");
        localStorage.removeItem("pamoja-auth");
        if (!USE_MOCKS) authApi.logout().catch(() => undefined);
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setUser: (user) => set({ user }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "pamoja-auth",
      onRehydrateStorage: () => (state) => {
        if (state) state._hasHydrated = true;
      },
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// HMR: preserve auth state across Vite hot reloads
if (import.meta.hot) {
  import.meta.hot.accept(() => {});
}
