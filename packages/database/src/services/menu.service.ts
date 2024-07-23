import { createId } from '@paralleldrive/cuid2';
import { and, eq } from 'drizzle-orm';
import type { Database } from '../client';
import * as schema from '../schema';

/**
 * Menu Service
 * Handles all menu-related operations including categories, items, and modifiers
 */
export class MenuService {
	constructor(private db: Database) {}

	// ===== Category Management =====

	async createCategory(input: {
		venueId: string;
		name: string;
		slug: string;
		description?: string;
		displayOrder?: number;
	}) {
		const [category] = await this.db
			.insert(schema.menuCategories)
			.values({
				id: createId(),
				venueId: input.venueId,
				name: input.name,
				slug: input.slug,
				description: input.description,
				displayOrder: input.displayOrder ?? 0,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		return category;
	}

	async listCategories(venueId: string, includeInactive = false) {
		const query = this.db
			.select()
			.from(schema.menuCategories)
			.where(
				includeInactive
					? eq(schema.menuCategories.venueId, venueId)
					: and(
							eq(schema.menuCategories.venueId, venueId),
							eq(schema.menuCategories.isActive, true)
						)
			)
			.orderBy(schema.menuCategories.displayOrder);

		return await query;
	}

	async updateCategory(
		categoryId: string,
		updates: {
			name?: string;
			description?: string;
			displayOrder?: number;
			isActive?: boolean;
		}
	) {
		const [updated] = await this.db
			.update(schema.menuCategories)
			.set({
				...updates,
				updatedAt: new Date(),
			})
			.where(eq(schema.menuCategories.id, categoryId))
			.returning();

		return updated;
	}

	async deleteCategory(categoryId: string) {
		await this.db.delete(schema.menuCategories).where(eq(schema.menuCategories.id, categoryId));
	}

	// ===== Menu Item Management =====

	async createMenuItem(input: {
		venueId: string;
		categoryId: string;
		name: string;
		slug: string;
		description?: string;
		price: number;
		calories?: number;
		isVegetarian?: boolean;
		isVegan?: boolean;
		isGlutenFree?: boolean;
		preparationTime?: number;
		displayOrder?: number;
	}) {
		const [item] = await this.db
			.insert(schema.menuItems)
			.values({
				id: createId(),
				venueId: input.venueId,
				categoryId: input.categoryId,
				name: input.name,
				slug: input.slug,
				description: input.description,
				price: input.price,
				calories: input.calories,
				isVegetarian: input.isVegetarian ?? false,
				isVegan: input.isVegan ?? false,
				isGlutenFree: input.isGlutenFree ?? false,
				preparationTime: input.preparationTime,
				displayOrder: input.displayOrder ?? 0,
				isActive: true,
				isAvailable: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		return item;
	}

	async listMenuItems(
		venueId: string,
		filters?: {
			categoryId?: string;
			isAvailable?: boolean;
			isActive?: boolean;
		}
	) {
		const conditions = [eq(schema.menuItems.venueId, venueId)];

		if (filters?.categoryId) {
			conditions.push(eq(schema.menuItems.categoryId, filters.categoryId));
		}
		if (filters?.isAvailable !== undefined) {
			conditions.push(eq(schema.menuItems.isAvailable, filters.isAvailable));
		}
		if (filters?.isActive !== undefined) {
			conditions.push(eq(schema.menuItems.isActive, filters.isActive));
		}

		return await this.db
			.select()
			.from(schema.menuItems)
			.where(and(...conditions))
			.orderBy(schema.menuItems.displayOrder);
	}

	async getMenuItem(itemId: string) {
		const [item] = await this.db
			.select()
			.from(schema.menuItems)
			.where(eq(schema.menuItems.id, itemId));

		return item || null;
	}

	async updateMenuItem(
		itemId: string,
		updates: {
			name?: string;
			description?: string;
			price?: number;
			calories?: number;
			isVegetarian?: boolean;
			isVegan?: boolean;
			isGlutenFree?: boolean;
			preparationTime?: number;
			displayOrder?: number;
			isActive?: boolean;
		}
	) {
		const [updated] = await this.db
			.update(schema.menuItems)
			.set({
				...updates,
				updatedAt: new Date(),
			})
			.where(eq(schema.menuItems.id, itemId))
			.returning();

		return updated;
	}

	async toggleAvailability(itemId: string, isAvailable: boolean) {
		const [updated] = await this.db
			.update(schema.menuItems)
			.set({
				isAvailable,
				updatedAt: new Date(),
			})
			.where(eq(schema.menuItems.id, itemId))
			.returning();

		return updated;
	}

	async deleteMenuItem(itemId: string) {
		await this.db.delete(schema.menuItems).where(eq(schema.menuItems.id, itemId));
	}

	// ===== Modifier Management =====

	async createModifierGroup(input: {
		venueId: string;
		name: string;
		selectionType?: 'single' | 'multiple';
		isRequired?: boolean;
		minSelections?: number;
		maxSelections?: number;
		displayOrder?: number;
	}) {
		const [group] = await this.db
			.insert(schema.menuModifierGroups)
			.values({
				id: createId(),
				venueId: input.venueId,
				name: input.name,
				selectionType: input.selectionType ?? 'single',
				isRequired: input.isRequired ?? false,
				minSelections: input.minSelections,
				maxSelections: input.maxSelections,
				displayOrder: input.displayOrder ?? 0,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		return group;
	}

	async createModifier(input: {
		groupId: string;
		name: string;
		priceAdjustment?: number;
		displayOrder?: number;
	}) {
		const [modifier] = await this.db
			.insert(schema.menuModifiers)
			.values({
				id: createId(),
				groupId: input.groupId,
				name: input.name,
				priceAdjustment: input.priceAdjustment ?? 0,
				displayOrder: input.displayOrder ?? 0,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		return modifier;
	}

	async attachModifierGroup(menuItemId: string, modifierGroupId: string, displayOrder: number) {
		const [link] = await this.db
			.insert(schema.menuItemModifierGroups)
			.values({
				id: createId(),
				itemId: menuItemId,
				groupId: modifierGroupId,
				displayOrder,
				createdAt: new Date(),
			})
			.returning();

		return link;
	}

	async getMenuItemWithModifiers(itemId: string) {
		// Get the menu item
		const item = await this.getMenuItem(itemId);
		if (!item) return null;

		// Get modifier groups for this item
		const modifierGroupLinks = await this.db
			.select()
			.from(schema.menuItemModifierGroups)
			.where(eq(schema.menuItemModifierGroups.itemId, itemId))
			.orderBy(schema.menuItemModifierGroups.displayOrder);

		const modifierGroups = [];
		for (const link of modifierGroupLinks) {
			const [group] = await this.db
				.select()
				.from(schema.menuModifierGroups)
				.where(eq(schema.menuModifierGroups.id, link.groupId));

			if (group) {
				const modifiers = await this.db
					.select()
					.from(schema.menuModifiers)
					.where(eq(schema.menuModifiers.groupId, group.id))
					.orderBy(schema.menuModifiers.displayOrder);

				modifierGroups.push({
					...group,
					modifiers,
				});
			}
		}

		return {
			...item,
			modifierGroups,
		};
	}
}
