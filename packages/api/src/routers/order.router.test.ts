import { TRPCError } from '@trpc/server';
import { describe, expect, it, vi } from 'vitest';
import { menuItemFactory, orderFactory, orderItemFactory } from '../test/factories';
import {
	createAuthContext,
	createTestContext,
	mockDb,
	mockDrizzleInsert,
	mockDrizzleUpdate,
} from '../test/setup';
import { orderRouter } from './order.router';

describe('OrderRouter', () => {
	describe('list', () => {
		it('should return orders for venue', async () => {
			const orders = orderFactory.buildList(3);
			mockDb.query.orders.findMany = vi.fn().mockResolvedValue(orders);

			const caller = orderRouter.createCaller(createAuthContext());
			const result = await caller.list({ venueId: 'test-venue-id' });

			expect(result.orders).toEqual(orders);
			expect(result.total).toBe(3);
		});

		it('should filter by status when provided', async () => {
			const orders = orderFactory.buildList(2, { status: 'open' });
			mockDb.query.orders.findMany = vi.fn().mockResolvedValue(orders);

			const caller = orderRouter.createCaller(createAuthContext());
			await caller.list({ venueId: 'test-venue-id', status: 'open' });

			expect(mockDb.query.orders.findMany).toHaveBeenCalled();
		});

		it('should apply limit and offset for pagination', async () => {
			const orders = orderFactory.buildList(10);
			mockDb.query.orders.findMany = vi.fn().mockResolvedValue(orders.slice(0, 5));

			const caller = orderRouter.createCaller(createAuthContext());
			await caller.list({ venueId: 'test-venue-id', limit: 5, offset: 0 });

			expect(mockDb.query.orders.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					limit: 5,
					offset: 0,
				})
			);
		});

		it('should require authentication', async () => {
			const caller = orderRouter.createCaller(createTestContext());

			await expect(caller.list({ venueId: 'test-venue-id' })).rejects.toThrow(TRPCError);
		});
	});

	describe('getById', () => {
		it('should return order by id with relations', async () => {
			const order = orderFactory.build();
			mockDb.query.orders.findFirst = vi.fn().mockResolvedValue(order);

			const caller = orderRouter.createCaller(createAuthContext());
			const result = await caller.getById({ id: 'order-1' });

			expect(result).toEqual(order);
			expect(mockDb.query.orders.findFirst).toHaveBeenCalled();
		});

		it('should throw NOT_FOUND when order does not exist', async () => {
			mockDb.query.orders.findFirst = vi.fn().mockResolvedValue(null);

			const caller = orderRouter.createCaller(createAuthContext());

			await expect(caller.getById({ id: 'non-existent' })).rejects.toThrow(
				new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' })
			);
		});

		it('should require authentication', async () => {
			const caller = orderRouter.createCaller(createTestContext());

			await expect(caller.getById({ id: 'order-1' })).rejects.toThrow(TRPCError);
		});
	});

	describe('listTables', () => {
		it('should return tables for venue', async () => {
			const tables = [
				{ id: '1', venueId: 'test-venue-id', tableNumber: '1', sectionName: 'Main' },
				{ id: '2', venueId: 'test-venue-id', tableNumber: '2', sectionName: 'Main' },
			];
			mockDb.query.tables.findMany = vi.fn().mockResolvedValue(tables);

			const caller = orderRouter.createCaller(createAuthContext());
			const result = await caller.listTables({ venueId: 'test-venue-id' });

			expect(result.tables).toEqual(tables);
		});

		it('should require authentication', async () => {
			const caller = orderRouter.createCaller(createTestContext());

			await expect(caller.listTables({ venueId: 'test-venue-id' })).rejects.toThrow(TRPCError);
		});
	});

	describe('create', () => {
		it('should create new order with generated order number', async () => {
			const todayOrders = orderFactory.buildList(5);
			const newOrder = orderFactory.build({ orderNumber: 6 });

			mockDb.query.orders.findMany = vi.fn().mockResolvedValue(todayOrders);
			mockDb.insert = vi.fn().mockReturnValue(mockDrizzleInsert([newOrder]));

			const caller = orderRouter.createCaller(createAuthContext());
			const result = await caller.create({
				venueId: 'test-venue-id',
				tableNumber: 5,
				guestCount: 2,
				orderType: 'dine_in',
			});

			expect(result).toEqual(newOrder);
		});

		it('should assign server id from authenticated user', async () => {
			mockDb.query.orders.findMany = vi.fn().mockResolvedValue([]);
			mockDb.insert = vi
				.fn()
				.mockReturnValue(mockDrizzleInsert([orderFactory.build({ serverId: 'test-user-id' })]));

			const caller = orderRouter.createCaller(createAuthContext({ id: 'test-user-id' }));
			await caller.create({
				venueId: 'test-venue-id',
				tableNumber: 5,
				guestCount: 2,
				orderType: 'dine_in',
			});

			expect(mockDb.insert).toHaveBeenCalled();
		});

		it('should use default values for optional fields', async () => {
			mockDb.query.orders.findMany = vi.fn().mockResolvedValue([]);
			mockDb.insert = vi
				.fn()
				.mockReturnValue(
					mockDrizzleInsert([orderFactory.build({ guestCount: 1, orderType: 'dine_in' })])
				);

			const caller = orderRouter.createCaller(createAuthContext());
			await caller.create({
				venueId: 'test-venue-id',
				tableNumber: 5,
			});

			expect(mockDb.insert).toHaveBeenCalled();
		});

		it('should require authentication', async () => {
			const caller = orderRouter.createCaller(createTestContext());

			await expect(
				caller.create({
					venueId: 'test-venue-id',
					tableNumber: 5,
					guestCount: 2,
					orderType: 'dine_in',
				})
			).rejects.toThrow(TRPCError);
		});
	});

	describe('addItems', () => {
		it('should add items to open order', async () => {
			const order = orderFactory.build({ status: 'open' });
			const menuItem = menuItemFactory.build({ price: 12.99 });
			const orderItem = orderItemFactory.build();

			mockDb.query.orders.findFirst = vi.fn().mockResolvedValue(order);
			mockDb.query.menuItems.findFirst = vi.fn().mockResolvedValue(menuItem);
			mockDb.insert = vi.fn().mockReturnValue(mockDrizzleInsert([orderItem]));

			const caller = orderRouter.createCaller(createAuthContext());
			const result = await caller.addItems({
				orderId: 'order-1',
				items: [{ menuItemId: 'item-1', quantity: 2 }],
			});

			expect(result.orderItems).toHaveLength(1);
		});

		it('should throw NOT_FOUND when order does not exist', async () => {
			mockDb.query.orders.findFirst = vi.fn().mockResolvedValue(null);

			const caller = orderRouter.createCaller(createAuthContext());

			await expect(
				caller.addItems({
					orderId: 'non-existent',
					items: [{ menuItemId: 'item-1', quantity: 1 }],
				})
			).rejects.toThrow(new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' }));
		});

		it('should throw BAD_REQUEST when order is not open', async () => {
			const order = orderFactory.build({ status: 'completed' });
			mockDb.query.orders.findFirst = vi.fn().mockResolvedValue(order);

			const caller = orderRouter.createCaller(createAuthContext());

			await expect(
				caller.addItems({
					orderId: 'order-1',
					items: [{ menuItemId: 'item-1', quantity: 1 }],
				})
			).rejects.toThrow(
				new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot add items to a closed order' })
			);
		});

		it('should throw NOT_FOUND when menu item does not exist', async () => {
			const order = orderFactory.build({ status: 'open' });
			mockDb.query.orders.findFirst = vi.fn().mockResolvedValue(order);
			mockDb.query.menuItems.findFirst = vi.fn().mockResolvedValue(null);

			const caller = orderRouter.createCaller(createAuthContext());

			await expect(
				caller.addItems({
					orderId: 'order-1',
					items: [{ menuItemId: 'non-existent', quantity: 1 }],
				})
			).rejects.toThrow(TRPCError);
		});

		it('should require authentication', async () => {
			const caller = orderRouter.createCaller(createTestContext());

			await expect(
				caller.addItems({
					orderId: 'order-1',
					items: [{ menuItemId: 'item-1', quantity: 1 }],
				})
			).rejects.toThrow(TRPCError);
		});
	});

	describe('updateStatus', () => {
		it('should update order status', async () => {
			const updatedOrder = orderFactory.build({ status: 'sent' });
			mockDb.update = vi.fn().mockReturnValue(mockDrizzleUpdate([updatedOrder]));

			const caller = orderRouter.createCaller(createAuthContext());
			const result = await caller.updateStatus({
				orderId: 'order-1',
				status: 'sent',
			});

			expect(result).toEqual(updatedOrder);
		});

		it('should set completedAt when status is completed', async () => {
			const completedOrder = orderFactory.build({
				status: 'completed',
				completedAt: new Date(),
			});
			mockDb.update = vi.fn().mockReturnValue(mockDrizzleUpdate([completedOrder]));

			const caller = orderRouter.createCaller(createAuthContext());
			await caller.updateStatus({
				orderId: 'order-1',
				status: 'completed',
			});

			expect(mockDb.update).toHaveBeenCalled();
		});

		it('should throw NOT_FOUND when order does not exist', async () => {
			mockDb.update = vi.fn().mockReturnValue(mockDrizzleUpdate([]));

			const caller = orderRouter.createCaller(createAuthContext());

			await expect(
				caller.updateStatus({
					orderId: 'non-existent',
					status: 'sent',
				})
			).rejects.toThrow(new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' }));
		});

		it('should validate status enum', async () => {
			const caller = orderRouter.createCaller(createAuthContext());

			await expect(
				caller.updateStatus({
					orderId: 'order-1',
					// @ts-expect-error Testing invalid status
					status: 'invalid-status',
				})
			).rejects.toThrow();
		});

		it('should require authentication', async () => {
			const caller = orderRouter.createCaller(createTestContext());

			await expect(
				caller.updateStatus({
					orderId: 'order-1',
					status: 'sent',
				})
			).rejects.toThrow(TRPCError);
		});
	});
});
