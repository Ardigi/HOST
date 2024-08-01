import type { Database } from '@host/database';
import * as schema from '@host/database/schema';
import { MenuService } from '@host/database/services';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Context } from '../trpc';
import { menuRouter } from './menu.router';

/**
 * Menu Workflow Integration Tests
 * Tests the full stack: tRPC API → MenuService → Database
 * Uses real in-memory SQLite database (not mocks)
 */
describe('Menu Workflow Integration Tests', () => {
	let db: Database;
	let menuService: MenuService;
	let venueId: string;
	let userId: string;

	/**
	 * Create authenticated test context with real services
	 */
	function createIntegrationContext(): Context {
		return {
			db,
			user: {
				id: userId,
				email: 'test@example.com',
				firstName: 'Test',
				lastName: 'User',
				venueId,
				roles: ['server'],
			},
			menuService,
			// biome-ignore lint/suspicious/noExplicitAny: Integration test context doesn't use all services
			orderService: null as any, // Not needed for menu tests
		};
	}

	beforeEach(async () => {
		// Create fresh in-memory database for each test
		const client = createClient({ url: ':memory:' });
		db = drizzle(client, { schema }) as Database;

		// Enable foreign key constraints
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
			`CREATE TABLE IF NOT EXISTS menu_item_modifier_groups (
				id TEXT PRIMARY KEY,
				item_id TEXT NOT NULL,
				group_id TEXT NOT NULL,
				display_order INTEGER NOT NULL,
				created_at INTEGER NOT NULL,
				FOREIGN KEY (item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
				FOREIGN KEY (group_id) REFERENCES menu_modifier_groups(id) ON DELETE CASCADE
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
				email: 'test@example.com',
				firstName: 'Test',
				lastName: 'User',
				venueId,
				role: 'server',
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();
		userId = user.id;

		// Initialize MenuService with real database
		menuService = new MenuService(db);
	});

	afterEach(async () => {
		// Cleanup handled by :memory: database
	});

	// ===== Category Workflow =====

	describe('Category Management Workflow', () => {
		it('should create, list, update, and delete category through API', async () => {
			const caller = menuRouter.createCaller(createIntegrationContext());

			// 1. Create category
			const created = await caller.createCategory({
				venueId,
				name: 'Appetizers',
				slug: 'appetizers',
				description: 'Start your meal right',
				displayOrder: 0,
			});

			expect(created.id).toBeDefined();
			expect(created.name).toBe('Appetizers');
			expect(created.slug).toBe('appetizers');
			expect(created.isActive).toBe(true);

			// 2. List categories - should include new category
			const { categories } = await caller.listCategories({
				venueId,
				includeInactive: false,
			});

			expect(categories).toHaveLength(1);
			expect(categories[0].name).toBe('Appetizers');

			// 3. Update category
			const updated = await caller.updateCategory({
				categoryId: created.id,
				name: 'Starters',
				description: 'Updated description',
			});

			expect(updated.name).toBe('Starters');
			expect(updated.description).toBe('Updated description');
			expect(updated.slug).toBe('appetizers'); // Unchanged

			// 4. Deactivate category
			const deactivated = await caller.updateCategory({
				categoryId: created.id,
				isActive: false,
			});

			expect(deactivated.isActive).toBe(false);

			// 5. List without inactive - should be empty
			const { categories: activeOnly } = await caller.listCategories({
				venueId,
				includeInactive: false,
			});

			expect(activeOnly).toHaveLength(0);

			// 6. List with inactive - should include deactivated category
			const { categories: withInactive } = await caller.listCategories({
				venueId,
				includeInactive: true,
			});

			expect(withInactive).toHaveLength(1);
			expect(withInactive[0].isActive).toBe(false);

			// 7. Delete category
			await caller.deleteCategory({ categoryId: created.id });

			// 8. Verify deletion
			const { categories: afterDelete } = await caller.listCategories({
				venueId,
				includeInactive: true,
			});

			expect(afterDelete).toHaveLength(0);
		});

		it('should order categories by display_order', async () => {
			const caller = menuRouter.createCaller(createIntegrationContext());

			// Create categories with different display orders
			await caller.createCategory({
				venueId,
				name: 'Category C',
				slug: 'category-c',
				displayOrder: 2,
			});

			await caller.createCategory({
				venueId,
				name: 'Category A',
				slug: 'category-a',
				displayOrder: 0,
			});

			await caller.createCategory({
				venueId,
				name: 'Category B',
				slug: 'category-b',
				displayOrder: 1,
			});

			// List categories - should be ordered by displayOrder
			const { categories } = await caller.listCategories({
				venueId,
				includeInactive: false,
			});

			expect(categories[0].name).toBe('Category A');
			expect(categories[1].name).toBe('Category B');
			expect(categories[2].name).toBe('Category C');
		});
	});

	// ===== Menu Item Workflow =====

	describe('Menu Item Management Workflow', () => {
		let categoryId: string;

		beforeEach(async () => {
			// Create test category
			const [category] = await db
				.insert(schema.menuCategories)
				.values({
					id: 'category-1',
					venueId,
					name: 'Appetizers',
					slug: 'appetizers',
					displayOrder: 0,
					isActive: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();
			categoryId = category.id;
		});

		it('should create, list, update, and delete menu item through API', async () => {
			const caller = menuRouter.createCaller(createIntegrationContext());

			// 1. Create menu item
			const created = await caller.createItem({
				venueId,
				categoryId,
				name: 'Buffalo Wings',
				slug: 'buffalo-wings',
				description: 'Spicy chicken wings',
				price: 12.99,
				calories: 850,
				isVegetarian: false,
				isVegan: false,
				isGlutenFree: false,
				preparationTime: 15,
				displayOrder: 0,
			});

			expect(created.id).toBeDefined();
			expect(created.name).toBe('Buffalo Wings');
			expect(created.price).toBe(12.99);
			expect(created.isActive).toBe(true);
			expect(created.isAvailable).toBe(true);

			// 2. Get single item
			const retrieved = await caller.getItem({ itemId: created.id });

			expect(retrieved.id).toBe(created.id);
			expect(retrieved.name).toBe('Buffalo Wings');

			// 3. List items
			const { items } = await caller.listItems({ venueId });

			expect(items).toHaveLength(1);
			expect(items[0].name).toBe('Buffalo Wings');

			// 4. Update item
			const updated = await caller.updateItem({
				itemId: created.id,
				price: 14.99,
				description: 'Extra spicy chicken wings',
			});

			expect(updated.price).toBe(14.99);
			expect(updated.description).toBe('Extra spicy chicken wings');
			expect(updated.name).toBe('Buffalo Wings'); // Unchanged

			// 5. Toggle availability to false
			const unavailable = await caller.toggleAvailability({
				itemId: created.id,
				isAvailable: false,
			});

			expect(unavailable.isAvailable).toBe(false);

			// 6. List available items only - should be empty
			const { items: availableOnly } = await caller.listItems({
				venueId,
				isAvailable: true,
			});

			expect(availableOnly).toHaveLength(0);

			// 7. Toggle availability back to true
			const available = await caller.toggleAvailability({
				itemId: created.id,
				isAvailable: true,
			});

			expect(available.isAvailable).toBe(true);

			// 8. Delete item
			await caller.deleteItem({ itemId: created.id });

			// 9. Verify deletion - should throw NOT_FOUND
			await expect(caller.getItem({ itemId: created.id })).rejects.toThrow('Menu item not found');
		});

		it('should filter items by category', async () => {
			const caller = menuRouter.createCaller(createIntegrationContext());

			// Create second category
			const [category2] = await db
				.insert(schema.menuCategories)
				.values({
					id: 'category-2',
					venueId,
					name: 'Entrees',
					slug: 'entrees',
					displayOrder: 1,
					isActive: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			// Create items in different categories
			await caller.createItem({
				venueId,
				categoryId,
				name: 'Wings',
				slug: 'wings',
				price: 12.99,
				displayOrder: 0,
			});

			await caller.createItem({
				venueId,
				categoryId: category2.id,
				name: 'Steak',
				slug: 'steak',
				price: 29.99,
				displayOrder: 0,
			});

			// List items for first category
			const { items: appetizers } = await caller.listItems({
				venueId,
				categoryId,
			});

			expect(appetizers).toHaveLength(1);
			expect(appetizers[0].name).toBe('Wings');

			// List items for second category
			const { items: entrees } = await caller.listItems({
				venueId,
				categoryId: category2.id,
			});

			expect(entrees).toHaveLength(1);
			expect(entrees[0].name).toBe('Steak');

			// List all items
			const { items: allItems } = await caller.listItems({ venueId });

			expect(allItems).toHaveLength(2);
		});

		it('should order items by display_order', async () => {
			const caller = menuRouter.createCaller(createIntegrationContext());

			// Create items with different display orders
			await caller.createItem({
				venueId,
				categoryId,
				name: 'Item C',
				slug: 'item-c',
				price: 10,
				displayOrder: 2,
			});

			await caller.createItem({
				venueId,
				categoryId,
				name: 'Item A',
				slug: 'item-a',
				price: 10,
				displayOrder: 0,
			});

			await caller.createItem({
				venueId,
				categoryId,
				name: 'Item B',
				slug: 'item-b',
				price: 10,
				displayOrder: 1,
			});

			// List items - should be ordered by displayOrder
			const { items } = await caller.listItems({ venueId });

			expect(items[0].name).toBe('Item A');
			expect(items[1].name).toBe('Item B');
			expect(items[2].name).toBe('Item C');
		});
	});

	// ===== Modifier Workflow =====

	describe('Modifier Management Workflow', () => {
		let categoryId: string;
		let itemId: string;

		beforeEach(async () => {
			// Create test category and item
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

			const [item] = await db
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
			itemId = item.id;
		});

		it('should get menu item with modifiers through service integration', async () => {
			// This tests MenuService integration, not tRPC router
			// Create modifier group
			const group = await menuService.createModifierGroup({
				venueId,
				name: 'Toppings',
				selectionType: 'multiple',
				isRequired: false,
				minSelections: 0,
				maxSelections: 5,
			});

			// Create modifiers
			await menuService.createModifier({
				groupId: group.id,
				name: 'Lettuce',
				priceAdjustment: 0,
			});

			await menuService.createModifier({
				groupId: group.id,
				name: 'Bacon',
				priceAdjustment: 2.0,
			});

			// Attach modifier group to menu item
			await menuService.attachModifierGroup(itemId, group.id, 0);

			// Get item with modifiers
			const itemWithModifiers = await menuService.getMenuItemWithModifiers(itemId);

			expect(itemWithModifiers).toBeDefined();
			expect(itemWithModifiers?.modifierGroups).toHaveLength(1);
			expect(itemWithModifiers?.modifierGroups[0].name).toBe('Toppings');
			expect(itemWithModifiers?.modifierGroups[0].modifiers).toHaveLength(2);
		});
	});

	// ===== Error Handling & Edge Cases =====

	describe('Error Handling & Validation', () => {
		it('should reject invalid slug format for category', async () => {
			const caller = menuRouter.createCaller(createIntegrationContext());

			await expect(
				caller.createCategory({
					venueId,
					name: 'Test',
					slug: 'Invalid Slug With Spaces!',
					displayOrder: 0,
				})
			).rejects.toThrow();
		});

		it('should reject invalid slug format for menu item', async () => {
			const caller = menuRouter.createCaller(createIntegrationContext());

			// Create category first
			const category = await caller.createCategory({
				venueId,
				name: 'Test',
				slug: 'test',
				displayOrder: 0,
			});

			await expect(
				caller.createItem({
					venueId,
					categoryId: category.id,
					name: 'Item',
					slug: 'INVALID SLUG!',
					price: 10,
					displayOrder: 0,
				})
			).rejects.toThrow();
		});

		it('should reject negative price for menu item', async () => {
			const caller = menuRouter.createCaller(createIntegrationContext());

			// Create category first
			const category = await caller.createCategory({
				venueId,
				name: 'Test',
				slug: 'test',
				displayOrder: 0,
			});

			await expect(
				caller.createItem({
					venueId,
					categoryId: category.id,
					name: 'Item',
					slug: 'item',
					price: -5.99,
					displayOrder: 0,
				})
			).rejects.toThrow();
		});

		it('should throw NOT_FOUND when updating non-existent category', async () => {
			const caller = menuRouter.createCaller(createIntegrationContext());

			await expect(
				caller.updateCategory({
					categoryId: 'non-existent-id',
					name: 'Updated',
				})
			).rejects.toThrow('Category not found');
		});

		it('should throw NOT_FOUND when updating non-existent menu item', async () => {
			const caller = menuRouter.createCaller(createIntegrationContext());

			await expect(
				caller.updateItem({
					itemId: 'non-existent-id',
					price: 15.99,
				})
			).rejects.toThrow('Menu item not found');
		});

		it('should throw NOT_FOUND when getting non-existent menu item', async () => {
			const caller = menuRouter.createCaller(createIntegrationContext());

			await expect(caller.getItem({ itemId: 'non-existent-id' })).rejects.toThrow(
				'Menu item not found'
			);
		});
	});

	// ===== Multi-Venue Isolation =====

	describe('Multi-Venue Data Isolation', () => {
		let venue2Id: string;

		beforeEach(async () => {
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
			venue2Id = venue2.id;
		});

		it('should isolate menu items by venue', async () => {
			const caller = menuRouter.createCaller(createIntegrationContext());

			// Create category for venue 1
			const category1 = await caller.createCategory({
				venueId,
				name: 'Appetizers',
				slug: 'appetizers',
				displayOrder: 0,
			});

			// Create category for venue 2 (different context, but same database)
			const baseContext = createIntegrationContext();
			const caller2 = menuRouter.createCaller({
				...baseContext,
				user: {
					...baseContext.user,
					venueId: venue2Id,
				},
			});

			const category2 = await caller2.createCategory({
				venueId: venue2Id,
				name: 'Appetizers',
				slug: 'appetizers',
				displayOrder: 0,
			});

			// Create items for each venue
			await caller.createItem({
				venueId,
				categoryId: category1.id,
				name: 'Venue 1 Wings',
				slug: 'wings',
				price: 12.99,
				displayOrder: 0,
			});

			await caller2.createItem({
				venueId: venue2Id,
				categoryId: category2.id,
				name: 'Venue 2 Wings',
				slug: 'wings',
				price: 14.99,
				displayOrder: 0,
			});

			// List items for venue 1 - should only see venue 1 items
			const { items: venue1Items } = await caller.listItems({ venueId });
			expect(venue1Items).toHaveLength(1);
			expect(venue1Items[0].name).toBe('Venue 1 Wings');
			expect(venue1Items[0].price).toBe(12.99);

			// List items for venue 2 - should only see venue 2 items
			const { items: venue2Items } = await caller2.listItems({ venueId: venue2Id });
			expect(venue2Items).toHaveLength(1);
			expect(venue2Items[0].name).toBe('Venue 2 Wings');
			expect(venue2Items[0].price).toBe(14.99);
		});
	});

	// ===== Full Menu Workflow =====

	describe('Full Menu Workflow', () => {
		it('should return complete menu with categories and items', async () => {
			const caller = menuRouter.createCaller(createIntegrationContext());

			// Create categories
			const appetizersCategory = await caller.createCategory({
				venueId,
				name: 'Appetizers',
				slug: 'appetizers',
				displayOrder: 0,
			});

			const entreesCategory = await caller.createCategory({
				venueId,
				name: 'Entrees',
				slug: 'entrees',
				displayOrder: 1,
			});

			// Create items for appetizers
			await caller.createItem({
				venueId,
				categoryId: appetizersCategory.id,
				name: 'Wings',
				slug: 'wings',
				price: 12.99,
				displayOrder: 0,
			});

			await caller.createItem({
				venueId,
				categoryId: appetizersCategory.id,
				name: 'Nachos',
				slug: 'nachos',
				price: 10.99,
				displayOrder: 1,
			});

			// Create items for entrees
			await caller.createItem({
				venueId,
				categoryId: entreesCategory.id,
				name: 'Burger',
				slug: 'burger',
				price: 15.99,
				displayOrder: 0,
			});

			// Get full menu
			const { menu } = await caller.getFullMenu({
				venueId,
				includeInactive: false,
			});

			// Verify structure
			expect(menu).toHaveLength(2);

			// Verify first category (Appetizers)
			expect(menu[0].name).toBe('Appetizers');
			expect(menu[0].items).toHaveLength(2);
			expect(menu[0].items[0].name).toBe('Wings');
			expect(menu[0].items[1].name).toBe('Nachos');

			// Verify second category (Entrees)
			expect(menu[1].name).toBe('Entrees');
			expect(menu[1].items).toHaveLength(1);
			expect(menu[1].items[0].name).toBe('Burger');
		});

		it('should filter full menu by active and available items', async () => {
			const caller = menuRouter.createCaller(createIntegrationContext());

			// Create category
			const category = await caller.createCategory({
				venueId,
				name: 'Appetizers',
				slug: 'appetizers',
				displayOrder: 0,
			});

			// Create active and available item
			const _activeItem = await caller.createItem({
				venueId,
				categoryId: category.id,
				name: 'Active Item',
				slug: 'active-item',
				price: 10,
				displayOrder: 0,
			});

			// Create inactive item
			const inactiveItem = await caller.createItem({
				venueId,
				categoryId: category.id,
				name: 'Inactive Item',
				slug: 'inactive-item',
				price: 10,
				displayOrder: 1,
			});

			await caller.updateItem({
				itemId: inactiveItem.id,
				isActive: false,
			});

			// Create unavailable item
			const unavailableItem = await caller.createItem({
				venueId,
				categoryId: category.id,
				name: 'Unavailable Item',
				slug: 'unavailable-item',
				price: 10,
				displayOrder: 2,
			});

			await caller.toggleAvailability({
				itemId: unavailableItem.id,
				isAvailable: false,
			});

			// Get full menu without inactive
			const { menu: activeMenu } = await caller.getFullMenu({
				venueId,
				includeInactive: false,
			});

			// Should only include active and available item
			expect(activeMenu[0].items).toHaveLength(1);
			expect(activeMenu[0].items[0].name).toBe('Active Item');

			// Get full menu with inactive
			const { menu: fullMenu } = await caller.getFullMenu({
				venueId,
				includeInactive: true,
			});

			// Should include all items
			expect(fullMenu[0].items).toHaveLength(3);
		});
	});
});
