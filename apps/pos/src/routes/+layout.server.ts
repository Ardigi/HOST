/**
 * Root layout server load function
 * Passes authenticated user data to all pages
 */

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: locals.user,
	};
};
