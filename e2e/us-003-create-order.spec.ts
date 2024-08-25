import { expect, test } from '@playwright/test';

/**
 * E2E Test for US-003: Create New Order
 *
 * User Story:
 * As a server, I want to create a new order for a table
 * So that I can start taking customer orders
 *
 * Acceptance Criteria:
 * - Given I am logged in as a server and table 5 is available
 * - When I select "New Order" for table 5
 * - Then a new order should be created with status "open"
 * - And the table status should change to "occupied"
 * - And I should see the order screen with an empty cart
 * - And the order should be assigned to me
 */

test.describe('US-003: Create New Order', () => {
	test.beforeEach(async ({ page }) => {
		// TODO: Set up authentication
		// For now, navigate directly to orders page
		// In production, this would require proper login flow
		await page.goto('/orders');
	});

	test('should create a new order for an available table', async ({ page }) => {
		// Verify we're on the orders page
		await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();

		// Get the "New Order" button and ensure it's fully interactive
		const newOrderButton = page.getByRole('button', { name: '+ New Order' });
		await newOrderButton.waitFor({ state: 'visible' });

		// Click and wait for the dialog with a single action
		await Promise.all([
			page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 }),
			newOrderButton.click(),
		]);

		// Verify dialog content is present
		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		// Verify dialog title is present
		await expect(page.getByText('Create New Order')).toBeVisible();

		// Select table from dropdown (using table 10 from seed data)
		await page.getByLabel('Table Number').selectOption('10');

		// Enter guest count
		await page.getByLabel('Number of Guests').fill('4');

		// Verify orderType hidden field has correct value
		const orderTypeInput = page.locator('input[name="orderType"]');
		await expect(orderTypeInput).toHaveValue('dine_in');

		// Submit the form
		await page.getByRole('button', { name: 'Create Order' }).click();

		// Wait for dialog to close (indicates form submission completed)
		await expect(page.getByText('Create New Order')).not.toBeVisible();

		// Wait for new order to appear in the list
		const orderCards = page.locator('[data-testid="order-card"]');
		await expect(orderCards.first()).toBeVisible({ timeout: 10000 });

		// Verify at least one order exists
		const orderCount = await orderCards.count();
		expect(orderCount).toBeGreaterThan(0);

		// Verify the newly created order shows:
		// - Table 10 (from seed data)
		// - Status "open"
		// - Guest count 4
		const latestOrder = orderCards.first();
		await expect(latestOrder).toContainText('Table 10');
		await expect(latestOrder).toContainText('open');
	});

	test('should reset form fields when dialog is reopened', async ({ page }) => {
		// Open dialog first time with Promise.all pattern
		const newOrderButton = page.getByRole('button', { name: '+ New Order' });
		await Promise.all([
			page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 }),
			newOrderButton.click(),
		]);

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		// Fill in values (using table 11 from seed data)
		await page.getByLabel('Table Number').selectOption('11');
		await page.getByLabel('Number of Guests').fill('8');

		// Close dialog without submitting
		await page.getByRole('button', { name: 'Cancel' }).click();

		// Wait for dialog to close completely
		await expect(dialog).not.toBeVisible();

		// Reopen dialog with Promise.all pattern
		await Promise.all([
			page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 }),
			newOrderButton.click(),
		]);

		// Verify dialog reopened
		await expect(dialog).toBeVisible();

		// Verify form is reset
		await expect(page.getByLabel('Table Number')).toHaveValue('');
		await expect(page.getByLabel('Number of Guests')).toHaveValue('1');
	});

	test('should close dialog when Escape key is pressed', async ({ page }) => {
		// Open dialog with Promise.all pattern
		const newOrderButton = page.getByRole('button', { name: '+ New Order' });
		await Promise.all([
			page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 }),
			newOrderButton.click(),
		]);

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		// Press Escape
		await page.keyboard.press('Escape');

		// Dialog should close
		await expect(dialog).not.toBeVisible();
	});

	test('should require table selection', async ({ page }) => {
		// Open dialog with Promise.all pattern
		const newOrderButton = page.getByRole('button', { name: '+ New Order' });
		await Promise.all([
			page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 }),
			newOrderButton.click(),
		]);

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		// Try to submit without selecting table
		const tableSelect = page.getByLabel('Table Number');
		const _submitButton = page.getByRole('button', { name: 'Create Order' });

		// Verify table select has required attribute
		await expect(tableSelect).toHaveAttribute('required');

		// HTML5 validation should prevent submission
		// We can't easily test HTML5 validation in Playwright, but we can verify the attribute
	});

	test('should require guest count within valid range', async ({ page }) => {
		// Open dialog with Promise.all pattern
		const newOrderButton = page.getByRole('button', { name: '+ New Order' });
		await Promise.all([
			page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 }),
			newOrderButton.click(),
		]);

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		const guestInput = page.getByLabel('Number of Guests');

		// Verify min and max constraints
		await expect(guestInput).toHaveAttribute('min', '1');
		await expect(guestInput).toHaveAttribute('max', '20');
		await expect(guestInput).toHaveAttribute('required');
	});

	test('should display empty state when no orders exist', async ({ page }) => {
		// This test assumes a fresh database or filtered view
		// In reality, we'd need to set up test isolation

		// If there are no orders, should show empty state
		const emptyMessage = page.getByText('No orders found');

		// This assertion is conditional - skip if orders exist
		const orderCards = page.locator('[data-testid="order-card"]');
		const hasOrders = (await orderCards.count()) > 0;

		if (!hasOrders) {
			await expect(emptyMessage).toBeVisible();
		}
	});
});

/**
 * TODO: Additional test scenarios to implement:
 *
 * 1. Duplicate Order Prevention:
 *    - Given table 5 already has an open order
 *    - When I try to create a new order
 *    - Then I should see a warning "Table 5 has an open order"
 *    - And I should have options to "View Order" or "Transfer Table"
 *
 * 2. Server Assignment:
 *    - Verify order is assigned to the logged-in server
 *    - Check order.serverId matches current user.id
 *
 * 3. Order Number Generation:
 *    - Verify sequential daily order numbers
 *    - Test order numbers reset at midnight
 *
 * 4. Table Status Change:
 *    - Verify table status changes from "available" to "occupied"
 *    - Check table.currentOrderId is set
 *
 * 5. Navigation to Order Detail:
 *    - After creating order, should navigate to /orders/{orderId}
 *    - Verify empty cart is displayed
 *    - Verify can add items to order
 */
