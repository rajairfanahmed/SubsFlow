import { test, expect } from '@playwright/test';

test.describe('Auth Cycle', () => {
  test('User can register and redirect to dashboard', async ({ page }) => {
    // 1. Visit Home
    await page.goto('/');

    // 2. Click Get Started (assuming it links to /register or /pricing then register)
    // Actually finding a link to /register
    const getStarted = page.locator('a[href="/register"]').first();
    // If not found, try to find "Get Started" text
    if (await getStarted.isVisible()) {
        await getStarted.click();
    } else {
        await page.goto('/register');
    }

    // 3. Fill details
    const email = `test-${Date.now()}@example.com`;
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'password123');

    // 4. Click Register
    await page.click('button[type="submit"]');

    // 5. Verify Redirect
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Optional: Verify Welcome message
    await expect(page.getByText('Overview')).toBeVisible();
  });
});
