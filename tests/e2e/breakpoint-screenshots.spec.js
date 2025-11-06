import { test, expect } from '@playwright/test';

/**
 * Visual Regression Test Suite
 * Captures screenshots at critical breakpoints for QA documentation
 */
test.describe('Breakpoint Screenshot Documentation', () => {

  test('capture 768px mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:8000/merchant/getting-started/tutorial-complete-store-setup-from-scratch');
    await page.waitForLoadState('networkidle');

    // Take screenshot of header
    await page.screenshot({
      path: 'test-results/screenshots/768px-mobile-header.png',
      fullPage: false
    });

    // Verify burger button visible
    const burgerButton = page.locator('button[aria-label="Toggle navigation menu"]');
    await expect(burgerButton).toBeVisible();

    // Verify desktop nav hidden
    const desktopNav = page.locator('.hidden.lg\\:flex.items-center.gap-8');
    await expect(desktopNav).toBeHidden();
  });

  test('capture 1023px just-below-breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: 1023, height: 768 });
    await page.goto('http://localhost:8000/merchant/getting-started/tutorial-complete-store-setup-from-scratch');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'test-results/screenshots/1023px-below-breakpoint.png',
      fullPage: false
    });

    // Verify burger button still visible
    const burgerButton = page.locator('button[aria-label="Toggle navigation menu"]');
    await expect(burgerButton).toBeVisible();
  });

  test('capture 1024px at-breakpoint (CRITICAL)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('http://localhost:8000/merchant/getting-started/tutorial-complete-store-setup-from-scratch');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'test-results/screenshots/1024px-at-breakpoint-CRITICAL.png',
      fullPage: false
    });

    // Verify burger button HIDDEN
    const burgerButton = page.locator('button[aria-label="Toggle navigation menu"]');
    await expect(burgerButton).toBeHidden();

    // Verify desktop nav VISIBLE
    const desktopNav = page.locator('.hidden.lg\\:flex.items-center.gap-8');
    await expect(desktopNav).toBeVisible();

    // Verify search icon VISIBLE
    const searchIcon = page.locator('#header-search');
    await expect(searchIcon).toBeVisible();
  });

  test('capture 1280px desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1024 });
    await page.goto('http://localhost:8000/merchant/getting-started/tutorial-complete-store-setup-from-scratch');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'test-results/screenshots/1280px-desktop.png',
      fullPage: false
    });

    // Verify all desktop elements visible
    const burgerButton = page.locator('button[aria-label="Toggle navigation menu"]');
    await expect(burgerButton).toBeHidden();

    const desktopNav = page.locator('.hidden.lg\\:flex.items-center.gap-8');
    await expect(desktopNav).toBeVisible();

    const searchIcon = page.locator('#header-search');
    await expect(searchIcon).toBeVisible();

    const ecosystemBanner = page.locator('.hidden.xl\\:flex.bg-charcoal');
    await expect(ecosystemBanner).toBeVisible();
  });

  test('capture 1440px xl-desktop with ecosystem banner', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:8000/');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'test-results/screenshots/1440px-xl-desktop-with-ecosystem-banner.png',
      fullPage: false
    });

    // Verify ecosystem banner visible
    const ecosystemBanner = page.locator('.hidden.xl\\:flex.bg-charcoal');
    await expect(ecosystemBanner).toBeVisible();
  });
});
