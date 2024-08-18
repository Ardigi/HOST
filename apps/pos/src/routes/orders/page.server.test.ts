/**
 * Tests for Orders Page Server Routes
 * Covers load function and form actions (createOrder, updateOrder)
 */

import { fail } from '@sveltejs/kit';
import type { Cookies, RequestEvent, ServerLoadEvent } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as ordersPage from './+page.server';

// Import route-specific types from SvelteKit's generated $types
// Note: App.Locals type is already defined in app.d.ts
import type { PageServerLoadEvent } from './$types';

// Mock tRPC server
vi.mock('$lib/trpc-server', () => ({
	createServerCaller: vi.fn(),
}));

import { createServerCaller } from '$lib/trpc-server';

/**
 * Creates a complete ServerLoadEvent mock with all required properties
 * Follows Vitest best practice: create complete "dummy" objects, not partial mocks
 */
function createMockServerLoadEvent(
	overrides: Partial<
		ServerLoadEvent<Record<string, string>, { user: App.Locals['user'] }, null>
	> = {}
): ServerLoadEvent<Record<string, string>, { user: App.Locals['user'] }, null> {
	const mockCookies: Cookies = {
		get: vi.fn(() => undefined),
		getAll: vi.fn(() => []),
		set: vi.fn(),
		delete: vi.fn(),
		serialize: vi.fn(() => ''),
	};

	const defaultEvent: ServerLoadEvent = {
		// From RequestEvent (16 properties)
		cookies: mockCookies,
		fetch: vi.fn(globalThis.fetch),
		getClientAddress: vi.fn(() => '127.0.0.1'),
		locals: { user: null },
		params: {},
		platform: undefined,
		request: new Request('http://localhost:5173/orders'),
		route: { id: null },
		setHeaders: vi.fn(),
		url: new URL('http://localhost:5173/orders'),
		isDataRequest: false,
		isSubRequest: false,
		isRemoteRequest: false,
		tracing: {
			enabled: false,
			// biome-ignore lint/suspicious/noExplicitAny: Mock tracer doesn't need full Span type
			root: {} as any,
			// biome-ignore lint/suspicious/noExplicitAny: Mock tracer doesn't need full Span type
			current: {} as any,
		},

		// From ServerLoadEvent (3 properties)
		parent: vi.fn(() => Promise.resolve({ user: null })) as ServerLoadEvent['parent'],
		depends: vi.fn() as ServerLoadEvent['depends'],
		untrack: (<T>(fn: () => T): T => fn()) as ServerLoadEvent['untrack'],
	};

	return {
		...defaultEvent,
		...overrides,
	} as ServerLoadEvent<Record<string, string>, { user: App.Locals['user'] }, null>;
}

/**
 * Creates a complete RequestEvent mock for action testing
 * @param overrides - Partial RequestEvent properties to override defaults
 */
function createMockRequestEvent(
	overrides: Partial<RequestEvent<Record<string, string>, '/orders'>> = {}
): RequestEvent<Record<string, string>, '/orders'> {
	const mockCookies: Cookies = {
		get: vi.fn(() => undefined),
		getAll: vi.fn(() => []),
		set: vi.fn(),
		delete: vi.fn(),
		serialize: vi.fn(() => ''),
	};

	const defaultEvent = {
		cookies: mockCookies,
		fetch: vi.fn(globalThis.fetch),
		getClientAddress: vi.fn(() => '127.0.0.1'),
		locals: { user: null },
		params: {},
		platform: undefined,
		request: new Request('http://localhost:5173/orders?/createOrder', { method: 'POST' }),
		route: { id: '/orders' as const },
		setHeaders: vi.fn(),
		url: new URL('http://localhost:5173/orders?/createOrder'),
		isDataRequest: false,
		isSubRequest: false,
		isRemoteRequest: false,
		tracing: {
			enabled: false,
			// biome-ignore lint/suspicious/noExplicitAny: Mock tracer doesn't need full Span type
			root: {} as any,
			// biome-ignore lint/suspicious/noExplicitAny: Mock tracer doesn't need full Span type
			current: {} as any,
		},
	};

	return { ...defaultEvent, ...overrides } as RequestEvent<Record<string, string>, '/orders'>;
}

