/**
 * Custom Vitest Matchers
 * Domain-specific test assertions for HOST POS
 */

import { expect } from 'vitest';

/**
 * Custom matcher to check if a value is a valid currency amount
 */
expect.extend({
	toBeValidCurrency(received: unknown) {
		const pass =
			typeof received === 'number' &&
			!Number.isNaN(received) &&
			Number.isFinite(received) &&
			received >= 0 &&
			// Check it has at most 2 decimal places
			Math.round(received * 100) / 100 === received;

		return {
			pass,
			message: () =>
				pass
					? `expected ${received} not to be a valid currency amount`
					: `expected ${received} to be a valid currency amount (non-negative number with max 2 decimal places)`,
		};
	},

	/**
	 * Custom matcher to check if a value is a valid order status
	 */
	toBeValidOrderStatus(received: unknown) {
		const validStatuses = ['open', 'closed', 'void', 'pending'];
		const pass = typeof received === 'string' && validStatuses.includes(received);

		return {
			pass,
			message: () =>
				pass
					? `expected ${received} not to be a valid order status`
					: `expected ${received} to be one of: ${validStatuses.join(', ')}`,
		};
	},
});

// TypeScript type declarations for custom matchers
declare module 'vitest' {
	interface Assertion {
		toBeValidCurrency(): void;
		toBeValidOrderStatus(): void;
	}
}
