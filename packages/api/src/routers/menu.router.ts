import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

/**
 * Menu validation schemas for tRPC
 */
const createCategorySchema = z.object({
	venueId: z.string(),
	name: z.string().min(1),
	slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
	description: z.string().optional(),
	displayOrder: z.number().int().min(0).default(0),
});

const updateCategorySchema = z.object({
	categoryId: z.string(),
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	displayOrder: z.number().int().min(0).optional(),
	isActive: z.boolean().optional(),
});

const createMenuItemSchema = z.object({
	venueId: z.string(),
	categoryId: z.string(),
	name: z.string().min(1),
	slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
	description: z.string().optional(),
	price: z.number().positive(),
	calories: z.number().int().min(0).optional(),
	isVegetarian: z.boolean().optional(),
	isVegan: z.boolean().optional(),
	isGlutenFree: z.boolean().optional(),
	preparationTime: z.number().int().min(0).optional(),
	displayOrder: z.number().int().min(0).default(0),
});

const updateMenuItemSchema = z.object({
	itemId: z.string(),
	categoryId: z.string().optional(),
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	price: z.number().positive().optional(),
	calories: z.number().int().min(0).optional(),
	isVegetarian: z.boolean().optional(),
	isVegan: z.boolean().optional(),
	isGlutenFree: z.boolean().optional(),
	preparationTime: z.number().int().min(0).optional(),
	displayOrder: z.number().int().min(0).optional(),
	isActive: z.boolean().optional(),
	isAvailable: z.boolean().optional(),
});

/**
 * Menu Router
 * Handles all menu-related operations
 */
export const menuRouter = router({
	// ===== Category Operations =====

	listCategories: protectedProcedure
		.input(
			z.object({
				venueId: z.string(),
				includeInactive: z.boolean().default(false),
			})
		)
		.query(async ({ ctx, input }) => {
			const categories = await ctx.menuService.listCategories(input.venueId, input.includeInactive);
			return { categories };
		}),

	createCategory: protectedProcedure
		.input(createCategorySchema)
		.mutation(async ({ ctx, input }) => {
			const category = await ctx.menuService.createCategory(input);
			return category;
		}),

	updateCategory: protectedProcedure
		.input(updateCategorySchema)
		.mutation(async ({ ctx, input }) => {
			const { categoryId, ...updates } = input;
			const category = await ctx.menuService.updateCategory(categoryId, updates);

			if (!category) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Category not found',
				});
			}

			return category;
		}),

	deleteCategory: protectedProcedure
		.input(z.object({ categoryId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.menuService.deleteCategory(input.categoryId);
			return { success: true };
		}),

	// ===== Menu Item Operations =====

	listItems: protectedProcedure
		.input(
			z.object({
				venueId: z.string(),
				categoryId: z.string().optional(),
				isAvailable: z.boolean().optional(),
				isActive: z.boolean().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const { venueId, ...filters } = input;
			const items = await ctx.menuService.listMenuItems(venueId, filters);
			return { items };
		}),

	getItem: protectedProcedure
		.input(z.object({ itemId: z.string() }))
		.query(async ({ ctx, input }) => {
			const item = await ctx.menuService.getMenuItem(input.itemId);

			if (!item) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Menu item not found',
				});
			}

			return item;
		}),

	createItem: protectedProcedure.input(createMenuItemSchema).mutation(async ({ ctx, input }) => {
		const item = await ctx.menuService.createMenuItem(input);
		return item;
	}),

	updateItem: protectedProcedure.input(updateMenuItemSchema).mutation(async ({ ctx, input }) => {
		const { itemId, ...updates } = input;
		const item = await ctx.menuService.updateMenuItem(itemId, updates);

		if (!item) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Menu item not found',
			});
		}

		return item;
	}),

	deleteItem: protectedProcedure
		.input(z.object({ itemId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.menuService.deleteMenuItem(input.itemId);
			return { success: true };
		}),

	toggleAvailability: protectedProcedure
		.input(
			z.object({
				itemId: z.string(),
				isAvailable: z.boolean(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const item = await ctx.menuService.toggleAvailability(input.itemId, input.isAvailable);

			if (!item) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Menu item not found',
				});
			}

			return item;
		}),

	// ===== Menu with Categories & Items =====

	getFullMenu: protectedProcedure
		.input(
			z.object({
				venueId: z.string(),
				includeInactive: z.boolean().default(false),
			})
		)
		.query(async ({ ctx, input }) => {
			const categories = await ctx.menuService.listCategories(input.venueId, input.includeInactive);

			const menu = await Promise.all(
				categories.map(async category => {
					const items = await ctx.menuService.listMenuItems(input.venueId, {
						categoryId: category.id,
						isActive: input.includeInactive ? undefined : true,
						isAvailable: input.includeInactive ? undefined : true,
					});

					return {
						...category,
						items,
					};
				})
			);

			return { menu };
		}),
});
