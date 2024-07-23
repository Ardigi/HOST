/**
 * Tables Schema Tests
 * Validates schema structure, constraints, and relationships
 */

import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanupTestDatabase, createTestDatabase } from '../../../../test/helpers/db-test';
import type { Database } from '../client';
import { orders } from './orders';
import { tables } from './tables';
import { venues } from './venues';

describe('Tables Schema', () => {
	let db: Database;
	const venueId = 'venue-1'; // Pre-created in createTables

	beforeEach(async () => {
		db = await createTestDatabase();
	});

	afterEach(async () => {
		await cleanupTestDatabase(db);
	});

	describe('Tables Table', () => {
		it('should create a table with required fields', async () => {
			const [table] = await db
				.insert(tables)
				.values({
					venueId,
					tableNumber: 5,
					sectionName: 'dining',
				})
				.returning();

			expect(table.id).toBeDefined();
			expect(table.venueId).toBe(venueId);
			expect(table.tableNumber).toBe(5);
			expect(table.sectionName).toBe('dining');
		});

		it('should generate unique CUID2 for id', async () => {
			const [table1] = await db
				.insert(tables)
				.values({
					venueId,
					tableNumber: 1,
					sectionName: 'bar',
				})
				.returning();

			const [table2] = await db
				.insert(tables)
				.values({
					venueId,
					tableNumber: 2,
					sectionName: 'dining',
				})
				.returning();

			expect(table1.id).not.toBe(table2.id);
			expect(table1.id).toMatch(/^[a-z0-9]{24,32}$/); // CUID2 format
			expect(table2.id).toMatch(/^[a-z0-9]{24,32}$/);
		});

		it('should set default values correctly', async () => {
			const [table] = await db
				.insert(tables)
				.values({
					venueId,
					tableNumber: 10,
					sectionName: 'patio',
				})
				.returning();

			expect(table.capacity).toBe(4);
			expect(table.status).toBe('available');
			expect(table.currentOrderId).toBeNull();
			expect(table.notes).toBeNull();
		});

		it('should set createdAt and updatedAt timestamps', async () => {
			const beforeCreate = Date.now();

			const [table] = await db
				.insert(tables)
				.values({
					venueId,
					tableNumber: 15,
					sectionName: 'private',
				})
				.returning();

			const afterCreate = Date.now();

			expect(table.createdAt).toBeInstanceOf(Date);
			expect(table.updatedAt).toBeInstanceOf(Date);
			expect(table.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate - 1000);
			expect(table.createdAt.getTime()).toBeLessThanOrEqual(afterCreate + 1000);
		});

		it('should accept valid sectionName values', async () => {
			const validSections = ['bar', 'dining', 'patio', 'private'];

			for (const section of validSections) {
				const [table] = await db
					.insert(tables)
					.values({
						venueId,
						tableNumber: Math.floor(Math.random() * 100),
						sectionName: section as 'bar' | 'dining' | 'patio' | 'private',
					})
					.returning();

				expect(table.sectionName).toBe(section);
			}
		});

		it('should accept valid status values', async () => {
			const validStatuses = ['available', 'occupied', 'reserved', 'dirty'];

			for (const status of validStatuses) {
				const [table] = await db
					.insert(tables)
					.values({
						venueId,
						tableNumber: Math.floor(Math.random() * 100),
						sectionName: 'dining',
						status: status as 'available' | 'occupied' | 'reserved' | 'dirty',
					})
					.returning();

				expect(table.status).toBe(status);
			}
		});

		it('should accept custom capacity', async () => {
			const [table] = await db
				.insert(tables)
				.values({
					venueId,
					tableNumber: 20,
					sectionName: 'dining',
					capacity: 8,
				})
				.returning();

			expect(table.capacity).toBe(8);
		});

		it('should accept optional notes', async () => {
			const notes = 'Near window, preferred by regulars';

			const [table] = await db
				.insert(tables)
				.values({
					venueId,
					tableNumber: 25,
					sectionName: 'dining',
					notes,
				})
				.returning();

			expect(table.notes).toBe(notes);
		});

		it('should accept optional currentOrderId', async () => {
			// First create an order
			const [order] = await db
				.insert(orders)
				.values({
					orderNumber: 100,
					venueId,
					serverId: 'user-1',
				})
				.returning();

			const [table] = await db
				.insert(tables)
				.values({
					venueId,
					tableNumber: 30,
					sectionName: 'dining',
					currentOrderId: order.id,
				})
				.returning();

			expect(table.currentOrderId).toBe(order.id);
		});

		it('should update updatedAt timestamp on update', async () => {
			const [table] = await db
				.insert(tables)
				.values({
					venueId,
					tableNumber: 35,
					sectionName: 'dining',
				})
				.returning();

			const originalUpdatedAt = table.updatedAt.getTime();

			// Wait 1+ second for SQLite integer timestamp to change
			await new Promise(resolve => setTimeout(resolve, 1100));

			const [updated] = await db
				.update(tables)
				.set({ status: 'occupied' })
				.where(eq(tables.id, table.id))
				.returning();

			expect(updated.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);
		});

		it('should enforce foreign key to venues', async () => {
			await expect(
				db.insert(tables).values({
					venueId: 'non-existent-venue',
					tableNumber: 40,
					sectionName: 'dining',
				})
			).rejects.toThrow();
		});

		it('should enforce foreign key to orders for currentOrderId', async () => {
			await expect(
				db.insert(tables).values({
					venueId,
					tableNumber: 45,
					sectionName: 'dining',
					currentOrderId: 'non-existent-order',
				})
			).rejects.toThrow();
		});

		it('should cascade delete when venue is deleted', async () => {
			// Create a separate venue for this test
			const [testVenue] = await db
				.insert(venues)
				.values({
					name: 'Test Delete Venue',
					slug: 'test-delete-venue-tables',
					email: 'delete-tables@test.com',
					taxRate: 825,
				})
				.returning();

			// Create table
			const [table] = await db
				.insert(tables)
				.values({
					venueId: testVenue.id,
					tableNumber: 50,
					sectionName: 'dining',
				})
				.returning();

			// Verify table exists
			const tablesBeforeDelete = await db.select().from(tables).where(eq(tables.id, table.id));
			expect(tablesBeforeDelete).toHaveLength(1);

			// Delete venue
			await db.delete(venues).where(eq(venues.id, testVenue.id));

			// Verify table was cascade deleted
			const tablesAfterDelete = await db.select().from(tables).where(eq(tables.id, table.id));
			expect(tablesAfterDelete).toHaveLength(0);
		});

		it('should set currentOrderId to null when order is deleted', async () => {
			// Create an order
			const [order] = await db
				.insert(orders)
				.values({
					orderNumber: 200,
					venueId,
					serverId: 'user-1',
				})
				.returning();

			// Create table with currentOrderId
			const [table] = await db
				.insert(tables)
				.values({
					venueId,
					tableNumber: 55,
					sectionName: 'dining',
					currentOrderId: order.id,
				})
				.returning();

			expect(table.currentOrderId).toBe(order.id);

			// Delete order
			await db.delete(orders).where(eq(orders.id, order.id));

			// Verify currentOrderId was set to null
			const [updatedTable] = await db.select().from(tables).where(eq(tables.id, table.id));
			expect(updatedTable.currentOrderId).toBeNull();
		});

		it('should allow querying tables by venue', async () => {
			await db.insert(tables).values({
				venueId,
				tableNumber: 60,
				sectionName: 'bar',
			});

			await db.insert(tables).values({
				venueId,
				tableNumber: 61,
				sectionName: 'dining',
			});

			const venueTables = await db.select().from(tables).where(eq(tables.venueId, venueId));

			expect(venueTables.length).toBeGreaterThanOrEqual(2);
		});

		it('should allow querying tables by section', async () => {
			await db.insert(tables).values({
				venueId,
				tableNumber: 70,
				sectionName: 'bar',
			});

			await db.insert(tables).values({
				venueId,
				tableNumber: 71,
				sectionName: 'bar',
			});

			const barTables = await db.select().from(tables).where(eq(tables.sectionName, 'bar'));

			expect(barTables.length).toBeGreaterThanOrEqual(2);
			expect(barTables.every(t => t.sectionName === 'bar')).toBe(true);
		});

		it('should allow querying tables by status', async () => {
			await db.insert(tables).values({
				venueId,
				tableNumber: 80,
				sectionName: 'dining',
				status: 'available',
			});

			await db.insert(tables).values({
				venueId,
				tableNumber: 81,
				sectionName: 'dining',
				status: 'occupied',
			});

			const availableTables = await db.select().from(tables).where(eq(tables.status, 'available'));

			expect(availableTables.length).toBeGreaterThanOrEqual(1);
			expect(availableTables.every(t => t.status === 'available')).toBe(true);
		});
	});

	describe('Type Inference', () => {
		it('should correctly infer Table types', async () => {
			const [table] = await db
				.insert(tables)
				.values({
					venueId,
					tableNumber: 90,
					sectionName: 'dining',
				})
				.returning();

			// Type assertions
			expect(typeof table.id).toBe('string');
			expect(typeof table.venueId).toBe('string');
			expect(typeof table.tableNumber).toBe('number');
			expect(typeof table.sectionName).toBe('string');
			expect(typeof table.capacity).toBe('number');
			expect(typeof table.status).toBe('string');
			expect(table.createdAt).toBeInstanceOf(Date);
			expect(table.updatedAt).toBeInstanceOf(Date);
		});

		it('should correctly infer optional field types', async () => {
			const [order] = await db
				.insert(orders)
				.values({
					orderNumber: 300,
					venueId,
					serverId: 'user-1',
				})
				.returning();

			const [table] = await db
				.insert(tables)
				.values({
					venueId,
					tableNumber: 95,
					sectionName: 'dining',
					currentOrderId: order.id,
					notes: 'Test notes',
				})
				.returning();

			// Optional fields should have correct types when present
			expect(typeof table.currentOrderId).toBe('string');
			expect(typeof table.notes).toBe('string');
		});

		it('should correctly handle null optional fields', async () => {
			const [table] = await db
				.insert(tables)
				.values({
					venueId,
					tableNumber: 100,
					sectionName: 'dining',
				})
				.returning();

			// Optional fields should be null when not provided
			expect(table.currentOrderId).toBeNull();
			expect(table.notes).toBeNull();
		});
	});
});
