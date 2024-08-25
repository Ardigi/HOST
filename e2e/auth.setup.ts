import path from 'node:path';
import { expect, test as setup } from '@playwright/test';

/**
 * E2E Authentication Setup
 *
 * This setup project runs once before all E2E tests to establish an authenticated session.
 * It saves the authentication state to .auth/user.json, which is then reused by all test projects.
 *
 * Pattern from: https://playwright.dev/docs/auth
 */

const authFile = path.join(__dirname, '../.auth/user.json');

setup('authenticate', async ({ page }) => {
	// In E2E test mode (CI=true), hooks.server.ts will automatically provide a mock user
	// This setup just needs to navigate to a protected route to trigger the auth bypass
	// and capture the session state (cookies, local storage, etc.)

	await page.goto('/orders');

	// Verify we're authenticated by checking for user-specific content
	// The orders page should load successfully (not redirect to Keycloak)
	await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();

	// Verify the "+ New Order" button is visible (requires authenticated user)
	await expect(page.getByRole('button', { name: '+ New Order' })).toBeVisible();

	// Save the authenticated state for reuse across all E2E tests
	await page.context().storageState({ path: authFile });

	console.log(`✅ Authentication state saved to ${authFile}`);
});
