import { test, expect } from '@playwright/test';

/**
 * SMOKE TEST: Authentication Pages
 * Tests signup, login, and auth-related flows
 */

test.describe('Smoke: Auth Pages', () => {
  
  test('Signup page loads', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('body')).toBeVisible();
    // Look for signup form elements
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('Auth signup page loads', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('Auth signin page loads', async ({ page }) => {
    await page.goto('/auth/signin');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('Signup form has required fields', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]').first()).toBeVisible();
  });

  test('Login form has required fields', async ({ page }) => {
    await page.goto('/auth/signin');
    await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]').first()).toBeVisible();
  });
});
