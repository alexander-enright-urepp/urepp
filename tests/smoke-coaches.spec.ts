import { test, expect } from '@playwright/test';

/**
 * SMOKE TEST: Coach Pages
 * Tests coach booking and listing pages
 */

test.describe('Smoke: Coach Pages', () => {
  
  test('Coach booking page loads with ID', async ({ page }) => {
    // Using a dummy ID - page should handle gracefully
    await page.goto('/coaches/test-coach-id/book');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Coach native booking page loads', async ({ page }) => {
    await page.goto('/coaches/test-coach-id/book-native');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Coach messages page loads', async ({ page }) => {
    await page.goto('/dashboard/coaches/messages');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Coach settings page loads', async ({ page }) => {
    await page.goto('/dashboard/coaches/settings');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });
});
