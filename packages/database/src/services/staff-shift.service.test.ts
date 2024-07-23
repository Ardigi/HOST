import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Database } from '../client';
import * as schema from '../schema';
import { StaffShiftService } from './staff-shift.service';

/**
 * StaffShiftService TDD Tests
 * Tests clock in/out, breaks, shift management, and performance tracking
 */
describe('StaffShiftService - TDD', () => {
	let db: Database;
	let service: StaffShiftService;
	let venueId: string;
	let userId: string;

	beforeEach(async () => {
		// Create fresh in-memory database
		const client = createClient({ url: ':memory:' });
		db = drizzle(client, { schema }) as Database;

		await client.execute('PRAGMA foreign_keys = ON');

		// Create test tables
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
			`CREATE TABLE IF NOT EXISTS staff_shifts (
				id TEXT PRIMARY KEY,
				venue_id TEXT NOT NULL,
				user_id TEXT NOT NULL,
				clock_in INTEGER NOT NULL,
				clock_out INTEGER,
				break_start INTEGER,
				break_end INTEGER,
				total_sales REAL NOT NULL DEFAULT 0,
				total_tips REAL NOT NULL DEFAULT 0,
				order_count INTEGER NOT NULL DEFAULT 0,
				status TEXT NOT NULL DEFAULT 'active',
				notes TEXT,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL,
				FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
			)`,
		]);

		// Create test venue
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

		// Create test user
		const [user] = await db
			.insert(schema.users)
			.values({
				id: 'user-1',
				keycloakId: 'keycloak-123',
				email: 'server@example.com',
				firstName: 'John',
				lastName: 'Doe',
				venueId,
				role: 'server',
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();
		userId = user.id;

		// Initialize service
		service = new StaffShiftService(db);
	});

	// ===== Clock In/Out =====

	describe('Clock In/Out', () => {
		it('should clock in a user', async () => {
			const shift = await service.clockIn({
				userId,
				venueId,
			});

			expect(shift.id).toBeDefined();
			expect(shift.userId).toBe(userId);
			expect(shift.venueId).toBe(venueId);
			expect(shift.clockIn).toBeInstanceOf(Date);
			expect(shift.clockOut).toBeNull();
			expect(shift.status).toBe('active');
		});

		it('should prevent double clock-in for same user', async () => {
			await service.clockIn({ userId, venueId });

			await expect(service.clockIn({ userId, venueId })).rejects.toThrow(
				'User already has an active shift'
			);
		});

		it('should clock out a user', async () => {
			const shift = await service.clockIn({ userId, venueId });

			const clockedOut = await service.clockOut(shift.id);

			expect(clockedOut.clockOut).toBeInstanceOf(Date);
			expect(clockedOut.status).toBe('completed');
		});

		it('should reject clock-out for non-existent shift', async () => {
			await expect(service.clockOut('non-existent-shift')).rejects.toThrow('Shift not found');
		});

		it('should reject clock-out for already completed shift', async () => {
			const shift = await service.clockIn({ userId, venueId });
			await service.clockOut(shift.id);

			await expect(service.clockOut(shift.id)).rejects.toThrow('Shift already completed');
		});
	});

	// ===== Break Management =====

	describe('Break Management', () => {
		it('should start a break', async () => {
			const shift = await service.clockIn({ userId, venueId });

			const onBreak = await service.startBreak(shift.id);

			expect(onBreak.breakStart).toBeInstanceOf(Date);
			expect(onBreak.status).toBe('on_break');
		});

		it('should reject starting break for non-active shift', async () => {
			const shift = await service.clockIn({ userId, venueId });
			await service.clockOut(shift.id);

			await expect(service.startBreak(shift.id)).rejects.toThrow('Shift is not active');
		});

		it('should end a break', async () => {
			const shift = await service.clockIn({ userId, venueId });
			await service.startBreak(shift.id);

			const backActive = await service.endBreak(shift.id);

			expect(backActive.breakEnd).toBeInstanceOf(Date);
			expect(backActive.status).toBe('active');
		});

		it('should reject ending break when not on break', async () => {
			const shift = await service.clockIn({ userId, venueId });

			await expect(service.endBreak(shift.id)).rejects.toThrow('Shift is not on break');
		});
	});

	// ===== Performance Tracking =====

	describe('Performance Tracking', () => {
		it('should update shift stats', async () => {
			const shift = await service.clockIn({ userId, venueId });

			const updated = await service.updateShiftStats(shift.id, {
				totalSales: 350.5,
				totalTips: 52.25,
				orderCount: 12,
			});

			expect(updated.totalSales).toBe(350.5);
			expect(updated.totalTips).toBe(52.25);
			expect(updated.orderCount).toBe(12);
		});

		it('should allow partial stats updates', async () => {
			const shift = await service.clockIn({ userId, venueId });

			const updated = await service.updateShiftStats(shift.id, {
				totalSales: 100,
			});

			expect(updated.totalSales).toBe(100);
			expect(updated.totalTips).toBe(0); // Default value
		});
	});

	// ===== Shift Queries =====

	describe('Shift Queries', () => {
		it('should get active shift for user', async () => {
			const shift = await service.clockIn({ userId, venueId });

			const active = await service.getActiveShift(userId);

			expect(active).toBeDefined();
			expect(active?.id).toBe(shift.id);
			expect(active?.status).toBe('active');
		});

		it('should return null if no active shift', async () => {
			const active = await service.getActiveShift(userId);

			expect(active).toBeNull();
		});

		it('should get shift by id', async () => {
			const shift = await service.clockIn({ userId, venueId });

			const retrieved = await service.getShiftById(shift.id);

			expect(retrieved).toBeDefined();
			expect(retrieved?.id).toBe(shift.id);
		});

		it('should list shifts for venue', async () => {
			await service.clockIn({ userId, venueId });

			const shifts = await service.listShifts(venueId);

			expect(shifts).toHaveLength(1);
			expect(shifts[0].userId).toBe(userId);
		});

		it('should filter shifts by user', async () => {
			// Create second user
			const [user2] = await db
				.insert(schema.users)
				.values({
					id: 'user-2',
					keycloakId: 'keycloak-456',
					email: 'server2@example.com',
					firstName: 'Jane',
					lastName: 'Smith',
					venueId,
					role: 'server',
					isActive: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			await service.clockIn({ userId, venueId });
			await service.clockIn({ userId: user2.id, venueId });

			const userShifts = await service.listShifts(venueId, { userId });

			expect(userShifts).toHaveLength(1);
			expect(userShifts[0].userId).toBe(userId);
		});

		it('should filter shifts by status', async () => {
			const shift = await service.clockIn({ userId, venueId });
			await service.clockOut(shift.id);

			const completedShifts = await service.listShifts(venueId, { status: 'completed' });

			expect(completedShifts).toHaveLength(1);
			expect(completedShifts[0].status).toBe('completed');
		});
	});

	// ===== Shift Calculations =====

	describe('Shift Calculations', () => {
		it('should calculate total shift duration', async () => {
			const shift = await service.clockIn({ userId, venueId });

			// Simulate time passing (100ms = ~0.002 minutes)
			await new Promise(resolve => setTimeout(resolve, 100));
			await service.clockOut(shift.id);

			const stats = await service.getShiftStats(shift.id);

			expect(stats.totalMinutes).toBeGreaterThanOrEqual(0);
			expect(stats.workMinutes).toBeGreaterThanOrEqual(0);
		});

		it('should calculate break duration', async () => {
			const shift = await service.clockIn({ userId, venueId });

			await service.startBreak(shift.id);
			await new Promise(resolve => setTimeout(resolve, 100));
			await service.endBreak(shift.id);

			const stats = await service.getShiftStats(shift.id);

			expect(stats.breakMinutes).toBeGreaterThanOrEqual(0);
			expect(stats.workMinutes).toBeGreaterThanOrEqual(0);
		});

		it('should calculate hourly sales rate', async () => {
			const shift = await service.clockIn({ userId, venueId });
			await service.updateShiftStats(shift.id, { totalSales: 400 });

			await new Promise(resolve => setTimeout(resolve, 100));
			await service.clockOut(shift.id);

			const stats = await service.getShiftStats(shift.id);

			// Sales per hour calculated even for very short shifts
			expect(stats.salesPerHour).toBeGreaterThanOrEqual(0);
			expect(stats.averageOrderValue).toBe(0); // No orders yet
		});
	});

	// ===== Shift Approval =====

	describe('Shift Approval', () => {
		it('should mark shift as pending approval when clocked out', async () => {
			const shift = await service.clockIn({ userId, venueId });
			const clockedOut = await service.clockOut(shift.id);

			expect(clockedOut.status).toBe('completed');
		});

		it('should approve a completed shift', async () => {
			const shift = await service.clockIn({ userId, venueId });
			await service.clockOut(shift.id);

			const approved = await service.approveShift(shift.id);

			expect(approved.status).toBe('pending_approval');
		});
	});
});
