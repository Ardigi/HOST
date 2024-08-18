import { createServerCaller } from '$lib/trpc-server';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async event => {
	const { locals } = event;

	// Authentication check
	// TODO: Re-enable after Keycloak is fully configured
	// if (!locals.user) {
	//   throw redirect(302, '/auth/login');
	// }

	// Use tRPC to fetch orders and tables
	const trpc = createServerCaller(event);

	// TODO: Get venueId from authenticated user
	// For now, use the seeded venue ID (will be dynamic after auth)
	const venueId = 't759aeemb3pqqokugmru0tqs'; // From seed output

	try {
		// Fetch orders and tables in parallel
		const [ordersResult, tablesResult] = await Promise.all([
			trpc.orders.list({ venueId, status: 'open' }),
			trpc.orders.listTables({ venueId }),
		]);

		return {
			orders: ordersResult.orders,
			tables: tablesResult.tables,
			user: locals.user,
		};
	} catch (error) {
		console.error('Failed to load orders data:', error);
		return {
			orders: [],
			tables: [],
			user: locals.user,
		};
	}
};

export const actions: Actions = {
	createOrder: async event => {
		const { request } = event;

		const formData = await request.formData();
		const tableNumber = formData.get('tableNumber');
		const guestCount = formData.get('guestCount');
		const orderType = formData.get('orderType');

		if (!tableNumber) {
			return fail(400, { error: 'Table number is required' });
		}

		if (!guestCount) {
			return fail(400, { error: 'Guest count is required' });
		}

		// Use tRPC to create order
		const trpc = createServerCaller(event);

		// TODO: Get venueId from authenticated user
		const venueId = 't759aeemb3pqqokugmru0tqs'; // From seed output

		try {
			const order = await trpc.orders.create({
				venueId,
				tableNumber: Number(tableNumber),
				guestCount: Number(guestCount),
				orderType: String(orderType) as 'dine_in' | 'takeout' | 'delivery',
			});

			return {
				success: true,
				order,
			};
		} catch (error) {
			console.error('Failed to create order:', error);
			return fail(500, { error: 'Failed to create order' });
		}
	},

	updateOrder: async event => {
		const { request, locals } = event;

		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const orderId = formData.get('orderId');
		const action = formData.get('action');

		if (!orderId || !action) {
			return fail(400, { error: 'Missing required fields' });
		}

		// Use tRPC to update order
		const _trpc = createServerCaller(event);

		// TODO: Implement when needed
		// await _trpc.orders.updateStatus({
		//   orderId: String(orderId),
		//   status: action as any,
		// });

		return { success: true };
	},
};
