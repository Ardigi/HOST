/**
 * @description Tests for orders schema (orders, orderItems, orderItemModifiers)
 * @dependencies Drizzle ORM, database client
 * @coverage-target 90% (critical data layer)
 */

import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanupTestDatabase, createTestDatabase } from '../../../../test/helpers/db-test';
import type { Database } from '../client';
import { orderItemModifiers, orderItems, orders } from './orders';
import { venues } from './venues';

describe('Orders Schema', () => {
	let db: Database;
	const venueId = 'venue-1'; // Pre-created in createTables
	const serverId = 'user-1'; // Pre-created in createTables

	beforeEach(async () => {
		db = await createTestDatabase();
	});

	afterEach(async () => {
		await cleanupTestDatabase(db);
	});

	describe('Orders Table', () => {
		it('should create order with required fields', async () => {
			const [order] = await db
				.insert(orders)
				.values({
					orderNumber: 1,
					venueId,
					serverId,
				})
				.returning();

			expect(order).toMatchObject({
				orderNumber: 1,
				venueId,
				serverId,
				status: 'open',
				orderType: 'dine_in',
				subtotal: 0,
				tax: 0,
				total: 0,
			});
			expect(order.id).toBeTruthy();
			expect(order.createdAt).toBeInstanceOf(Date);
			expect(order.updatedAt).toBeInstanceOf(Date);
		});

		it('should generate unique CUID2 primary key', async () => {
			const [order1] = await db
				.insert(orders)
				.values({
					orderNumber: 1,
					venueId,
					serverId,
				})
				.returning();

			const [order2] = await db
				.insert(orders)
				.values({
					orderNumber: 2,
					venueId,
					serverId,
				})
				.returning();

			expect(order1.id).toBeTruthy();
			expect(order2.id).toBeTruthy();
			expect(order1.id).not.toBe(order2.id);
			expect(typeof order1.id).toBe('string');
		});

		it('should set default status to "open"', async () => {
			const [order] = await db
				.insert(orders)
				.values({
					orderNumber: 1,
					venueId,
					serverId,
				})
				.returning();

			expect(order.status).toBe('open');
		});

		it('should set default orderType to "dine_in"', async () => {
			const [order] = await db
				.insert(orders)
				.values({
					orderNumber: 1,
					venueId,
					serverId,
				})
				.returning();

			expect(order.orderType).toBe('dine_in');
		});

		it('should set default guestCount to 1', async () => {
			const [order] = await db
				.insert(orders)
				.values({
					orderNumber: 1,
					venueId,
					serverId,
				})
				.returning();

			expect(order.guestCount).toBe(1);
		});

		it('should allow all valid status values', async () => {
			const statuses = ['open', 'sent', 'completed', 'cancelled', 'voided'] as const;

			for (const status of statuses) {
				const [order] = await db
					.insert(orders)
					.values({
						orderNumber: Math.floor(Math.random() * 10000),
						venueId,
						serverId,
						status,
					})
					.returning();

				expect(order.status).toBe(status);
			}
		});

		it('should allow all valid orderType values', async () => {
			const orderTypes = ['dine_in', 'takeout', 'delivery', 'bar'] as const;

			for (const orderType of orderTypes) {
				const [order] = await db
					.insert(orders)
					.values({
						orderNumber: Math.floor(Math.random() * 10000),
						venueId,
						serverId,
						orderType,
					})
					.returning();

				expect(order.orderType).toBe(orderType);
			}
		});

		it('should store monetary values correctly', async () => {
			const [order] = await db
				.insert(orders)
				.values({
					orderNumber: 1,
					venueId,
					serverId,
					subtotal: 25.5,
					tax: 2.1,
					tip: 5.0,
					discount: 3.0,
					total: 29.6,
				})
				.returning();

			expect(order.subtotal).toBe(25.5);
			expect(order.tax).toBe(2.1);
			expect(order.tip).toBe(5.0);
			expect(order.discount).toBe(3.0);
			expect(order.total).toBe(29.6);
		});

		it('should allow optional tableNumber', async () => {
			const [order1] = await db
				.insert(orders)
				.values({
					orderNumber: 1,
					venueId,
					serverId,
					tableNumber: 5,
				})
				.returning();

			expect(order1.tableNumber).toBe(5);

			const [order2] = await db
				.insert(orders)
				.values({
					orderNumber: 2,
					venueId,
					serverId,
				})
				.returning();

			expect(order2.tableNumber).toBeNull();
		});

		it('should allow optional notes', async () => {
			const [order] = await db
				.insert(orders)
				.values({
					orderNumber: 1,
					venueId,
					serverId,
					notes: 'Customer requested extra napkins',
				})
				.returning();

			expect(order.notes).toBe('Customer requested extra napkins');
		});

		it('should set completedAt when provided', async () => {
			const completedTime = new Date();
			const [order] = await db
				.insert(orders)
				.values({
					orderNumber: 1,
					venueId,
					serverId,
					status: 'completed',
					completedAt: completedTime,
				})
				.returning();

			expect(order.completedAt).toBeInstanceOf(Date);
			// SQLite stores timestamps as integers (seconds), so compare with 1-second tolerance
			expect(Math.abs((order.completedAt?.getTime() ?? 0) - completedTime.getTime())).toBeLessThan(
				1000
			);
		});

		it('should enforce foreign key to venues', async () => {
			await expect(
				db.insert(orders).values({
					orderNumber: 1,
					venueId: 'non-existent-venue',
					serverId,
				})
			).rejects.toThrow();
		});

		it('should enforce foreign key to users (server)', async () => {
			await expect(
				db.insert(orders).values({
					orderNumber: 1,
					venueId,
					serverId: 'non-existent-server',
				})
			).rejects.toThrow();
		});

		it('should cascade delete when venue is deleted', async () => {
			const [order] = await db
				.insert(orders)
				.values({
					orderNumber: 1,
					venueId,
					serverId,
				})
				.returning();

			expect(order).toBeTruthy();

			// Delete venue
			await db.delete(venues).where(eq(venues.id, venueId));

			// Order should be deleted
			const foundOrders = await db.select().from(orders).where(eq(orders.id, order.id));
			expect(foundOrders).toHaveLength(0);
		});

		it('should update updatedAt timestamp on update', async () => {
			const [order] = await db
				.insert(orders)
				.values({
					orderNumber: 1,
					venueId,
					serverId,
				})
				.returning();

			const originalUpdatedAt = order.updatedAt;

			// Wait 1 second to ensure timestamp difference (SQLite stores seconds)
			await new Promise(resolve => setTimeout(resolve, 1100));

			const [updated] = await db
				.update(orders)
				.set({ status: 'sent' })
				.where(eq(orders.id, order.id))
				.returning();

			expect(updated.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
		});
	});

	describe('Order Items Table', () => {
		let orderId: string;

		beforeEach(async () => {
			const [order] = await db
				.insert(orders)
				.values({
					orderNumber: 1,
					venueId,
					serverId,
				})
				.returning();
			orderId = order.id;
		});

		it('should create order item with required fields', async () => {
			const [item] = await db
				.insert(orderItems)
				.values({
					orderId,
					menuItemId: 'menu-item-1',
					name: 'Cheeseburger',
					quantity: 2,
					price: 12.99,
					total: 25.98,
				})
				.returning();

			expect(item).toMatchObject({
				orderId,
				menuItemId: 'menu-item-1',
				name: 'Cheeseburger',
				quantity: 2,
				price: 12.99,
				modifierTotal: 0,
				total: 25.98,
				status: 'pending',
			});
			expect(item.id).toBeTruthy();
			expect(item.createdAt).toBeInstanceOf(Date);
		});

		it('should generate unique CUID2 primary key', async () => {
			const [item1] = await db
				.insert(orderItems)
				.values({
					orderId,
					menuItemId: 'menu-item-1',
					name: 'Item 1',
					quantity: 1,
					price: 10.0,
					total: 10.0,
				})
				.returning();

			const [item2] = await db
				.insert(orderItems)
				.values({
					orderId,
					menuItemId: 'menu-item-2',
					name: 'Item 2',
					quantity: 1,
					price: 15.0,
					total: 15.0,
				})
				.returning();

			expect(item1.id).toBeTruthy();
			expect(item2.id).toBeTruthy();
			expect(item1.id).not.toBe(item2.id);
		});

		it('should set default quantity to 1', async () => {
			const [item] = await db
				.insert(orderItems)
				.values({
					orderId,
					menuItemId: 'menu-item-1',
					name: 'Fries',
					price: 3.99,
					total: 3.99,
				})
				.returning();

			expect(item.quantity).toBe(1);
		});

		it('should set default status to "pending"', async () => {
			const [item] = await db
				.insert(orderItems)
				.values({
					orderId,
					menuItemId: 'menu-item-1',
					name: 'Salad',
					price: 8.99,
					total: 8.99,
				})
				.returning();

			expect(item.status).toBe('pending');
		});

		it('should set default modifierTotal to 0', async () => {
			const [item] = await db
				.insert(orderItems)
				.values({
					orderId,
					menuItemId: 'menu-item-1',
					name: 'Sandwich',
					price: 9.99,
					total: 9.99,
				})
				.returning();

			expect(item.modifierTotal).toBe(0);
		});

		it('should allow all valid status values', async () => {
			const statuses = ['pending', 'sent', 'preparing', 'ready', 'delivered'] as const;

			for (const status of statuses) {
				const [item] = await db
					.insert(orderItems)
					.values({
						orderId,
						menuItemId: `menu-item-${status}`,
						name: `Item ${status}`,
						price: 10.0,
						total: 10.0,
						status,
					})
					.returning();

				expect(item.status).toBe(status);
			}
		});

		it('should allow optional notes', async () => {
			const [item] = await db
				.insert(orderItems)
				.values({
					orderId,
					menuItemId: 'menu-item-1',
					name: 'Burger',
					price: 12.99,
					total: 12.99,
					notes: 'No onions, extra pickles',
				})
				.returning();

			expect(item.notes).toBe('No onions, extra pickles');
		});

		it('should set sentToKitchenAt when provided', async () => {
			const sentTime = new Date();
			const [item] = await db
				.insert(orderItems)
				.values({
					orderId,
					menuItemId: 'menu-item-1',
					name: 'Pizza',
					price: 15.99,
					total: 15.99,
					status: 'sent',
					sentToKitchenAt: sentTime,
				})
				.returning();

			expect(item.sentToKitchenAt).toBeInstanceOf(Date);
			// SQLite stores timestamps as integers (seconds), so compare with 1-second tolerance
			expect(Math.abs((item.sentToKitchenAt?.getTime() ?? 0) - sentTime.getTime())).toBeLessThan(
				1000
			);
		});

		it('should enforce foreign key to orders', async () => {
			await expect(
				db.insert(orderItems).values({
					orderId: 'non-existent-order',
					menuItemId: 'menu-item-1',
					name: 'Item',
					price: 10.0,
					total: 10.0,
				})
			).rejects.toThrow();
		});

		it('should cascade delete when order is deleted', async () => {
			const [item] = await db
				.insert(orderItems)
				.values({
					orderId,
					menuItemId: 'menu-item-1',
					name: 'Pasta',
					price: 14.99,
					total: 14.99,
				})
				.returning();

			expect(item).toBeTruthy();

			// Delete order
			await db.delete(orders).where(eq(orders.id, orderId));

			// Order item should be deleted
			const foundItems = await db.select().from(orderItems).where(eq(orderItems.id, item.id));
			expect(foundItems).toHaveLength(0);
		});
	});

	describe('Order Item Modifiers Table', () => {
		let orderId: string;
		let orderItemId: string;

		beforeEach(async () => {
			const [order] = await db
				.insert(orders)
				.values({
					orderNumber: 1,
					venueId,
					serverId,
				})
				.returning();
			orderId = order.id;

			const [item] = await db
				.insert(orderItems)
				.values({
					orderId,
					menuItemId: 'menu-item-1',
					name: 'Burger',
					price: 10.0,
					total: 10.0,
				})
				.returning();
			orderItemId = item.id;
		});

		it('should create order item modifier with required fields', async () => {
			const [modifier] = await db
				.insert(orderItemModifiers)
				.values({
					orderItemId,
					modifierId: 'modifier-1',
					name: 'Extra Cheese',
					price: 1.5,
				})
				.returning();

			expect(modifier).toMatchObject({
				orderItemId,
				modifierId: 'modifier-1',
				name: 'Extra Cheese',
				price: 1.5,
				quantity: 1,
			});
			expect(modifier.id).toBeTruthy();
		});

		it('should generate unique CUID2 primary key', async () => {
			const [mod1] = await db
				.insert(orderItemModifiers)
				.values({
					orderItemId,
					modifierId: 'modifier-1',
					name: 'Extra Cheese',
					price: 1.5,
				})
				.returning();

			const [mod2] = await db
				.insert(orderItemModifiers)
				.values({
					orderItemId,
					modifierId: 'modifier-2',
					name: 'Bacon',
					price: 2.0,
				})
				.returning();

			expect(mod1.id).toBeTruthy();
			expect(mod2.id).toBeTruthy();
			expect(mod1.id).not.toBe(mod2.id);
		});

		it('should set default price to 0', async () => {
			const [modifier] = await db
				.insert(orderItemModifiers)
				.values({
					orderItemId,
					modifierId: 'modifier-1',
					name: 'No Onions',
				})
				.returning();

			expect(modifier.price).toBe(0);
		});

		it('should set default quantity to 1', async () => {
			const [modifier] = await db
				.insert(orderItemModifiers)
				.values({
					orderItemId,
					modifierId: 'modifier-1',
					name: 'Extra Pickles',
					price: 0.5,
				})
				.returning();

			expect(modifier.quantity).toBe(1);
		});

		it('should allow quantity greater than 1', async () => {
			const [modifier] = await db
				.insert(orderItemModifiers)
				.values({
					orderItemId,
					modifierId: 'modifier-1',
					name: 'Extra Patty',
					price: 3.0,
					quantity: 2,
				})
				.returning();

			expect(modifier.quantity).toBe(2);
		});

		it('should enforce foreign key to orderItems', async () => {
			await expect(
				db.insert(orderItemModifiers).values({
					orderItemId: 'non-existent-item',
					modifierId: 'modifier-1',
					name: 'Modifier',
					price: 1.0,
				})
			).rejects.toThrow();
		});

		it('should cascade delete when order item is deleted', async () => {
			const [modifier] = await db
				.insert(orderItemModifiers)
				.values({
					orderItemId,
					modifierId: 'modifier-1',
					name: 'Lettuce',
					price: 0.0,
				})
				.returning();

			expect(modifier).toBeTruthy();

			// Delete order item
			await db.delete(orderItems).where(eq(orderItems.id, orderItemId));

			// Modifier should be deleted
			const foundModifiers = await db
				.select()
				.from(orderItemModifiers)
				.where(eq(orderItemModifiers.id, modifier.id));
			expect(foundModifiers).toHaveLength(0);
		});

		it('should cascade delete when parent order is deleted', async () => {
			const [modifier] = await db
				.insert(orderItemModifiers)
				.values({
					orderItemId,
					modifierId: 'modifier-1',
					name: 'Tomato',
					price: 0.5,
				})
				.returning();

			expect(modifier).toBeTruthy();

			// Delete parent order (should cascade through orderItems to modifiers)
			await db.delete(orders).where(eq(orders.id, orderId));

			// Modifier should be deleted
			const foundModifiers = await db
				.select()
				.from(orderItemModifiers)
				.where(eq(orderItemModifiers.id, modifier.id));
			expect(foundModifiers).toHaveLength(0);
		});
	});

	describe('Type Inference', () => {
		it('should correctly infer Order types', async () => {
			const [order] = await db
				.insert(orders)
				.values({
					orderNumber: 1,
					venueId,
					serverId,
				})
				.returning();

			// Type checks
			expect(typeof order.id).toBe('string');
			expect(typeof order.orderNumber).toBe('number');
			expect(typeof order.venueId).toBe('string');
			expect(typeof order.serverId).toBe('string');
			expect(typeof order.status).toBe('string');
			expect(typeof order.orderType).toBe('string');
			expect(typeof order.subtotal).toBe('number');
			expect(typeof order.tax).toBe('number');
			expect(typeof order.total).toBe('number');
			expect(order.createdAt).toBeInstanceOf(Date);
			expect(order.updatedAt).toBeInstanceOf(Date);
		});

		it('should correctly infer OrderItem types', async () => {
			const [order] = await db
				.insert(orders)
				.values({
					orderNumber: 1,
					venueId,
					serverId,
				})
				.returning();

			const [item] = await db
				.insert(orderItems)
				.values({
					orderId: order.id,
					menuItemId: 'item-1',
					name: 'Test Item',
					price: 10.0,
					total: 10.0,
				})
				.returning();

			expect(typeof item.id).toBe('string');
			expect(typeof item.orderId).toBe('string');
			expect(typeof item.menuItemId).toBe('string');
			expect(typeof item.name).toBe('string');
			expect(typeof item.quantity).toBe('number');
			expect(typeof item.price).toBe('number');
			expect(typeof item.total).toBe('number');
			expect(typeof item.status).toBe('string');
			expect(item.createdAt).toBeInstanceOf(Date);
		});

		it('should correctly infer OrderItemModifier types', async () => {
			const [order] = await db
				.insert(orders)
				.values({
					orderNumber: 1,
					venueId,
					serverId,
				})
				.returning();

			const [item] = await db
				.insert(orderItems)
				.values({
					orderId: order.id,
					menuItemId: 'item-1',
					name: 'Test Item',
					price: 10.0,
					total: 10.0,
				})
				.returning();

			const [modifier] = await db
				.insert(orderItemModifiers)
				.values({
					orderItemId: item.id,
					modifierId: 'mod-1',
					name: 'Test Modifier',
					price: 1.0,
				})
				.returning();

			expect(typeof modifier.id).toBe('string');
			expect(typeof modifier.orderItemId).toBe('string');
			expect(typeof modifier.modifierId).toBe('string');
			expect(typeof modifier.name).toBe('string');
			expect(typeof modifier.price).toBe('number');
			expect(typeof modifier.quantity).toBe('number');
		});
	});
});
