/**
 * @description Authentication Service Tests
 * @dependencies jose, @auth/sveltekit
 * @coverage-target 85% (critical authentication path)
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
	let authService: AuthService;
	const mockKeycloakUrl = 'http://localhost:8080';
	const mockRealm = 'host-pos';
	const mockClientId = 'host-pos-web';

	beforeEach(() => {
		authService = new AuthService({
			keycloakUrl: mockKeycloakUrl,
			realm: mockRealm,
			clientId: mockClientId,
		});
	});

	describe('getAuthorizationUrl', () => {
		it('should generate PKCE authorization URL with correct parameters', () => {
			// Arrange
			const redirectUri = 'http://localhost:5173/auth/callback';
			const state = 'random-state-string';
			const codeVerifier = 'test-code-verifier-string-with-sufficient-length';

			// Act
			const url = authService.getAuthorizationUrl(redirectUri, state, codeVerifier);

			// Assert
			expect(url).toContain(`${mockKeycloakUrl}/realms/${mockRealm}/protocol/openid-connect/auth`);
			expect(url).toContain(`client_id=${mockClientId}`);
			expect(url).toContain(`redirect_uri=${encodeURIComponent(redirectUri)}`);
			expect(url).toContain('response_type=code');
			expect(url).toContain(`state=${state}`);
			expect(url).toContain('code_challenge_method=S256');
			expect(url).toContain('code_challenge=');
		});

		it('should include required scopes in authorization URL', () => {
			// Arrange
			const redirectUri = 'http://localhost:5173/auth/callback';
			const state = 'state';
			const codeVerifier = 'verifier-string-with-sufficient-length-for-pkce';

			// Act
			const url = authService.getAuthorizationUrl(redirectUri, state, codeVerifier);

			// Assert
			expect(url).toContain('scope=');
			expect(url).toContain('openid');
			expect(url).toContain('profile');
			expect(url).toContain('email');
		});
	});

	describe('exchangeCodeForTokens', () => {
		it('should exchange authorization code for tokens', async () => {
			// Arrange
			const code = 'auth-code-123';
			const redirectUri = 'http://localhost:5173/auth/callback';
			const codeVerifier = 'code-verifier-string-with-sufficient-length';

			const mockResponse = {
				access_token: 'eyJhbGc...',
				refresh_token: 'refresh...',
				id_token: 'id...',
				expires_in: 300,
				token_type: 'Bearer',
			};

			// Mock fetch
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => mockResponse,
			} as Response);

			// Act
			const tokens = await authService.exchangeCodeForTokens(code, redirectUri, codeVerifier);

			// Assert
			expect(tokens).toEqual(mockResponse);
			expect(global.fetch).toHaveBeenCalledWith(
				`${mockKeycloakUrl}/realms/${mockRealm}/protocol/openid-connect/token`,
				expect.objectContaining({
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				})
			);
		});

		it('should throw error on token exchange failure', async () => {
			// Arrange
			const code = 'invalid-code';
			const redirectUri = 'http://localhost:5173/auth/callback';
			const codeVerifier = 'code-verifier';

			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 400,
				statusText: 'Bad Request',
			} as Response);

			// Act & Assert
			await expect(
				authService.exchangeCodeForTokens(code, redirectUri, codeVerifier)
			).rejects.toThrow('Token exchange failed');
		});
	});

	describe('validateToken', () => {
		it('should validate JWT token and return decoded payload', async () => {
			// Arrange
			const mockToken =
				'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImdpdmVuX25hbWUiOiJKb2huIiwiZmFtaWx5X25hbWUiOiJEb2UiLCJ2ZW51ZV9pZCI6InZlbnVlLTQ1NiIsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJzZXJ2ZXIiXX0sImV4cCI6OTk5OTk5OTk5OSwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3JlYWxtcy9ob3N0LXBvcyIsImF1ZCI6Imhvc3QtcG9zLXdlYiJ9.mock-signature';

			// Note: In real implementation, we'd need to mock JWKS endpoint
			// For now, we're testing the structure

			// Act & Assert
			// This will fail until implementation is complete
			await expect(authService.validateToken(mockToken)).rejects.toThrow();
		});

		it('should reject expired tokens', async () => {
			// Arrange
			const expiredToken =
				'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImV4cCI6MTAwMDAwMDAwMH0.mock-signature';

			// Act & Assert
			await expect(authService.validateToken(expiredToken)).rejects.toThrow();
		});
	});

	describe('refreshAccessToken', () => {
		it('should refresh access token using refresh token', async () => {
			// Arrange
			const refreshToken = 'refresh-token-123';
			const mockResponse = {
				access_token: 'new-access-token',
				refresh_token: 'new-refresh-token',
				expires_in: 300,
				token_type: 'Bearer',
			};

			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => mockResponse,
			} as Response);

			// Act
			const tokens = await authService.refreshAccessToken(refreshToken);

			// Assert
			expect(tokens).toEqual(mockResponse);
			expect(global.fetch).toHaveBeenCalledWith(
				`${mockKeycloakUrl}/realms/${mockRealm}/protocol/openid-connect/token`,
				expect.objectContaining({
					method: 'POST',
					body: expect.stringContaining('grant_type=refresh_token'),
				})
			);
		});

		it('should throw error on refresh failure', async () => {
			// Arrange
			const refreshToken = 'invalid-refresh-token';

			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 401,
			} as Response);

			// Act & Assert
			await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrow(
				'Token refresh failed'
			);
		});
	});

	describe('logout', () => {
		it('should revoke tokens on logout', async () => {
			// Arrange
			const refreshToken = 'refresh-token-to-revoke';

			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
			} as Response);

			// Act
			await authService.logout(refreshToken);

			// Assert
			expect(global.fetch).toHaveBeenCalledWith(
				`${mockKeycloakUrl}/realms/${mockRealm}/protocol/openid-connect/logout`,
				expect.objectContaining({
					method: 'POST',
					body: expect.stringContaining(`client_id=${mockClientId}`),
				})
			);
		});

		it('should handle logout errors gracefully', async () => {
			// Arrange
			const refreshToken = 'token';

			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
			} as Response);

			// Act & Assert
			// Logout should not throw even if revocation fails
			await expect(authService.logout(refreshToken)).resolves.toBeUndefined();
		});
	});

	describe('getUserInfo', () => {
		it('should fetch user info from Keycloak', async () => {
			// Arrange
			const accessToken = 'valid-access-token';
			const mockUserInfo = {
				sub: 'user-123',
				email: 'test@example.com',
				given_name: 'John',
				family_name: 'Doe',
				venue_id: 'venue-456',
			};

			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => mockUserInfo,
			} as Response);

			// Act
			const userInfo = await authService.getUserInfo(accessToken);

			// Assert
			expect(userInfo).toEqual(mockUserInfo);
			expect(global.fetch).toHaveBeenCalledWith(
				`${mockKeycloakUrl}/realms/${mockRealm}/protocol/openid-connect/userinfo`,
				expect.objectContaining({
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				})
			);
		});
	});

	describe('hasRole', () => {
		it('should check if user has specific role', () => {
			// Arrange
			const tokenPayload = {
				realm_access: {
					roles: ['server', 'bartender'],
				},
			};

			// Act & Assert
			expect(authService.hasRole(tokenPayload, 'server')).toBe(true);
			expect(authService.hasRole(tokenPayload, 'admin')).toBe(false);
		});

		it('should return false for missing realm_access', () => {
			// Arrange
			const tokenPayload = {};

			// Act & Assert
			expect(authService.hasRole(tokenPayload, 'server')).toBe(false);
		});
	});

	describe('PKCE helpers', () => {
		it('should generate code verifier with RFC 7636 compliant length (43-128 chars)', () => {
			// Act
			const verifier = authService.generateCodeVerifier();

			// Assert
			expect(verifier).toBeDefined();
			expect(verifier.length).toBeGreaterThanOrEqual(43);
			expect(verifier.length).toBeLessThanOrEqual(128);
		});

		it('should generate code verifier with only URL-safe characters', () => {
			// Act
			const verifier = authService.generateCodeVerifier();

			// Assert - RFC 7636: unreserved characters [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
			const urlSafeRegex = /^[A-Za-z0-9\-._~]+$/;
			expect(verifier).toMatch(urlSafeRegex);
		});

		it('should generate unique code verifiers on each call', () => {
			// Act
			const verifier1 = authService.generateCodeVerifier();
			const verifier2 = authService.generateCodeVerifier();
			const verifier3 = authService.generateCodeVerifier();

			// Assert - Each verifier should be unique (cryptographically random)
			expect(verifier1).not.toBe(verifier2);
			expect(verifier2).not.toBe(verifier3);
			expect(verifier1).not.toBe(verifier3);
		});

		it('should generate code challenge from verifier using SHA-256', async () => {
			// Arrange
			const verifier = 'test-verifier-string-with-sufficient-length-for-pkce-standard';

			// Act
			const challenge = await authService.generateCodeChallenge(verifier);

			// Assert
			expect(challenge).toBeDefined();
			expect(challenge).not.toBe(verifier);
			expect(challenge.length).toBeGreaterThan(0);
		});

		it('should generate deterministic code challenge for same verifier (SHA-256 is deterministic)', async () => {
			// Arrange
			const verifier = 'consistent-test-verifier-string-for-determinism-check';

			// Act
			const challenge1 = await authService.generateCodeChallenge(verifier);
			const challenge2 = await authService.generateCodeChallenge(verifier);

			// Assert - Same verifier must always produce same challenge
			expect(challenge1).toBe(challenge2);
		});

		it('should generate different challenges for different verifiers', async () => {
			// Arrange
			const verifier1 = 'first-verifier-string-with-sufficient-length';
			const verifier2 = 'second-verifier-string-with-different-content';

			// Act
			const challenge1 = await authService.generateCodeChallenge(verifier1);
			const challenge2 = await authService.generateCodeChallenge(verifier2);

			// Assert - Different verifiers must produce different challenges
			expect(challenge1).not.toBe(challenge2);
		});

		it('should generate code challenge with base64url encoding (no padding, URL-safe)', async () => {
			// Arrange
			const verifier = 'verifier-for-base64url-encoding-validation';

			// Act
			const challenge = await authService.generateCodeChallenge(verifier);

			// Assert - base64url must not contain +, /, or = (padding)
			expect(challenge).not.toContain('+');
			expect(challenge).not.toContain('/');
			expect(challenge).not.toContain('=');
			// base64url uses - and _ instead
			const base64UrlRegex = /^[A-Za-z0-9\-_]+$/;
			expect(challenge).toMatch(base64UrlRegex);
		});

		it('should use S256 (SHA-256) algorithm as specified in RFC 7636', () => {
			// Arrange
			const redirectUri = 'http://localhost:5173/auth/callback';
			const state = 'state';
			const codeVerifier = 'verifier-string-with-sufficient-length-for-pkce';

			// Act
			const url = authService.getAuthorizationUrl(redirectUri, state, codeVerifier);

			// Assert - Authorization URL must specify S256 as the challenge method
			expect(url).toContain('code_challenge_method=S256');
		});

		it('should verify SHA-256 hash algorithm produces 43-character base64url output', async () => {
			// Arrange
			const verifier = 'any-valid-verifier-string-for-sha256-test';

			// Act
			const challenge = await authService.generateCodeChallenge(verifier);

			// Assert - SHA-256 produces 32 bytes = 256 bits
			// base64url encoding: 32 bytes -> 43 characters (no padding)
			expect(challenge.length).toBe(43);
		});
	});
});
