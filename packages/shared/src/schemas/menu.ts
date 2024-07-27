/**
 * Menu Validation Schemas
 * Runtime validation for menu entities using Zod
 */

import { z } from 'zod';

/**
 * Slug validation - lowercase alphanumeric with hyphens
 */
const slugSchema = z
	.string()
	.min(1)
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens');

/**
 * Menu Category Schemas
 */
export const newMenuCategorySchema = z.object({
	venueId: z.string().min(1),
	name: z.string().min(1),
	slug: slugSchema,
	description: z.string().optional(),
	displayOrder: z.number().int().min(0),
	isActive: z.boolean().optional(),
});

export const menuCategorySchema = newMenuCategorySchema.extend({
	id: z.string().min(1),
	isActive: z.boolean(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

/**
 * Menu Item Schemas
 */
export const newMenuItemSchema = z.object({
	venueId: z.string().min(1),
	categoryId: z.string().min(1),
	name: z.string().min(1),
	slug: slugSchema,
	description: z.string().optional(),
	price: z.number().positive('Price must be greater than zero'),
	imageUrl: z.string().url().optional().or(z.literal('')),
	calories: z.number().int().min(0).optional(),
	isVegetarian: z.boolean().optional(),
	isVegan: z.boolean().optional(),
	isGlutenFree: z.boolean().optional(),
	preparationTime: z.number().int().min(0).optional(),
	displayOrder: z.number().int().min(0),
	isActive: z.boolean().optional(),
	isAvailable: z.boolean().optional(),
});

export const menuItemSchema = newMenuItemSchema.extend({
	id: z.string().min(1),
	isActive: z.boolean(),
	isAvailable: z.boolean(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

/**
 * Menu Modifier Group Schemas
 */
const modifierGroupBaseSchema = z.object({
	venueId: z.string().min(1),
	name: z.string().min(1),
	displayOrder: z.number().int().min(0),
	selectionType: z.enum(['single', 'multiple']),
	isRequired: z.boolean().optional(),
	minSelections: z.number().int().min(0).optional(),
	maxSelections: z.number().int().min(0).optional(),
});

export const newMenuModifierGroupSchema = modifierGroupBaseSchema.refine(
	data => {
		// If both min and max are provided, max must be >= min
		if (data.minSelections !== undefined && data.maxSelections !== undefined) {
			return data.maxSelections >= data.minSelections;
		}
		return true;
	},
	{
		message: 'maxSelections must be greater than or equal to minSelections',
		path: ['maxSelections'],
	}
);

export const menuModifierGroupSchema = modifierGroupBaseSchema
	.extend({
		id: z.string().min(1),
		isRequired: z.boolean(),
		createdAt: z.date(),
		updatedAt: z.date(),
	})
	.refine(
		data => {
			// If both min and max are provided, max must be >= min
			if (data.minSelections !== undefined && data.maxSelections !== undefined) {
				return data.maxSelections >= data.minSelections;
			}
			return true;
		},
		{
			message: 'maxSelections must be greater than or equal to minSelections',
			path: ['maxSelections'],
		}
	);

/**
 * Menu Modifier Schemas
 */
export const newMenuModifierSchema = z.object({
	groupId: z.string().min(1),
	name: z.string().min(1),
	priceAdjustment: z.number(), // Can be negative (discount), zero, or positive
	displayOrder: z.number().int().min(0),
	isActive: z.boolean().optional(),
});

export const menuModifierSchema = newMenuModifierSchema.extend({
	id: z.string().min(1),
	isActive: z.boolean(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

/**
 * Type exports
 */
export type NewMenuCategory = z.infer<typeof newMenuCategorySchema>;
export type MenuCategory = z.infer<typeof menuCategorySchema>;
export type NewMenuItem = z.infer<typeof newMenuItemSchema>;
export type MenuItem = z.infer<typeof menuItemSchema>;
export type NewMenuModifierGroup = z.infer<typeof newMenuModifierGroupSchema>;
export type MenuModifierGroup = z.infer<typeof menuModifierGroupSchema>;
export type NewMenuModifier = z.infer<typeof newMenuModifierSchema>;
export type MenuModifier = z.infer<typeof menuModifierSchema>;
