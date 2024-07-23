/**
 * StaffShifts Schema Tests
 * Validates schema structure, constraints, and relationships
 */

import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanupTestDatabase, createTestDatabase } from '../../../../test/helpers/db-test';
import type { Database } from '../client';
import { staffShifts } from './staff-shifts';
import { users } from './users';
import { venues } from './venues';

describe('StaffShifts Schema', () => {
	let db: Database;
	const venueId = 'venue-1'; // Pre-created in createTables
	const userId = 'user-1'; // Pre-created in createTables

	beforeEach(async () => {
		db = await createTestDatabase();
	});

	afterEach(async () => {
		await cleanupTestDatabase(db);
	});

	describe('StaffShifts Table', () => {
		it('should create a staff shift with required fields', async () => {
			const clockInTime = new Date();

			const [shift] = await db
				.insert(staffShifts)
				.values({
					venueId,
					userId,
					clockIn: clockInTime,
				})
				.returning();

			expect(shift.id).toBeDefined();
			expect(shift.venueId).toBe(venueId);
			expect(shift.userId).toBe(userId);
			expect(shift.clockIn).toBeInstanceOf(Date);
			// SQLite stores timestamps as integers (seconds), so compare with 1-second tolerance
			expect(Math.abs((shift.clockIn?.getTime() ?? 0) - clockInTime.getTime())).toBeLessThan(1000);
		});

		it('should generate unique CUID2 for id', async () => {
			const clockInTime = new Date();

			const [shift1] = await db
				.insert(staffShifts)
				.values({
					venueId,
					userId,
					clockIn: clockInTime,
				})
				.returning();

			const [shift2] = await db
				.insert(staffShifts)
				.values({
					venueId,
					userId,
					clockIn: clockInTime,
				})
				.returning();

			expect(shift1.id).not.toBe(shift2.id);
			expect(shift1.id).toMatch(/^[a-z0-9]{24,32}$/); // CUID2 format
			expect(shift2.id).toMatch(/^[a-z0-9]{24,32}$/);
		});

		it('should set default values correctly', async () => {
			const clockInTime = new Date();

			const [shift] = await db
				.insert(staffShifts)
				.values({
					venueId,
					userId,
					clockIn: clockInTime,
				})
				.returning();

			expect(shift.totalSales).toBe(0);
			expect(shift.totalTips).toBe(0);
			expect(shift.orderCount).toBe(0);
			expect(shift.status).toBe('active');
			expect(shift.clockOut).toBeNull();
			expect(shift.breakStart).toBeNull();
			expect(shift.breakEnd).toBeNull();
			expect(shift.notes).toBeNull();
		});

		it('should set createdAt and updatedAt timestamps', async () => {
			const beforeCreate = Date.now();

			const [shift] = await db
				.insert(staffShifts)
				.values({
					venueId,
					userId,
					clockIn: new Date(),
				})
				.returning();

			const afterCreate = Date.now();

			expect(shift.createdAt).toBeInstanceOf(Date);
			expect(shift.updatedAt).toBeInstanceOf(Date);
			expect(shift.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate - 1000);
			expect(shift.createdAt.getTime()).toBeLessThanOrEqual(afterCreate + 1000);
		});

		it('should accept valid status values', async () => {
			const validStatuses = ['active', 'on_break', 'completed', 'pending_approval'];

			for (const status of validStatuses) {
				const [shift] = await db
					.insert(staffShifts)
					.values({
						venueId,
						userId,
						clockIn: new Date(),
						status: status as 'active' | 'on_break' | 'completed' | 'pending_approval',
					})
					.returning();

				expect(shift.status).toBe(status);
			}
		});

		it('should accept optional timestamp fields', async () => {
			const clockInTime = new Date();
			const clockOutTime = new Date(clockInTime.getTime() + 8 * 60 * 60 * 1000); // 8 hours later
			const breakStartTime = new Date(clockInTime.getTime() + 4 * 60 * 60 * 1000); // 4 hours in
			const breakEndTime = new Date(breakStartTime.getTime() + 30 * 60 * 1000); // 30 min break

			const [shift] = await db
				.insert(staffShifts)
				.values({
					venueId,
					userId,
					clockIn: clockInTime,
					clockOut: clockOutTime,
					breakStart: breakStartTime,
					breakEnd: breakEndTime,
				})
				.returning();

			expect(shift.clockOut).toBeInstanceOf(Date);
			expect(shift.breakStart).toBeInstanceOf(Date);
			expect(shift.breakEnd).toBeInstanceOf(Date);
			// SQLite stores timestamps as integers (seconds), so compare with 1-second tolerance
			expect(Math.abs((shift.clockOut?.getTime() ?? 0) - clockOutTime.getTime())).toBeLessThan(
				1000
			);
			expect(Math.abs((shift.breakStart?.getTime() ?? 0) - breakStartTime.getTime())).toBeLessThan(
				1000
			);
			expect(Math.abs((shift.breakEnd?.getTime() ?? 0) - breakEndTime.getTime())).toBeLessThan(
				1000
			);
		});

		it('should accept sales and tips data', async () => {
			const [shift] = await db
				.insert(staffShifts)
				.values({
					venueId,
					userId,
					clockIn: new Date(),
					totalSales: 1250.5,
					totalTips: 187.75,
					orderCount: 42,
				})
				.returning();

			expect(shift.totalSales).toBe(1250.5);
			expect(shift.totalTips).toBe(187.75);
			expect(shift.orderCount).toBe(42);
		});

		it('should accept optional notes', async () => {
			const notes = 'Busy Friday night, handled large party well';

			const [shift] = await db
				.insert(staffShifts)
				.values({
					venueId,
					userId,
					clockIn: new Date(),
					notes,
				})
				.returning();

			expect(shift.notes).toBe(notes);
		});

		it('should update updatedAt timestamp on update', async () => {
			const [shift] = await db
				.insert(staffShifts)
				.values({
					venueId,
					userId,
					clockIn: new Date(),
				})
				.returning();

			const originalUpdatedAt = shift.updatedAt.getTime();

			// Wait 1+ second for SQLite integer timestamp to change
			await new Promise(resolve => setTimeout(resolve, 1100));

			const [updated] = await db
				.update(staffShifts)
				.set({ status: 'completed' })
				.where(eq(staffShifts.id, shift.id))
				.returning();

			expect(updated.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);
		});

		it('should enforce foreign key to venues', async () => {
			await expect(
				db.insert(staffShifts).values({
					venueId: 'non-existent-venue',
					userId,
					clockIn: new Date(),
				})
			).rejects.toThrow();
		});

		it('should enforce foreign key to users', async () => {
			await expect(
				db.insert(staffShifts).values({
					venueId,
					userId: 'non-existent-user',
					clockIn: new Date(),
				})
			).rejects.toThrow();
		});

		it('should cascade delete when venue is deleted', async () => {
			// Create a separate venue for this test
			const [testVenue] = await db
				.insert(venues)
				.values({
					name: 'Test Delete Venue',
					slug: 'test-delete-venue-shifts',
					email: 'delete-shifts@test.com',
					taxRate: 825,
				})
				.returning();

			// Create user in test venue
			const [testUser] = await db
				.insert(users)
				.values({
					venueId: testVenue.id,
					keycloakId: 'kc-test-delete-shifts',
					email: 'testuser-shifts@test.com',
					firstName: 'Test',
					lastName: 'User',
					role: 'server',
				})
				.returning();

			// Create shift
			const [shift] = await db
				.insert(staffShifts)
				.values({
					venueId: testVenue.id,
					userId: testUser.id,
					clockIn: new Date(),
				})
				.returning();

			// Verify shift exists
			const shiftsBeforeDelete = await db
				.select()
				.from(staffShifts)
				.where(eq(staffShifts.id, shift.id));
			expect(shiftsBeforeDelete).toHaveLength(1);

			// Delete venue
			await db.delete(venues).where(eq(venues.id, testVenue.id));

			// Verify shift was cascade deleted
			const shiftsAfterDelete = await db
				.select()
				.from(staffShifts)
				.where(eq(staffShifts.id, shift.id));
			expect(shiftsAfterDelete).toHaveLength(0);
		});

		it('should cascade delete when user is deleted', async () => {
			// Create a separate user for this test
			const [testUser] = await db
				.insert(users)
				.values({
					venueId,
					keycloakId: 'kc-test-delete-user',
					email: 'testdelete@test.com',
					firstName: 'Test',
					lastName: 'Delete',
					role: 'server',
				})
				.returning();

			// Create shift
			const [shift] = await db
				.insert(staffShifts)
				.values({
					venueId,
					userId: testUser.id,
					clockIn: new Date(),
				})
				.returning();

			// Verify shift exists
			const shiftsBeforeDelete = await db
				.select()
				.from(staffShifts)
				.where(eq(staffShifts.id, shift.id));
			expect(shiftsBeforeDelete).toHaveLength(1);

			// Delete user
			await db.delete(users).where(eq(users.id, testUser.id));

			// Verify shift was cascade deleted
			const shiftsAfterDelete = await db
				.select()
				.from(staffShifts)
				.where(eq(staffShifts.id, shift.id));
			expect(shiftsAfterDelete).toHaveLength(0);
		});

		it('should allow querying shifts by venue', async () => {
			await db.insert(staffShifts).values({
				venueId,
				userId,
				clockIn: new Date(),
			});

			await db.insert(staffShifts).values({
				venueId,
				userId,
				clockIn: new Date(),
			});

			const shifts = await db.select().from(staffShifts).where(eq(staffShifts.venueId, venueId));

			expect(shifts.length).toBeGreaterThanOrEqual(2);
		});

		it('should allow querying shifts by user', async () => {
			await db.insert(staffShifts).values({
				venueId,
				userId,
				clockIn: new Date(),
			});

			await db.insert(staffShifts).values({
				venueId,
				userId,
				clockIn: new Date(),
			});

			const shifts = await db.select().from(staffShifts).where(eq(staffShifts.userId, userId));

			expect(shifts.length).toBeGreaterThanOrEqual(2);
		});

		it('should allow querying shifts by status', async () => {
			await db.insert(staffShifts).values({
				venueId,
				userId,
				clockIn: new Date(),
				status: 'active',
			});

			await db.insert(staffShifts).values({
				venueId,
				userId,
				clockIn: new Date(),
				status: 'completed',
			});

			const activeShifts = await db
				.select()
				.from(staffShifts)
				.where(eq(staffShifts.status, 'active'));

			expect(activeShifts.length).toBeGreaterThanOrEqual(1);
			expect(activeShifts.every(s => s.status === 'active')).toBe(true);
		});
	});

	describe('Type Inference', () => {
		it('should correctly infer StaffShift types', async () => {
			const [shift] = await db
				.insert(staffShifts)
				.values({
					venueId,
					userId,
					clockIn: new Date(),
				})
				.returning();

			// Type assertions
			expect(typeof shift.id).toBe('string');
			expect(typeof shift.venueId).toBe('string');
			expect(typeof shift.userId).toBe('string');
			expect(shift.clockIn).toBeInstanceOf(Date);
			expect(typeof shift.totalSales).toBe('number');
			expect(typeof shift.totalTips).toBe('number');
			expect(typeof shift.orderCount).toBe('number');
			expect(typeof shift.status).toBe('string');
			expect(shift.createdAt).toBeInstanceOf(Date);
			expect(shift.updatedAt).toBeInstanceOf(Date);
		});

		it('should correctly infer optional timestamp types', async () => {
			const clockOutTime = new Date();

			const [shift] = await db
				.insert(staffShifts)
				.values({
					venueId,
					userId,
					clockIn: new Date(),
					clockOut: clockOutTime,
					breakStart: new Date(),
					breakEnd: new Date(),
				})
				.returning();

			// Optional timestamp fields should be Date when present
			expect(shift.clockOut).toBeInstanceOf(Date);
			expect(shift.breakStart).toBeInstanceOf(Date);
			expect(shift.breakEnd).toBeInstanceOf(Date);
		});

		it('should correctly handle null optional fields', async () => {
			const [shift] = await db
				.insert(staffShifts)
				.values({
					venueId,
					userId,
					clockIn: new Date(),
				})
				.returning();

			// Optional fields should be null when not provided
			expect(shift.clockOut).toBeNull();
			expect(shift.breakStart).toBeNull();
			expect(shift.breakEnd).toBeNull();
			expect(shift.notes).toBeNull();
		});
	});
});
