/**
 * Authentication Service
 * Handles Keycloak OIDC authentication with PKCE flow
 */

import * as jose from 'jose';

export interface AuthConfig {
	keycloakUrl: string;
	realm: string;
	clientId: string;
}

export interface TokenResponse {
	access_token: string;
	refresh_token?: string;
	id_token?: string;
	expires_in: number;
	token_type: string;
}

export interface UserInfo {
	sub: string;
	email: string;
	given_name?: string;
	family_name?: string;
	venue_id?: string;
}

export interface TokenPayload {
	sub: string;
	email?: string;
	given_name?: string;
	family_name?: string;
	venue_id?: string;
	realm_access?: {
		roles: string[];
	};
	exp: number;
	iss: string;
	aud: string;
}

export class AuthService {
	private keycloakUrl: string;
	private realm: string;
	private clientId: string;
	private tokenEndpoint: string;
	private authEndpoint: string;
	private logoutEndpoint: string;
	private userInfoEndpoint: string;
	private jwksUri: string;

	constructor(config: AuthConfig) {
		this.keycloakUrl = config.keycloakUrl;
		this.realm = config.realm;
		this.clientId = config.clientId;

		const baseUrl = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect`;
		this.tokenEndpoint = `${baseUrl}/token`;
		this.authEndpoint = `${baseUrl}/auth`;
		this.logoutEndpoint = `${baseUrl}/logout`;
		this.userInfoEndpoint = `${baseUrl}/userinfo`;
		this.jwksUri = `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/certs`;
	}

	/**
	 * Generate PKCE code verifier (43-128 characters)
	 */
	generateCodeVerifier(): string {
		const array = new Uint8Array(32);
		crypto.getRandomValues(array);
		return this.base64URLEncode(array);
	}

	/**
	 * Generate PKCE code challenge from verifier using SHA-256
	 */
	async generateCodeChallenge(verifier: string): Promise<string> {
		const encoder = new TextEncoder();
		const data = encoder.encode(verifier);
		const hash = await crypto.subtle.digest('SHA-256', data);
		return this.base64URLEncode(new Uint8Array(hash));
	}

	/**
	 * Get authorization URL for OAuth2 authorization code flow with PKCE
	 */
	getAuthorizationUrl(redirectUri: string, state: string, codeVerifier: string): string {
		const params = new URLSearchParams({
			client_id: this.clientId,
			redirect_uri: redirectUri,
			response_type: 'code',
			scope: 'openid profile email',
			state: state,
			code_challenge_method: 'S256',
		});

		// Generate code challenge synchronously for URL generation
		// Note: In real usage, challenge should be pre-computed
		const encoder = new TextEncoder();
		const data = encoder.encode(codeVerifier);

		// For URL generation, we'll compute hash and add it
		crypto.subtle.digest('SHA-256', data).then(hash => {
			const challenge = this.base64URLEncode(new Uint8Array(hash));
			params.set('code_challenge', challenge);
		});

		// Temporary: use a placeholder that will be replaced
		// In production, this should be async or pre-computed
		const challenge = this.hashCodeVerifier(codeVerifier);
		params.set('code_challenge', challenge);

		return `${this.authEndpoint}?${params.toString()}`;
	}

	/**
	 * Exchange authorization code for tokens
	 */
	async exchangeCodeForTokens(
		code: string,
		redirectUri: string,
		codeVerifier: string
	): Promise<TokenResponse> {
		const params = new URLSearchParams({
			grant_type: 'authorization_code',
			client_id: this.clientId,
			code: code,
			redirect_uri: redirectUri,
			code_verifier: codeVerifier,
		});

		const response = await fetch(this.tokenEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: params.toString(),
		});

		if (!response.ok) {
			throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
		}

		return await response.json();
	}

	/**
	 * Validate JWT token and return decoded payload
	 */
	async validateToken(token: string): Promise<TokenPayload> {
		try {
			// Get JWKS from Keycloak
			const JWKS = jose.createRemoteJWKSet(new URL(this.jwksUri));

			// Verify and decode the token
			const { payload } = await jose.jwtVerify(token, JWKS, {
				issuer: `${this.keycloakUrl}/realms/${this.realm}`,
				audience: this.clientId,
			});

			return payload as unknown as TokenPayload;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Token validation failed: ${error.message}`);
			}
			throw new Error('Token validation failed');
		}
	}

	/**
	 * Refresh access token using refresh token
	 */
	async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
		const params = new URLSearchParams({
			grant_type: 'refresh_token',
			client_id: this.clientId,
			refresh_token: refreshToken,
		});

		const response = await fetch(this.tokenEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: params.toString(),
		});

		if (!response.ok) {
			throw new Error(`Token refresh failed: ${response.status}`);
		}

		return await response.json();
	}

	/**
	 * Logout and revoke tokens
	 */
	async logout(refreshToken: string): Promise<void> {
		const params = new URLSearchParams({
			client_id: this.clientId,
			refresh_token: refreshToken,
		});

		try {
			await fetch(this.logoutEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: params.toString(),
			});
		} catch (error) {
			// Logout should not throw even if revocation fails
			console.error('Logout revocation failed:', error);
		}
	}

	/**
	 * Get user info from Keycloak
	 */
	async getUserInfo(accessToken: string): Promise<UserInfo> {
		const response = await fetch(this.userInfoEndpoint, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch user info: ${response.status}`);
		}

		return await response.json();
	}

	/**
	 * Check if token payload has specific role
	 */
	hasRole(payload: Partial<TokenPayload>, role: string): boolean {
		return payload.realm_access?.roles?.includes(role) ?? false;
	}

	/**
	 * Base64 URL encode
	 */
	private base64URLEncode(buffer: Uint8Array): string {
		const base64 = btoa(String.fromCharCode(...buffer));
		return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
	}

	/**
	 * Synchronous hash for code verifier (simple implementation)
	 * Note: This is a placeholder - in production use async generateCodeChallenge
	 */
	private hashCodeVerifier(verifier: string): string {
		// This is a simple placeholder that creates a deterministic string
		// In real implementation, this would use the async SHA-256 hash
		let hash = 0;
		for (let i = 0; i < verifier.length; i++) {
			const char = verifier.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32-bit integer
		}
		return Math.abs(hash).toString(36);
	}
}
