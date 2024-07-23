import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Database } from '../client';
import * as schema from '../schema';
import { TableService } from './table.service';

describe('TableService - TDD', () => {
	let db: Database;
	let service: TableService;
	let venueId: string;

	beforeEach(async () => {
		// Create fresh in-memory database
		const client = createClient({ url: ':memory:' });
		db = drizzle(client, { schema }) as Database;

		await client.execute('PRAGMA foreign_keys = ON');

		// Create test tables
		await client.execute(`
			CREATE TABLE venues (
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
			)
		`);

		await client.execute(`
			CREATE TABLE orders (
				id TEXT PRIMARY KEY,
				order_number INTEGER NOT NULL,
				venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
				server_id TEXT NOT NULL,
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
			CREATE TABLE tables (
				id TEXT PRIMARY KEY,
				venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
				table_number INTEGER NOT NULL,
				section_name TEXT NOT NULL,
				capacity INTEGER NOT NULL DEFAULT 4,
				status TEXT NOT NULL DEFAULT 'available',
				current_order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
				notes TEXT,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			)
		`);

		// Create test venue
		venueId = 'test-venue-1';
		await db.insert(schema.venues).values({
			id: venueId,
			name: 'Test Restaurant',
			slug: 'test-restaurant',
			email: 'test@restaurant.com',
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		// Initialize service
		service = new TableService(db);
	});

	describe('Table Management', () => {
		describe('createTable', () => {
			it('should create a new table with required fields', async () => {
				const table = await service.createTable({
					venueId,
					tableNumber: 5,
					sectionName: 'dining',
				});

				expect(table.id).toBeDefined();
				expect(table.tableNumber).toBe(5);
				expect(table.sectionName).toBe('dining');
				expect(table.capacity).toBe(4); // Default
				expect(table.status).toBe('available'); // Default
			});

			it('should create table with custom capacity', async () => {
				const table = await service.createTable({
					venueId,
					tableNumber: 10,
					sectionName: 'private',
					capacity: 8,
				});

				expect(table.capacity).toBe(8);
			});

			it('should create table with notes', async () => {
				const table = await service.createTable({
					venueId,
					tableNumber: 3,
					sectionName: 'patio',
					notes: 'Window seat',
				});

				expect(table.notes).toBe('Window seat');
			});

			it('should prevent duplicate table numbers in same venue', async () => {
				await service.createTable({
					venueId,
					tableNumber: 1,
					sectionName: 'bar',
				});

				// Duplicate table number should fail (enforce unique constraint)
				await expect(
					service.createTable({
						venueId,
						tableNumber: 1,
						sectionName: 'dining',
					})
				).rejects.toThrow();
			});
		});

		describe('getTableById', () => {
			it('should retrieve a table by id', async () => {
				const created = await service.createTable({
					venueId,
					tableNumber: 7,
					sectionName: 'dining',
				});

				const retrieved = await service.getTableById(created.id);

				expect(retrieved).toBeDefined();
				expect(retrieved?.id).toBe(created.id);
				expect(retrieved?.tableNumber).toBe(7);
			});

			it('should return null for non-existent table', async () => {
				const table = await service.getTableById('non-existent-id');
				expect(table).toBeNull();
			});
		});

		describe('listTables', () => {
			it('should list all tables for a venue', async () => {
				await service.createTable({
					venueId,
					tableNumber: 1,
					sectionName: 'bar',
				});

				await service.createTable({
					venueId,
					tableNumber: 2,
					sectionName: 'dining',
				});

				const tables = await service.listTables(venueId);

				expect(tables).toHaveLength(2);
			});

			it('should filter tables by section', async () => {
				await service.createTable({
					venueId,
					tableNumber: 1,
					sectionName: 'bar',
				});

				await service.createTable({
					venueId,
					tableNumber: 2,
					sectionName: 'dining',
				});

				await service.createTable({
					venueId,
					tableNumber: 3,
					sectionName: 'bar',
				});

				const barTables = await service.listTables(venueId, { section: 'bar' });

				expect(barTables).toHaveLength(2);
				expect(barTables.every(t => t.sectionName === 'bar')).toBe(true);
			});

			it('should filter tables by status', async () => {
				await service.createTable({
					venueId,
					tableNumber: 1,
					sectionName: 'dining',
				});

				const table2 = await service.createTable({
					venueId,
					tableNumber: 2,
					sectionName: 'dining',
				});

				// Mark table 2 as occupied
				await service.updateTableStatus(table2.id, 'occupied');

				const availableTables = await service.listTables(venueId, { status: 'available' });

				expect(availableTables).toHaveLength(1);
				expect(availableTables[0].tableNumber).toBe(1);
			});
		});

		describe('updateTable', () => {
			it('should update table properties', async () => {
				const table = await service.createTable({
					venueId,
					tableNumber: 5,
					sectionName: 'dining',
					capacity: 4,
				});

				const updated = await service.updateTable(table.id, {
					capacity: 6,
					notes: 'Large booth',
				});

				expect(updated.capacity).toBe(6);
				expect(updated.notes).toBe('Large booth');
			});
		});

		describe('deleteTable', () => {
			it('should delete a table', async () => {
				const table = await service.createTable({
					venueId,
					tableNumber: 99,
					sectionName: 'patio',
				});

				await service.deleteTable(table.id);

				const retrieved = await service.getTableById(table.id);
				expect(retrieved).toBeNull();
			});

			it('should prevent deleting table with active order', async () => {
				const table = await service.createTable({
					venueId,
					tableNumber: 10,
					sectionName: 'dining',
				});

				// Create an order for this table
				const [order] = await db
					.insert(schema.orders)
					.values({
						id: 'order-1',
						venueId,
						serverId: 'server-1',
						orderNumber: 1,
						tableNumber: table.tableNumber,
						orderType: 'dine_in',
						status: 'open',
						createdAt: new Date(),
						updatedAt: new Date(),
					})
					.returning();

				// Associate order with table
				await service.updateTableStatus(table.id, 'occupied', order.id);

				await expect(service.deleteTable(table.id)).rejects.toThrow(
					'Cannot delete table with active order'
				);
			});
		});
	});

	describe('Status Management', () => {
		describe('updateTableStatus', () => {
			it('should update table status to occupied', async () => {
				const table = await service.createTable({
					venueId,
					tableNumber: 5,
					sectionName: 'dining',
				});

				const updated = await service.updateTableStatus(table.id, 'occupied');

				expect(updated.status).toBe('occupied');
			});

			it('should update table status to reserved', async () => {
				const table = await service.createTable({
					venueId,
					tableNumber: 8,
					sectionName: 'dining',
				});

				const updated = await service.updateTableStatus(table.id, 'reserved');

				expect(updated.status).toBe('reserved');
			});

			it('should update table status to dirty', async () => {
				const table = await service.createTable({
					venueId,
					tableNumber: 3,
					sectionName: 'dining',
				});

				await service.updateTableStatus(table.id, 'occupied');
				const updated = await service.updateTableStatus(table.id, 'dirty');

				expect(updated.status).toBe('dirty');
			});

			it('should associate order when status becomes occupied', async () => {
				const table = await service.createTable({
					venueId,
					tableNumber: 6,
					sectionName: 'dining',
				});

				// Create an order
				const [order] = await db
					.insert(schema.orders)
					.values({
						id: 'order-1',
						venueId,
						serverId: 'server-1',
						orderNumber: 1,
						tableNumber: table.tableNumber,
						orderType: 'dine_in',
						status: 'open',
						createdAt: new Date(),
						updatedAt: new Date(),
					})
					.returning();

				const updated = await service.updateTableStatus(table.id, 'occupied', order.id);

				expect(updated.status).toBe('occupied');
				expect(updated.currentOrderId).toBe(order.id);
			});

			it('should clear order when status becomes available', async () => {
				const table = await service.createTable({
					venueId,
					tableNumber: 7,
					sectionName: 'dining',
				});

				// Create and associate order
				const [order] = await db
					.insert(schema.orders)
					.values({
						id: 'order-2',
						venueId,
						serverId: 'server-1',
						orderNumber: 2,
						tableNumber: table.tableNumber,
						orderType: 'dine_in',
						status: 'open',
						createdAt: new Date(),
						updatedAt: new Date(),
					})
					.returning();

				await service.updateTableStatus(table.id, 'occupied', order.id);

				// Release table
				const updated = await service.updateTableStatus(table.id, 'available');

				expect(updated.status).toBe('available');
				expect(updated.currentOrderId).toBeNull();
			});
		});

		describe('occupyTable', () => {
			it('should occupy table with order assignment', async () => {
				const table = await service.createTable({
					venueId,
					tableNumber: 12,
					sectionName: 'dining',
				});

				const [order] = await db
					.insert(schema.orders)
					.values({
						id: 'order-3',
						venueId,
						serverId: 'server-1',
						orderNumber: 3,
						tableNumber: table.tableNumber,
						orderType: 'dine_in',
						status: 'open',
						createdAt: new Date(),
						updatedAt: new Date(),
					})
					.returning();

				const occupied = await service.occupyTable(table.id, order.id);

				expect(occupied.status).toBe('occupied');
				expect(occupied.currentOrderId).toBe(order.id);
			});

			it('should prevent occupying already occupied table', async () => {
				const table = await service.createTable({
					venueId,
					tableNumber: 15,
					sectionName: 'dining',
				});

				const [order1] = await db
					.insert(schema.orders)
					.values({
						id: 'order-4',
						venueId,
						serverId: 'server-1',
						orderNumber: 4,
						tableNumber: table.tableNumber,
						orderType: 'dine_in',
						status: 'open',
						createdAt: new Date(),
						updatedAt: new Date(),
					})
					.returning();

				await service.occupyTable(table.id, order1.id);

				await expect(service.occupyTable(table.id, 'order-5')).rejects.toThrow(
					'Table is already occupied'
				);
			});
		});

		describe('releaseTable', () => {
			it('should release occupied table', async () => {
				const table = await service.createTable({
					venueId,
					tableNumber: 20,
					sectionName: 'dining',
				});

				const [order] = await db
					.insert(schema.orders)
					.values({
						id: 'order-6',
						venueId,
						serverId: 'server-1',
						orderNumber: 6,
						tableNumber: table.tableNumber,
						orderType: 'dine_in',
						status: 'open',
						createdAt: new Date(),
						updatedAt: new Date(),
					})
					.returning();

				await service.occupyTable(table.id, order.id);
				const released = await service.releaseTable(table.id);

				expect(released.status).toBe('available');
				expect(released.currentOrderId).toBeNull();
			});
		});
	});

	describe('Section Management', () => {
		describe('getTablesBySection', () => {
			it('should retrieve all tables in a section', async () => {
				await service.createTable({ venueId, tableNumber: 1, sectionName: 'bar' });
				await service.createTable({ venueId, tableNumber: 2, sectionName: 'bar' });
				await service.createTable({ venueId, tableNumber: 3, sectionName: 'dining' });

				const barTables = await service.getTablesBySection(venueId, 'bar');

				expect(barTables).toHaveLength(2);
			});
		});

		describe('getAvailableTables', () => {
			it('should return only available tables', async () => {
				const table1 = await service.createTable({
					venueId,
					tableNumber: 1,
					sectionName: 'dining',
				});

				await service.createTable({
					venueId,
					tableNumber: 2,
					sectionName: 'dining',
				});

				const table3 = await service.createTable({
					venueId,
					tableNumber: 3,
					sectionName: 'dining',
				});

				// Occupy table 1
				await service.updateTableStatus(table1.id, 'occupied');

				// Reserve table 3
				await service.updateTableStatus(table3.id, 'reserved');

				const available = await service.getAvailableTables(venueId);

				expect(available).toHaveLength(1);
				expect(available[0].tableNumber).toBe(2);
			});

			it('should filter available tables by section', async () => {
				await service.createTable({ venueId, tableNumber: 1, sectionName: 'bar' });
				await service.createTable({ venueId, tableNumber: 2, sectionName: 'dining' });

				const table3 = await service.createTable({
					venueId,
					tableNumber: 3,
					sectionName: 'dining',
				});

				await service.updateTableStatus(table3.id, 'occupied');

				const availableDining = await service.getAvailableTables(venueId, 'dining');

				expect(availableDining).toHaveLength(1);
				expect(availableDining[0].tableNumber).toBe(2);
			});

			it('should filter available tables by minimum capacity', async () => {
				await service.createTable({
					venueId,
					tableNumber: 1,
					sectionName: 'dining',
					capacity: 2,
				});

				await service.createTable({
					venueId,
					tableNumber: 2,
					sectionName: 'dining',
					capacity: 4,
				});

				await service.createTable({
					venueId,
					tableNumber: 3,
					sectionName: 'dining',
					capacity: 8,
				});

				const largeTables = await service.getAvailableTables(venueId, undefined, 6);

				expect(largeTables).toHaveLength(1);
				expect(largeTables[0].capacity).toBe(8);
			});
		});
	});

	describe('Order Association', () => {
		describe('getTableWithCurrentOrder', () => {
			it('should retrieve table with current order details', async () => {
				const table = await service.createTable({
					venueId,
					tableNumber: 25,
					sectionName: 'dining',
				});

				const [order] = await db
					.insert(schema.orders)
					.values({
						id: 'order-10',
						venueId,
						serverId: 'server-1',
						orderNumber: 10,
						tableNumber: table.tableNumber,
						orderType: 'dine_in',
						status: 'open',
						total: 45.99,
						createdAt: new Date(),
						updatedAt: new Date(),
					})
					.returning();

				await service.occupyTable(table.id, order.id);

				const tableWithOrder = await service.getTableWithCurrentOrder(table.id);

				expect(tableWithOrder).toBeDefined();
				expect(tableWithOrder?.currentOrderId).toBe(order.id);
			});
		});

		describe('transferOrder', () => {
			it('should transfer order from one table to another', async () => {
				const table1 = await service.createTable({
					venueId,
					tableNumber: 30,
					sectionName: 'dining',
				});

				const table2 = await service.createTable({
					venueId,
					tableNumber: 31,
					sectionName: 'dining',
				});

				const [order] = await db
					.insert(schema.orders)
					.values({
						id: 'order-11',
						venueId,
						serverId: 'server-1',
						orderNumber: 11,
						tableNumber: table1.tableNumber,
						orderType: 'dine_in',
						status: 'open',
						createdAt: new Date(),
						updatedAt: new Date(),
					})
					.returning();

				await service.occupyTable(table1.id, order.id);

				await service.transferOrder(table1.id, table2.id);

				const sourceTable = await service.getTableById(table1.id);
				const destTable = await service.getTableById(table2.id);

				expect(sourceTable?.status).toBe('available');
				expect(sourceTable?.currentOrderId).toBeNull();
				expect(destTable?.status).toBe('occupied');
				expect(destTable?.currentOrderId).toBe(order.id);
			});

			it('should prevent transferring to occupied table', async () => {
				const table1 = await service.createTable({
					venueId,
					tableNumber: 40,
					sectionName: 'dining',
				});

				const table2 = await service.createTable({
					venueId,
					tableNumber: 41,
					sectionName: 'dining',
				});

				const [order1] = await db
					.insert(schema.orders)
					.values({
						id: 'order-12',
						venueId,
						serverId: 'server-1',
						orderNumber: 12,
						tableNumber: table1.tableNumber,
						orderType: 'dine_in',
						status: 'open',
						createdAt: new Date(),
						updatedAt: new Date(),
					})
					.returning();

				const [order2] = await db
					.insert(schema.orders)
					.values({
						id: 'order-13',
						venueId,
						serverId: 'server-2',
						orderNumber: 13,
						tableNumber: table2.tableNumber,
						orderType: 'dine_in',
						status: 'open',
						createdAt: new Date(),
						updatedAt: new Date(),
					})
					.returning();

				await service.occupyTable(table1.id, order1.id);
				await service.occupyTable(table2.id, order2.id);

				await expect(service.transferOrder(table1.id, table2.id)).rejects.toThrow(
					'Destination table is not available'
				);
			});
		});
	});
});
