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

	// Use tRPC to fetch orders
	const _trpc = createServerCaller(event);

	// For now, return empty orders since we need a venue setup
	// In production, this would be:
	// const { orders } = await _trpc.orders.list({
	//   venueId: locals.user.venueId,
	//   status: 'open',
	// });

	const orders: unknown[] = [];

	return {
		orders,
		user: locals.user,
	};
};

export const actions: Actions = {
	createOrder: async event => {
		const { request, locals } = event;

		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const tableNumber = formData.get('tableNumber');

		if (!tableNumber) {
			return fail(400, { error: 'Table number is required' });
		}

		// Use tRPC to create order
		const _trpc = createServerCaller(event);

		// TODO: Implement when venue setup is complete
		// const order = await _trpc.orders.create({
		//   venueId: locals.user.venueId,
		//   tableNumber: Number(tableNumber),
		//   guestCount: 1,
		//   orderType: 'dine_in',
		// });

		return {
			success: true,
			order: {
				id: 'new-order-id',
				tableNumber: Number(tableNumber),
			},
		};
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
