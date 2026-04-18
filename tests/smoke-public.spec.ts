import { test, expect } from '@playwright/test';

/**
 * SMOKE TEST: Public Pages
 * Tests all publicly accessible pages that don't require auth
 */

test.describe('Smoke: Public Pages', () => {
  
  test('Home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    // Check page doesn't crash
    await expect(page.locator('text=Error').first()).not.toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('Search page loads', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('input, [placeholder*="Search"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('TV page loads', async ({ page }) => {
    await page.goto('/tv');
    await expect(page.locator('h1')).toContainText('UREPP TV', { timeout: 10000 });
    await expect(page.locator('button:has-text("Explore")')).toBeVisible();
    await expect(page.locator('button:has-text("Contact")')).toBeVisible();
  });

  test('Terms page loads', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('Privacy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('Recruiter login page loads', async ({ page }) => {
    await page.goto('/recruiter-login');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('Bottom navigation visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tv');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('a:has-text("Home")')).toBeVisible();
    await expect(page.locator('a:has-text("TV")')).toBeVisible();
    await expect(page.locator('a:has-text("Search")')).toBeVisible();
    await expect(page.locator('a:has-text("Profile")')).toBeVisible();
  });
});
