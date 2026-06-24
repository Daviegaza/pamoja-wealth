import { getCurrentUser } from "@/mock";
import type { User } from "@/types";

/** Mocked auth service — replace internals with real `api` calls when a backend is available. */
export const authService = {
  async login(_email: string, _password: string): Promise<User> {
    await new Promise((r) => setTimeout(r, 500));
    return getCurrentUser();
  },
  async logout(): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
  },
};
