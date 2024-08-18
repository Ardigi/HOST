/**
 * OAuth callback handler
 * Exchanges authorization code for tokens
 */

import { AuthService } from '@host/shared';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, cookies }) => {
	// Get authorization code and state from query params
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const errorParam = url.searchParams.get('error');
	const errorDescription = url.searchParams.get('error_description');

	// Check for OAuth errors
	if (errorParam) {
		throw error(400, {
			message: `Authentication failed: ${errorDescription || errorParam}`,
		});
	}

	if (!code || !state) {
		throw error(400, { message: 'Missing authorization code or state' });
	}

	// Verify state to prevent CSRF
	const storedState = cookies.get('oauth_state');
	if (!storedState || storedState !== state) {
		throw error(400, { message: 'Invalid state parameter' });
	}

	// Get code verifier
	const codeVerifier = cookies.get('oauth_code_verifier');
	if (!codeVerifier) {
		throw error(400, { message: 'Missing code verifier' });
	}

	// Initialize AuthService
	const authService = new AuthService({
		keycloakUrl: import.meta.env.PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
		realm: import.meta.env.PUBLIC_KEYCLOAK_REALM || 'host-pos',
		clientId: import.meta.env.PUBLIC_KEYCLOAK_CLIENT_ID || 'host-pos-web',
	});

	try {
		// Exchange code for tokens
		const tokens = await authService.exchangeCodeForTokens(
			code,
			`${url.origin}/auth/callback`,
			codeVerifier
		);

		// Set access token cookie
		cookies.set('access_token', tokens.access_token, {
			path: '/',
			httpOnly: true,
			secure: import.meta.env.PROD,
			sameSite: 'lax',
			maxAge: tokens.expires_in,
		});

		// Set refresh token cookie if provided
		if (tokens.refresh_token) {
			cookies.set('refresh_token', tokens.refresh_token, {
				path: '/',
				httpOnly: true,
				secure: import.meta.env.PROD,
				sameSite: 'lax',
				maxAge: 30 * 24 * 60 * 60, // 30 days
			});
		}

		// Clean up temporary cookies
		cookies.delete('oauth_code_verifier', { path: '/' });
		cookies.delete('oauth_state', { path: '/' });

		// Get redirect URL or default to home
		const redirectUrl = cookies.get('post_login_redirect') || '/';
		cookies.delete('post_login_redirect', { path: '/' });

		// Redirect to original destination
		throw redirect(302, redirectUrl);
	} catch (err) {
		// Re-throw SvelteKit redirects (they have a status property)
		if (err && typeof err === 'object' && 'status' in err && 'location' in err) {
			throw err;
		}

		console.error('Token exchange failed:', err);
		throw error(500, {
			message: err instanceof Error ? err.message : 'Failed to exchange authorization code',
		});
	}
};
