import { authedTest as test, expect } from "./fixtures";

/**
 * Dashboard & chama record-keeping e2e coverage.
 *
 * These specs run signed-in via the shared storageState (see global-setup.ts).
 * Backend and frontend dev servers are expected to already be running.
 */

async function createChamaViaUi(page: import("@playwright/test").Page, name: string) {
  await page.goto("/chamas/create");
  await expect(page.getByRole("heading", { name: /create a chama/i })).toBeVisible();
  await page.getByLabel(/chama name/i).fill(name);
  await page.getByLabel(/^type$/i).selectOption("savings");
  await page.getByLabel(/expected monthly contribution/i).fill("1000");
  await page.getByLabel(/where members pay/i).fill("M-Pesa Paybill 123456, Account: TEST");
  await page.getByRole("button", { name: /create chama/i }).click();
  // Creating lands on the new chama's Members tab.
  await page.waitForURL(/\/chamas\/[^/]+\/members$/, { timeout: 15_000 });
}

test.describe("Dashboard shell", () => {
  test("dashboard loads with heading, navigation and the non-custodial notice", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("heading").first()).toBeVisible();
    await expect(page.getByText(/something went wrong/i)).toHaveCount(0);
    await expect(page.locator("nav").first()).toBeVisible();
    await expect(page.getByText(/never hold, receive, or transfer/i).first()).toBeVisible();
  });
});

test.describe("Chama record-keeping flow", () => {
  test("/chamas renders (empty state or list)", async ({ page }) => {
    await page.goto("/chamas");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("button", { name: /create a chama/i }).first()).toBeVisible();
    await expect(page.getByText(/something went wrong/i)).toHaveCount(0);
  });

  test("creator becomes chairperson and can open every workspace tab", async ({ page }) => {
    const chamaName = `PW UI Chama ${Date.now()}`;
    await createChamaViaUi(page, chamaName);
    await expect(page.getByRole("heading", { name: chamaName })).toBeVisible();
    await expect(page.getByText("Chairperson").first()).toBeVisible();

    for (const tab of ["Contributions", "Loan register", "Meetings", "Goals", "Statements", "Audit log", "Billing"]) {
      await page.getByRole("navigation", { name: /chama sections/i }).getByRole("link", { name: tab }).click();
      await page.waitForLoadState("networkidle");
      await expect(page.getByText(/something went wrong/i)).toHaveCount(0);
    }
  });

  test("treasurer-style user can record a contribution for themselves", async ({ page }) => {
    const chamaName = `PW Contrib ${Date.now()}`;
    await createChamaViaUi(page, chamaName);
    await page.getByRole("navigation", { name: /chama sections/i }).getByRole("link", { name: "Contributions" }).click();
    await page.getByRole("button", { name: /record contribution/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/^member$/i).selectOption({ index: 1 });
    await dialog.getByLabel(/amount/i).fill("1500");
    await dialog.getByLabel(/receipt code/i).fill("SAB1C2D3E4");
    await dialog.getByRole("button", { name: /save record/i }).click();
    await expect(page.getByText("SAB1C2D3E4")).toBeVisible();
    // The chairperson is also the member here, so they can confirm their own entry.
    await page.getByRole("button", { name: /^confirm$/i }).first().click();
    await expect(page.getByText(/^Confirmed$/).first()).toBeVisible();
  });

  test("new chama appears in /chamas list", async ({ page }) => {
    const chamaName = `PW List Chama ${Date.now()}`;
    await createChamaViaUi(page, chamaName);
    await page.goto("/chamas");
    await expect(page.getByText(chamaName).first()).toBeVisible();
  });

  test("/chamas/join renders", async ({ page }) => {
    await page.goto("/chamas/join");
    await expect(page.getByRole("heading", { name: /join a chama/i })).toBeVisible();
    await expect(page.getByText(/something went wrong/i)).toHaveCount(0);
  });
});
