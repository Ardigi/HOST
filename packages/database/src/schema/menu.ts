import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { integer, real, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { venues } from './venues';

/**
 * Menu Categories table
 * Organizes menu items into logical groups (Appetizers, Entrees, Desserts, etc.)
 */
export const menuCategories = sqliteTable(
	'menu_categories',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => createId()),
		venueId: text('venue_id')
			.notNull()
			.references(() => venues.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		slug: text('slug').notNull(),
		description: text('description'),
		displayOrder: integer('display_order').notNull(),
		isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
			.$onUpdateFn(() => new Date()),
	},
	table => ({
		// Unique slug per venue
		uniqueSlugPerVenue: unique().on(table.venueId, table.slug),
	})
);

/**
 * Menu Items table
 * Individual items that can be ordered
 */
export const menuItems = sqliteTable(
	'menu_items',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => createId()),
		venueId: text('venue_id')
			.notNull()
			.references(() => venues.id, { onDelete: 'cascade' }),
		categoryId: text('category_id')
			.notNull()
			.references(() => menuCategories.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		slug: text('slug').notNull(),
		description: text('description'),
		price: real('price').notNull(),
		imageUrl: text('image_url'),
		calories: integer('calories'),
		isVegetarian: integer('is_vegetarian', { mode: 'boolean' }).default(false),
		isVegan: integer('is_vegan', { mode: 'boolean' }).default(false),
		isGlutenFree: integer('is_gluten_free', { mode: 'boolean' }).default(false),
		preparationTime: integer('preparation_time'), // in minutes
		displayOrder: integer('display_order').notNull(),
		isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
		isAvailable: integer('is_available', { mode: 'boolean' }).notNull().default(true),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
			.$onUpdateFn(() => new Date()),
	},
	table => ({
		// Unique slug per venue
		uniqueSlugPerVenue: unique().on(table.venueId, table.slug),
	})
);

/**
 * Menu Modifier Groups table
 * Groups of modifiers (Size, Toppings, Cook Temperature, etc.)
 */
export const menuModifierGroups = sqliteTable('menu_modifier_groups', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	venueId: text('venue_id')
		.notNull()
		.references(() => venues.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	displayOrder: integer('display_order').notNull(),
	selectionType: text('selection_type', { enum: ['single', 'multiple'] }).notNull(),
	isRequired: integer('is_required', { mode: 'boolean' }).notNull().default(false),
	minSelections: integer('min_selections'), // for multiple selection
	maxSelections: integer('max_selections'), // for multiple selection
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdateFn(() => new Date()),
});

/**
 * Menu Modifiers table
 * Individual modifiers within a group (Large, Medium, Small, etc.)
 */
export const menuModifiers = sqliteTable('menu_modifiers', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	groupId: text('group_id')
		.notNull()
		.references(() => menuModifierGroups.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	priceAdjustment: real('price_adjustment').notNull(),
	displayOrder: integer('display_order').notNull(),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdateFn(() => new Date()),
});

/**
 * Menu Item to Modifier Group junction table
 * Many-to-many relationship: items can have multiple modifier groups
 */
export const menuItemModifierGroups = sqliteTable('menu_item_modifier_groups', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	itemId: text('item_id')
		.notNull()
		.references(() => menuItems.id, { onDelete: 'cascade' }),
	groupId: text('group_id')
		.notNull()
		.references(() => menuModifierGroups.id, { onDelete: 'cascade' }),
	displayOrder: integer('display_order').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
});

/**
 * Define relations between tables
 */
export const menuCategoriesRelations = relations(menuCategories, ({ one, many }) => ({
	venue: one(venues, {
		fields: [menuCategories.venueId],
		references: [venues.id],
	}),
	items: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
	venue: one(venues, {
		fields: [menuItems.venueId],
		references: [venues.id],
	}),
	category: one(menuCategories, {
		fields: [menuItems.categoryId],
		references: [menuCategories.id],
	}),
	modifierGroups: many(menuItemModifierGroups),
}));

export const menuModifierGroupsRelations = relations(menuModifierGroups, ({ one, many }) => ({
	venue: one(venues, {
		fields: [menuModifierGroups.venueId],
		references: [venues.id],
	}),
	modifiers: many(menuModifiers),
	items: many(menuItemModifierGroups),
}));

export const menuModifiersRelations = relations(menuModifiers, ({ one }) => ({
	group: one(menuModifierGroups, {
		fields: [menuModifiers.groupId],
		references: [menuModifierGroups.id],
	}),
}));

export const menuItemModifierGroupsRelations = relations(menuItemModifierGroups, ({ one }) => ({
	item: one(menuItems, {
		fields: [menuItemModifierGroups.itemId],
		references: [menuItems.id],
	}),
	group: one(menuModifierGroups, {
		fields: [menuItemModifierGroups.groupId],
		references: [menuModifierGroups.id],
	}),
}));

/**
 * Type exports for use in application
 */
export type MenuCategory = typeof menuCategories.$inferSelect;
export type NewMenuCategory = typeof menuCategories.$inferInsert;
export type MenuItem = typeof menuItems.$inferSelect;
export type NewMenuItem = typeof menuItems.$inferInsert;
export type MenuModifierGroup = typeof menuModifierGroups.$inferSelect;
export type NewMenuModifierGroup = typeof menuModifierGroups.$inferInsert;
export type MenuModifier = typeof menuModifiers.$inferSelect;
export type NewMenuModifier = typeof menuModifiers.$inferInsert;
export type MenuItemModifierGroup = typeof menuItemModifierGroups.$inferSelect;
export type NewMenuItemModifierGroup = typeof menuItemModifierGroups.$inferInsert;