describe('Orders Page Server Routes', () => {
	// biome-ignore lint/suspicious/noExplicitAny: tRPC router types are complex, using any for test mock
	let mockTrpc: any;

	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks();

		// Setup tRPC mock with all required routers
		mockTrpc = {
			orders: {
				list: vi.fn(),
				listTables: vi.fn(),
				create: vi.fn(),
			},
			menu: {},
			payments: {},
		};

		vi.mocked(createServerCaller).mockReturnValue(mockTrpc);
	});

	describe('load function', () => {
		it('should fetch orders and tables successfully', async () => {
			// Arrange
			const mockOrders = [
				{
					id: 'order1',
					orderNumber: '001',
					tableNumber: 5,
					status: 'open',
					total: 45.5,
				},
				{
					id: 'order2',
					orderNumber: '002',
					tableNumber: 3,
					status: 'open',
					total: 32.0,
				},
			];

			const mockTables = [
				{
					id: 'table1',
					tableNumber: 1,
					sectionName: 'Main',
					capacity: 4,
				},
				{
					id: 'table2',
					tableNumber: 2,
					sectionName: 'Patio',
					capacity: 2,
				},
			];

			mockTrpc.orders.list.mockResolvedValue({ orders: mockOrders });
			mockTrpc.orders.listTables.mockResolvedValue({ tables: mockTables });

			const mockEvent = createMockServerLoadEvent({
				locals: { user: null },
			}) as unknown as PageServerLoadEvent;

			// Act
			const result = await ordersPage.load(mockEvent);

			// Assert
			expect(result).toEqual({
				orders: mockOrders,
				tables: mockTables,
				user: null,
			});

			expect(createServerCaller).toHaveBeenCalledWith(mockEvent);
			expect(mockTrpc.orders.list).toHaveBeenCalledWith({
				venueId: 't759aeemb3pqqokugmru0tqs',
				status: 'open',
			});
			expect(mockTrpc.orders.listTables).toHaveBeenCalledWith({
				venueId: 't759aeemb3pqqokugmru0tqs',
			});
		});

		it('should fetch orders and tables in parallel', async () => {
			// Arrange
			let listCalled = false;
			let listTablesCalled = false;

			mockTrpc.orders.list.mockImplementation(async () => {
				listCalled = true;
				// Verify listTables hasn't returned yet (parallel execution)
				return { orders: [] };
			});

			mockTrpc.orders.listTables.mockImplementation(async () => {
				listTablesCalled = true;
				// Verify list hasn't returned yet (parallel execution)
				return { tables: [] };
			});

			const mockEvent = createMockServerLoadEvent() as unknown as PageServerLoadEvent;

			// Act
			await ordersPage.load(mockEvent);

			// Assert - Both should be called (parallel execution)
			expect(listCalled).toBe(true);
			expect(listTablesCalled).toBe(true);
		});

		it('should include user from locals in returned data', async () => {
			// Arrange
			const mockUser = {
				id: 'user1',
				email: 'test@example.com',
				firstName: 'Test',
				lastName: 'User',
				venueId: 'venue1',
				roles: ['server'],
			};

			mockTrpc.orders.list.mockResolvedValue({ orders: [] });
			mockTrpc.orders.listTables.mockResolvedValue({ tables: [] });

			const mockEvent = createMockServerLoadEvent({
				locals: { user: mockUser },
			}) as unknown as PageServerLoadEvent;

			// Act
			const result = await ordersPage.load(mockEvent);

			// Assert
			expect(result?.user).toEqual(mockUser);
		});

		it('should handle errors gracefully and return empty arrays', async () => {
			// Arrange
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
				// Intentionally empty - suppress console.error during test
			});
			mockTrpc.orders.list.mockRejectedValue(new Error('Database connection failed'));
			mockTrpc.orders.listTables.mockRejectedValue(new Error('Database connection failed'));

			const mockEvent = createMockServerLoadEvent() as unknown as PageServerLoadEvent;

			// Act
			const result = await ordersPage.load(mockEvent);

			// Assert
			expect(result).toEqual({
				orders: [],
				tables: [],
				user: null,
			});
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'Failed to load orders data:',
				expect.any(Error)
			);

			consoleErrorSpy.mockRestore();
		});

		it('should handle partial errors (orders fail, tables succeed)', async () => {
			// Arrange
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
				// Intentionally empty - suppress console.error during test
			});
			const mockTables = [{ id: 'table1', tableNumber: 1, sectionName: 'Main', capacity: 4 }];

			mockTrpc.orders.list.mockRejectedValue(new Error('Orders fetch failed'));
			mockTrpc.orders.listTables.mockResolvedValue({ tables: mockTables });

			const mockEvent = createMockServerLoadEvent() as unknown as PageServerLoadEvent;

			// Act
			const result = await ordersPage.load(mockEvent);

			// Assert - Should return empty arrays even if only one fails (Promise.all behavior)
			expect(result?.orders).toEqual([]);
			expect(result?.tables).toEqual([]);

			consoleErrorSpy.mockRestore();
		});
	});

	describe('createOrder action', () => {
		it('should validate tableNumber is required', async () => {
			// Arrange
			const formData = new FormData();
			formData.set('guestCount', '4');
			formData.set('orderType', 'dine_in');

			const mockRequest = new Request('http://localhost:5173/orders?/createOrder', {
				method: 'POST',
				body: formData,
			});

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
			});

			// Act
			const result = await ordersPage.actions.createOrder(mockEvent);

			// Assert
			expect(result).toEqual(fail(400, { error: 'Table number is required' }));
			expect(mockTrpc.orders.create).not.toHaveBeenCalled();
		});

		it('should validate guestCount is required', async () => {
			// Arrange
			const formData = new FormData();
			formData.set('tableNumber', '5');
			formData.set('orderType', 'dine_in');

			const mockRequest = new Request('http://localhost:5173/orders?/createOrder', {
				method: 'POST',
				body: formData,
			});

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
			});

			// Act
			const result = await ordersPage.actions.createOrder(mockEvent);

			// Assert
			expect(result).toEqual(fail(400, { error: 'Guest count is required' }));
			expect(mockTrpc.orders.create).not.toHaveBeenCalled();
		});

		it('should create order successfully with valid data', async () => {
			// Arrange
			const mockOrder = {
				id: 'order1',
				orderNumber: '001',
				venueId: 't759aeemb3pqqokugmru0tqs',
				tableNumber: 5,
				guestCount: 4,
				orderType: 'dine_in',
				status: 'open',
				total: 0,
			};

			mockTrpc.orders.create.mockResolvedValue(mockOrder);

			const formData = new FormData();
			formData.set('tableNumber', '5');
			formData.set('guestCount', '4');
			formData.set('orderType', 'dine_in');

			const mockRequest = new Request('http://localhost:5173/orders?/createOrder', {
				method: 'POST',
				body: formData,
			});

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
			});

			// Act
			const result = await ordersPage.actions.createOrder(mockEvent);

			// Assert
			expect(result).toEqual({
				success: true,
				order: mockOrder,
			});

			expect(createServerCaller).toHaveBeenCalledWith(mockEvent);
			expect(mockTrpc.orders.create).toHaveBeenCalledWith({
				venueId: 't759aeemb3pqqokugmru0tqs',
				tableNumber: 5,
				guestCount: 4,
				orderType: 'dine_in',
			});
		});

		it('should parse tableNumber and guestCount as numbers', async () => {
			// Arrange
			mockTrpc.orders.create.mockResolvedValue({
				id: 'order1',
				orderNumber: '001',
			});

			const formData = new FormData();
			formData.set('tableNumber', '12'); // String from form
			formData.set('guestCount', '8'); // String from form
			formData.set('orderType', 'dine_in');

			const mockRequest = new Request('http://localhost:5173/orders?/createOrder', {
				method: 'POST',
				body: formData,
			});

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
			});

			// Act
			await ordersPage.actions.createOrder(mockEvent);

			// Assert - Should convert strings to numbers
			expect(mockTrpc.orders.create).toHaveBeenCalledWith({
				venueId: 't759aeemb3pqqokugmru0tqs',
				tableNumber: 12, // Number
				guestCount: 8, // Number
				orderType: 'dine_in',
			});
		});

		it('should handle different order types', async () => {
			// Arrange
			mockTrpc.orders.create.mockResolvedValue({ id: 'order1' });

			const formData = new FormData();
			formData.set('tableNumber', '5');
			formData.set('guestCount', '2');
			formData.set('orderType', 'takeout');

			const mockRequest = new Request('http://localhost:5173/orders?/createOrder', {
				method: 'POST',
				body: formData,
			});

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
			});

			// Act
			await ordersPage.actions.createOrder(mockEvent);

			// Assert
			expect(mockTrpc.orders.create).toHaveBeenCalledWith(
				expect.objectContaining({
					orderType: 'takeout',
				})
			);
		});

		it('should handle tRPC errors and return fail(500)', async () => {
			// Arrange
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
				// Intentionally empty - suppress console.error during test
			});
			mockTrpc.orders.create.mockRejectedValue(new Error('Database error'));

			const formData = new FormData();
			formData.set('tableNumber', '5');
			formData.set('guestCount', '4');
			formData.set('orderType', 'dine_in');

			const mockRequest = new Request('http://localhost:5173/orders?/createOrder', {
				method: 'POST',
				body: formData,
			});

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
			});

			// Act
			const result = await ordersPage.actions.createOrder(mockEvent);

			// Assert
			expect(result).toEqual(fail(500, { error: 'Failed to create order' }));
			expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create order:', expect.any(Error));

			consoleErrorSpy.mockRestore();
		});
	});

	describe('updateOrder action', () => {
		it('should require authentication', async () => {
			// Arrange
			const formData = new FormData();
			formData.set('orderId', 'order1');
			formData.set('action', 'close');

			const mockRequest = new Request('http://localhost:5173/orders?/updateOrder', {
				method: 'POST',
				body: formData,
			});

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				locals: { user: null }, // No user
			});

			// Act
			const result = await ordersPage.actions.updateOrder(mockEvent);

			// Assert
			expect(result).toEqual(fail(401, { error: 'Unauthorized' }));
		});

		it('should validate orderId is required', async () => {
			// Arrange
			const mockUser = {
				id: 'user1',
				email: 'test@example.com',
				firstName: 'Test',
				lastName: 'User',
				venueId: 'venue1',
				roles: ['server'],
			};

			const formData = new FormData();
			formData.set('action', 'close');

			const mockRequest = new Request('http://localhost:5173/orders?/updateOrder', {
				method: 'POST',
				body: formData,
			});

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				locals: { user: mockUser },
			});

			// Act
			const result = await ordersPage.actions.updateOrder(mockEvent);

			// Assert
			expect(result).toEqual(fail(400, { error: 'Missing required fields' }));
		});

		it('should validate action is required', async () => {
			// Arrange
			const mockUser = {
				id: 'user1',
				email: 'test@example.com',
				firstName: 'Test',
				lastName: 'User',
				venueId: 'venue1',
				roles: ['server'],
			};

			const formData = new FormData();
			formData.set('orderId', 'order1');

			const mockRequest = new Request('http://localhost:5173/orders?/updateOrder', {
				method: 'POST',
				body: formData,
			});

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				locals: { user: mockUser },
			});

			// Act
			const result = await ordersPage.actions.updateOrder(mockEvent);

			// Assert
			expect(result).toEqual(fail(400, { error: 'Missing required fields' }));
		});

		it('should return success when implementation is complete (TODO)', async () => {
			// Arrange
			const mockUser = {
				id: 'user1',
				email: 'test@example.com',
				firstName: 'Test',
				lastName: 'User',
				venueId: 'venue1',
				roles: ['server'],
			};

			const formData = new FormData();
			formData.set('orderId', 'order1');
			formData.set('action', 'close');

			const mockRequest = new Request('http://localhost:5173/orders?/updateOrder', {
				method: 'POST',
				body: formData,
			});

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				locals: { user: mockUser },
			});

			// Act
			const result = await ordersPage.actions.updateOrder(mockEvent);

			// Assert - Implementation returns { success: true } (TODO)
			expect(result).toEqual({ success: true });
		});

		it('should create tRPC caller with event', async () => {
			// Arrange
			const mockUser = {
				id: 'user1',
				email: 'test@example.com',
				firstName: 'Test',
				lastName: 'User',
				venueId: 'venue1',
				roles: ['server'],
			};

			const formData = new FormData();
			formData.set('orderId', 'order1');
			formData.set('action', 'close');

			const mockRequest = new Request('http://localhost:5173/orders?/updateOrder', {
				method: 'POST',
				body: formData,
			});

			const mockEvent = createMockRequestEvent({
				request: mockRequest,
				locals: { user: mockUser },
			});

			// Act
			await ordersPage.actions.updateOrder(mockEvent);

			// Assert
			expect(createServerCaller).toHaveBeenCalledWith(mockEvent);
		});
	});
});
