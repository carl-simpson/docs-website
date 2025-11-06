import { test, expect } from '@playwright/test';

test.describe('Navigation and Styling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8000/');
  });

  test('homepage loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Merchant Documentation/);
    const response = await page.goto('http://localhost:8000/');
    expect(response.status()).toBe(200);
  });

  test('merchant index page loads', async ({ page }) => {
    const response = await page.goto('http://localhost:8000/merchant');
    expect(response.status()).toBe(200);
  });

  test('merchant category page loads', async ({ page }) => {
    const response = await page.goto('http://localhost:8000/merchant/getting-started');
    expect(response.status()).toBe(200);
  });

  test('merchant article loads', async ({ page }) => {
    const response = await page.goto('http://localhost:8000/merchant/getting-started/tutorial-complete-store-setup-from-scratch');
    expect(response.status()).toBe(200);
  });

  test('search icon is visible on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const searchButton = page.locator('#header-search');
    await expect(searchButton).toBeVisible();
  });

  test('ecosystem menu is visible on xl screens', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const ecosystemMenu = page.locator('.bg-charcoal.xl\\:flex');
    await expect(ecosystemMenu).toBeVisible();
  });

  test('mobile menu button shows on smaller screens', async ({ page }) => {
    await page.goto('http://localhost:8000/merchant/getting-started/tutorial-complete-store-setup-from-scratch');
    await page.setViewportSize({ width: 768, height: 1024 });
    const mobileMenuButton = page.locator('button:has-text("Menu")');
    await expect(mobileMenuButton).toBeVisible();
  });

  test('documentation article has proper styling', async ({ page }) => {
    await page.goto('http://localhost:8000/merchant/getting-started/tutorial-complete-store-setup-from-scratch');

    // Check for docs content container
    const docsContent = page.locator('.docs-content');
    await expect(docsContent).toBeVisible();

    // Check for sidebar navigation
    const sidebar = page.locator('aside.w-\\[400px\\]');
    await expect(sidebar).toBeVisible();
  });
});
