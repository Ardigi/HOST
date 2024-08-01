import type { Database } from '@host/database';
import * as schema from '@host/database/schema';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Context } from '../trpc';
import { orderRouter } from './order.router';

/**
 * Order Workflow Integration Tests
 * Tests the full stack: tRPC API → Direct DB queries → Database
 * Uses real in-memory SQLite database (not mocks)
 */
describe('Order Workflow Integration Tests', () => {
	let db: Database;
	let venueId: string;
	let userId: string;
	let categoryId: string;
	let menuItemId: string;
	let modifierGroupId: string;
	let modifierId: string;

	/**
	 * Create authenticated test context
	 */
	function createIntegrationContext(): Context {
		return {
			db,
			user: {
				id: userId,
				email: 'test@example.com',
				firstName: 'Test',
				lastName: 'Server',
				venueId,
				roles: ['server'],
			},
			// biome-ignore lint/suspicious/noExplicitAny: Integration test context doesn't use all services
			menuService: null as any, // Not used in order router
			// biome-ignore lint/suspicious/noExplicitAny: Integration test context doesn't use all services
			orderService: null as any, // Not used yet (TODO in router)
		};
	}

	beforeEach(async () => {
		// Create fresh in-memory database
		const client = createClient({ url: ':memory:' });
		db = drizzle(client, { schema }) as Database;

		await client.execute('PRAGMA foreign_keys = ON');

		// Create all required tables
		await client.batch([
			`CREATE TABLE IF NOT EXISTS venues (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				slug TEXT NOT NULL UNIQUE,
				email TEXT NOT NULL,
				phone TEXT,
				address TEXT,
				city TEXT,
				state TEXT,
				zip_code TEXT,
				country TEXT DEFAULT 'US',
				timezone TEXT DEFAULT 'America/New_York',
				currency TEXT DEFAULT 'USD',
				tax_rate INTEGER NOT NULL DEFAULT 825,
				is_active INTEGER NOT NULL DEFAULT 1,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			)`,
			`CREATE TABLE IF NOT EXISTS users (
				id TEXT PRIMARY KEY,
				keycloak_id TEXT NOT NULL UNIQUE,
				email TEXT NOT NULL UNIQUE,
				first_name TEXT NOT NULL,
				last_name TEXT NOT NULL,
				phone TEXT,
				venue_id TEXT NOT NULL,
				role TEXT NOT NULL DEFAULT 'server',
				pin_code_hash TEXT,
				is_active INTEGER NOT NULL DEFAULT 1,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL,
				FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
			)`,
			`CREATE TABLE IF NOT EXISTS tables (
				id TEXT PRIMARY KEY,
				venue_id TEXT NOT NULL,
				table_number INTEGER NOT NULL,
				section_name TEXT NOT NULL,
				capacity INTEGER NOT NULL DEFAULT 4,
				status TEXT NOT NULL DEFAULT 'available',
				current_order_id TEXT,
				notes TEXT,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL,
				FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
			)`,
			`CREATE TABLE IF NOT EXISTS menu_categories (
				id TEXT PRIMARY KEY,
				venue_id TEXT NOT NULL,
				name TEXT NOT NULL,
				slug TEXT NOT NULL,
				description TEXT,
				display_order INTEGER NOT NULL DEFAULT 0,
				is_active INTEGER NOT NULL DEFAULT 1,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL,
				FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
			)`,
			`CREATE TABLE IF NOT EXISTS menu_items (
				id TEXT PRIMARY KEY,
				venue_id TEXT NOT NULL,
				category_id TEXT NOT NULL,
				name TEXT NOT NULL,
				slug TEXT NOT NULL,
				description TEXT,
				price REAL NOT NULL,
				image_url TEXT,
				calories INTEGER,
				is_vegetarian INTEGER NOT NULL DEFAULT 0,
				is_vegan INTEGER NOT NULL DEFAULT 0,
				is_gluten_free INTEGER NOT NULL DEFAULT 0,
				preparation_time INTEGER,
				display_order INTEGER NOT NULL DEFAULT 0,
				is_active INTEGER NOT NULL DEFAULT 1,
				is_available INTEGER NOT NULL DEFAULT 1,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL,
				FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
				FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
			)`,
			`CREATE TABLE IF NOT EXISTS menu_modifier_groups (
				id TEXT PRIMARY KEY,
				venue_id TEXT NOT NULL,
				name TEXT NOT NULL,
				display_order INTEGER NOT NULL,
				selection_type TEXT NOT NULL,
				is_required INTEGER NOT NULL DEFAULT 0,
				min_selections INTEGER,
				max_selections INTEGER,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL,
				FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
			)`,
			`CREATE TABLE IF NOT EXISTS menu_modifiers (
				id TEXT PRIMARY KEY,
				group_id TEXT NOT NULL,
				name TEXT NOT NULL,
				price_adjustment REAL NOT NULL,
				display_order INTEGER NOT NULL,
				is_active INTEGER NOT NULL DEFAULT 1,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL,
				FOREIGN KEY (group_id) REFERENCES menu_modifier_groups(id) ON DELETE CASCADE
			)`,
			`CREATE TABLE IF NOT EXISTS orders (
				id TEXT PRIMARY KEY,
				venue_id TEXT NOT NULL,
				table_number INTEGER,
				server_id TEXT NOT NULL,
				order_number INTEGER NOT NULL,
				status TEXT NOT NULL DEFAULT 'open',
				order_type TEXT NOT NULL DEFAULT 'dine_in',
				guest_count INTEGER DEFAULT 1,
				subtotal REAL NOT NULL DEFAULT 0,
				tax REAL NOT NULL DEFAULT 0,
				tip REAL DEFAULT 0,
				discount REAL DEFAULT 0,
				total REAL NOT NULL DEFAULT 0,
				notes TEXT,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL,
				completed_at INTEGER,
				FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
				FOREIGN KEY (server_id) REFERENCES users(id)
			)`,
			`CREATE TABLE IF NOT EXISTS order_items (
				id TEXT PRIMARY KEY,
				order_id TEXT NOT NULL,
				menu_item_id TEXT NOT NULL,
				name TEXT NOT NULL,
				quantity INTEGER NOT NULL DEFAULT 1,
				price REAL NOT NULL,
				modifier_total REAL NOT NULL DEFAULT 0,
				total REAL NOT NULL,
				notes TEXT,
				status TEXT NOT NULL DEFAULT 'pending',
				sent_to_kitchen_at INTEGER,
				created_at INTEGER NOT NULL,
				FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
				FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
			)`,
			`CREATE TABLE IF NOT EXISTS order_item_modifiers (
				id TEXT PRIMARY KEY,
				order_item_id TEXT NOT NULL,
				modifier_id TEXT NOT NULL,
				name TEXT NOT NULL,
				price REAL NOT NULL DEFAULT 0,
				quantity INTEGER NOT NULL DEFAULT 1,
				FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
				FOREIGN KEY (modifier_id) REFERENCES menu_modifiers(id)
			)`,
		]);

		// Create test data
		const [venue] = await db
			.insert(schema.venues)
			.values({
				id: 'venue-1',
				name: 'Test Restaurant',
				slug: 'test-restaurant',
				email: 'venue@example.com',
				taxRate: 825,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();
		venueId = venue.id;

		const [user] = await db
			.insert(schema.users)
			.values({
				id: 'user-1',
				keycloakId: 'keycloak-123',
				email: 'test@example.com',
				firstName: 'Test',
				lastName: 'Server',
				venueId,
				role: 'server',
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();
		userId = user.id;

		// Create menu category
		const [category] = await db
			.insert(schema.menuCategories)
			.values({
				id: 'category-1',
				venueId,
				name: 'Burgers',
				slug: 'burgers',
				displayOrder: 0,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();
		categoryId = category.id;

		// Create menu item
		const [menuItem] = await db
			.insert(schema.menuItems)
			.values({
				id: 'item-1',
				venueId,
				categoryId,
				name: 'Cheeseburger',
				slug: 'cheeseburger',
				price: 12.99,
				displayOrder: 0,
				isActive: true,
				isAvailable: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();
		menuItemId = menuItem.id;

		// Create modifier group
		const [modifierGroup] = await db
			.insert(schema.menuModifierGroups)
			.values({
				id: 'group-1',
				venueId,
				name: 'Add Ons',
				selectionType: 'multiple',
				displayOrder: 0,
				isRequired: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();
		modifierGroupId = modifierGroup.id;

		// Create modifier
		const [modifier] = await db
			.insert(schema.menuModifiers)
			.values({
				id: 'modifier-1',
				groupId: modifierGroupId,
				name: 'Bacon',
				priceAdjustment: 2.0,
				displayOrder: 0,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();
		modifierId = modifier.id;
	});

	// ===== Order Creation Workflow =====

	describe('Order Creation Workflow', () => {
		it('should create new dine-in order with auto-generated order number', async () => {
			const caller = orderRouter.createCaller(createIntegrationContext());

			const order = await caller.create({
				venueId,
				tableNumber: 5,
				guestCount: 4,
				orderType: 'dine_in',
			});

			expect(order.id).toBeDefined();
			expect(order.orderNumber).toBe(1); // First order of the day
			expect(order.tableNumber).toBe(5);
			expect(order.guestCount).toBe(4);
			expect(order.orderType).toBe('dine_in');
			expect(order.status).toBe('open');
			expect(order.serverId).toBe(userId);
		});

		it('should auto-increment order number for same venue on same day', async () => {
			const caller = orderRouter.createCaller(createIntegrationContext());

			const order1 = await caller.create({
				venueId,
				tableNumber: 1,
			});

			const order2 = await caller.create({
				venueId,
				tableNumber: 2,
			});

			expect(order1.orderNumber).toBe(1);
			expect(order2.orderNumber).toBe(2);
		});

		it('should support different order types', async () => {
			const caller = orderRouter.createCaller(createIntegrationContext());

			const dineIn = await caller.create({
				venueId,
				tableNumber: 5,
				orderType: 'dine_in',
			});

			const takeout = await caller.create({
				venueId,
				tableNumber: 99, // Takeout counter number
				orderType: 'takeout',
			});

			expect(dineIn.orderType).toBe('dine_in');
			expect(takeout.orderType).toBe('takeout');
		});
	});

	// ===== Adding Items Workflow =====

	describe('Adding Items to Order', () => {
		it('should add single item to order without modifiers', async () => {
			const caller = orderRouter.createCaller(createIntegrationContext());

			// Create order
			const order = await caller.create({
				venueId,
				tableNumber: 5,
			});

			// Add items
			const result = await caller.addItems({
				orderId: order.id,
				items: [
					{
						menuItemId,
						quantity: 2,
					},
				],
			});

			expect(result.orderItems).toHaveLength(1);
			expect(result.orderItems[0].menuItemId).toBe(menuItemId);
			expect(result.orderItems[0].quantity).toBe(2);
			expect(result.orderItems[0].price).toBe(12.99);
			expect(result.orderItems[0].modifierTotal).toBe(0);
			expect(result.orderItems[0].total).toBe(12.99 * 2);
		});

		it('should add item with modifiers and calculate correct totals', async () => {
			const caller = orderRouter.createCaller(createIntegrationContext());

			const order = await caller.create({
				venueId,
				tableNumber: 5,
			});

			const result = await caller.addItems({
				orderId: order.id,
				items: [
					{
						menuItemId,
						quantity: 1,
						modifiers: [
							{
								modifierId,
								quantity: 2, // 2x bacon
							},
						],
					},
				],
			});

			const orderItem = result.orderItems[0];

			// Item price: 12.99
			// Modifier total: 2.00 * 2 = 4.00
			// Item total: (12.99 + 4.00) * 1 = 16.99
			expect(orderItem.price).toBeCloseTo(12.99, 2);
			expect(orderItem.modifierTotal).toBeCloseTo(4.0, 2);
			expect(orderItem.total).toBeCloseTo(16.99, 2);
		});

		it('should add multiple items in single request', async () => {
			const caller = orderRouter.createCaller(createIntegrationContext());

			const order = await caller.create({
				venueId,
				tableNumber: 5,
			});

			// Create second menu item
			const [item2] = await db
				.insert(schema.menuItems)
				.values({
					id: 'item-2',
					venueId,
					categoryId,
					name: 'Fries',
					slug: 'fries',
					price: 4.99,
					displayOrder: 1,
					isActive: true,
					isAvailable: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			const result = await caller.addItems({
				orderId: order.id,
				items: [
					{ menuItemId, quantity: 1 },
					{ menuItemId: item2.id, quantity: 2 },
				],
			});

			expect(result.orderItems).toHaveLength(2);
			expect(result.orderItems[0].name).toBe('Cheeseburger');
			expect(result.orderItems[1].name).toBe('Fries');
		});

		it('should include special instructions with order item', async () => {
			const caller = orderRouter.createCaller(createIntegrationContext());

			const order = await caller.create({
				venueId,
				tableNumber: 5,
			});

			const result = await caller.addItems({
				orderId: order.id,
				items: [
					{
						menuItemId,
						quantity: 1,
						notes: 'No onions, extra pickles',
					},
				],
			});

			expect(result.orderItems[0].notes).toBe('No onions, extra pickles');
		});

		it('should reject adding items to non-existent order', async () => {
			const caller = orderRouter.createCaller(createIntegrationContext());

			await expect(
				caller.addItems({
					orderId: 'non-existent-order',
					items: [{ menuItemId, quantity: 1 }],
				})
			).rejects.toThrow('Order not found');
		});

		it('should reject adding items to completed order', async () => {
			const caller = orderRouter.createCaller(createIntegrationContext());

			const order = await caller.create({
				venueId,
				tableNumber: 5,
			});

			// Complete the order
			await caller.updateStatus({
				orderId: order.id,
				status: 'completed',
			});

			// Try to add items to completed order
			await expect(
				caller.addItems({
					orderId: order.id,
					items: [{ menuItemId, quantity: 1 }],
				})
			).rejects.toThrow('Cannot add items to a closed order');
		});

		it('should reject adding non-existent menu item', async () => {
			const caller = orderRouter.createCaller(createIntegrationContext());

			const order = await caller.create({
				venueId,
				tableNumber: 5,
			});

			await expect(
				caller.addItems({
					orderId: order.id,
					items: [{ menuItemId: 'non-existent-item', quantity: 1 }],
				})
			).rejects.toThrow('Menu item non-existent-item not found');
		});
	});

	// ===== Order Status Management =====

	describe('Order Status Management', () => {
		it('should update order status from open to sent', async () => {
			const caller = orderRouter.createCaller(createIntegrationContext());

			const order = await caller.create({
				venueId,
				tableNumber: 5,
			});

			const updated = await caller.updateStatus({
				orderId: order.id,
				status: 'sent',
			});

			expect(updated.status).toBe('sent');
		});

		it('should set completedAt timestamp when completing order', async () => {
			const caller = orderRouter.createCaller(createIntegrationContext());

			const order = await caller.create({
				venueId,
				tableNumber: 5,
			});

			const updated = await caller.updateStatus({
				orderId: order.id,
				status: 'completed',
			});

			expect(updated.status).toBe('completed');
			expect(updated.completedAt).toBeInstanceOf(Date);
		});

		it('should support all order status transitions', async () => {
			const caller = orderRouter.createCaller(createIntegrationContext());

			const order = await caller.create({
				venueId,
				tableNumber: 5,
			});

			// Open -> Sent -> Completed
			const sent = await caller.updateStatus({ orderId: order.id, status: 'sent' });
			expect(sent.status).toBe('sent');

			const completed = await caller.updateStatus({ orderId: order.id, status: 'completed' });
			expect(completed.status).toBe('completed');
		});

		it('should support voiding orders', async () => {
			const caller = orderRouter.createCaller(createIntegrationContext());

			const order = await caller.create({
				venueId,
				tableNumber: 5,
			});

			const voided = await caller.updateStatus({
				orderId: order.id,
				status: 'voided',
			});

			expect(voided.status).toBe('voided');
		});
	});

	// ===== Order Listing & Filtering =====

	describe('Order Listing and Filtering', () => {
		it('should list all orders for venue', async () => {
			const caller = orderRouter.createCaller(createIntegrationContext());

			// Create multiple orders
			await caller.create({ venueId, tableNumber: 1 });
			await caller.create({ venueId, tableNumber: 2 });
			await caller.create({ venueId, tableNumber: 3 });

			const result = await caller.list({ venueId });

			expect(result.orders).toHaveLength(3);
			expect(result.total).toBe(3);
		});

		it('should filter orders by status', async () => {
			const caller = orderRouter.createCaller(createIntegrationContext());

			const _order1 = await caller.create({ venueId, tableNumber: 1 });
			const order2 = await caller.create({ venueId, tableNumber: 2 });

			await caller.updateStatus({ orderId: order2.id, status: 'completed' });

			// List only open orders
			const openOrders = await caller.list({
				venueId,
				status: 'open',
			});

			expect(openOrders.orders).toHaveLength(1);
			expect(openOrders.orders[0].status).toBe('open');

			// List only completed orders
			const completedOrders = await caller.list({
				venueId,
				status: 'completed',
			});

			expect(completedOrders.orders).toHaveLength(1);
			expect(completedOrders.orders[0].status).toBe('completed');
		});

		it('should get single order by ID with full details', async () => {
			const caller = orderRouter.createCaller(createIntegrationContext());

			const order = await caller.create({ venueId, tableNumber: 5 });

			await caller.addItems({
				orderId: order.id,
				items: [
					{
						menuItemId,
						quantity: 1,
						modifiers: [{ modifierId, quantity: 1 }],
					},
				],
			});

			const retrieved = await caller.getById({ id: order.id });

			expect(retrieved.id).toBe(order.id);
			expect(retrieved.items).toHaveLength(1);
			expect(retrieved.items[0].modifiers).toHaveLength(1);
			expect(retrieved.server).toBeDefined();
			expect(retrieved.venue).toBeDefined();
		});

		it('should throw NOT_FOUND when getting non-existent order', async () => {
			const caller = orderRouter.createCaller(createIntegrationContext());

			await expect(caller.getById({ id: 'non-existent' })).rejects.toThrow('Order not found');
		});
	});

	// ===== Multi-Venue Isolation =====

	describe('Multi-Venue Data Isolation', () => {
		it('should isolate orders by venue', async () => {
			const caller = orderRouter.createCaller(createIntegrationContext());

			// Create second venue
			const [venue2] = await db
				.insert(schema.venues)
				.values({
					id: 'venue-2',
					name: 'Second Restaurant',
					slug: 'second-restaurant',
					email: 'venue2@example.com',
					taxRate: 825,
					isActive: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			// Create order for venue 1
			await caller.create({
				venueId,
				tableNumber: 5,
			});

			// Create caller for venue 2
			const baseContext = createIntegrationContext();
			const caller2 = orderRouter.createCaller({
				...baseContext,
				user: {
					...baseContext.user,
					venueId: venue2.id,
				},
			});

			// Create order for venue 2
			await caller2.create({
				venueId: venue2.id,
				tableNumber: 5,
			});

			// List orders for venue 1 - should only see venue 1 orders
			const venue1Orders = await caller.list({ venueId });
			expect(venue1Orders.orders).toHaveLength(1);
			expect(venue1Orders.orders[0].venueId).toBe(venueId);

			// List orders for venue 2 - should only see venue 2 orders
			const venue2Orders = await caller2.list({ venueId: venue2.id });
			expect(venue2Orders.orders).toHaveLength(1);
			expect(venue2Orders.orders[0].venueId).toBe(venue2.id);
		});
	});

	// ===== Table Listing =====

	describe('Table Listing', () => {
		it('should list all tables for venue', async () => {
			const caller = orderRouter.createCaller(createIntegrationContext());

			// Create tables
			await db.insert(schema.tables).values([
				{
					id: 'table-1',
					venueId,
					tableNumber: 1,
					sectionName: 'dining',
					capacity: 4,
					status: 'available',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: 'table-2',
					venueId,
					tableNumber: 2,
					sectionName: 'dining',
					capacity: 2,
					status: 'available',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			]);

			const result = await caller.listTables({ venueId });

			expect(result.tables).toHaveLength(2);
			expect(result.tables[0].tableNumber).toBe(1);
			expect(result.tables[1].tableNumber).toBe(2);
		});
	});
});
