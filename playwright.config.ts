import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright e2e config for Pamoja Wealth frontend.
 *
 * Assumes the frontend dev server (vite) is already running on port 5174 and
 * the backend on port 3000. Global setup registers a shared test user and
 * saves the storage state to e2e/.auth/user.json, which authenticated specs
 * consume via the `authenticatedPage` fixture.
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.spec\.ts/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: process.env.FRONTEND_URL ?? "http://localhost:5174",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
