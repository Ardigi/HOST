import { createServerCaller } from '$lib/trpc-server';
import { fail } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Actions, PageServerLoad } from './$types';

// Mock dependencies
vi.mock('$lib/trpc-server', () => ({
	createServerCaller: vi.fn(),
}));

vi.mock('@sveltejs/kit', () => ({
	fail: vi.fn((status, data) => ({ status, ...data })),
}));

describe('Order Detail Page Server', () => {
	type RouteParams = { orderId: string };
	const mockEvent = {
		params: { orderId: 'order-123' } as RouteParams,
		locals: {
			user: {
				id: 'user-123',
				email: 'test@test.com',
				venueId: 'venue-123',
				roles: ['server'],
			},
		},
		request: new Request('http://localhost/orders/order-123'),
		parent: async () => ({}),
		depends: () => {
			// Mock function - no-op
		},
		untrack: <T>(fn: () => T) => fn(),
	} as unknown as RequestEvent<RouteParams, '/orders/[orderId]'>;

	const mockTrpc = {
		orders: {
			getById: vi.fn(),
			listTables: vi.fn(),
			addItems: vi.fn(),
		},
		menu: {
			listItems: vi.fn(),
			listCategories: vi.fn(),
		},
	};

	beforeEach(() => {
		vi.clearAllMocks();
		// biome-ignore lint/suspicious/noExplicitAny: Mock tRPC caller has complex inferred types
		vi.mocked(createServerCaller).mockReturnValue(mockTrpc as any);
	});

	describe('load function', () => {
		it('should load order details with menu items and categories', async () => {
			// Arrange
			const mockOrder = {
				id: 'order-123',
				orderNumber: 1,
				tableNumber: 5,
				guestCount: 2,
				status: 'open',
				venueId: 'venue-123',
				serverId: 'user-123',
				items: [],
				server: { firstName: 'Test', lastName: 'User' },
				venue: { name: 'The Copper Pour' },
			};

			const mockMenuItems = [
				{
					id: 'item-1',
					name: 'Burger',
					price: 14.99,
					categoryId: 'cat-1',
					isAvailable: true,
				},
				{
					id: 'item-2',
					name: 'Wings',
					price: 12.99,
					categoryId: 'cat-2',
					isAvailable: true,
				},
			];

			const mockCategories = [
				{ id: 'cat-1', name: 'Entrees', displayOrder: 1 },
				{ id: 'cat-2', name: 'Appetizers', displayOrder: 2 },
			];

			mockTrpc.orders.getById.mockResolvedValue(mockOrder);
			mockTrpc.menu.listItems.mockResolvedValue({ items: mockMenuItems });
			mockTrpc.menu.listCategories.mockResolvedValue({ categories: mockCategories });

			// Act
			const { load } = await import('./+page.server');
			// biome-ignore lint/suspicious/noExplicitAny: Test mock - type precision less critical
			const result = await (load as PageServerLoad)(mockEvent as any);

			// Assert
			expect(createServerCaller).toHaveBeenCalledWith(mockEvent);
			expect(mockTrpc.orders.getById).toHaveBeenCalledWith({ id: 'order-123' });
			expect(mockTrpc.menu.listItems).toHaveBeenCalledWith({
				venueId: 'venue-123',
				isAvailable: true,
				isActive: true,
			});
			expect(mockTrpc.menu.listCategories).toHaveBeenCalledWith({ venueId: 'venue-123' });
			expect(result).toEqual({
				order: mockOrder,
				menuItems: mockMenuItems,
				categories: mockCategories,
				user: mockEvent.locals.user,
			});
		});

		it('should handle errors gracefully when order not found', async () => {
			// Arrange
			mockTrpc.orders.getById.mockRejectedValue(new Error('Order not found'));

			// Act
			const { load } = await import('./+page.server');
			// biome-ignore lint/suspicious/noExplicitAny: Test mock - type precision less critical
			const result = await (load as PageServerLoad)(mockEvent as any);

			// Assert
			expect(result).toEqual({
				order: null,
				menuItems: [],
				categories: [],
				user: mockEvent.locals.user,
			});
		});
	});

	describe('addItem action', () => {
		it('should add item to order without modifiers', async () => {
			// Arrange
			const formData = new FormData();
			formData.set('orderId', 'order-123');
			formData.set('menuItemId', 'item-1');
			formData.set('quantity', '2');

			const mockRequest = new Request('http://localhost/orders/order-123', {
				method: 'POST',
				body: formData,
			});

			const actionEvent = {
				...mockEvent,
				request: mockRequest,
			};

			const mockOrderItems = [
				{
					id: 'orderitem-1',
					orderId: 'order-123',
					menuItemId: 'item-1',
					name: 'Burger',
					quantity: 2,
					price: 14.99,
					modifierTotal: 0,
					total: 29.98,
				},
			];

			mockTrpc.orders.addItems.mockResolvedValue({ orderItems: mockOrderItems });

			// Act
			const { actions } = await import('./+page.server');
			// biome-ignore lint/suspicious/noExplicitAny: Test mock - type precision less critical
			const result = await (actions as Actions).addItem(actionEvent as any);

			// Assert
			expect(mockTrpc.orders.addItems).toHaveBeenCalledWith({
				orderId: 'order-123',
				items: [
					{
						menuItemId: 'item-1',
						quantity: 2,
						modifiers: undefined,
						notes: undefined,
					},
				],
			});
			expect(result).toEqual({
				success: true,
				orderItems: mockOrderItems,
			});
		});

		it('should add item with modifiers', async () => {
			// Arrange
			const formData = new FormData();
			formData.set('orderId', 'order-123');
			formData.set('menuItemId', 'item-1');
			formData.set('quantity', '1');
			formData.set('modifiers', JSON.stringify([{ modifierId: 'mod-1', quantity: 1 }]));

			const mockRequest = new Request('http://localhost/orders/order-123', {
				method: 'POST',
				body: formData,
			});

			const actionEvent = {
				...mockEvent,
				request: mockRequest,
			};

			const mockOrderItems = [
				{
					id: 'orderitem-1',
					orderId: 'order-123',
					menuItemId: 'item-1',
					name: 'Burger',
					quantity: 1,
					price: 14.99,
					modifierTotal: 0,
					total: 14.99,
					modifiers: [{ modifierId: 'mod-1', name: 'Medium Rare', quantity: 1 }],
				},
			];

			mockTrpc.orders.addItems.mockResolvedValue({ orderItems: mockOrderItems });

			// Act
			const { actions } = await import('./+page.server');
			// biome-ignore lint/suspicious/noExplicitAny: Test mock - type precision less critical
			const result = await (actions as Actions).addItem(actionEvent as any);

			// Assert
			expect(mockTrpc.orders.addItems).toHaveBeenCalledWith({
				orderId: 'order-123',
				items: [
					{
						menuItemId: 'item-1',
						quantity: 1,
						modifiers: [{ modifierId: 'mod-1', quantity: 1 }],
						notes: undefined,
					},
				],
			});
			expect(result).toEqual({
				success: true,
				orderItems: mockOrderItems,
			});
		});

		it('should add item with notes', async () => {
			// Arrange
			const formData = new FormData();
			formData.set('orderId', 'order-123');
			formData.set('menuItemId', 'item-1');
			formData.set('quantity', '1');
			formData.set('notes', 'No onions');

			const mockRequest = new Request('http://localhost/orders/order-123', {
				method: 'POST',
				body: formData,
			});

			const actionEvent = {
				...mockEvent,
				request: mockRequest,
			};

			const mockOrderItems = [
				{
					id: 'orderitem-1',
					orderId: 'order-123',
					menuItemId: 'item-1',
					name: 'Burger',
					quantity: 1,
					price: 14.99,
					modifierTotal: 0,
					total: 14.99,
					notes: 'No onions',
				},
			];

			mockTrpc.orders.addItems.mockResolvedValue({ orderItems: mockOrderItems });

			// Act
			const { actions } = await import('./+page.server');
			// biome-ignore lint/suspicious/noExplicitAny: Test mock - type precision less critical
			const result = await (actions as Actions).addItem(actionEvent as any);

			// Assert
			expect(mockTrpc.orders.addItems).toHaveBeenCalledWith({
				orderId: 'order-123',
				items: [
					{
						menuItemId: 'item-1',
						quantity: 1,
						modifiers: undefined,
						notes: 'No onions',
					},
				],
			});
			expect(result).toEqual({
				success: true,
				orderItems: mockOrderItems,
			});
		});

		it('should return error when menuItemId is missing', async () => {
			// Arrange
			const formData = new FormData();
			formData.set('orderId', 'order-123');
			formData.set('quantity', '1');

			const mockRequest = new Request('http://localhost/orders/order-123', {
				method: 'POST',
				body: formData,
			});

			const actionEvent = {
				...mockEvent,
				request: mockRequest,
			};

			// Act
			const { actions } = await import('./+page.server');
			// biome-ignore lint/suspicious/noExplicitAny: Test mock - type precision less critical
			await (actions as Actions).addItem(actionEvent as any);

			// Assert
			expect(fail).toHaveBeenCalledWith(400, { error: 'Menu item ID is required' });
		});

		it('should return error when quantity is missing', async () => {
			// Arrange
			const formData = new FormData();
			formData.set('orderId', 'order-123');
			formData.set('menuItemId', 'item-1');

			const mockRequest = new Request('http://localhost/orders/order-123', {
				method: 'POST',
				body: formData,
			});

			const actionEvent = {
				...mockEvent,
				request: mockRequest,
			};

			// Act
			const { actions } = await import('./+page.server');
			// biome-ignore lint/suspicious/noExplicitAny: Test mock - type precision less critical
			await (actions as Actions).addItem(actionEvent as any);

			// Assert
			expect(fail).toHaveBeenCalledWith(400, { error: 'Quantity is required' });
		});

		it('should handle tRPC errors gracefully', async () => {
			// Arrange
			const formData = new FormData();
			formData.set('orderId', 'order-123');
			formData.set('menuItemId', 'item-1');
			formData.set('quantity', '1');

			const mockRequest = new Request('http://localhost/orders/order-123', {
				method: 'POST',
				body: formData,
			});

			const actionEvent = {
				...mockEvent,
				request: mockRequest,
			};

			mockTrpc.orders.addItems.mockRejectedValue(new Error('Database error'));

			// Act
			const { actions } = await import('./+page.server');
			// biome-ignore lint/suspicious/noExplicitAny: Test mock - type precision less critical
			await (actions as Actions).addItem(actionEvent as any);

			// Assert
			expect(fail).toHaveBeenCalledWith(500, { error: 'Failed to add item to order' });
		});
	});

	describe('removeItem action', () => {
		it('should remove item from order', async () => {
			// Arrange
			const formData = new FormData();
			formData.set('orderId', 'order-123');
			formData.set('orderItemId', 'orderitem-1');

			const mockRequest = new Request('http://localhost/orders/order-123', {
				method: 'POST',
				body: formData,
			});

			const actionEvent = {
				...mockEvent,
				request: mockRequest,
			};

			// Act
			const { actions } = await import('./+page.server');
			// biome-ignore lint/suspicious/noExplicitAny: Test mock - type precision less critical
			const result = await (actions as Actions).removeItem(actionEvent as any);

			// Assert
			expect(result).toEqual({ success: true });
		});

		it('should return error when orderItemId is missing', async () => {
			// Arrange
			const formData = new FormData();
			formData.set('orderId', 'order-123');

			const mockRequest = new Request('http://localhost/orders/order-123', {
				method: 'POST',
				body: formData,
			});

			const actionEvent = {
				...mockEvent,
				request: mockRequest,
			};

			// Act
			const { actions } = await import('./+page.server');
			// biome-ignore lint/suspicious/noExplicitAny: Test mock - type precision less critical
			await (actions as Actions).removeItem(actionEvent as any);

			// Assert
			expect(fail).toHaveBeenCalledWith(400, { error: 'Order item ID is required' });
		});
	});

	describe('updateQuantity action', () => {
		it('should update item quantity', async () => {
			// Arrange
			const formData = new FormData();
			formData.set('orderId', 'order-123');
			formData.set('orderItemId', 'orderitem-1');
			formData.set('quantity', '3');

			const mockRequest = new Request('http://localhost/orders/order-123', {
				method: 'POST',
				body: formData,
			});

			const actionEvent = {
				...mockEvent,
				request: mockRequest,
			};

			// Act
			const { actions } = await import('./+page.server');
			// biome-ignore lint/suspicious/noExplicitAny: Test mock - type precision less critical
			const result = await (actions as Actions).updateQuantity(actionEvent as any);

			// Assert
			expect(result).toEqual({ success: true });
		});

		it('should return error when quantity is missing', async () => {
			// Arrange
			const formData = new FormData();
			formData.set('orderId', 'order-123');
			formData.set('orderItemId', 'orderitem-1');

			const mockRequest = new Request('http://localhost/orders/order-123', {
				method: 'POST',
				body: formData,
			});

			const actionEvent = {
				...mockEvent,
				request: mockRequest,
			};

			// Act
			const { actions } = await import('./+page.server');
			// biome-ignore lint/suspicious/noExplicitAny: Test mock - type precision less critical
			await (actions as Actions).updateQuantity(actionEvent as any);

			// Assert
			expect(fail).toHaveBeenCalledWith(400, { error: 'Quantity is required' });
		});

		it('should return error when quantity is less than 1', async () => {
			// Arrange
			const formData = new FormData();
			formData.set('orderId', 'order-123');
			formData.set('orderItemId', 'orderitem-1');
			formData.set('quantity', '0');

			const mockRequest = new Request('http://localhost/orders/order-123', {
				method: 'POST',
				body: formData,
			});

			const actionEvent = {
				...mockEvent,
				request: mockRequest,
			};

			// Act
			const { actions } = await import('./+page.server');
			// biome-ignore lint/suspicious/noExplicitAny: Test mock - type precision less critical
			await (actions as Actions).updateQuantity(actionEvent as any);

			// Assert
			expect(fail).toHaveBeenCalledWith(400, { error: 'Quantity must be at least 1' });
		});
	});
});
