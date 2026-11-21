// Shared app-level types. API DTOs live next to their API modules in src/api.

export type ThemeMode = "light" | "dark" | "system";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  createdAt: string;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: string;
  location: string;
}

export interface Settings {
  theme: ThemeMode;
  language: string;
  currency: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  twoFactorEnabled: boolean;
}
