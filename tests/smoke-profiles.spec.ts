import { test, expect } from '@playwright/test';

/**
 * SMOKE TEST: Profile Pages
 * Tests player profile and recruiter pages
 */

test.describe('Smoke: Profile Pages', () => {
  
  test('Edit profile page loads', async ({ page }) => {
    await page.goto('/edit-profile');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Player profile page loads with username', async ({ page }) => {
    // Using a test username
    await page.goto('/players/testuser');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2, [class*="profile"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('Recruiter dashboard loads', async ({ page }) => {
    await page.goto('/recruiter-dashboard');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });
});
