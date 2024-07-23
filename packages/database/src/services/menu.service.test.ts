import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Database } from '../client';
import * as schema from '../schema';
import { MenuService } from './menu.service';

describe('MenuService - TDD', () => {
	let db: Database;
	let service: MenuService;
	let venueId: string;
	let categoryId: string;

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
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			)
		`);

		await client.execute(`
			CREATE TABLE menu_categories (
				id TEXT PRIMARY KEY,
				venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
				name TEXT NOT NULL,
				slug TEXT NOT NULL,
				description TEXT,
				display_order INTEGER NOT NULL DEFAULT 0,
				is_active INTEGER NOT NULL DEFAULT 1,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			)
		`);

		await client.execute(`
			CREATE TABLE menu_items (
				id TEXT PRIMARY KEY,
				venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
				category_id TEXT NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
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
				updated_at INTEGER NOT NULL
			)
		`);

		await client.execute(`
			CREATE TABLE menu_modifier_groups (
				id TEXT PRIMARY KEY,
				venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
				name TEXT NOT NULL,
				display_order INTEGER NOT NULL DEFAULT 0,
				selection_type TEXT NOT NULL DEFAULT 'single',
				is_required INTEGER NOT NULL DEFAULT 0,
				min_selections INTEGER,
				max_selections INTEGER,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			)
		`);

		await client.execute(`
			CREATE TABLE menu_modifiers (
				id TEXT PRIMARY KEY,
				group_id TEXT NOT NULL REFERENCES menu_modifier_groups(id) ON DELETE CASCADE,
				name TEXT NOT NULL,
				price_adjustment REAL NOT NULL DEFAULT 0,
				display_order INTEGER NOT NULL DEFAULT 0,
				is_active INTEGER NOT NULL DEFAULT 1,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			)
		`);

		await client.execute(`
			CREATE TABLE menu_item_modifier_groups (
				id TEXT PRIMARY KEY,
				item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
				group_id TEXT NOT NULL REFERENCES menu_modifier_groups(id) ON DELETE CASCADE,
				display_order INTEGER NOT NULL DEFAULT 0,
				created_at INTEGER NOT NULL
			)
		`);

		// Insert test data
		const now = Date.now();
		venueId = 'venue-test-001';
		categoryId = 'category-test-001';

		await client.execute(`
			INSERT INTO venues (id, name, slug, email, created_at, updated_at)
			VALUES ('${venueId}', 'Test Venue', 'test-venue', 'test@venue.com', ${now}, ${now})
		`);

		await client.execute(`
			INSERT INTO menu_categories (id, venue_id, name, slug, description, display_order, is_active, created_at, updated_at)
			VALUES ('${categoryId}', '${venueId}', 'Appetizers', 'appetizers', 'Starters', 1, 1, ${now}, ${now})
		`);

		service = new MenuService(db);
	});

	describe('Category Management', () => {
		it('should create a new category', async () => {
			const category = await service.createCategory({
				venueId,
				name: 'Entrees',
				slug: 'entrees',
				description: 'Main dishes',
				displayOrder: 2,
			});

			expect(category).toBeDefined();
			expect(category.name).toBe('Entrees');
			expect(category.venueId).toBe(venueId);
		});

		it('should list all categories for a venue', async () => {
			const categories = await service.listCategories(venueId);

			expect(categories).toHaveLength(1);
			expect(categories[0].name).toBe('Appetizers');
		});

		it('should update a category', async () => {
			const updated = await service.updateCategory(categoryId, {
				name: 'Starters',
				description: 'Begin your meal',
			});

			expect(updated.name).toBe('Starters');
			expect(updated.description).toBe('Begin your meal');
		});

		it('should delete a category', async () => {
			await service.deleteCategory(categoryId);
			const categories = await service.listCategories(venueId);
			expect(categories).toHaveLength(0);
		});
	});

	describe('Menu Item Management', () => {
		it('should create a menu item', async () => {
			const item = await service.createMenuItem({
				venueId,
				categoryId,
				name: 'Wings',
				slug: 'wings',
				description: 'Crispy wings',
				price: 12.99,
				calories: 850,
				isVegetarian: false,
				isVegan: false,
				isGlutenFree: false,
				preparationTime: 15,
				displayOrder: 1,
			});

			expect(item).toBeDefined();
			expect(item.name).toBe('Wings');
			expect(item.price).toBe(12.99);
		});

		it('should list menu items by category', async () => {
			await service.createMenuItem({
				venueId,
				categoryId,
				name: 'Nachos',
				slug: 'nachos',
				price: 10.99,
			});

			const items = await service.listMenuItems(venueId, { categoryId });

			expect(items).toHaveLength(1);
			expect(items[0].name).toBe('Nachos');
		});

		it('should get menu item by id', async () => {
			const created = await service.createMenuItem({
				venueId,
				categoryId,
				name: 'Burger',
				slug: 'burger',
				price: 14.99,
			});

			const item = await service.getMenuItem(created.id);

			expect(item).toBeDefined();
			expect(item?.name).toBe('Burger');
		});

		it('should update menu item', async () => {
			const created = await service.createMenuItem({
				venueId,
				categoryId,
				name: 'Salad',
				slug: 'salad',
				price: 8.99,
			});

			const updated = await service.updateMenuItem(created.id, {
				price: 9.99,
				description: 'Fresh garden salad',
			});

			expect(updated.price).toBe(9.99);
			expect(updated.description).toBe('Fresh garden salad');
		});

		it('should toggle menu item availability', async () => {
			const created = await service.createMenuItem({
				venueId,
				categoryId,
				name: 'Soup',
				slug: 'soup',
				price: 6.99,
			});

			const unavailable = await service.toggleAvailability(created.id, false);
			expect(unavailable.isAvailable).toBe(false);

			const available = await service.toggleAvailability(created.id, true);
			expect(available.isAvailable).toBe(true);
		});

		it('should delete menu item', async () => {
			const created = await service.createMenuItem({
				venueId,
				categoryId,
				name: 'Dessert',
				slug: 'dessert',
				price: 7.99,
			});

			await service.deleteMenuItem(created.id);
			const item = await service.getMenuItem(created.id);
			expect(item).toBeNull();
		});
	});

	describe('Modifier Management', () => {
		it('should create modifier group', async () => {
			const group = await service.createModifierGroup({
				venueId,
				name: 'Cook Temperature',
				selectionType: 'single',
				isRequired: true,
				minSelections: 1,
				maxSelections: 1,
			});

			expect(group).toBeDefined();
			expect(group.name).toBe('Cook Temperature');
			expect(group.isRequired).toBe(true);
		});

		it('should create modifier', async () => {
			const group = await service.createModifierGroup({
				venueId,
				name: 'Toppings',
				selectionType: 'multiple',
			});

			const modifier = await service.createModifier({
				groupId: group.id,
				name: 'Extra Cheese',
				priceAdjustment: 1.5,
				displayOrder: 1,
			});

			expect(modifier).toBeDefined();
			expect(modifier.name).toBe('Extra Cheese');
			expect(modifier.priceAdjustment).toBe(1.5);
		});

		it('should attach modifier group to menu item', async () => {
			const item = await service.createMenuItem({
				venueId,
				categoryId,
				name: 'Pizza',
				slug: 'pizza',
				price: 15.99,
			});

			const group = await service.createModifierGroup({
				venueId,
				name: 'Size',
				selectionType: 'single',
			});

			await service.attachModifierGroup(item.id, group.id, 1);

			const itemWithModifiers = await service.getMenuItemWithModifiers(item.id);
			expect(itemWithModifiers?.modifierGroups).toHaveLength(1);
			expect(itemWithModifiers?.modifierGroups[0].name).toBe('Size');
		});
	});
});
