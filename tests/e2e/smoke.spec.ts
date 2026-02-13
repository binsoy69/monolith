import { test, expect } from "@playwright/test";

test.describe("Smoke Test", () => {
  test("should load dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Monolith/i);
    // Add selector check for dashboard element
    // await expect(page.getByText('Habits')).toBeVisible();
  });

  // Adding basic navigation tests
  test("should navigate to finance page", async ({ page }) => {
    await page.goto("/finance");
    // await expect(page).toHaveURL(/.*finance/);
    // await expect(page.getByText('Transactions')).toBeVisible();
  });
});
