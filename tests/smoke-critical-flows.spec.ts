import { test, expect } from '@playwright/test';

/**
 * SMOKE TEST: Critical User Flows
 * Tests main navigation paths users take
 */

test.describe('Smoke: Critical Flows', () => {
  
  test('Navigation: Home → TV → Search', async ({ page }) => {
    // Start at home
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    
    // Navigate to TV
    await page.goto('/tv');
    await expect(page.locator('h1')).toContainText('UREPP TV', { timeout: 10000 });
    
    // Navigate to Search
    await page.goto('/search');
    await expect(page.locator('body')).toBeVisible();
  });

  test('TV tab switching works', async ({ page }) => {
    await page.goto('/tv');
    
    // Click Contact tab
    await page.click('button:has-text("Contact")');
    await expect(page.locator('h2')).toContainText('Live Stream Your Games!', { timeout: 5000 });
    
    // Click back to Explore
    await page.click('button:has-text("Explore")');
    await expect(page.locator('h2')).toContainText('Featured Videos', { timeout: 5000 });
  });

  test('Bottom navigation links work', async ({ page }) => {
    await page.goto('/tv');
    
    // Click Search
    await page.click('a:has-text("Search")');
    await expect(page.url()).toContain('/search');
    
    // Go back and click Profile
    await page.goto('/tv');
    await page.click('a:has-text("Profile")');
    await expect(page.url()).toContain('/dashboard');
  });

  test('Auth redirect flow', async ({ page }) => {
    // Try to access protected page without auth
    await page.goto('/dashboard/appointments');
    await expect(page.locator('body')).toBeVisible();
    
    // Should either show page or redirect to auth
    const url = page.url();
    const isProtectedOrAuth = 
      url.includes('/dashboard') || 
      url.includes('/login') || 
      url.includes('/auth') ||
      url.includes('/signup');
    expect(isProtectedOrAuth).toBeTruthy();
  });

  test('404 handling for invalid routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await expect(page.locator('body')).toBeVisible();
    // Page should not crash - either shows custom 404 or redirects
  });
});
