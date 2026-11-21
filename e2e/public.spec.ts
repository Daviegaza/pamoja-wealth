import { publicTest as test, expect } from "./fixtures";

/**
 * Public / unauthenticated routes for the Pamoja Wealth frontend.
 *
 * Every spec asserts that the document loaded, no error boundary rendered,
 * and page-specific copy is visible.
 */

async function gotoAndAssertOk(page: import("@playwright/test").Page, path: string) {
  const response = await page.goto(path);
  expect(response, `no response for ${path}`).not.toBeNull();
  expect(response!.status(), `bad status for ${path}`).toBe(200);
  await page.waitForLoadState("networkidle");
  await expect(page.getByText("Something went wrong. Please try again.")).toHaveCount(0);
}

test.describe("Public pages", () => {
  test("landing states the non-custodial model and has primary CTAs", async ({ page }) => {
    await gotoAndAssertOk(page, "/");
    await expect(page.getByRole("heading", { level: 1, name: /chama's books/i })).toBeVisible();
    await expect(page.getByText(/We never hold, receive, or transfer your chama's money/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Start free/i }).first()).toBeVisible();
  });

  test("landing has no made-up marketing numbers", async ({ page }) => {
    await gotoAndAssertOk(page, "/");
    for (const claim of [/2\.4B/i, /1,000\+/, /99\.95/, /200\+ chamas/i]) {
      await expect(page.getByText(claim)).toHaveCount(0);
    }
  });

  test("landing navbar Pricing link changes URL to /pricing", async ({ page }) => {
    await gotoAndAssertOk(page, "/");
    await page.getByRole("link", { name: /^Pricing$/ }).first().click();
    await expect(page).toHaveURL(/\/pricing$/);
    await expect(page.getByRole("heading", { name: /^Pricing$/ })).toBeVisible();
  });

  test("/about renders", async ({ page }) => {
    await gotoAndAssertOk(page, "/about");
    await expect(page.getByRole("heading", { name: /About Pamoja Wealth/i })).toBeVisible();
  });

  test("/help explains that Pamoja does not hold money", async ({ page }) => {
    await gotoAndAssertOk(page, "/help");
    await expect(page.getByRole("heading", { level: 1, name: /^Help$/ })).toBeVisible();
    await expect(page.getByText(/not a bank, SACCO, payment service provider/i)).toBeVisible();
  });

  test("/terms renders with draft notice", async ({ page }) => {
    await gotoAndAssertOk(page, "/terms");
    await expect(page.getByRole("heading", { name: /Terms of Service/i })).toBeVisible();
    await expect(page.getByText(/pending review by a Kenyan advocate/i)).toBeVisible();
  });

  test("/privacy renders", async ({ page }) => {
    await gotoAndAssertOk(page, "/privacy");
    await expect(page.getByRole("heading", { name: /Privacy Notice/i })).toBeVisible();
    await expect(page.getByText(/Data Protection Act, 2019/i)).toBeVisible();
  });

  test("/security renders", async ({ page }) => {
    await gotoAndAssertOk(page, "/security");
    await expect(page.getByRole("heading", { name: /^Security$/ })).toBeVisible();
  });

  test("removed money-handling routes are gone", async ({ page }) => {
    for (const path of ["/wallet", "/investments", "/discover", "/give/abc"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await expect(page.getByText(/not found/i).first()).toBeVisible();
    }
  });

  test("unknown route renders NotFoundPage", async ({ page }) => {
    await page.goto("/definitely-does-not-exist-xyz");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/not found/i).first()).toBeVisible();
    await expect(page.getByText("Something went wrong. Please try again.")).toHaveCount(0);
  });
});
