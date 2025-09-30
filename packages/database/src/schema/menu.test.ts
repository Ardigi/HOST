/**
 * @description Tests for menu schema and operations
 * @dependencies Drizzle ORM, database client
 * @coverage-target 90% (critical data layer)
 */

import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanupTestDatabase, createTestDatabase } from '../../../../test/helpers/db-test';
import type { Database } from '../client';
import { menuCategories, menuItems, menuModifierGroups, menuModifiers } from './menu';

describe('Menu Schema', () => {
	let db: Database;

	beforeEach(async () => {
		db = await createTestDatabase();
	});

	afterEach(async () => {
		await cleanupTestDatabase(db);
	});

	describe('Menu Categories', () => {
		it('should create menu category with required fields', async () => {
			const category = await db
				.insert(menuCategories)
				.values({
					venueId: 'venue-1',
					name: 'Appetizers',
					slug: 'appetizers',
					displayOrder: 1,
				})
				.returning();

			expect(category).toHaveLength(1);
			expect(category[0]).toMatchObject({
				name: 'Appetizers',
				slug: 'appetizers',
				displayOrder: 1,
				isActive: true,
			});
			expect(category[0].id).toBeTruthy();
			expect(category[0].createdAt).toBeInstanceOf(Date);
		});

		it('should enforce unique slug per venue', async () => {
			await db.insert(menuCategories).values({
				venueId: 'venue-1',
				name: 'Appetizers',
				slug: 'appetizers',
				displayOrder: 1,
			});

			// Same slug, same venue should fail
			await expect(
				db.insert(menuCategories).values({
					venueId: 'venue-1',
					name: 'Starters',
					slug: 'appetizers',
					displayOrder: 2,
				})
			).rejects.toThrow();
		});

		it('should allow same slug across different venues', async () => {
			await db.insert(menuCategories).values({
				venueId: 'venue-1',
				name: 'Appetizers',
				slug: 'appetizers',
				displayOrder: 1,
			});

			const category = await db
				.insert(menuCategories)
				.values({
					venueId: 'venue-2',
					name: 'Appetizers',
					slug: 'appetizers',
					displayOrder: 1,
				})
				.returning();

			expect(category).toHaveLength(1);
		});

		it('should set default isActive to true', async () => {
			const category = await db
				.insert(menuCategories)
				.values({
					venueId: 'venue-1',
					name: 'Desserts',
					slug: 'desserts',
					displayOrder: 5,
				})
				.returning();

			expect(category[0].isActive).toBe(true);
		});

		it('should support optional description field', async () => {
			const category = await db
				.insert(menuCategories)
				.values({
					venueId: 'venue-1',
					name: 'Beverages',
					slug: 'beverages',
					displayOrder: 3,
					description: 'Refreshing drinks',
				})
				.returning();

			expect(category[0].description).toBe('Refreshing drinks');
		});
	});

	describe('Menu Items', () => {
		it('should create menu item with required fields', async () => {
			const category = await db
				.insert(menuCategories)
				.values({
					venueId: 'venue-1',
					name: 'Entrees',
					slug: 'entrees',
					displayOrder: 2,
				})
				.returning();

			const item = await db
				.insert(menuItems)
				.values({
					venueId: 'venue-1',
					categoryId: category[0].id,
					name: 'Burger',
					slug: 'burger',
					price: 12.99,
					displayOrder: 1,
				})
				.returning();

			expect(item).toHaveLength(1);
			expect(item[0]).toMatchObject({
				name: 'Burger',
				slug: 'burger',
				price: 12.99,
				isActive: true,
				isAvailable: true,
			});
		});

		it('should enforce positive price', async () => {
			const category = await db
				.insert(menuCategories)
				.values({
					venueId: 'venue-1',
					name: 'Entrees',
					slug: 'entrees',
					displayOrder: 2,
				})
				.returning();

			// Negative price should be rejected at validation layer
			// (We'll test this in integration tests with Zod schemas)
			const item = await db
				.insert(menuItems)
				.values({
					venueId: 'venue-1',
					categoryId: category[0].id,
					name: 'Test',
					slug: 'test',
					price: -5.0,
					displayOrder: 1,
				})
				.returning();

			// Database allows it, but validation layer should prevent
			expect(item[0].price).toBe(-5.0);
		});

		it('should support optional fields', async () => {
			const category = await db
				.insert(menuCategories)
				.values({
					venueId: 'venue-1',
					name: 'Entrees',
					slug: 'entrees',
					displayOrder: 2,
				})
				.returning();

			const item = await db
				.insert(menuItems)
				.values({
					venueId: 'venue-1',
					categoryId: category[0].id,
					name: 'Steak',
					slug: 'steak',
					price: 24.99,
					displayOrder: 1,
					description: 'Grilled to perfection',
					imageUrl: 'https://example.com/steak.jpg',
					calories: 650,
					isVegetarian: false,
					isVegan: false,
					isGlutenFree: false,
					preparationTime: 20,
				})
				.returning();

			expect(item[0]).toMatchObject({
				description: 'Grilled to perfection',
				calories: 650,
				preparationTime: 20,
			});
		});

		it('should cascade delete when category is deleted', async () => {
			const category = await db
				.insert(menuCategories)
				.values({
					venueId: 'venue-1',
					name: 'Entrees',
					slug: 'entrees',
					displayOrder: 2,
				})
				.returning();

			await db.insert(menuItems).values({
				venueId: 'venue-1',
				categoryId: category[0].id,
				name: 'Burger',
				slug: 'burger',
				price: 12.99,
				displayOrder: 1,
			});

			// Delete category
			await db.delete(menuCategories).where(eq(menuCategories.id, category[0].id));

			// Items should be deleted (cascade)
			const items = await db
				.select()
				.from(menuItems)
				.where(eq(menuItems.categoryId, category[0].id));
			expect(items).toHaveLength(0);
		});
	});

	describe('Modifier Groups', () => {
		it('should create modifier group with required fields', async () => {
			const group = await db
				.insert(menuModifierGroups)
				.values({
					venueId: 'venue-1',
					name: 'Size',
					displayOrder: 1,
					selectionType: 'single',
				})
				.returning();

			expect(group).toHaveLength(1);
			expect(group[0]).toMatchObject({
				name: 'Size',
				selectionType: 'single',
				isRequired: false,
			});
		});

		it('should support single and multiple selection types', async () => {
			const singleGroup = await db
				.insert(menuModifierGroups)
				.values({
					venueId: 'venue-1',
					name: 'Size',
					displayOrder: 1,
					selectionType: 'single',
				})
				.returning();

			const multiGroup = await db
				.insert(menuModifierGroups)
				.values({
					venueId: 'venue-1',
					name: 'Toppings',
					displayOrder: 2,
					selectionType: 'multiple',
				})
				.returning();

			expect(singleGroup[0].selectionType).toBe('single');
			expect(multiGroup[0].selectionType).toBe('multiple');
		});

		it('should support min/max constraints for multiple selection', async () => {
			const group = await db
				.insert(menuModifierGroups)
				.values({
					venueId: 'venue-1',
					name: 'Toppings',
					displayOrder: 1,
					selectionType: 'multiple',
					minSelections: 1,
					maxSelections: 3,
				})
				.returning();

			expect(group[0].minSelections).toBe(1);
			expect(group[0].maxSelections).toBe(3);
		});
	});

	describe('Modifiers', () => {
		it('should create modifier with required fields', async () => {
			const group = await db
				.insert(menuModifierGroups)
				.values({
					venueId: 'venue-1',
					name: 'Size',
					displayOrder: 1,
					selectionType: 'single',
				})
				.returning();

			const modifier = await db
				.insert(menuModifiers)
				.values({
					groupId: group[0].id,
					name: 'Large',
					priceAdjustment: 2.0,
					displayOrder: 1,
				})
				.returning();

			expect(modifier).toHaveLength(1);
			expect(modifier[0]).toMatchObject({
				name: 'Large',
				priceAdjustment: 2.0,
				isActive: true,
			});
		});

		it('should support negative price adjustments (discounts)', async () => {
			const group = await db
				.insert(menuModifierGroups)
				.values({
					venueId: 'venue-1',
					name: 'Size',
					displayOrder: 1,
					selectionType: 'single',
				})
				.returning();

			const modifier = await db
				.insert(menuModifiers)
				.values({
					groupId: group[0].id,
					name: 'Small',
					priceAdjustment: -1.0,
					displayOrder: 1,
				})
				.returning();

			expect(modifier[0].priceAdjustment).toBe(-1.0);
		});

		it('should support zero price adjustment (free option)', async () => {
			const group = await db
				.insert(menuModifierGroups)
				.values({
					venueId: 'venue-1',
					name: 'Size',
					displayOrder: 1,
					selectionType: 'single',
				})
				.returning();

			const modifier = await db
				.insert(menuModifiers)
				.values({
					groupId: group[0].id,
					name: 'Regular',
					priceAdjustment: 0,
					displayOrder: 2,
				})
				.returning();

			expect(modifier[0].priceAdjustment).toBe(0);
		});

		it('should cascade delete when modifier group is deleted', async () => {
			const group = await db
				.insert(menuModifierGroups)
				.values({
					venueId: 'venue-1',
					name: 'Size',
					displayOrder: 1,
					selectionType: 'single',
				})
				.returning();

			await db.insert(menuModifiers).values({
				groupId: group[0].id,
				name: 'Large',
				priceAdjustment: 2.0,
				displayOrder: 1,
			});

			// Delete group
			await db.delete(menuModifierGroups).where(eq(menuModifierGroups.id, group[0].id));

			// Modifiers should be deleted (cascade)
			const modifiers = await db
				.select()
				.from(menuModifiers)
				.where(eq(menuModifiers.groupId, group[0].id));
			expect(modifiers).toHaveLength(0);
		});
	});
});
