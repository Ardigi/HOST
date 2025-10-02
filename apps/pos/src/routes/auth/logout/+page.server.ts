/**
 * Logout handler
 * Revokes tokens and clears cookies
 */

import { AuthService } from '@host/shared';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	// Get refresh token
	const refreshToken = cookies.get('refresh_token');

	if (refreshToken) {
		// Initialize AuthService
		const authService = new AuthService({
			keycloakUrl: import.meta.env.PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
			realm: import.meta.env.PUBLIC_KEYCLOAK_REALM || 'host-pos',
			clientId: import.meta.env.PUBLIC_KEYCLOAK_CLIENT_ID || 'host-pos-web',
		});

		try {
			// Revoke tokens at Keycloak
			await authService.logout(refreshToken);
		} catch (error) {
			// Logout errors are logged but don't prevent clearing cookies
			console.error('Keycloak logout failed:', error);
		}
	}

	// Clear auth cookies
	cookies.delete('access_token', { path: '/' });
	cookies.delete('refresh_token', { path: '/' });

	// Redirect to login page
	throw redirect(302, '/auth/login');
};
