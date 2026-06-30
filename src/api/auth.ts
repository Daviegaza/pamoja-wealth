import { api } from "./axios";

export interface AuthUser {
  id: string;
  email: string;
  phone: string;
  username?: string | null;
  fullName: string;
  avatarUrl: string | null;
  location: string | null;
  isVerified: boolean;
  isActive: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  nationalId: string | null;
  createdAt: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

interface ApiEnvelope<T> { success: true; data: T; }

export async function login(email: string, password: string) {
  const r = await api.post<ApiEnvelope<LoginResponse>>("/auth/login", { email, password });
  return r.data.data;
}

export async function register(data: {
  fullName: string;
  email: string;
  phone: string;
  username?: string;
  password: string;
}) {
  const r = await api.post<ApiEnvelope<LoginResponse>>("/auth/register", data);
  return r.data.data;
}

export async function refreshTokens(refreshToken: string) {
  const r = await api.post<ApiEnvelope<{ accessToken: string; refreshToken: string }>>(
    "/auth/refresh",
    { refreshToken }
  );
  return r.data.data;
}

export async function logout() {
  await api.post("/auth/logout").catch(() => undefined);
}

export async function getMe() {
  const r = await api.get<ApiEnvelope<AuthUser>>("/users/me");
  return r.data.data;
}
