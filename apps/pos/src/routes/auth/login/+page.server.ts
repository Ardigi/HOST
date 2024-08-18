/**
 * Login page server logic
 * Initiates OAuth2 authorization code flow with PKCE
 */

import { AuthService } from '@host/shared';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, cookies }) => {
	// Initialize AuthService
	const authService = new AuthService({
		keycloakUrl: import.meta.env.PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
		realm: import.meta.env.PUBLIC_KEYCLOAK_REALM || 'host-pos',
		clientId: import.meta.env.PUBLIC_KEYCLOAK_CLIENT_ID || 'host-pos-web',
	});

	// Generate PKCE code verifier and challenge
	const codeVerifier = authService.generateCodeVerifier();
	const state = crypto.randomUUID();

	// Store code verifier and state in cookies (temporary)
	cookies.set('oauth_code_verifier', codeVerifier, {
		path: '/',
		httpOnly: true,
		secure: import.meta.env.PROD,
		sameSite: 'lax',
		maxAge: 60 * 10, // 10 minutes
	});

	cookies.set('oauth_state', state, {
		path: '/',
		httpOnly: true,
		secure: import.meta.env.PROD,
		sameSite: 'lax',
		maxAge: 60 * 10, // 10 minutes
	});

	// Get redirect URL from query params (where to go after login)
	const redirectUrl = url.searchParams.get('redirect') || '/';
	cookies.set('post_login_redirect', redirectUrl, {
		path: '/',
		httpOnly: true,
		secure: import.meta.env.PROD,
		sameSite: 'lax',
		maxAge: 60 * 10, // 10 minutes
	});

	// Build authorization URL
	const callbackUrl = `${url.origin}/auth/callback`;
	const authorizationUrl = authService.getAuthorizationUrl(callbackUrl, state, codeVerifier);

	// Redirect to Keycloak
	throw redirect(302, authorizationUrl);
};
