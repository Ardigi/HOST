import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Database } from '../client';
import * as schema from '../schema';
import { OrderService } from './order.service';

describe('OrderService - RED Phase', () => {
	let db: Database;
	let service: OrderService;

	beforeEach(async () => {
		// Create fresh in-memory database for each test
		const client = createClient({ url: ':memory:' });
		db = drizzle(client, { schema }) as Database;

		// Enable foreign keys
		await client.execute('PRAGMA foreign_keys = ON');

		// Create minimal test tables
		await client.execute(`
			CREATE TABLE venues (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				slug TEXT NOT NULL UNIQUE,
				email TEXT NOT NULL,
				tax_rate INTEGER DEFAULT 825 NOT NULL,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			)
		`);

		await client.execute(`
			CREATE TABLE users (
				id TEXT PRIMARY KEY,
				venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
				keycloak_id TEXT NOT NULL UNIQUE,
				email TEXT NOT NULL UNIQUE,
				first_name TEXT NOT NULL,
				last_name TEXT NOT NULL,
				role TEXT DEFAULT 'server' NOT NULL,
				is_active INTEGER DEFAULT 1 NOT NULL,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			)
		`);

		await client.execute(`
			CREATE TABLE orders (
				id TEXT PRIMARY KEY,
				order_number INTEGER NOT NULL,
				venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
				server_id TEXT NOT NULL REFERENCES users(id),
				table_number INTEGER,
				guest_count INTEGER DEFAULT 1,
				status TEXT NOT NULL DEFAULT 'open',
				order_type TEXT NOT NULL DEFAULT 'dine_in',
				subtotal REAL NOT NULL DEFAULT 0,
				tax REAL NOT NULL DEFAULT 0,
				tip REAL DEFAULT 0,
				discount REAL DEFAULT 0,
				total REAL NOT NULL DEFAULT 0,
				notes TEXT,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL,
				completed_at INTEGER
			)
		`);

		await client.execute(`
			CREATE TABLE order_items (
				id TEXT PRIMARY KEY,
				order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
				menu_item_id TEXT NOT NULL,
				name TEXT NOT NULL,
				quantity INTEGER NOT NULL DEFAULT 1,
				price REAL NOT NULL,
				modifier_total REAL NOT NULL DEFAULT 0,
				total REAL NOT NULL,
				notes TEXT,
				status TEXT NOT NULL DEFAULT 'pending',
				sent_to_kitchen_at INTEGER,
				created_at INTEGER NOT NULL
			)
		`);

		await client.execute(`
			CREATE TABLE order_item_modifiers (
				id TEXT PRIMARY KEY,
				order_item_id TEXT NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
				modifier_id TEXT NOT NULL,
				name TEXT NOT NULL,
				price REAL NOT NULL DEFAULT 0,
				quantity INTEGER NOT NULL DEFAULT 1
			)
		`);

		// Insert test data
		const now = Date.now();
		await client.execute(`
			INSERT INTO venues (id, name, slug, email, created_at, updated_at)
			VALUES ('venue-1', 'Test Bar', 'test-bar', 'test@bar.com', ${now}, ${now})
		`);

		await client.execute(`
			INSERT INTO users (id, venue_id, keycloak_id, email, first_name, last_name, created_at, updated_at)
			VALUES ('user-1', 'venue-1', 'kc-123', 'user@test.com', 'Test', 'User', ${now}, ${now})
		`);

		service = new OrderService(db);
	});

	describe('createOrder', () => {
		it('should create a new order with generated order number', async () => {
			const newOrder = {
				venueId: 'venue-1',
				serverId: 'user-1',
				tableNumber: 5,
				guestCount: 2,
				orderType: 'dine_in' as const,
			};

			const order = await service.createOrder(newOrder);

			expect(order.id).toBeDefined();
			expect(order.orderNumber).toBeGreaterThan(0);
			expect(order.venueId).toBe('venue-1');
			expect(order.serverId).toBe('user-1');
			expect(order.tableNumber).toBe(5);
			expect(order.guestCount).toBe(2);
			expect(order.status).toBe('open');
			expect(order.orderType).toBe('dine_in');
			expect(order.subtotal).toBe(0);
			expect(order.tax).toBe(0);
			expect(order.total).toBe(0);
		});

		it('should create bar order without table number', async () => {
			const newOrder = {
				venueId: 'venue-1',
				serverId: 'user-1',
				orderType: 'bar' as const,
			};

			const order = await service.createOrder(newOrder);

			expect(order.orderType).toBe('bar');
			expect(order.tableNumber).toBeNull();
		});

		it('should generate sequential order numbers per venue', async () => {
			const order1 = await service.createOrder({
				venueId: 'venue-1',
				serverId: 'user-1',
				orderType: 'bar' as const,
			});

			const order2 = await service.createOrder({
				venueId: 'venue-1',
				serverId: 'user-1',
				orderType: 'bar' as const,
			});

			expect(order2.orderNumber).toBe(order1.orderNumber + 1);
		});
	});

	describe('addItemToOrder', () => {
		it('should add menu item to order', async () => {
			const order = await service.createOrder({
				venueId: 'venue-1',
				serverId: 'user-1',
				orderType: 'bar' as const,
			});

			const item = await service.addItemToOrder({
				orderId: order.id,
				menuItemId: 'item-1',
				name: 'Draft Beer',
				quantity: 2,
				price: 6.5,
			});

			expect(item.orderId).toBe(order.id);
			expect(item.menuItemId).toBe('item-1');
			expect(item.name).toBe('Draft Beer');
			expect(item.quantity).toBe(2);
			expect(item.price).toBe(6.5);
			expect(item.total).toBe(13.0);
			expect(item.status).toBe('pending');
		});

		it('should add item with modifiers', async () => {
			const order = await service.createOrder({
				venueId: 'venue-1',
				serverId: 'user-1',
				orderType: 'dine_in' as const,
			});

			const item = await service.addItemToOrder({
				orderId: order.id,
				menuItemId: 'item-2',
				name: 'Burger',
				quantity: 1,
				price: 12.0,
				modifiers: [
					{ modifierId: 'mod-1', name: 'Extra Cheese', price: 1.5 },
					{ modifierId: 'mod-2', name: 'Bacon', price: 2.0 },
				],
			});

			expect(item.modifierTotal).toBe(3.5);
			expect(item.total).toBe(15.5);
		});

		it('should recalculate order totals after adding item', async () => {
			const order = await service.createOrder({
				venueId: 'venue-1',
				serverId: 'user-1',
				orderType: 'dine_in' as const,
			});

			await service.addItemToOrder({
				orderId: order.id,
				menuItemId: 'item-1',
				name: 'Draft Beer',
				quantity: 2,
				price: 6.5,
			});

			const updated = await service.getOrder(order.id);
			expect(updated?.subtotal).toBe(13.0);
			expect(updated?.tax).toBeGreaterThan(0);
			expect(updated?.total).toBeGreaterThan(13.0);
		});
	});

	describe('updateOrderItem', () => {
		it('should update item quantity', async () => {
			const order = await service.createOrder({
				venueId: 'venue-1',
				serverId: 'user-1',
				orderType: 'bar' as const,
			});

			const item = await service.addItemToOrder({
				orderId: order.id,
				menuItemId: 'item-1',
				name: 'Draft Beer',
				quantity: 2,
				price: 6.5,
			});

			const updated = await service.updateOrderItem(item.id, { quantity: 3 });

			expect(updated.quantity).toBe(3);
			expect(updated.total).toBe(19.5);
		});

		it('should update item notes', async () => {
			const order = await service.createOrder({
				venueId: 'venue-1',
				serverId: 'user-1',
				orderType: 'dine_in' as const,
			});

			const item = await service.addItemToOrder({
				orderId: order.id,
				menuItemId: 'item-2',
				name: 'Burger',
				quantity: 1,
				price: 12.0,
			});

			const updated = await service.updateOrderItem(item.id, {
				notes: 'No pickles',
			});

			expect(updated.notes).toBe('No pickles');
		});

		it('should recalculate order totals after updating item', async () => {
			const order = await service.createOrder({
				venueId: 'venue-1',
				serverId: 'user-1',
				orderType: 'dine_in' as const,
			});

			const item = await service.addItemToOrder({
				orderId: order.id,
				menuItemId: 'item-1',
				name: 'Draft Beer',
				quantity: 2,
				price: 6.5,
			});

			await service.updateOrderItem(item.id, { quantity: 5 });

			const updated = await service.getOrder(order.id);
			expect(updated?.subtotal).toBe(32.5);
		});
	});

	describe('removeOrderItem', () => {
		it('should remove item from order', async () => {
			const order = await service.createOrder({
				venueId: 'venue-1',
				serverId: 'user-1',
				orderType: 'bar' as const,
			});

			const item = await service.addItemToOrder({
				orderId: order.id,
				menuItemId: 'item-1',
				name: 'Draft Beer',
				quantity: 2,
				price: 6.5,
			});

			await service.removeOrderItem(item.id);

			const updated = await service.getOrder(order.id);
			expect(updated?.subtotal).toBe(0);
			expect(updated?.total).toBe(0);
		});

		it('should recalculate order totals after removing item', async () => {
			const order = await service.createOrder({
				venueId: 'venue-1',
				serverId: 'user-1',
				orderType: 'dine_in' as const,
			});

			await service.addItemToOrder({
				orderId: order.id,
				menuItemId: 'item-1',
				name: 'Beer',
				quantity: 2,
				price: 6.5,
			});

			const item2 = await service.addItemToOrder({
				orderId: order.id,
				menuItemId: 'item-2',
				name: 'Burger',
				quantity: 1,
				price: 12.0,
			});

			await service.removeOrderItem(item2.id);

			const updated = await service.getOrder(order.id);
			expect(updated?.subtotal).toBe(13.0);
		});
	});

	describe('sendToKitchen', () => {
		it('should mark order as sent and update item status', async () => {
			const order = await service.createOrder({
				venueId: 'venue-1',
				serverId: 'user-1',
				orderType: 'dine_in' as const,
			});

			const _item = await service.addItemToOrder({
				orderId: order.id,
				menuItemId: 'item-1',
				name: 'Burger',
				quantity: 1,
				price: 12.0,
			});

			await service.sendToKitchen(order.id);

			const updated = await service.getOrder(order.id);
			expect(updated?.status).toBe('sent');

			const items = await service.getOrderItems(order.id);
			expect(items[0].status).toBe('sent');
			expect(items[0].sentToKitchenAt).toBeInstanceOf(Date);
		});

		it('should not send empty order', async () => {
			const order = await service.createOrder({
				venueId: 'venue-1',
				serverId: 'user-1',
				orderType: 'bar' as const,
			});

			await expect(service.sendToKitchen(order.id)).rejects.toThrow('Cannot send empty order');
		});
	});

	describe('applyDiscount', () => {
		it('should apply discount amount to order', async () => {
			const order = await service.createOrder({
				venueId: 'venue-1',
				serverId: 'user-1',
				orderType: 'bar' as const,
			});

			await service.addItemToOrder({
				orderId: order.id,
				menuItemId: 'item-1',
				name: 'Draft Beer',
				quantity: 2,
				price: 6.5,
			});

			const updated = await service.applyDiscount(order.id, 5.0);

			expect(updated.discount).toBe(5.0);
			expect(updated.total).toBeLessThan(updated.subtotal + updated.tax);
		});

		it('should not apply discount greater than subtotal', async () => {
			const order = await service.createOrder({
				venueId: 'venue-1',
				serverId: 'user-1',
				orderType: 'bar' as const,
			});

			await service.addItemToOrder({
				orderId: order.id,
				menuItemId: 'item-1',
				name: 'Beer',
				quantity: 1,
				price: 6.5,
			});

			await expect(service.applyDiscount(order.id, 20.0)).rejects.toThrow(
				'Discount cannot exceed subtotal'
			);
		});
	});

	describe('voidOrder', () => {
		it('should void an order', async () => {
			const order = await service.createOrder({
				venueId: 'venue-1',
				serverId: 'user-1',
				orderType: 'bar' as const,
			});

			await service.addItemToOrder({
				orderId: order.id,
				menuItemId: 'item-1',
				name: 'Beer',
				quantity: 1,
				price: 6.5,
			});

			const voided = await service.voidOrder(order.id);

			expect(voided.status).toBe('voided');
		});

		it('should not void completed order', async () => {
			const order = await service.createOrder({
				venueId: 'venue-1',
				serverId: 'user-1',
				orderType: 'bar' as const,
			});

			await service.addItemToOrder({
				orderId: order.id,
				menuItemId: 'item-1',
				name: 'Beer',
				quantity: 1,
				price: 6.5,
			});

			await service.completeOrder(order.id);

			await expect(service.voidOrder(order.id)).rejects.toThrow('Cannot void completed order');
		});
	});

	describe('completeOrder', () => {
		it('should complete an order', async () => {
			const order = await service.createOrder({
				venueId: 'venue-1',
				serverId: 'user-1',
				orderType: 'bar' as const,
			});

			await service.addItemToOrder({
				orderId: order.id,
				menuItemId: 'item-1',
				name: 'Beer',
				quantity: 1,
				price: 6.5,
			});

			const completed = await service.completeOrder(order.id);

			expect(completed.status).toBe('completed');
			expect(completed.completedAt).toBeInstanceOf(Date);
		});

		it('should not complete empty order', async () => {
			const order = await service.createOrder({
				venueId: 'venue-1',
				serverId: 'user-1',
				orderType: 'bar' as const,
			});

			await expect(service.completeOrder(order.id)).rejects.toThrow('Cannot complete empty order');
		});
	});

	describe('getOrder', () => {
		it('should retrieve order by id', async () => {
			const order = await service.createOrder({
				venueId: 'venue-1',
				serverId: 'user-1',
				orderType: 'bar' as const,
			});

			const retrieved = await service.getOrder(order.id);

			expect(retrieved).toBeDefined();
			expect(retrieved?.id).toBe(order.id);
		});

		it('should return null for non-existent order', async () => {
			const retrieved = await service.getOrder('non-existent');

			expect(retrieved).toBeNull();
		});
	});

	describe('getOrderItems', () => {
		it('should retrieve all items for an order', async () => {
			const order = await service.createOrder({
				venueId: 'venue-1',
				serverId: 'user-1',
				orderType: 'bar' as const,
			});

			await service.addItemToOrder({
				orderId: order.id,
				menuItemId: 'item-1',
				name: 'Beer',
				quantity: 2,
				price: 6.5,
			});

			await service.addItemToOrder({
				orderId: order.id,
				menuItemId: 'item-2',
				name: 'Wine',
				quantity: 1,
				price: 9.0,
			});

			const items = await service.getOrderItems(order.id);

			expect(items).toHaveLength(2);
			expect(items[0].name).toBe('Beer');
			expect(items[1].name).toBe('Wine');
		});
	});

	describe('getOpenOrdersByVenue', () => {
		it('should retrieve all open orders for a venue', async () => {
			await service.createOrder({
				venueId: 'venue-1',
				serverId: 'user-1',
				orderType: 'bar' as const,
			});

			await service.createOrder({
				venueId: 'venue-1',
				serverId: 'user-1',
				tableNumber: 5,
				orderType: 'dine_in' as const,
			});

			const openOrders = await service.getOpenOrdersByVenue('venue-1');

			expect(openOrders).toHaveLength(2);
			expect(openOrders.every(o => o.status === 'open')).toBe(true);
		});

		it('should not return completed orders', async () => {
			const order1 = await service.createOrder({
				venueId: 'venue-1',
				serverId: 'user-1',
				orderType: 'bar' as const,
			});

			await service.addItemToOrder({
				orderId: order1.id,
				menuItemId: 'item-1',
				name: 'Beer',
				quantity: 1,
				price: 6.5,
			});

			await service.completeOrder(order1.id);

			await service.createOrder({
				venueId: 'venue-1',
				serverId: 'user-1',
				orderType: 'bar' as const,
			});

			const openOrders = await service.getOpenOrdersByVenue('venue-1');

			expect(openOrders).toHaveLength(1);
		});
	});
});
