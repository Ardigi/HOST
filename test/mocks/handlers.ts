import { http, HttpResponse } from 'msw';

/**
 * MSW Handlers for API Mocking
 * @see https://mswjs.io/docs/basics/request-handler
 */
export const handlers = [
	// Example: Mock menu items endpoint
	http.get('/api/menu/items', () => {
		return HttpResponse.json([
			{
				id: '1',
				name: 'Cheeseburger',
				price: 12.99,
				category: 'food',
			},
			{
				id: '2',
				name: 'French Fries',
				price: 4.99,
				category: 'sides',
			},
		]);
	}),

	// Example: Mock order creation
	http.post('/api/orders', async ({ request }) => {
		const body = await request.json();
		return HttpResponse.json(
			{
				id: 'order-123',
				status: 'open',
				...(body as object),
			},
			{ status: 201 }
		);
	}),

	// Example: Mock payment processing
	http.post('/api/payments/process', async ({ request }) => {
		const body = await request.json();
		return HttpResponse.json({
			id: 'payment-123',
			status: 'completed',
			amount: (body as { amount?: number }).amount || 0,
		});
	}),
];
