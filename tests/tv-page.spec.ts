import { test, expect } from '@playwright/test';

test.describe('TV Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tv');
  });

  test('should display TV page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('UREPP TV');
  });

  test('should have Explore and Contact tabs', async ({ page }) => {
    await expect(page.locator('button:has-text("Explore")')).toBeVisible();
    await expect(page.locator('button:has-text("Contact")')).toBeVisible();
  });

  test('should show Featured Videos section by default', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Featured Videos');
    await expect(page.locator('text=Watch the best sports content')).toBeVisible();
  });

  test('should show loading or empty state when no videos', async ({ page }) => {
    // Wait for either loading or content to appear
    await Promise.race([
      page.locator('text=Loading videos...').waitFor({ timeout: 5000 }),
      page.locator('text=No videos available yet').waitFor({ timeout: 5000 }),
    ]);
  });

  test('should switch to Contact tab', async ({ page }) => {
    await page.click('button:has-text("Contact")');
    await expect(page.locator('h2')).toContainText('Live Stream Your Games!');
    await expect(page.locator('button:has-text("Contact Support")')).toBeVisible();
  });

  test('should navigate back to Explore from Contact', async ({ page }) => {
    await page.click('button:has-text("Contact")');
    await expect(page.locator('h2')).toContainText('Live Stream Your Games!');
    
    await page.click('button:has-text("Explore")');
    await expect(page.locator('h2')).toContainText('Featured Videos');
  });

  test('should have bottom navigation', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('a:has-text("Home")')).toBeVisible();
    await expect(page.locator('a:has-text("TV")')).toBeVisible();
    await expect(page.locator('a:has-text("Search")')).toBeVisible();
    await expect(page.locator('a:has-text("Profile")')).toBeVisible();
  });

  test('TV link should be active', async ({ page }) => {
    const tvLink = page.locator('a:has-text("TV")');
    await expect(tvLink).toHaveClass(/text-babyblue-600/);
  });
});

test.describe('TV Page - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display correctly on mobile', async ({ page }) => {
    await page.goto('/tv');
    await expect(page.locator('h1')).toContainText('UREPP TV');
    
    // Check that tabs are still visible
    await expect(page.locator('button:has-text("Explore")')).toBeVisible();
    await expect(page.locator('button:has-text("Contact")')).toBeVisible();
  });
});
