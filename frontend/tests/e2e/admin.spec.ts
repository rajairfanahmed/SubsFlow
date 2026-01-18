import { test, expect } from '@playwright/test';

test.describe('Admin Protections', () => {
  test('Standard user cannot access admin dashboard', async ({ page }) => {
    // Register standard user
    await page.goto('/register');
    const email = `std-${Date.now()}@example.com`;
    await page.fill('input[name="name"]', 'Standard User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Attempt to go to Admin
    await page.goto('/admin');

    // Should be redirected back to dashboard or 403 (Home or Dashboard)
    // The ProtectedRoute/AdminRoute logic typically redirects to dashboard or 404/403
    // Let's expect it NOT to be /admin
    await expect(page).not.toHaveURL(/\/admin/);
    await expect(page).toHaveURL(/\/dashboard/); // Or home
  });
});
