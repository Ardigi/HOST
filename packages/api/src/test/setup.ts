import type { Database } from '@host/database';
import type { MenuService, OrderService, PaymentService } from '@host/database/services';
import { beforeEach, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import type { Context } from '../trpc';

/**
 * Mock database instance
 * Used across all tests
 */
export const mockDb = mockDeep<Database>();

/**
 * Mock MenuService instance
 */
export const mockMenuService = mockDeep<MenuService>();

/**
 * Mock OrderService instance
 */
export const mockOrderService = mockDeep<OrderService>();

/**
 * Mock PaymentService instance
 */
export const mockPaymentService = mockDeep<PaymentService>();

/**
 * Create test context for tRPC procedures
 */
export function createTestContext(overrides?: Partial<Context>): Context {
	return {
		db: mockDb,
		user: null,
		menuService: mockMenuService,
		orderService: mockOrderService,
		paymentService: mockPaymentService,
		...overrides,
	};
}

/**
 * Create authenticated test context
 */
export function createAuthContext(userOverrides?: Partial<NonNullable<Context['user']>>): Context {
	return createTestContext({
		user: {
			id: 'test-user-id',
			email: 'test@example.com',
			firstName: 'Test',
			lastName: 'User',
			venueId: 'test-venue-id',
			roles: ['server'],
			...userOverrides,
		},
	});
}

/**
 * Create admin test context
 */
export function createAdminContext(userOverrides?: Partial<NonNullable<Context['user']>>): Context {
	return createAuthContext({
		roles: ['admin'],
		...userOverrides,
	});
}

/**
 * Mock Drizzle query builder
 * Helps mock complex Drizzle queries
 */
export function mockDrizzleQuery<T>(returnValue: T) {
	return {
		findMany: vi.fn().mockResolvedValue(returnValue),
		findFirst: vi.fn().mockResolvedValue(returnValue),
	};
}

/**
 * Mock Drizzle insert/update builder
 */
export function mockDrizzleInsert<T>(returnValue: T[]) {
	return {
		values: vi.fn().mockReturnThis(),
		returning: vi.fn().mockResolvedValue(returnValue),
	};
}

export function mockDrizzleUpdate<T>(returnValue: T[]) {
	return {
		set: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		returning: vi.fn().mockResolvedValue(returnValue),
	};
}

/**
 * Reset all mocks before each test
 */
beforeEach(() => {
	mockReset(mockDb);
	mockReset(mockMenuService);
	mockReset(mockOrderService);
	mockReset(mockPaymentService);
});
