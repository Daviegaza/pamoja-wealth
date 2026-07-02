import { publicTest as test, expect } from "./fixtures";

/**
 * Public / unauthenticated routes for the Pamoja Wealth frontend.
 *
 * Every spec asserts three things:
 *   1. The server responded 200 for the initial document.
 *   2. Neither the global error boundary text ("Something went wrong")
 *      nor a hard runtime crash surfaced.
 *   3. A page-specific piece of copy from the actual page file is visible,
 *      proving the Suspense fallback resolved and the lazy chunk mounted.
 */

async function gotoAndAssertOk(page: import("@playwright/test").Page, path: string) {
  const response = await page.goto(path);
  expect(response, `no response for ${path}`).not.toBeNull();
  expect(response!.status(), `bad status for ${path}`).toBe(200);
  await page.waitForLoadState("networkidle");
  // Generic error-boundary sentinel from src/components/common/ErrorState.tsx.
  await expect(page.getByText("Something went wrong. Please try again.")).toHaveCount(0);
}

test.describe("Public pages", () => {
  test("landing / renders hero and primary CTAs", async ({ page }) => {
    await gotoAndAssertOk(page, "/");
    await expect(page.getByRole("heading", { name: /Your Chama,\s*Supercharged/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Start Free Today/i }).first()).toBeVisible();
    // Navbar CTAs to the auth routes.
    await expect(page.getByRole("link", { name: /Get started/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Sign in/i }).first()).toBeVisible();
  });

  test("landing 'Get started' CTA navigates to /register", async ({ page }) => {
    await gotoAndAssertOk(page, "/");
    // The navbar "Get started" wraps a button inside a <Link to="/register">.
    await page.getByRole("link", { name: /Get started/i }).first().click();
    await expect(page).toHaveURL(/\/register$/);
  });

  test("landing 'Sign in' CTA navigates to /login", async ({ page }) => {
    await gotoAndAssertOk(page, "/");
    await page.getByRole("link", { name: /Sign in/i }).first().click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("landing navbar Pricing link changes URL to /pricing", async ({ page }) => {
    await gotoAndAssertOk(page, "/");
    await page.getByRole("link", { name: /^Pricing$/ }).first().click();
    await expect(page).toHaveURL(/\/pricing$/);
    await expect(page.getByRole("heading", { name: /pot of money/i })).toBeVisible();
  });

  test("/about renders mission and use cases", async ({ page }) => {
    await gotoAndAssertOk(page, "/about");
    await expect(page.getByRole("heading", { name: /Building Wealth,\s*Together/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Our Mission/i })).toBeVisible();
  });

  test("/pricing renders pricing hero", async ({ page }) => {
    await gotoAndAssertOk(page, "/pricing");
    await expect(page.getByRole("heading", { name: /pot of money/i })).toBeVisible();
  });

  test("/discover renders discover header", async ({ page }) => {
    await gotoAndAssertOk(page, "/discover");
    await expect(page.getByRole("heading", { name: /^Discover$/ })).toBeVisible();
    await expect(page.getByText(/Find public harambees, open chamas/i)).toBeVisible();
  });

  test("/help renders FAQ and guides", async ({ page }) => {
    await gotoAndAssertOk(page, "/help");
    await expect(page.getByRole("heading", { name: /Help & Guides/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Frequently Asked Questions/i })).toBeVisible();
  });

  test("/terms renders terms of service", async ({ page }) => {
    await gotoAndAssertOk(page, "/terms");
    await expect(page.getByRole("heading", { name: /Terms of Service/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Acceptance of Terms/i })).toBeVisible();
  });

  test("/privacy renders privacy policy", async ({ page }) => {
    await gotoAndAssertOk(page, "/privacy");
    await expect(page.getByRole("heading", { name: /Privacy Policy/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Information We Collect/i })).toBeVisible();
  });

  test("/security renders security page", async ({ page }) => {
    await gotoAndAssertOk(page, "/security");
    await expect(page.getByRole("heading", { name: /^Security$/ })).toBeVisible();
  });

  test("/c/:slug renders without crashing (found or empty state)", async ({ page }) => {
    // The mock loader in Campaign/[slug].tsx matches on the last 4 chars of an
    // internal id OR a substring of the name. For an arbitrary slug we can't
    // guarantee a hit, so either the campaign renders OR the "Campaign not
    // found" EmptyState renders — both are acceptable, we're checking no crash.
    await gotoAndAssertOk(page, "/c/test-campaign");
    const found = page.getByText(/Campaign not found/i);
    const article = page.locator("article").first();
    await expect(async () => {
      const foundCount = await found.count();
      const articleCount = await article.count();
      expect(foundCount + articleCount).toBeGreaterThan(0);
    }).toPass({ timeout: 5_000 });
  });

  test("unknown route renders NotFoundPage", async ({ page }) => {
    // React-router's catch-all still returns 200 from the Vite dev server (SPA),
    // so we only assert that the NotFoundPage copy is visible.
    await page.goto("/definitely-does-not-exist-xyz");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/not found/i).first()).toBeVisible();
    await expect(page.getByText("Something went wrong. Please try again.")).toHaveCount(0);
  });
});
