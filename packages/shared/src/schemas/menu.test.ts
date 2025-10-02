/**
 * @description Tests for menu validation schemas
 * @dependencies Zod
 * @coverage-target 95% (critical validation logic)
 */

import { describe, expect, it } from 'vitest';
import {
	menuCategorySchema,
	menuItemSchema,
	menuModifierGroupSchema,
	menuModifierSchema,
	newMenuCategorySchema,
	newMenuItemSchema,
	newMenuModifierGroupSchema,
	newMenuModifierSchema,
} from './menu.js';

describe('Menu Validation Schemas', () => {
	describe('Menu Category Schema', () => {
		it('should validate valid menu category', () => {
			const validCategory = {
				venueId: 'venue-123',
				name: 'Appetizers',
				slug: 'appetizers',
				displayOrder: 1,
			};

			const result = newMenuCategorySchema.safeParse(validCategory);
			expect(result.success).toBe(true);
		});

		it('should reject empty name', () => {
			const invalidCategory = {
				venueId: 'venue-123',
				name: '',
				slug: 'appetizers',
				displayOrder: 1,
			};

			const result = newMenuCategorySchema.safeParse(invalidCategory);
			expect(result.success).toBe(false);
		});

		it('should reject invalid slug format', () => {
			const invalidCategory = {
				venueId: 'venue-123',
				name: 'Appetizers',
				slug: 'Invalid Slug!',
				displayOrder: 1,
			};

			const result = newMenuCategorySchema.safeParse(invalidCategory);
			expect(result.success).toBe(false);
		});

		it('should reject negative display order', () => {
			const invalidCategory = {
				venueId: 'venue-123',
				name: 'Appetizers',
				slug: 'appetizers',
				displayOrder: -1,
			};

			const result = newMenuCategorySchema.safeParse(invalidCategory);
			expect(result.success).toBe(false);
		});

		it('should accept optional description', () => {
			const validCategory = {
				venueId: 'venue-123',
				name: 'Appetizers',
				slug: 'appetizers',
				displayOrder: 1,
				description: 'Delicious starters',
			};

			const result = newMenuCategorySchema.safeParse(validCategory);
			expect(result.success).toBe(true);
		});

		it('should include timestamps in full schema', () => {
			const validCategory = {
				id: 'cat-123',
				venueId: 'venue-123',
				name: 'Appetizers',
				slug: 'appetizers',
				displayOrder: 1,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = menuCategorySchema.safeParse(validCategory);
			expect(result.success).toBe(true);
		});
	});

	describe('Menu Item Schema', () => {
		it('should validate valid menu item', () => {
			const validItem = {
				venueId: 'venue-123',
				categoryId: 'cat-123',
				name: 'Burger',
				slug: 'burger',
				price: 12.99,
				displayOrder: 1,
			};

			const result = newMenuItemSchema.safeParse(validItem);
			expect(result.success).toBe(true);
		});

		it('should reject negative price', () => {
			const invalidItem = {
				venueId: 'venue-123',
				categoryId: 'cat-123',
				name: 'Burger',
				slug: 'burger',
				price: -5.0,
				displayOrder: 1,
			};

			const result = newMenuItemSchema.safeParse(invalidItem);
			expect(result.success).toBe(false);
		});

		it('should reject zero price', () => {
			const invalidItem = {
				venueId: 'venue-123',
				categoryId: 'cat-123',
				name: 'Burger',
				slug: 'burger',
				price: 0,
				displayOrder: 1,
			};

			const result = newMenuItemSchema.safeParse(invalidItem);
			expect(result.success).toBe(false);
		});

		it('should accept valid price with decimals', () => {
			const validItem = {
				venueId: 'venue-123',
				categoryId: 'cat-123',
				name: 'Burger',
				slug: 'burger',
				price: 12.99,
				displayOrder: 1,
			};

			const result = newMenuItemSchema.safeParse(validItem);
			expect(result.success).toBe(true);
		});

		it('should reject negative calories', () => {
			const invalidItem = {
				venueId: 'venue-123',
				categoryId: 'cat-123',
				name: 'Burger',
				slug: 'burger',
				price: 12.99,
				displayOrder: 1,
				calories: -100,
			};

			const result = newMenuItemSchema.safeParse(invalidItem);
			expect(result.success).toBe(false);
		});

		it('should reject negative preparation time', () => {
			const invalidItem = {
				venueId: 'venue-123',
				categoryId: 'cat-123',
				name: 'Burger',
				slug: 'burger',
				price: 12.99,
				displayOrder: 1,
				preparationTime: -5,
			};

			const result = newMenuItemSchema.safeParse(invalidItem);
			expect(result.success).toBe(false);
		});

		it('should accept all optional dietary fields', () => {
			const validItem = {
				venueId: 'venue-123',
				categoryId: 'cat-123',
				name: 'Salad',
				slug: 'salad',
				price: 8.99,
				displayOrder: 1,
				isVegetarian: true,
				isVegan: true,
				isGlutenFree: true,
			};

			const result = newMenuItemSchema.safeParse(validItem);
			expect(result.success).toBe(true);
		});

		it('should validate URL format for imageUrl', () => {
			const invalidItem = {
				venueId: 'venue-123',
				categoryId: 'cat-123',
				name: 'Burger',
				slug: 'burger',
				price: 12.99,
				displayOrder: 1,
				imageUrl: 'not-a-url',
			};

			const result = newMenuItemSchema.safeParse(invalidItem);
			expect(result.success).toBe(false);
		});

		it('should accept valid imageUrl', () => {
			const validItem = {
				venueId: 'venue-123',
				categoryId: 'cat-123',
				name: 'Burger',
				slug: 'burger',
				price: 12.99,
				displayOrder: 1,
				imageUrl: 'https://example.com/burger.jpg',
			};

			const result = newMenuItemSchema.safeParse(validItem);
			expect(result.success).toBe(true);
		});
	});

	describe('Modifier Group Schema', () => {
		it('should validate valid single-selection modifier group', () => {
			const validGroup = {
				venueId: 'venue-123',
				name: 'Size',
				displayOrder: 1,
				selectionType: 'single',
			};

			const result = newMenuModifierGroupSchema.safeParse(validGroup);
			expect(result.success).toBe(true);
		});

		it('should validate valid multiple-selection modifier group', () => {
			const validGroup = {
				venueId: 'venue-123',
				name: 'Toppings',
				displayOrder: 1,
				selectionType: 'multiple',
			};

			const result = newMenuModifierGroupSchema.safeParse(validGroup);
			expect(result.success).toBe(true);
		});

		it('should reject invalid selection type', () => {
			const invalidGroup = {
				venueId: 'venue-123',
				name: 'Size',
				displayOrder: 1,
				selectionType: 'invalid',
			};

			const result = newMenuModifierGroupSchema.safeParse(invalidGroup);
			expect(result.success).toBe(false);
		});

		it('should accept min/max selections for multiple type', () => {
			const validGroup = {
				venueId: 'venue-123',
				name: 'Toppings',
				displayOrder: 1,
				selectionType: 'multiple',
				minSelections: 1,
				maxSelections: 3,
			};

			const result = newMenuModifierGroupSchema.safeParse(validGroup);
			expect(result.success).toBe(true);
		});

		it('should reject negative min selections', () => {
			const invalidGroup = {
				venueId: 'venue-123',
				name: 'Toppings',
				displayOrder: 1,
				selectionType: 'multiple',
				minSelections: -1,
			};

			const result = newMenuModifierGroupSchema.safeParse(invalidGroup);
			expect(result.success).toBe(false);
		});

		it('should reject max selections less than min selections', () => {
			const invalidGroup = {
				venueId: 'venue-123',
				name: 'Toppings',
				displayOrder: 1,
				selectionType: 'multiple',
				minSelections: 3,
				maxSelections: 1,
			};

			const result = newMenuModifierGroupSchema.safeParse(invalidGroup);
			expect(result.success).toBe(false);
		});

		it('should reject max selections less than min selections in full schema', () => {
			const invalidGroup = {
				id: 'group-123',
				venueId: 'venue-123',
				name: 'Toppings',
				displayOrder: 1,
				selectionType: 'multiple',
				isRequired: true,
				minSelections: 3,
				maxSelections: 1,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = menuModifierGroupSchema.safeParse(invalidGroup);
			expect(result.success).toBe(false);
		});

		it('should accept valid min/max selections in full schema', () => {
			const validGroup = {
				id: 'group-123',
				venueId: 'venue-123',
				name: 'Toppings',
				displayOrder: 1,
				selectionType: 'multiple',
				isRequired: true,
				minSelections: 1,
				maxSelections: 3,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = menuModifierGroupSchema.safeParse(validGroup);
			expect(result.success).toBe(true);
		});
	});

	describe('Modifier Schema', () => {
		it('should validate valid modifier with positive adjustment', () => {
			const validModifier = {
				groupId: 'group-123',
				name: 'Large',
				priceAdjustment: 2.0,
				displayOrder: 1,
			};

			const result = newMenuModifierSchema.safeParse(validModifier);
			expect(result.success).toBe(true);
		});

		it('should accept negative price adjustment (discount)', () => {
			const validModifier = {
				groupId: 'group-123',
				name: 'Small',
				priceAdjustment: -1.0,
				displayOrder: 1,
			};

			const result = newMenuModifierSchema.safeParse(validModifier);
			expect(result.success).toBe(true);
		});

		it('should accept zero price adjustment', () => {
			const validModifier = {
				groupId: 'group-123',
				name: 'Regular',
				priceAdjustment: 0,
				displayOrder: 1,
			};

			const result = newMenuModifierSchema.safeParse(validModifier);
			expect(result.success).toBe(true);
		});

		it('should reject empty name', () => {
			const invalidModifier = {
				groupId: 'group-123',
				name: '',
				priceAdjustment: 2.0,
				displayOrder: 1,
			};

			const result = newMenuModifierSchema.safeParse(invalidModifier);
			expect(result.success).toBe(false);
		});

		it('should include all fields in full schema', () => {
			const validModifier = {
				id: 'mod-123',
				groupId: 'group-123',
				name: 'Large',
				priceAdjustment: 2.0,
				displayOrder: 1,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = menuModifierSchema.safeParse(validModifier);
			expect(result.success).toBe(true);
		});
	});
});
