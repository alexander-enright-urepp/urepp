import { test, expect } from '@playwright/test';

/**
 * SMOKE TEST: Dashboard Pages
 * Tests all dashboard sub-pages (may redirect to login if auth required)
 */

test.describe('Smoke: Dashboard Pages', () => {
  
  test('Main dashboard page loads or redirects', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('body')).toBeVisible();
    // Either loads dashboard or redirects to login
    const url = page.url();
    expect(url.includes('/dashboard') || url.includes('/login') || url.includes('/auth')).toBeTruthy();
  });

  test('Dashboard - Academics page', async ({ page }) => {
    await page.goto('/dashboard/academics');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2, [class*="dashboard"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('Dashboard - Appointments page', async ({ page }) => {
    await page.goto('/dashboard/appointments');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Dashboard - Coaches page', async ({ page }) => {
    await page.goto('/dashboard/coaches');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Dashboard - Videos page', async ({ page }) => {
    await page.goto('/dashboard/videos');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Dashboard - Links page', async ({ page }) => {
    await page.goto('/dashboard/links');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Dashboard - Teams page', async ({ page }) => {
    await page.goto('/dashboard/teams');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Dashboard - Awards page', async ({ page }) => {
    await page.goto('/dashboard/awards');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Dashboard - Account page', async ({ page }) => {
    await page.goto('/dashboard/account');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Dashboard - Themes page', async ({ page }) => {
    await page.goto('/dashboard/themes');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Dashboard - Measurements page', async ({ page }) => {
    await page.goto('/dashboard/measurements');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Dashboard - Recruiting page', async ({ page }) => {
    await page.goto('/dashboard/recruiting');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Dashboard - Stats page', async ({ page }) => {
    await page.goto('/dashboard/stats');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Dashboard - Analytics page', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Dashboard - Subscription page', async ({ page }) => {
    await page.goto('/dashboard/subscription');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });
});
