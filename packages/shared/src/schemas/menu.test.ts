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

		it('should reject empty name with specific error', () => {
			const invalidCategory = {
				venueId: 'venue-123',
				name: '',
				slug: 'appetizers',
				displayOrder: 1,
			};

			const result = newMenuCategorySchema.safeParse(invalidCategory);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['name']);
				expect(result.error.issues[0].message).toMatch(/string must contain at least 1 character/i);
			}
		});

		it('should reject invalid slug format with specific error', () => {
			const invalidCategory = {
				venueId: 'venue-123',
				name: 'Appetizers',
				slug: 'Invalid Slug!',
				displayOrder: 1,
			};

			const result = newMenuCategorySchema.safeParse(invalidCategory);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['slug']);
				// Slug should match lowercase-alphanumeric-hyphen pattern
				expect(result.error.issues[0].message).toMatch(/slug must be lowercase alphanumeric/i);
			}
		});

		it('should reject negative display order with specific error', () => {
			const invalidCategory = {
				venueId: 'venue-123',
				name: 'Appetizers',
				slug: 'appetizers',
				displayOrder: -1,
			};

			const result = newMenuCategorySchema.safeParse(invalidCategory);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['displayOrder']);
				expect(result.error.issues[0].message).toMatch(/must be greater than or equal to 0/i);
			}
		});

		it('should validate multiple errors simultaneously', () => {
			const invalidCategory = {
				venueId: 'venue-123',
				name: '', // Empty name
				slug: 'Invalid Slug!', // Invalid slug format
				displayOrder: -1, // Negative order
			};

			const result = newMenuCategorySchema.safeParse(invalidCategory);
			expect(result.success).toBe(false);
			if (!result.success) {
				// Should report all 3 validation errors
				expect(result.error.issues.length).toBeGreaterThanOrEqual(3);

				const paths = result.error.issues.map(issue => issue.path[0]);
				expect(paths).toContain('name');
				expect(paths).toContain('slug');
				expect(paths).toContain('displayOrder');
			}
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

		it('should reject negative price with specific error', () => {
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
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['price']);
				expect(result.error.issues[0].message).toMatch(/price must be greater than zero/i);
			}
		});

		it('should reject zero price with specific error', () => {
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
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['price']);
				expect(result.error.issues[0].message).toMatch(/price must be greater than zero/i);
			}
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

		it('should reject negative calories with specific error', () => {
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
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['calories']);
				expect(result.error.issues[0].message).toMatch(/must be greater than or equal to 0/i);
			}
		});

		it('should reject negative preparation time with specific error', () => {
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
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['preparationTime']);
				expect(result.error.issues[0].message).toMatch(/must be greater than or equal to 0/i);
			}
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

		it('should validate URL format for imageUrl with specific error', () => {
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
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['imageUrl']);
				expect(result.error.issues[0].message).toMatch(/invalid.*url/i);
			}
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

		it('should reject invalid selection type with specific error', () => {
			const invalidGroup = {
				venueId: 'venue-123',
				name: 'Size',
				displayOrder: 1,
				selectionType: 'invalid',
			};

			const result = newMenuModifierGroupSchema.safeParse(invalidGroup);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['selectionType']);
				expect(result.error.issues[0].message).toMatch(/invalid.*enum/i);
			}
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

		it('should reject negative min selections with specific error', () => {
			const invalidGroup = {
				venueId: 'venue-123',
				name: 'Toppings',
				displayOrder: 1,
				selectionType: 'multiple',
				minSelections: -1,
			};

			const result = newMenuModifierGroupSchema.safeParse(invalidGroup);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['minSelections']);
				expect(result.error.issues[0].message).toMatch(/must be greater than or equal to 0/i);
			}
		});

		it('should reject max selections less than min selections with specific error', () => {
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
			if (!result.success) {
				// Zod refine() validation should catch this business rule
				expect(result.error.issues.length).toBeGreaterThan(0);
				const refineIssue = result.error.issues.find(
					issue => issue.code === 'custom' || issue.message.toLowerCase().includes('max')
				);
				expect(refineIssue).toBeDefined();
			}
		});

		it('should reject max selections less than min selections in full schema with specific error', () => {
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
			if (!result.success) {
				// Zod refine() validation should catch this business rule
				expect(result.error.issues.length).toBeGreaterThan(0);
				const refineIssue = result.error.issues.find(
					issue => issue.code === 'custom' || issue.message.toLowerCase().includes('max')
				);
				expect(refineIssue).toBeDefined();
			}
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
