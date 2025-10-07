import { createServerCaller } from '$lib/trpc-server';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async event => {
	const { params, locals } = event;
	const { orderId } = params;

	// Use tRPC to fetch order details and menu data
	const trpc = createServerCaller(event);

	// TODO: Get venueId from authenticated user
	// For now, use the user's venueId if available, otherwise use seeded venue
	const venueId = locals.user?.venueId || 't759aeemb3pqqokugmru0tqs';

	try {
		// Fetch order, menu items, and categories in parallel
		const [order, menuResult, categoriesResult] = await Promise.all([
			trpc.orders.getById({ id: orderId }),
			trpc.menu.listItems({ venueId, isAvailable: true, isActive: true }),
			trpc.menu.listCategories({ venueId }),
		]);

		return {
			order,
			menuItems: menuResult.items,
			categories: categoriesResult.categories,
			user: locals.user,
		};
	} catch (error) {
		console.error('Failed to load order details:', error);
		return {
			order: null,
			menuItems: [],
			categories: [],
			user: locals.user,
		};
	}
};

export const actions: Actions = {
	addItem: async event => {
		const { request, params } = event;
		const { orderId } = params;

		const formData = await request.formData();
		const menuItemId = formData.get('menuItemId');
		const quantity = formData.get('quantity');
		const modifiersJson = formData.get('modifiers');
		const notes = formData.get('notes');

		// Validation
		if (!menuItemId) {
			return fail(400, { error: 'Menu item ID is required' });
		}

		if (!quantity) {
			return fail(400, { error: 'Quantity is required' });
		}

		// Parse modifiers if present
		let modifiers: Array<{ modifierId: string; quantity: number }> | undefined;
		if (modifiersJson) {
			try {
				modifiers = JSON.parse(String(modifiersJson));
			} catch (_error) {
				return fail(400, { error: 'Invalid modifiers format' });
			}
		}

		// Use tRPC to add item to order
		const trpc = createServerCaller(event);

		try {
			const result = await trpc.orders.addItems({
				orderId,
				items: [
					{
						menuItemId: String(menuItemId),
						quantity: Number(quantity),
						modifiers,
						notes: notes ? String(notes) : undefined,
					},
				],
			});

			return {
				success: true,
				orderItems: result.orderItems,
			};
		} catch (error) {
			console.error('Failed to add item to order:', error);
			return fail(500, { error: 'Failed to add item to order' });
		}
	},

	removeItem: async event => {
		const { request } = event;

		const formData = await request.formData();
		const orderItemId = formData.get('orderItemId');

		// Validation
		if (!orderItemId) {
			return fail(400, { error: 'Order item ID is required' });
		}

		// TODO: Implement removeItem tRPC endpoint
		// const trpc = createServerCaller(event);
		// await trpc.orders.removeItem({ orderItemId: String(orderItemId) });

		return { success: true };
	},

	updateQuantity: async event => {
		const { request } = event;

		const formData = await request.formData();
		const orderItemId = formData.get('orderItemId');
		const quantity = formData.get('quantity');

		// Validation
		if (!orderItemId) {
			return fail(400, { error: 'Order item ID is required' });
		}

		if (!quantity) {
			return fail(400, { error: 'Quantity is required' });
		}

		const quantityNum = Number(quantity);
		if (quantityNum < 1) {
			return fail(400, { error: 'Quantity must be at least 1' });
		}

		// TODO: Implement updateQuantity tRPC endpoint
		// const trpc = createServerCaller(event);
		// await trpc.orders.updateItemQuantity({
		//   orderItemId: String(orderItemId),
		//   quantity: quantityNum,
		// });

		return { success: true };
	},
};
