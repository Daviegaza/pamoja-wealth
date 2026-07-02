import { test as base, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Shared Playwright fixtures for Pamoja Wealth e2e specs.
 *
 * - `authedTest` — auto-loads storageState from e2e/.auth/user.json (seeded by
 *   global-setup.ts). Use for any spec that must be signed in.
 * - `publicTest` — no storageState. Use for landing/auth flow specs.
 * - `apiRequest` — helper for direct backend calls (chama create, seeding, etc.).
 * - `user` — the e2e test user record from user-info.json.
 */
type TestUser = {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  password: string;
  accessToken: string;
  refreshToken: string;
};

const STORAGE_PATH = resolve(__dirname, ".auth/user.json");
const USER_PATH = resolve(__dirname, ".auth/user-info.json");
export const BACKEND = process.env.BACKEND_URL ?? "http://localhost:3000";
export const API = `${BACKEND}/api/v1`;

function loadUser(): TestUser {
  return JSON.parse(readFileSync(USER_PATH, "utf-8"));
}

type Fixtures = {
  user: TestUser;
  apiRequest: <T = any>(
    path: string,
    init?: { method?: string; body?: unknown; token?: string | null }
  ) => Promise<T>;
};

export const publicTest = base.extend<Fixtures>({
  user: async ({}, use) => {
    await use(loadUser());
  },
  apiRequest: async ({}, use) => {
    async function apiRequest<T>(
      path: string,
      init: { method?: string; body?: unknown; token?: string | null } = {}
    ): Promise<T> {
      const { method = "GET", body, token } = init;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const r = await fetch(`${API}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(`${method} ${path} ${r.status}: ${JSON.stringify(json)}`);
      return json as T;
    }
    await use(apiRequest);
  },
});

export const authedTest = publicTest.extend({
  storageState: STORAGE_PATH,
});

export { expect };
