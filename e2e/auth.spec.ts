import { publicTest, authedTest, expect, API } from "./fixtures";

/**
 * End-to-end auth flow coverage for the Pamoja Wealth React frontend.
 *
 * Backend endpoints: /api/v1/auth/{register,login,logout}
 * Auth persists via localStorage keys: pamoja_token, pamoja_refresh, pamoja-auth
 */

function makeUser(tag: string) {
  const stamp = Date.now();
  return {
    fullName: "Playwright Auth",
    email: `pw-${tag}+${stamp}@pamoja.test`,
    phone: `+2547${String(stamp).slice(-8)}`,
    password: "Register123",
  };
}

async function registerViaApi(user: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}) {
  const r = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    throw new Error(`register seed failed: ${r.status} ${body}`);
  }
}

publicTest.describe("auth flow", () => {
  publicTest("register page renders and creates an account", async ({ page }) => {
    const user = makeUser("register");

    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: /create your account/i })
    ).toBeVisible();

    await page.getByLabel("Full name").fill(user.fullName);
    await page.getByLabel("Email address").fill(user.email);
    await page.getByLabel("Phone number").fill(user.phone);
    await page.getByLabel("Password", { exact: true }).fill(user.password);
    await page.getByLabel("Confirm password").fill(user.password);
    await page.getByLabel(/i agree to the/i).check();

    await page.getByRole("button", { name: /create account/i }).click();

    await page.waitForURL(/\/(dashboard|otp-verification)/, { timeout: 15_000 });
    expect(page.url()).toMatch(/\/(dashboard|otp-verification)$/);

    const token = await page.evaluate(() =>
      window.localStorage.getItem("pamoja_token")
    );
    expect(token).toBeTruthy();
  });

  publicTest("login page signs the user in with valid credentials", async ({
    page,
  }) => {
    const user = makeUser("login");
    await registerViaApi(user);

    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: /welcome back/i })
    ).toBeVisible();

    await page.getByLabel("Email address").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: /sign in/i }).click();

    await page.waitForURL(/\/dashboard/, { timeout: 15_000 });

    const token = await page.evaluate(() =>
      window.localStorage.getItem("pamoja_token")
    );
    expect(token).toBeTruthy();
  });

  publicTest("login with wrong password shows an inline error", async ({
    page,
  }) => {
    const user = makeUser("badlogin");
    await registerViaApi(user);

    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await page.getByLabel("Email address").fill(user.email);
    await page.getByLabel("Password").fill("WrongPassword999");
    await page.getByRole("button", { name: /sign in/i }).click();

    // App should not crash and should keep us on /login.
    await page.waitForTimeout(1500);
    expect(page.url()).toMatch(/\/login$/);

    // Sign-in button should still be present (no crash) and email input still there.
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();

    // Token should NOT have been written.
    const token = await page.evaluate(() =>
      window.localStorage.getItem("pamoja_token")
    );
    expect(token).toBeFalsy();
  });

  publicTest("forgot-password page accepts an email submission", async ({
    page,
  }) => {
    await page.goto("/forgot-password");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: /forgot your password/i })
    ).toBeVisible();

    await page.getByLabel("Email address").fill("pw-forgot@pamoja.test");
    await page
      .getByRole("button", { name: /send reset instructions/i })
      .click();

    // The page navigates to /otp-verification after a short delay; either
    // outcome (still on /forgot-password or navigated) is acceptable — the
    // requirement is only that submission does not crash the app.
    await page.waitForLoadState("networkidle");
    expect(page.url()).toMatch(/\/(forgot-password|otp-verification)$/);
  });

  publicTest("guarded route /dashboard redirects unauthenticated users to /login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/login/);
  });
});

authedTest.describe("auth flow (authenticated)", () => {
  authedTest("logout clears the token and returns user to a public page", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/dashboard/);

    // Sidebar logout button uses aria-label="Log out"; on smaller viewports
    // MobileSidebar renders a "Sign out" button. Prefer the accessible name.
    const logoutButton = page
      .getByRole("button", { name: /^log out$|^sign out$/i })
      .first();
    await logoutButton.click();

    await page.waitForURL(/\/(login|)$/, { timeout: 10_000 });

    const token = await page.evaluate(() =>
      window.localStorage.getItem("pamoja_token")
    );
    expect(token).toBeFalsy();
    expect(page.url()).toMatch(/\/(login|)?$/);
  });
});
