/**
 * Venues Schema Tests
 * Validates schema structure, constraints, and relationships
 */

import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanupTestDatabase, createTestDatabase } from '../../../../test/helpers/db-test';
import type { Database } from '../client';
import { venues } from './venues';

describe('Venues Schema', () => {
	let db: Database;

	beforeEach(async () => {
		db = await createTestDatabase();
	});

	afterEach(async () => {
		await cleanupTestDatabase(db);
	});

	describe('Venues Table', () => {
		it('should create a venue with required fields', async () => {
			const [venue] = await db
				.insert(venues)
				.values({
					name: 'Test Restaurant',
					slug: 'test-restaurant',
					email: 'info@test-restaurant.com',
				})
				.returning();

			expect(venue.id).toBeDefined();
			expect(venue.name).toBe('Test Restaurant');
			expect(venue.slug).toBe('test-restaurant');
			expect(venue.email).toBe('info@test-restaurant.com');
		});

		it('should generate unique CUID2 for id', async () => {
			const [venue1] = await db
				.insert(venues)
				.values({
					name: 'Venue One',
					slug: 'venue-one',
					email: 'one@venue.com',
				})
				.returning();

			const [venue2] = await db
				.insert(venues)
				.values({
					name: 'Venue Two',
					slug: 'venue-two',
					email: 'two@venue.com',
				})
				.returning();

			expect(venue1.id).not.toBe(venue2.id);
			expect(venue1.id).toMatch(/^[a-z0-9]{24,32}$/); // CUID2 format
			expect(venue2.id).toMatch(/^[a-z0-9]{24,32}$/);
		});

		it('should set default values correctly', async () => {
			const [venue] = await db
				.insert(venues)
				.values({
					name: 'Default Test',
					slug: 'default-test',
					email: 'default@test.com',
				})
				.returning();

			expect(venue.country).toBe('US');
			expect(venue.timezone).toBe('America/New_York');
			expect(venue.currency).toBe('USD');
			expect(venue.taxRate).toBe(825); // 8.25% in basis points
			expect(venue.isActive).toBe(true);
			expect(venue.phone).toBeNull();
			expect(venue.address).toBeNull();
			expect(venue.city).toBeNull();
			expect(venue.state).toBeNull();
			expect(venue.zipCode).toBeNull();
		});

		it('should set createdAt and updatedAt timestamps', async () => {
			const beforeCreate = Date.now();

			const [venue] = await db
				.insert(venues)
				.values({
					name: 'Timestamp Test',
					slug: 'timestamp-test',
					email: 'timestamp@test.com',
				})
				.returning();

			const afterCreate = Date.now();

			expect(venue.createdAt).toBeInstanceOf(Date);
			expect(venue.updatedAt).toBeInstanceOf(Date);
			expect(venue.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate - 1000);
			expect(venue.createdAt.getTime()).toBeLessThanOrEqual(afterCreate + 1000);
		});

		it('should accept optional address fields', async () => {
			const [venue] = await db
				.insert(venues)
				.values({
					name: 'Full Address Venue',
					slug: 'full-address-venue',
					email: 'address@venue.com',
					phone: '+1-555-0100',
					address: '123 Main St',
					city: 'New York',
					state: 'NY',
					zipCode: '10001',
				})
				.returning();

			expect(venue.phone).toBe('+1-555-0100');
			expect(venue.address).toBe('123 Main St');
			expect(venue.city).toBe('New York');
			expect(venue.state).toBe('NY');
			expect(venue.zipCode).toBe('10001');
		});

		it('should accept custom country, timezone, and currency', async () => {
			const [venue] = await db
				.insert(venues)
				.values({
					name: 'International Venue',
					slug: 'international-venue',
					email: 'international@venue.com',
					country: 'CA',
					timezone: 'America/Toronto',
					currency: 'CAD',
				})
				.returning();

			expect(venue.country).toBe('CA');
			expect(venue.timezone).toBe('America/Toronto');
			expect(venue.currency).toBe('CAD');
		});

		it('should accept custom taxRate', async () => {
			const [venue] = await db
				.insert(venues)
				.values({
					name: 'Custom Tax Venue',
					slug: 'custom-tax-venue',
					email: 'tax@venue.com',
					taxRate: 1000, // 10%
				})
				.returning();

			expect(venue.taxRate).toBe(1000);
		});

		it('should accept custom isActive value', async () => {
			const [venue] = await db
				.insert(venues)
				.values({
					name: 'Inactive Venue',
					slug: 'inactive-venue',
					email: 'inactive@venue.com',
					isActive: false,
				})
				.returning();

			expect(venue.isActive).toBe(false);
		});

		it('should update updatedAt timestamp on update', async () => {
			const [venue] = await db
				.insert(venues)
				.values({
					name: 'Update Test',
					slug: 'update-test',
					email: 'update@test.com',
				})
				.returning();

			const originalUpdatedAt = venue.updatedAt.getTime();

			// Wait 1+ second for SQLite integer timestamp to change
			await new Promise(resolve => setTimeout(resolve, 1100));

			const [updated] = await db
				.update(venues)
				.set({ name: 'Updated Name' })
				.where(eq(venues.id, venue.id))
				.returning();

			expect(updated.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);
		});

		it('should enforce unique slug constraint', async () => {
			const slug = 'unique-slug-test';

			await db.insert(venues).values({
				name: 'First Venue',
				slug,
				email: 'first@venue.com',
			});

			// Try to insert with same slug
			await expect(
				db.insert(venues).values({
					name: 'Second Venue',
					slug, // Duplicate
					email: 'second@venue.com',
				})
			).rejects.toThrow();
		});

		it('should allow querying venues by slug', async () => {
			const slug = 'query-by-slug';

			await db.insert(venues).values({
				name: 'Slug Query Test',
				slug,
				email: 'slug@venue.com',
			});

			const [venue] = await db.select().from(venues).where(eq(venues.slug, slug));

			expect(venue).toBeDefined();
			expect(venue.slug).toBe(slug);
		});

		it('should allow querying venues by isActive status', async () => {
			await db.insert(venues).values({
				name: 'Active Venue',
				slug: 'active-venue',
				email: 'active@venue.com',
				isActive: true,
			});

			await db.insert(venues).values({
				name: 'Inactive Venue 2',
				slug: 'inactive-venue-2',
				email: 'inactive2@venue.com',
				isActive: false,
			});

			const activeVenues = await db.select().from(venues).where(eq(venues.isActive, true));
			const inactiveVenues = await db.select().from(venues).where(eq(venues.isActive, false));

			expect(activeVenues.length).toBeGreaterThanOrEqual(1);
			expect(inactiveVenues.length).toBeGreaterThanOrEqual(1);
			expect(activeVenues.every(v => v.isActive === true)).toBe(true);
			expect(inactiveVenues.every(v => v.isActive === false)).toBe(true);
		});

		it('should allow querying venues by email', async () => {
			const email = 'specific@venue.com';

			await db.insert(venues).values({
				name: 'Email Query Test',
				slug: 'email-query-test',
				email,
			});

			const [venue] = await db.select().from(venues).where(eq(venues.email, email));

			expect(venue).toBeDefined();
			expect(venue.email).toBe(email);
		});

		it('should allow querying venues by city', async () => {
			await db.insert(venues).values({
				name: 'NYC Venue 1',
				slug: 'nyc-venue-1',
				email: 'nyc1@venue.com',
				city: 'New York',
			});

			await db.insert(venues).values({
				name: 'NYC Venue 2',
				slug: 'nyc-venue-2',
				email: 'nyc2@venue.com',
				city: 'New York',
			});

			const nycVenues = await db.select().from(venues).where(eq(venues.city, 'New York'));

			expect(nycVenues.length).toBeGreaterThanOrEqual(2);
			expect(nycVenues.every(v => v.city === 'New York')).toBe(true);
		});

		it('should allow querying venues by country', async () => {
			await db.insert(venues).values({
				name: 'Canada Venue',
				slug: 'canada-venue',
				email: 'canada@venue.com',
				country: 'CA',
			});

			const canadaVenues = await db.select().from(venues).where(eq(venues.country, 'CA'));

			expect(canadaVenues.length).toBeGreaterThanOrEqual(1);
			expect(canadaVenues.every(v => v.country === 'CA')).toBe(true);
		});

		it('should store taxRate as integer (basis points)', async () => {
			const [venue] = await db
				.insert(venues)
				.values({
					name: 'Tax Basis Points Test',
					slug: 'tax-basis-points',
					email: 'taxbp@venue.com',
					taxRate: 950, // 9.50%
				})
				.returning();

			expect(venue.taxRate).toBe(950);
			expect(typeof venue.taxRate).toBe('number');
		});
	});

	describe('Type Inference', () => {
		it('should correctly infer Venue types', async () => {
			const [venue] = await db
				.insert(venues)
				.values({
					name: 'Type Test',
					slug: 'type-test',
					email: 'types@venue.com',
				})
				.returning();

			// Type assertions
			expect(typeof venue.id).toBe('string');
			expect(typeof venue.name).toBe('string');
			expect(typeof venue.slug).toBe('string');
			expect(typeof venue.email).toBe('string');
			expect(typeof venue.country).toBe('string');
			expect(typeof venue.timezone).toBe('string');
			expect(typeof venue.currency).toBe('string');
			expect(typeof venue.taxRate).toBe('number');
			expect(typeof venue.isActive).toBe('boolean');
			expect(venue.createdAt).toBeInstanceOf(Date);
			expect(venue.updatedAt).toBeInstanceOf(Date);
		});

		it('should correctly infer optional field types', async () => {
			const [venue] = await db
				.insert(venues)
				.values({
					name: 'Optional Fields Test',
					slug: 'optional-fields-test',
					email: 'optional@venue.com',
					phone: '+1-555-9999',
					address: '456 Oak St',
					city: 'Boston',
					state: 'MA',
					zipCode: '02101',
				})
				.returning();

			// Optional fields should have correct types when present
			expect(typeof venue.phone).toBe('string');
			expect(typeof venue.address).toBe('string');
			expect(typeof venue.city).toBe('string');
			expect(typeof venue.state).toBe('string');
			expect(typeof venue.zipCode).toBe('string');
		});

		it('should correctly handle null optional fields', async () => {
			const [venue] = await db
				.insert(venues)
				.values({
					name: 'Null Fields Test',
					slug: 'null-fields-test',
					email: 'null@venue.com',
				})
				.returning();

			// Optional fields should be null when not provided
			expect(venue.phone).toBeNull();
			expect(venue.address).toBeNull();
			expect(venue.city).toBeNull();
			expect(venue.state).toBeNull();
			expect(venue.zipCode).toBeNull();
		});
	});
});
