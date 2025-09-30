import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Server-side data loading with authentication
	if (!locals.user) {
		throw new Error('Unauthorized');
	}

	// In real implementation, this would query the database
	const orders = [
		{
			id: '1',
			orderNumber: 1001,
			tableNumber: 5,
			status: 'open',
			total: 45.5,
			items: [],
		},
		{
			id: '2',
			orderNumber: 1002,
			tableNumber: 3,
			status: 'open',
			total: 67.25,
			items: [],
		},
	];

	return {
		orders,
		user: locals.user,
	};
};

export const actions: Actions = {
	createOrder: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const tableNumber = formData.get('tableNumber');

		if (!tableNumber) {
			return fail(400, { error: 'Table number is required' });
		}

		// In real implementation, create order in database
		// const order = await orderService.create({
		//   tableNumber: Number(tableNumber),
		//   serverId: locals.user.id,
		//   venueId: locals.user.venueId
		// });

		return {
			success: true,
			order: {
				id: 'new-order-id',
				tableNumber: Number(tableNumber),
			},
		};
	},

	updateOrder: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const orderId = formData.get('orderId');
		const action = formData.get('action');

		if (!orderId || !action) {
			return fail(400, { error: 'Missing required fields' });
		}

		// Handle order updates
		return { success: true };
	},
};
