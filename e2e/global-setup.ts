import { chromium, type FullConfig } from "@playwright/test";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

/**
 * Registers a shared e2e test user via the backend API, then bakes a browser
 * storage state (localStorage tokens + zustand persisted auth) that
 * authenticated specs consume via `test.use({ storageState })`.
 *
 * Runs once before the suite; skipped if PW_REUSE_AUTH=1 and a prior state
 * exists (delete e2e/.auth/user.json to force re-register).
 */
const BACKEND = process.env.BACKEND_URL ?? "http://localhost:3000";
const FRONTEND = process.env.FRONTEND_URL ?? "http://localhost:5174";
const API = `${BACKEND}/api/v1`;
const STORAGE = resolve(__dirname, ".auth/user.json");

export const E2E_USER = {
  email: `pw-e2e+${Date.now()}@pamoja.test`,
  phone: `+2547${String(Date.now()).slice(-8)}`,
  fullName: "Playwright E2E",
  password: "PlaywrightE2E123",
};

async function post(path: string, body: unknown) {
  const r = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: FRONTEND },
    body: JSON.stringify(body),
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`POST ${path} ${r.status}: ${JSON.stringify(json)}`);
  return json;
}

export default async function globalSetup(_config: FullConfig) {
  if (existsSync(STORAGE) && process.env.PW_REUSE_AUTH === "1") return;

  let accessToken: string;
  let refreshToken: string;
  let user: any;
  try {
    const reg = await post("/auth/register", E2E_USER);
    accessToken = reg.data.accessToken;
    refreshToken = reg.data.refreshToken;
    user = reg.data.user;
  } catch {
    const login = await post("/auth/login", {
      email: E2E_USER.email,
      password: E2E_USER.password,
    });
    accessToken = login.data.accessToken;
    refreshToken = login.data.refreshToken;
    user = login.data.user;
  }

  const persistedAuth = {
    state: {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl ?? `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.email}`,
        role: "member",
        permissions: ["view_dashboard"],
        createdAt: user.createdAt,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        lastLoginAt: user.lastLoginAt ?? user.createdAt,
        nationalId: user.nationalId ?? undefined,
        location: user.location ?? "",
      },
      isAuthenticated: true,
    },
    version: 0,
  };

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(FRONTEND);
  await page.evaluate(
    ([token, refresh, auth]) => {
      localStorage.setItem("pamoja_token", token);
      localStorage.setItem("pamoja_refresh", refresh);
      localStorage.setItem("pamoja-auth", auth);
    },
    [accessToken, refreshToken, JSON.stringify(persistedAuth)]
  );

  mkdirSync(dirname(STORAGE), { recursive: true });
  await context.storageState({ path: STORAGE });
  writeFileSync(
    resolve(__dirname, ".auth/user-info.json"),
    JSON.stringify({ ...E2E_USER, id: user.id, accessToken, refreshToken }, null, 2)
  );

  await browser.close();
}
