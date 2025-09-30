import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	// Fetch orders from API
	const response = await fetch('/api/orders');

	if (!response.ok) {
		throw new Error('Failed to fetch orders');
	}

	const orders = await response.json();

	return {
		orders,
	};
};