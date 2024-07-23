/**
 * Users Schema Tests
 * Validates schema structure, constraints, and relationships
 */

import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanupTestDatabase, createTestDatabase } from '../../../../test/helpers/db-test';
import type { Database } from '../client';
import { users } from './users';
import { venues } from './venues';

describe('Users Schema', () => {
	let db: Database;
	const venueId = 'venue-1'; // Pre-created in createTables

	beforeEach(async () => {
		db = await createTestDatabase();
	});

	afterEach(async () => {
		await cleanupTestDatabase(db);
	});

	describe('Users Table', () => {
		it('should create a user with required fields', async () => {
			const [user] = await db
				.insert(users)
				.values({
					venueId,
					keycloakId: 'kc-test-123',
					email: 'john.doe@example.com',
					firstName: 'John',
					lastName: 'Doe',
				})
				.returning();

			expect(user.id).toBeDefined();
			expect(user.venueId).toBe(venueId);
			expect(user.keycloakId).toBe('kc-test-123');
			expect(user.email).toBe('john.doe@example.com');
			expect(user.firstName).toBe('John');
			expect(user.lastName).toBe('Doe');
		});

		it('should generate unique CUID2 for id', async () => {
			const [user1] = await db
				.insert(users)
				.values({
					venueId,
					keycloakId: 'kc-test-1',
					email: 'user1@example.com',
					firstName: 'User',
					lastName: 'One',
				})
				.returning();

			const [user2] = await db
				.insert(users)
				.values({
					venueId,
					keycloakId: 'kc-test-2',
					email: 'user2@example.com',
					firstName: 'User',
					lastName: 'Two',
				})
				.returning();

			expect(user1.id).not.toBe(user2.id);
			expect(user1.id).toMatch(/^[a-z0-9]{24,32}$/); // CUID2 format
			expect(user2.id).toMatch(/^[a-z0-9]{24,32}$/);
		});

		it('should set default values correctly', async () => {
			const [user] = await db
				.insert(users)
				.values({
					venueId,
					keycloakId: 'kc-default-test',
					email: 'default@example.com',
					firstName: 'Default',
					lastName: 'User',
				})
				.returning();

			expect(user.role).toBe('server');
			expect(user.isActive).toBe(true);
			expect(user.phone).toBeNull();
			expect(user.pinCodeHash).toBeNull();
		});

		it('should set createdAt and updatedAt timestamps', async () => {
			const beforeCreate = Date.now();

			const [user] = await db
				.insert(users)
				.values({
					venueId,
					keycloakId: 'kc-timestamp-test',
					email: 'timestamp@example.com',
					firstName: 'Timestamp',
					lastName: 'Test',
				})
				.returning();

			const afterCreate = Date.now();

			expect(user.createdAt).toBeInstanceOf(Date);
			expect(user.updatedAt).toBeInstanceOf(Date);
			expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate - 1000);
			expect(user.createdAt.getTime()).toBeLessThanOrEqual(afterCreate + 1000);
		});

		it('should accept valid role values', async () => {
			const validRoles = ['admin', 'manager', 'server', 'bartender', 'kitchen'];

			for (const role of validRoles) {
				const [user] = await db
					.insert(users)
					.values({
						venueId,
						keycloakId: `kc-role-${role}`,
						email: `${role}@example.com`,
						firstName: 'Role',
						lastName: 'Test',
						role: role as 'admin' | 'manager' | 'server' | 'bartender' | 'kitchen',
					})
					.returning();

				expect(user.role).toBe(role);
			}
		});

		it('should accept optional phone field', async () => {
			const phone = '+1-555-0123';

			const [user] = await db
				.insert(users)
				.values({
					venueId,
					keycloakId: 'kc-phone-test',
					email: 'phone@example.com',
					firstName: 'Phone',
					lastName: 'Test',
					phone,
				})
				.returning();

			expect(user.phone).toBe(phone);
		});

		it('should accept optional pinCodeHash field', async () => {
			const pinCodeHash = '$2a$10$abcdefghijklmnopqrstuv'; // Example bcrypt hash

			const [user] = await db
				.insert(users)
				.values({
					venueId,
					keycloakId: 'kc-pin-test',
					email: 'pin@example.com',
					firstName: 'Pin',
					lastName: 'Test',
					pinCodeHash,
				})
				.returning();

			expect(user.pinCodeHash).toBe(pinCodeHash);
		});

		it('should accept custom isActive value', async () => {
			const [user] = await db
				.insert(users)
				.values({
					venueId,
					keycloakId: 'kc-inactive-test',
					email: 'inactive@example.com',
					firstName: 'Inactive',
					lastName: 'User',
					isActive: false,
				})
				.returning();

			expect(user.isActive).toBe(false);
		});

		it('should update updatedAt timestamp on update', async () => {
			const [user] = await db
				.insert(users)
				.values({
					venueId,
					keycloakId: 'kc-update-test',
					email: 'update@example.com',
					firstName: 'Update',
					lastName: 'Test',
				})
				.returning();

			const originalUpdatedAt = user.updatedAt.getTime();

			// Wait 1+ second for SQLite integer timestamp to change
			await new Promise(resolve => setTimeout(resolve, 1100));

			const [updated] = await db
				.update(users)
				.set({ firstName: 'Updated' })
				.where(eq(users.id, user.id))
				.returning();

			expect(updated.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);
		});

		it('should enforce foreign key to venues', async () => {
			await expect(
				db.insert(users).values({
					venueId: 'non-existent-venue',
					keycloakId: 'kc-fk-test',
					email: 'fk@example.com',
					firstName: 'FK',
					lastName: 'Test',
				})
			).rejects.toThrow();
		});

		it('should enforce unique keycloakId constraint', async () => {
			const keycloakId = 'kc-unique-test';

			await db.insert(users).values({
				venueId,
				keycloakId,
				email: 'first@example.com',
				firstName: 'First',
				lastName: 'User',
			});

			// Try to insert with same keycloakId
			await expect(
				db.insert(users).values({
					venueId,
					keycloakId, // Duplicate
					email: 'second@example.com',
					firstName: 'Second',
					lastName: 'User',
				})
			).rejects.toThrow();
		});

		it('should enforce unique email constraint', async () => {
			const email = 'unique@example.com';

			await db.insert(users).values({
				venueId,
				keycloakId: 'kc-email-1',
				email,
				firstName: 'First',
				lastName: 'User',
			});

			// Try to insert with same email
			await expect(
				db.insert(users).values({
					venueId,
					keycloakId: 'kc-email-2',
					email, // Duplicate
					firstName: 'Second',
					lastName: 'User',
				})
			).rejects.toThrow();
		});

		it('should cascade delete when venue is deleted', async () => {
			// Create a separate venue for this test
			const [testVenue] = await db
				.insert(venues)
				.values({
					name: 'Test Delete Venue',
					slug: 'test-delete-venue-users',
					email: 'delete-users@test.com',
					taxRate: 825,
				})
				.returning();

			// Create user in test venue
			const [user] = await db
				.insert(users)
				.values({
					venueId: testVenue.id,
					keycloakId: 'kc-cascade-test',
					email: 'cascade@example.com',
					firstName: 'Cascade',
					lastName: 'Test',
				})
				.returning();

			// Verify user exists
			const usersBeforeDelete = await db.select().from(users).where(eq(users.id, user.id));
			expect(usersBeforeDelete).toHaveLength(1);

			// Delete venue
			await db.delete(venues).where(eq(venues.id, testVenue.id));

			// Verify user was cascade deleted
			const usersAfterDelete = await db.select().from(users).where(eq(users.id, user.id));
			expect(usersAfterDelete).toHaveLength(0);
		});

		it('should allow querying users by venue', async () => {
			await db.insert(users).values({
				venueId,
				keycloakId: 'kc-venue-1',
				email: 'venue1@example.com',
				firstName: 'Venue',
				lastName: 'One',
			});

			await db.insert(users).values({
				venueId,
				keycloakId: 'kc-venue-2',
				email: 'venue2@example.com',
				firstName: 'Venue',
				lastName: 'Two',
			});

			const venueUsers = await db.select().from(users).where(eq(users.venueId, venueId));

			expect(venueUsers.length).toBeGreaterThanOrEqual(2);
		});

		it('should allow querying users by role', async () => {
			await db.insert(users).values({
				venueId,
				keycloakId: 'kc-admin-1',
				email: 'admin1@example.com',
				firstName: 'Admin',
				lastName: 'One',
				role: 'admin',
			});

			await db.insert(users).values({
				venueId,
				keycloakId: 'kc-admin-2',
				email: 'admin2@example.com',
				firstName: 'Admin',
				lastName: 'Two',
				role: 'admin',
			});

			const adminUsers = await db.select().from(users).where(eq(users.role, 'admin'));

			expect(adminUsers.length).toBeGreaterThanOrEqual(2);
			expect(adminUsers.every(u => u.role === 'admin')).toBe(true);
		});

		it('should allow querying users by isActive status', async () => {
			await db.insert(users).values({
				venueId,
				keycloakId: 'kc-active-test',
				email: 'active@example.com',
				firstName: 'Active',
				lastName: 'User',
				isActive: true,
			});

			await db.insert(users).values({
				venueId,
				keycloakId: 'kc-inactive-test-2',
				email: 'inactive2@example.com',
				firstName: 'Inactive',
				lastName: 'User',
				isActive: false,
			});

			const activeUsers = await db.select().from(users).where(eq(users.isActive, true));
			const inactiveUsers = await db.select().from(users).where(eq(users.isActive, false));

			expect(activeUsers.length).toBeGreaterThanOrEqual(1);
			expect(inactiveUsers.length).toBeGreaterThanOrEqual(1);
			expect(activeUsers.every(u => u.isActive === true)).toBe(true);
			expect(inactiveUsers.every(u => u.isActive === false)).toBe(true);
		});
	});

	describe('Type Inference', () => {
		it('should correctly infer User types', async () => {
			const [user] = await db
				.insert(users)
				.values({
					venueId,
					keycloakId: 'kc-type-test',
					email: 'types@example.com',
					firstName: 'Type',
					lastName: 'Test',
				})
				.returning();

			// Type assertions
			expect(typeof user.id).toBe('string');
			expect(typeof user.venueId).toBe('string');
			expect(typeof user.keycloakId).toBe('string');
			expect(typeof user.email).toBe('string');
			expect(typeof user.firstName).toBe('string');
			expect(typeof user.lastName).toBe('string');
			expect(typeof user.role).toBe('string');
			expect(typeof user.isActive).toBe('boolean');
			expect(user.createdAt).toBeInstanceOf(Date);
			expect(user.updatedAt).toBeInstanceOf(Date);
		});

		it('should correctly infer optional field types', async () => {
			const [user] = await db
				.insert(users)
				.values({
					venueId,
					keycloakId: 'kc-optional-test',
					email: 'optional@example.com',
					firstName: 'Optional',
					lastName: 'Test',
					phone: '+1-555-9999',
					pinCodeHash: '$2a$10$test',
				})
				.returning();

			// Optional fields should have correct types when present
			expect(typeof user.phone).toBe('string');
			expect(typeof user.pinCodeHash).toBe('string');
		});

		it('should correctly handle null optional fields', async () => {
			const [user] = await db
				.insert(users)
				.values({
					venueId,
					keycloakId: 'kc-null-test',
					email: 'null@example.com',
					firstName: 'Null',
					lastName: 'Test',
				})
				.returning();

			// Optional fields should be null when not provided
			expect(user.phone).toBeNull();
			expect(user.pinCodeHash).toBeNull();
		});
	});
});
