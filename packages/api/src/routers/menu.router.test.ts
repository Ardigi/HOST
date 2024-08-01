import { TRPCError } from '@trpc/server';
import { describe, expect, it } from 'vitest';
import { menuCategoryFactory, menuItemFactory } from '../test/factories';
import { createAuthContext, createTestContext, mockMenuService } from '../test/setup';
import { menuRouter } from './menu.router';

describe('MenuRouter', () => {
	describe('listCategories', () => {
		it('should return all active categories for venue', async () => {
			const categories = menuCategoryFactory.buildList(3);
			mockMenuService.listCategories.mockResolvedValue(categories);

			const caller = menuRouter.createCaller(createAuthContext());
			const result = await caller.listCategories({
				venueId: 'test-venue-id',
				includeInactive: false,
			});

			expect(result.categories).toEqual(categories);
			expect(mockMenuService.listCategories).toHaveBeenCalledWith('test-venue-id', false);
		});

		it('should include inactive categories when requested', async () => {
			const categories = menuCategoryFactory.buildList(3, { isActive: false });
			mockMenuService.listCategories.mockResolvedValue(categories);

			const caller = menuRouter.createCaller(createAuthContext());
			const result = await caller.listCategories({
				venueId: 'test-venue-id',
				includeInactive: true,
			});

			expect(result.categories).toEqual(categories);
			expect(mockMenuService.listCategories).toHaveBeenCalledWith('test-venue-id', true);
		});

		it('should require authentication', async () => {
			const caller = menuRouter.createCaller(createTestContext());

			await expect(
				caller.listCategories({
					venueId: 'test-venue-id',
					includeInactive: false,
				})
			).rejects.toThrow(TRPCError);
		});

		it('should handle database errors', async () => {
			mockMenuService.listCategories.mockRejectedValue(new Error('Database error'));

			const caller = menuRouter.createCaller(createAuthContext());

			await expect(
				caller.listCategories({
					venueId: 'test-venue-id',
					includeInactive: false,
				})
			).rejects.toThrow('Database error');
		});
	});

	describe('createCategory', () => {
		it('should create new category with valid input', async () => {
			const category = menuCategoryFactory.build();
			mockMenuService.createCategory.mockResolvedValue(category);

			const caller = menuRouter.createCaller(createAuthContext());
			const result = await caller.createCategory({
				venueId: 'test-venue-id',
				name: 'Appetizers',
				slug: 'appetizers',
				description: 'Start your meal',
				displayOrder: 0,
			});

			expect(result).toEqual(category);
			expect(mockMenuService.createCategory).toHaveBeenCalledWith({
				venueId: 'test-venue-id',
				name: 'Appetizers',
				slug: 'appetizers',
				description: 'Start your meal',
				displayOrder: 0,
			});
		});

		it('should reject invalid slug format', async () => {
			const caller = menuRouter.createCaller(createAuthContext());

			await expect(
				caller.createCategory({
					venueId: 'test-venue-id',
					name: 'Appetizers',
					slug: 'Invalid Slug!',
					displayOrder: 0,
				})
			).rejects.toThrow();
		});

		it('should require authentication', async () => {
			const caller = menuRouter.createCaller(createTestContext());

			await expect(
				caller.createCategory({
					venueId: 'test-venue-id',
					name: 'Appetizers',
					slug: 'appetizers',
					displayOrder: 0,
				})
			).rejects.toThrow(TRPCError);
		});

		it('should use default displayOrder when not provided', async () => {
			const category = menuCategoryFactory.build({ displayOrder: 0 });
			mockMenuService.createCategory.mockResolvedValue(category);

			const caller = menuRouter.createCaller(createAuthContext());
			await caller.createCategory({
				venueId: 'test-venue-id',
				name: 'Appetizers',
				slug: 'appetizers',
			});

			expect(mockMenuService.createCategory).toHaveBeenCalledWith(
				expect.objectContaining({
					displayOrder: 0,
				})
			);
		});
	});

	describe('updateCategory', () => {
		it('should update existing category', async () => {
			const updatedCategory = menuCategoryFactory.build({ name: 'Updated Name' });
			mockMenuService.updateCategory.mockResolvedValue(updatedCategory);

			const caller = menuRouter.createCaller(createAuthContext());
			const result = await caller.updateCategory({
				categoryId: 'category-1',
				name: 'Updated Name',
			});

			expect(result).toEqual(updatedCategory);
			expect(mockMenuService.updateCategory).toHaveBeenCalledWith('category-1', {
				name: 'Updated Name',
			});
		});

		it('should throw NOT_FOUND when category does not exist', async () => {
			mockMenuService.updateCategory.mockResolvedValue(null);

			const caller = menuRouter.createCaller(createAuthContext());

			await expect(
				caller.updateCategory({
					categoryId: 'non-existent',
					name: 'Updated',
				})
			).rejects.toThrow(new TRPCError({ code: 'NOT_FOUND', message: 'Category not found' }));
		});

		it('should allow partial updates', async () => {
			const updatedCategory = menuCategoryFactory.build();
			mockMenuService.updateCategory.mockResolvedValue(updatedCategory);

			const caller = menuRouter.createCaller(createAuthContext());
			await caller.updateCategory({
				categoryId: 'category-1',
				isActive: false,
			});

			expect(mockMenuService.updateCategory).toHaveBeenCalledWith('category-1', {
				isActive: false,
			});
		});

		it('should require authentication', async () => {
			const caller = menuRouter.createCaller(createTestContext());

			await expect(
				caller.updateCategory({
					categoryId: 'category-1',
					name: 'Updated',
				})
			).rejects.toThrow(TRPCError);
		});
	});

	describe('deleteCategory', () => {
		it('should delete category', async () => {
			mockMenuService.deleteCategory.mockResolvedValue(undefined);

			const caller = menuRouter.createCaller(createAuthContext());
			const result = await caller.deleteCategory({ categoryId: 'category-1' });

			expect(result).toEqual({ success: true });
			expect(mockMenuService.deleteCategory).toHaveBeenCalledWith('category-1');
		});

		it('should require authentication', async () => {
			const caller = menuRouter.createCaller(createTestContext());

			await expect(caller.deleteCategory({ categoryId: 'category-1' })).rejects.toThrow(TRPCError);
		});

		it('should handle database errors', async () => {
			mockMenuService.deleteCategory.mockRejectedValue(new Error('Foreign key constraint'));

			const caller = menuRouter.createCaller(createAuthContext());

			await expect(caller.deleteCategory({ categoryId: 'category-1' })).rejects.toThrow(
				'Foreign key constraint'
			);
		});
	});

	describe('listItems', () => {
		it('should return all items for venue', async () => {
			const items = menuItemFactory.buildList(5);
			mockMenuService.listMenuItems.mockResolvedValue(items);

			const caller = menuRouter.createCaller(createAuthContext());
			const result = await caller.listItems({ venueId: 'test-venue-id' });

			expect(result.items).toEqual(items);
			expect(mockMenuService.listMenuItems).toHaveBeenCalledWith('test-venue-id', {});
		});

		it('should filter by category when provided', async () => {
			const items = menuItemFactory.buildList(3, { categoryId: 'category-1' });
			mockMenuService.listMenuItems.mockResolvedValue(items);

			const caller = menuRouter.createCaller(createAuthContext());
			const result = await caller.listItems({
				venueId: 'test-venue-id',
				categoryId: 'category-1',
			});

			expect(result.items).toEqual(items);
			expect(mockMenuService.listMenuItems).toHaveBeenCalledWith('test-venue-id', {
				categoryId: 'category-1',
			});
		});

		it('should filter by availability when provided', async () => {
			const items = menuItemFactory.buildList(3, { isAvailable: true });
			mockMenuService.listMenuItems.mockResolvedValue(items);

			const caller = menuRouter.createCaller(createAuthContext());
			await caller.listItems({
				venueId: 'test-venue-id',
				isAvailable: true,
			});

			expect(mockMenuService.listMenuItems).toHaveBeenCalledWith('test-venue-id', {
				isAvailable: true,
			});
		});

		it('should require authentication', async () => {
			const caller = menuRouter.createCaller(createTestContext());

			await expect(caller.listItems({ venueId: 'test-venue-id' })).rejects.toThrow(TRPCError);
		});
	});

	describe('getItem', () => {
		it('should return menu item by id', async () => {
			const item = menuItemFactory.build();
			mockMenuService.getMenuItem.mockResolvedValue(item);

			const caller = menuRouter.createCaller(createAuthContext());
			const result = await caller.getItem({ itemId: 'item-1' });

			expect(result).toEqual(item);
			expect(mockMenuService.getMenuItem).toHaveBeenCalledWith('item-1');
		});

		it('should throw NOT_FOUND when item does not exist', async () => {
			mockMenuService.getMenuItem.mockResolvedValue(null);

			const caller = menuRouter.createCaller(createAuthContext());

			await expect(caller.getItem({ itemId: 'non-existent' })).rejects.toThrow(
				new TRPCError({ code: 'NOT_FOUND', message: 'Menu item not found' })
			);
		});

		it('should require authentication', async () => {
			const caller = menuRouter.createCaller(createTestContext());

			await expect(caller.getItem({ itemId: 'item-1' })).rejects.toThrow(TRPCError);
		});
	});

	describe('createItem', () => {
		it('should create menu item with valid input', async () => {
			const item = menuItemFactory.build();
			mockMenuService.createMenuItem.mockResolvedValue(item);

			const caller = menuRouter.createCaller(createAuthContext());
			const result = await caller.createItem({
				venueId: 'test-venue-id',
				categoryId: 'category-1',
				name: 'Buffalo Wings',
				slug: 'buffalo-wings',
				price: 12.99,
				displayOrder: 0,
			});

			expect(result).toEqual(item);
			expect(mockMenuService.createMenuItem).toHaveBeenCalledWith(
				expect.objectContaining({
					venueId: 'test-venue-id',
					categoryId: 'category-1',
					name: 'Buffalo Wings',
					slug: 'buffalo-wings',
					price: 12.99,
					displayOrder: 0,
				})
			);
		});

		it('should reject negative price', async () => {
			const caller = menuRouter.createCaller(createAuthContext());

			await expect(
				caller.createItem({
					venueId: 'test-venue-id',
					categoryId: 'category-1',
					name: 'Item',
					slug: 'item',
					price: -10,
					displayOrder: 0,
				})
			).rejects.toThrow();
		});

		it('should reject invalid slug format', async () => {
			const caller = menuRouter.createCaller(createAuthContext());

			await expect(
				caller.createItem({
					venueId: 'test-venue-id',
					categoryId: 'category-1',
					name: 'Item',
					slug: 'Invalid Slug!',
					price: 12.99,
					displayOrder: 0,
				})
			).rejects.toThrow();
		});

		it('should require authentication', async () => {
			const caller = menuRouter.createCaller(createTestContext());

			await expect(
				caller.createItem({
					venueId: 'test-venue-id',
					categoryId: 'category-1',
					name: 'Item',
					slug: 'item',
					price: 12.99,
					displayOrder: 0,
				})
			).rejects.toThrow(TRPCError);
		});
	});

	describe('updateItem', () => {
		it('should update existing menu item', async () => {
			const updatedItem = menuItemFactory.build({ price: 15.99 });
			mockMenuService.updateMenuItem.mockResolvedValue(updatedItem);

			const caller = menuRouter.createCaller(createAuthContext());
			const result = await caller.updateItem({
				itemId: 'item-1',
				price: 15.99,
			});

			expect(result).toEqual(updatedItem);
			expect(mockMenuService.updateMenuItem).toHaveBeenCalledWith('item-1', {
				price: 15.99,
			});
		});

		it('should throw NOT_FOUND when item does not exist', async () => {
			mockMenuService.updateMenuItem.mockResolvedValue(null);

			const caller = menuRouter.createCaller(createAuthContext());

			await expect(
				caller.updateItem({
					itemId: 'non-existent',
					price: 15.99,
				})
			).rejects.toThrow(new TRPCError({ code: 'NOT_FOUND', message: 'Menu item not found' }));
		});

		it('should allow partial updates', async () => {
			const updatedItem = menuItemFactory.build();
			mockMenuService.updateMenuItem.mockResolvedValue(updatedItem);

			const caller = menuRouter.createCaller(createAuthContext());
			await caller.updateItem({
				itemId: 'item-1',
				isVegetarian: true,
			});

			expect(mockMenuService.updateMenuItem).toHaveBeenCalledWith('item-1', {
				isVegetarian: true,
			});
		});

		it('should require authentication', async () => {
			const caller = menuRouter.createCaller(createTestContext());

			await expect(
				caller.updateItem({
					itemId: 'item-1',
					price: 15.99,
				})
			).rejects.toThrow(TRPCError);
		});
	});

	describe('deleteItem', () => {
		it('should delete menu item', async () => {
			mockMenuService.deleteMenuItem.mockResolvedValue(undefined);

			const caller = menuRouter.createCaller(createAuthContext());
			const result = await caller.deleteItem({ itemId: 'item-1' });

			expect(result).toEqual({ success: true });
			expect(mockMenuService.deleteMenuItem).toHaveBeenCalledWith('item-1');
		});

		it('should require authentication', async () => {
			const caller = menuRouter.createCaller(createTestContext());

			await expect(caller.deleteItem({ itemId: 'item-1' })).rejects.toThrow(TRPCError);
		});
	});

	describe('toggleAvailability', () => {
		it('should toggle item availability to true', async () => {
			const item = menuItemFactory.build({ isAvailable: true });
			mockMenuService.toggleAvailability.mockResolvedValue(item);

			const caller = menuRouter.createCaller(createAuthContext());
			const result = await caller.toggleAvailability({
				itemId: 'item-1',
				isAvailable: true,
			});

			expect(result).toEqual(item);
			expect(mockMenuService.toggleAvailability).toHaveBeenCalledWith('item-1', true);
		});

		it('should toggle item availability to false', async () => {
			const item = menuItemFactory.build({ isAvailable: false });
			mockMenuService.toggleAvailability.mockResolvedValue(item);

			const caller = menuRouter.createCaller(createAuthContext());
			const result = await caller.toggleAvailability({
				itemId: 'item-1',
				isAvailable: false,
			});

			expect(result).toEqual(item);
			expect(mockMenuService.toggleAvailability).toHaveBeenCalledWith('item-1', false);
		});

		it('should throw NOT_FOUND when item does not exist', async () => {
			mockMenuService.toggleAvailability.mockResolvedValue(null);

			const caller = menuRouter.createCaller(createAuthContext());

			await expect(
				caller.toggleAvailability({
					itemId: 'non-existent',
					isAvailable: true,
				})
			).rejects.toThrow(new TRPCError({ code: 'NOT_FOUND', message: 'Menu item not found' }));
		});

		it('should require authentication', async () => {
			const caller = menuRouter.createCaller(createTestContext());

			await expect(
				caller.toggleAvailability({
					itemId: 'item-1',
					isAvailable: true,
				})
			).rejects.toThrow(TRPCError);
		});
	});

	describe('getFullMenu', () => {
		it('should return menu with categories and items', async () => {
			const categories = menuCategoryFactory.buildList(2);
			const items1 = menuItemFactory.buildList(3, { categoryId: 'category-1' });
			const items2 = menuItemFactory.buildList(2, { categoryId: 'category-2' });

			mockMenuService.listCategories.mockResolvedValue(categories);
			mockMenuService.listMenuItems.mockResolvedValueOnce(items1).mockResolvedValueOnce(items2);

			const caller = menuRouter.createCaller(createAuthContext());
			const result = await caller.getFullMenu({
				venueId: 'test-venue-id',
				includeInactive: false,
			});

			expect(result.menu).toHaveLength(2);
			expect(result.menu[0].items).toEqual(items1);
			expect(result.menu[1].items).toEqual(items2);
		});

		it('should filter items by active and available when includeInactive is false', async () => {
			const categories = menuCategoryFactory.buildList(1);
			mockMenuService.listCategories.mockResolvedValue(categories);
			mockMenuService.listMenuItems.mockResolvedValue([]);

			const caller = menuRouter.createCaller(createAuthContext());
			await caller.getFullMenu({
				venueId: 'test-venue-id',
				includeInactive: false,
			});

			expect(mockMenuService.listMenuItems).toHaveBeenCalledWith('test-venue-id', {
				categoryId: 'category-1',
				isActive: true,
				isAvailable: true,
			});
		});

		it('should not filter items when includeInactive is true', async () => {
			const categories = menuCategoryFactory.buildList(1);
			mockMenuService.listCategories.mockResolvedValue(categories);
			mockMenuService.listMenuItems.mockResolvedValue([]);

			const caller = menuRouter.createCaller(createAuthContext());
			await caller.getFullMenu({
				venueId: 'test-venue-id',
				includeInactive: true,
			});

			expect(mockMenuService.listMenuItems).toHaveBeenCalledWith('test-venue-id', {
				categoryId: 'category-1',
				isActive: undefined,
				isAvailable: undefined,
			});
		});

		it('should require authentication', async () => {
			const caller = menuRouter.createCaller(createTestContext());

			await expect(
				caller.getFullMenu({
					venueId: 'test-venue-id',
					includeInactive: false,
				})
			).rejects.toThrow(TRPCError);
		});
	});
});
