import { describe, expect, it } from 'vitest';
import type { LayoutServerLoad } from './$types';

/**
 * Tests for +layout.server.ts
 * Validates that authenticated user data is properly passed to all pages
 */

// Import the load function
const loadModule = await import('./+layout.server');
const load: LayoutServerLoad = loadModule.load;

describe('+layout.server.ts', () => {
	describe('User Data Propagation', () => {
		it('should pass authenticated user to all pages', async () => {
			const mockUser = {
				id: 'user-123',
				email: 'server@example.com',
				firstName: 'Server',
				lastName: 'User',
				venueId: 'venue-456',
				roles: ['server'],
			};

			const mockLocals = {
				user: mockUser,
			};

			// biome-ignore lint/suspicious/noExplicitAny: Test mock requires partial RequestEvent
			const result = await load({ locals: mockLocals } as any);

			expect(result).toEqual({
				user: mockUser,
			});
		});

		it('should pass null user when not authenticated', async () => {
			const mockLocals = {
				user: null,
			};

			// biome-ignore lint/suspicious/noExplicitAny: Test mock requires partial RequestEvent
			const result = await load({ locals: mockLocals } as any);

			expect(result).toEqual({
				user: null,
			});
		});

		it('should pass undefined user when user is undefined', async () => {
			const mockLocals = {
				user: undefined,
			};

			// biome-ignore lint/suspicious/noExplicitAny: Test mock requires partial RequestEvent
			const result = await load({ locals: mockLocals } as any);

			expect(result).toEqual({
				user: undefined,
			});
		});

		it('should handle admin users correctly', async () => {
			const adminUser = {
				id: 'admin-789',
				email: 'admin@example.com',
				firstName: 'Admin',
				lastName: 'User',
				venueId: 'venue-456',
				roles: ['admin'],
			};

			const mockLocals = {
				user: adminUser,
			};

			// biome-ignore lint/suspicious/noExplicitAny: Test mock requires partial RequestEvent
			const result = await load({ locals: mockLocals } as any);

			// biome-ignore lint/style/noNonNullAssertion: Test validates result structure
			expect(result!.user).toEqual(adminUser);
			// biome-ignore lint/style/noNonNullAssertion: Test validates result structure
			expect(result!.user?.roles).toContain('admin');
		});

		it('should handle manager users correctly', async () => {
			const managerUser = {
				id: 'manager-101',
				email: 'manager@example.com',
				firstName: 'Manager',
				lastName: 'User',
				venueId: 'venue-456',
				roles: ['manager'],
			};

			const mockLocals = {
				user: managerUser,
			};

			// biome-ignore lint/suspicious/noExplicitAny: Test mock requires partial RequestEvent
			const result = await load({ locals: mockLocals } as any);

			// biome-ignore lint/style/noNonNullAssertion: Test validates result structure
			expect(result!.user).toEqual(managerUser);
			// biome-ignore lint/style/noNonNullAssertion: Test validates result structure
			expect(result!.user?.roles).toContain('manager');
		});

		it('should ensure user object contains all required fields', async () => {
			const completeUser = {
				id: 'user-complete',
				email: 'complete@example.com',
				firstName: 'Complete',
				lastName: 'User',
				venueId: 'venue-789',
				roles: ['server', 'bartender'],
			};

			const mockLocals = {
				user: completeUser,
			};

			// biome-ignore lint/suspicious/noExplicitAny: Test mock requires partial RequestEvent
			const result = await load({ locals: mockLocals } as any);

			// Verify all required fields are present
			// biome-ignore lint/style/noNonNullAssertion: Test validates result structure
			expect(result!.user).toHaveProperty('id');
			// biome-ignore lint/style/noNonNullAssertion: Test validates result structure
			expect(result!.user).toHaveProperty('email');
			// biome-ignore lint/style/noNonNullAssertion: Test validates result structure
			expect(result!.user).toHaveProperty('firstName');
			// biome-ignore lint/style/noNonNullAssertion: Test validates result structure
			expect(result!.user).toHaveProperty('lastName');
			// biome-ignore lint/style/noNonNullAssertion: Test validates result structure
			expect(result!.user).toHaveProperty('venueId');
			// biome-ignore lint/style/noNonNullAssertion: Test validates result structure
			expect(result!.user).toHaveProperty('roles');
			// biome-ignore lint/style/noNonNullAssertion: Test validates result structure
			expect(Array.isArray(result!.user?.roles)).toBe(true);
		});
	});
});
