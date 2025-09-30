import { expect, test } from '@playwright/test';

/**
 * Example E2E test - Authentication Flow
 * Reference: US-001 from user-stories.md
 */
test.describe('Authentication', () => {
	test('should login with valid credentials', async ({ page }) => {
		// Navigate to login page
		await page.goto('/login');

		// Fill in credentials
		await page.fill('[name="email"]', 'admin@host-pos.com');
		await page.fill('[name="password"]', 'password123');

		// Submit form
		await page.click('button[type="submit"]');

		// Wait for navigation to dashboard
		await page.waitForURL('/dashboard');

		// Verify user is logged in
		await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
	});

	test('should show error with invalid credentials', async ({ page }) => {
		await page.goto('/login');

		await page.fill('[name="email"]', 'invalid@example.com');
		await page.fill('[name="password"]', 'wrongpassword');

		await page.click('button[type="submit"]');

		// Should remain on login page
		await expect(page).toHaveURL('/login');

		// Should show error message
		await expect(page.locator('[role="alert"]')).toContainText('Invalid email or password');
	});
});
