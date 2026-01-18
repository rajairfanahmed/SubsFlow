import { test, expect } from '@playwright/test';

test.describe('Subscription Flow', () => {
  test('User can initiate subscription flow', async ({ page }) => {
    // Register first
    await page.goto('/register');
    const email = `sub-${Date.now()}@example.com`;
    await page.fill('input[name="name"]', 'Sub User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Mock API response for checkout
    await page.route('**/api/subscriptions/checkout', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                success: true,
                data: { url: 'https://checkout.stripe.com/mock-session' }
            })
        });
    });

    // Go to Pricing (or Subscription tab)
    await page.goto('/pricing'); // Or via dashboard link

    // Click Subscribe on a plan
    // Assuming buttons say "Subscribe" or "Get Started"
    // Finding the first plan button
    const subscribeBtn = page.getByRole('button', { name: /Choose|Subscribe|Get/i }).first();
    await subscribeBtn.click();

    // Verify redirection to the mock URL
    // Since we returned a URL, the frontend should redirect there.
    // We expect the page to eventually navigate to the mocked URL
    await expect(page).toHaveURL('https://checkout.stripe.com/mock-session');
  });
});
