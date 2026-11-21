import { authedTest as test, expect } from "./fixtures";

/** Renders each authenticated top-level page and asserts its heading is visible. */

async function gotoAuthed(page: import("@playwright/test").Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}

async function expectNoErrorBoundary(page: import("@playwright/test").Page) {
  await expect(page.getByText("Something went wrong. Please try again.")).toHaveCount(0);
}

test.describe("authenticated pages render", () => {
  test("/profile renders with user email", async ({ page, user }) => {
    await gotoAuthed(page, "/profile");
    await expect(page.getByRole("heading", { level: 1, name: "Profile" })).toBeVisible();
    await expect(page.getByText(user.email, { exact: false }).first()).toBeVisible();
    await expectNoErrorBoundary(page);
  });

  test("/settings renders", async ({ page }) => {
    await gotoAuthed(page, "/settings");
    await expect(page.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "General" })).toBeVisible();
    await expectNoErrorBoundary(page);
  });

  test("/notifications renders", async ({ page }) => {
    await gotoAuthed(page, "/notifications");
    await expect(page.getByRole("heading", { level: 1, name: "Notifications" })).toBeVisible();
    await expectNoErrorBoundary(page);
  });
});
