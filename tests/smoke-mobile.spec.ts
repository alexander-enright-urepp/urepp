import { test, expect } from '@playwright/test';

/**
 * SMOKE TEST: Mobile Responsiveness
 * Tests key pages on mobile viewport
 */

test.describe('Smoke: Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('Home page on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    // Check no horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow small tolerance
  });

  test('TV page on mobile', async ({ page }) => {
    await page.goto('/tv');
    await expect(page.locator('h1')).toContainText('UREPP TV', { timeout: 10000 });
    await expect(page.locator('nav')).toBeVisible();
  });

  test('Search page on mobile', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('input').first()).toBeVisible({ timeout: 10000 });
  });

  test('Signup page on mobile', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('Dashboard on mobile', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('body')).toBeVisible();
    // Should either show dashboard or redirect
    await expect(page.locator('h1, h2, form, nav').first()).toBeVisible({ timeout: 10000 });
  });
});
