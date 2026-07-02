import { authedTest as test, expect } from "./fixtures";

/**
 * Renders each authenticated top-level page and asserts the page-specific
 * heading is visible. Also runs two lightweight interaction checks:
 * flipping a Switch on /settings and confirming the profile fullName field
 * is editable on /profile.
 */

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
    await expect(page.getByRole("heading", { level: 2, name: "Edit Profile" })).toBeVisible();
    await expect(page.getByText(user.email, { exact: false }).first()).toBeVisible();
    await expectNoErrorBoundary(page);
  });

  test("/settings renders", async ({ page }) => {
    await gotoAuthed(page, "/settings");
    await expect(page.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "General" })).toBeVisible();
    await expectNoErrorBoundary(page);
  });

  test("/billing renders", async ({ page }) => {
    await gotoAuthed(page, "/billing");
    await expect(page.getByRole("heading", { level: 1, name: "Billing" })).toBeVisible();
    await expect(page.getByText("Current Plan", { exact: false })).toBeVisible();
    await expectNoErrorBoundary(page);
  });

  test("/support renders", async ({ page }) => {
    await gotoAuthed(page, "/support");
    await expect(page.getByRole("heading", { level: 1, name: "Support" })).toBeVisible();
    await expect(page.getByText("Live Chat")).toBeVisible();
    await expectNoErrorBoundary(page);
  });

  test("/members renders", async ({ page }) => {
    await gotoAuthed(page, "/members");
    await expect(page.getByRole("heading", { level: 1, name: "Members" })).toBeVisible();
    await expectNoErrorBoundary(page);
  });

  test("/meetings renders", async ({ page }) => {
    await gotoAuthed(page, "/meetings");
    await expect(page.getByRole("heading", { level: 1, name: "Meetings" })).toBeVisible();
    await expectNoErrorBoundary(page);
  });

  test("/voting renders", async ({ page }) => {
    await gotoAuthed(page, "/voting");
    await expect(page.getByRole("heading", { level: 1, name: "Voting" })).toBeVisible();
    await expectNoErrorBoundary(page);
  });

  test("/documents renders", async ({ page }) => {
    await gotoAuthed(page, "/documents");
    await expect(page.getByRole("heading", { level: 1, name: "Documents" })).toBeVisible();
    await expectNoErrorBoundary(page);
  });

  test("/analytics renders", async ({ page }) => {
    await gotoAuthed(page, "/analytics");
    await expect(page.getByRole("heading", { level: 1, name: "Analytics" })).toBeVisible();
    await expectNoErrorBoundary(page);
  });

  test("/ai-assistant renders", async ({ page }) => {
    await gotoAuthed(page, "/ai-assistant");
    await expect(page.getByRole("heading", { level: 1, name: "AI Assistant" })).toBeVisible();
    await expectNoErrorBoundary(page);
  });

  test("/network renders", async ({ page }) => {
    await gotoAuthed(page, "/network");
    await expect(page.getByRole("heading", { level: 1, name: "My Network" })).toBeVisible();
    await expectNoErrorBoundary(page);
  });
});

test.describe("interaction", () => {
  test("/settings notifications switch toggles visual state", async ({ page }) => {
    await gotoAuthed(page, "/settings");

    // Open Notifications tab.
    await page.getByRole("tab", { name: "Notifications" }).click();

    const emailSwitch = page.getByRole("switch", { name: "Email notifications" });
    await expect(emailSwitch).toBeVisible();

    const initial = await emailSwitch.getAttribute("aria-checked");
    await emailSwitch.click();
    await expect(emailSwitch).not.toHaveAttribute("aria-checked", initial ?? "");
    const toggled = await emailSwitch.getAttribute("aria-checked");
    expect(toggled === "true" || toggled === "false").toBe(true);
    expect(toggled).not.toBe(initial);
  });

  test("/profile full name input is editable", async ({ page }) => {
    await gotoAuthed(page, "/profile");
    // Input generates id from label "Full name" -> "full-name".
    const fullNameInput = page.locator("#full-name");
    await expect(fullNameInput).toBeVisible();
    await fullNameInput.focus();
    await expect(fullNameInput).toBeFocused();
    await fullNameInput.fill("Playwright E2E Updated");
    await expect(fullNameInput).toHaveValue("Playwright E2E Updated");
  });
});
