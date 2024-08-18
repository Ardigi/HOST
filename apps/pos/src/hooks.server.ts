/**
 * SvelteKit Server Hooks
 * Handles authentication and session management
 */

import { AuthService } from '@host/shared';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { E2E_TEST_USER } from '../../../e2e/test-user.config';

// Initialize AuthService
const authService = new AuthService({
	keycloakUrl: import.meta.env.PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
	realm: import.meta.env.PUBLIC_KEYCLOAK_REALM || 'host-pos',
	clientId: import.meta.env.PUBLIC_KEYCLOAK_CLIENT_ID || 'host-pos-web',
});

/**
 * Authentication hook
 * Validates JWT token and adds user to locals
 */
const handleAuth: Handle = async ({ event, resolve }) => {
	// Get access token from cookie
	const accessToken = event.cookies.get('access_token');
	const refreshToken = event.cookies.get('refresh_token');

	if (accessToken) {
		try {
			// Validate token
			const payload = await authService.validateToken(accessToken);

			// Add user info to locals
			event.locals.user = {
				id: payload.sub,
				email: payload.email || '',
				firstName: payload.given_name || '',
				lastName: payload.family_name || '',
				venueId: payload.venue_id || '',
				roles: payload.realm_access?.roles || [],
			};
		} catch (_error) {
			// Token is invalid or expired, try to refresh
			if (refreshToken) {
				try {
					const tokens = await authService.refreshAccessToken(refreshToken);

					// Set new tokens in cookies
					event.cookies.set('access_token', tokens.access_token, {
						path: '/',
						httpOnly: true,
						secure: import.meta.env.PROD,
						sameSite: 'lax',
						maxAge: tokens.expires_in,
					});

					if (tokens.refresh_token) {
						event.cookies.set('refresh_token', tokens.refresh_token, {
							path: '/',
							httpOnly: true,
							secure: import.meta.env.PROD,
							sameSite: 'lax',
							maxAge: 30 * 24 * 60 * 60, // 30 days
						});
					}

					// Validate new token and set user
					const payload = await authService.validateToken(tokens.access_token);
					event.locals.user = {
						id: payload.sub,
						email: payload.email || '',
						firstName: payload.given_name || '',
						lastName: payload.family_name || '',
						venueId: payload.venue_id || '',
						roles: payload.realm_access?.roles || [],
					};
				} catch (_refreshError) {
					// Refresh failed, clear cookies
					event.cookies.delete('access_token', { path: '/' });
					event.cookies.delete('refresh_token', { path: '/' });
					event.locals.user = null;
				}
			} else {
				// No refresh token, user needs to login again
				event.locals.user = null;
			}
		}
	} else {
		event.locals.user = null;
	}

	// Resolve the request
	return await resolve(event);
};

/**
 * Role-based access control hook
 * Protects routes based on user roles
 */
const handleAuthorization: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	// E2E Test Mode: Bypass authentication for automated testing
	// When CI=true, inject a mock authenticated user to allow E2E tests to run
	// without requiring Keycloak. This user matches seed data to satisfy FK constraints.
	const isE2EMode = import.meta.env.PUBLIC_E2E_MODE === 'true' || process.env.CI === 'true';

	if (isE2EMode && !event.locals.user) {
		// Import test user configuration from e2e/test-user.config.ts
		// This ensures E2E tests have a consistent, predictable authenticated state
		// Convert readonly roles array to mutable array for compatibility
		event.locals.user = {
			...E2E_TEST_USER,
			roles: [...E2E_TEST_USER.roles],
		};
	}

	// Protected routes configuration
	const protectedRoutes = [
		{ path: '/admin', roles: ['admin'] },
		{ path: '/manager', roles: ['admin', 'manager'] },
		{ path: '/orders', roles: ['admin', 'manager', 'server'] },
		{ path: '/inventory', roles: ['admin', 'manager'] },
	];

	// Check if route is protected
	const protectedRoute = protectedRoutes.find(route => pathname.startsWith(route.path));

	if (protectedRoute) {
		// Check if user is authenticated
		if (!event.locals.user) {
			// Redirect to login with return URL
			return new Response(null, {
				status: 302,
				headers: {
					location: `/auth/login?redirect=${encodeURIComponent(pathname)}`,
				},
			});
		}

		// Check if user has required role
		const hasRequiredRole = protectedRoute.roles.some(role =>
			event.locals.user?.roles.includes(role)
		);

		if (!hasRequiredRole) {
			// User doesn't have permission
			return new Response(null, {
				status: 302,
				headers: {
					location: '/unauthorized',
				},
			});
		}
	}

	return await resolve(event);
};

// Export individual hooks for testing
export { handleAuth, handleAuthorization };

// Export combined hooks
export const handle = sequence(handleAuth, handleAuthorization);
