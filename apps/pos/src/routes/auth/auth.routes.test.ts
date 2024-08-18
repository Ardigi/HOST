/**
 * Tests for Authentication Routes
 * Covers login, callback, and logout flows with OIDC/PKCE
 */

import { AuthService } from '@host/shared';
import type { Cookies, ServerLoadEvent } from '@sveltejs/kit';
import type { CookieSerializeOptions } from 'cookie';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as callbackRoute from './callback/+page.server';
// Import route load functions
import * as loginRoute from './login/+page.server';
import * as logoutRoute from './logout/+page.server';

import type { PageServerLoadEvent as CallbackLoadEvent } from './callback/$types';
// Import route-specific types from SvelteKit's generated $types
import type { PageServerLoadEvent as LoginLoadEvent } from './login/$types';
import type { PageServerLoadEvent as LogoutLoadEvent } from './logout/$types';

// Type guards for SvelteKit redirects and errors
interface SvelteKitRedirect {
	status: number;
	location: string;
}

interface SvelteKitError {
	status: number;
	body: { message: string };
}

function isSvelteKitRedirect(error: unknown): error is SvelteKitRedirect {
	return (
		typeof error === 'object' &&
		error !== null &&
		'status' in error &&
		'location' in error &&
		typeof (error as SvelteKitRedirect).status === 'number' &&
		typeof (error as SvelteKitRedirect).location === 'string'
	);
}

function isSvelteKitError(error: unknown): error is SvelteKitError {
	return (
		typeof error === 'object' &&
		error !== null &&
		'status' in error &&
		'body' in error &&
		typeof (error as SvelteKitError).status === 'number'
	);
}

/**
 * Creates a complete ServerLoadEvent mock with all required properties
 * Follows Vitest best practice: create complete "dummy" objects, not partial mocks
 */
function createMockServerLoadEvent(
	overrides: Partial<
		ServerLoadEvent<Record<string, string>, { user: App.Locals['user'] }, null>
	> = {}
): ServerLoadEvent<Record<string, string>, { user: App.Locals['user'] }, null> {
	const mockCookies: Cookies = {
		get: vi.fn((_name: string) => undefined),
		getAll: vi.fn(() => []),
		set: vi.fn(),
		delete: vi.fn(),
		serialize: vi.fn(() => ''),
	};

	const defaultEvent: ServerLoadEvent = {
		// From RequestEvent
		cookies: mockCookies,
		fetch: vi.fn(globalThis.fetch),
		getClientAddress: vi.fn(() => '127.0.0.1'),
		locals: { user: null },
		params: {},
		platform: undefined,
		request: new Request('http://localhost:5173'),
		route: { id: null },
		setHeaders: vi.fn(),
		url: new URL('http://localhost:5173'),
		isDataRequest: false,
		isSubRequest: false,
		isRemoteRequest: false,
		tracing: {
			enabled: false,
			// biome-ignore lint/suspicious/noExplicitAny: Mock tracer doesn't need full Span type
			root: {} as any,
			// biome-ignore lint/suspicious/noExplicitAny: Mock tracer doesn't need full Span type
			current: {} as any,
		},

		// From ServerLoadEvent
		parent: vi.fn(() => Promise.resolve({ user: null })) as ServerLoadEvent['parent'],
		depends: vi.fn() as ServerLoadEvent['depends'],
		untrack: (<T>(fn: () => T): T => fn()) as ServerLoadEvent['untrack'],
	};

	return { ...defaultEvent, ...overrides } as ServerLoadEvent<
		Record<string, string>,
		{ user: App.Locals['user'] },
		null
	>;
}

describe('Authentication Routes', () => {
	let cookies: Map<string, string>;
	let setCookieCalls: Array<{ name: string; value: string; options: CookieSerializeOptions }>;
	let deleteCookieCalls: Array<{ name: string; options: CookieSerializeOptions }>;
	let mockUrl: URL;

	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks();
		cookies = new Map();
		setCookieCalls = [];
		deleteCookieCalls = [];

		// Mock URL
		mockUrl = new URL('http://localhost:5173/auth/login');

		// Spy on AuthService methods
		vi.spyOn(AuthService.prototype, 'generateCodeVerifier').mockReturnValue(
			'mock-code-verifier-123'
		);
		vi.spyOn(AuthService.prototype, 'getAuthorizationUrl').mockReturnValue(
			'http://localhost:8080/auth/realms/host-pos/protocol/openid-connect/auth?...'
		);
		vi.spyOn(AuthService.prototype, 'exchangeCodeForTokens').mockResolvedValue({
			access_token: 'mock-access-token',
			refresh_token: 'mock-refresh-token',
			expires_in: 300,
			token_type: 'Bearer',
		});
		vi.spyOn(AuthService.prototype, 'logout').mockResolvedValue();

		// Mock crypto.randomUUID
		vi.stubGlobal('crypto', {
			randomUUID: vi.fn(() => 'mock-state-uuid'),
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	describe('Login Route (/auth/login)', () => {
		it('should generate PKCE code verifier and state', async () => {
			// Arrange
			const mockEvent = createMockServerLoadEvent({
				url: mockUrl,
				cookies: {
					get: vi.fn((name: string) => cookies.get(name)),
					getAll: vi.fn(() => []),
					set: vi.fn((name: string, value: string, options: CookieSerializeOptions) => {
						cookies.set(name, value);
						setCookieCalls.push({ name, value, options });
					}),
					delete: vi.fn(),
					serialize: vi.fn(() => ''),
				} as Cookies,
			}) as unknown as LoginLoadEvent;

			// Act & Assert - Should throw redirect
			await expect(loginRoute.load(mockEvent)).rejects.toThrow();

			// Verify AuthService methods called
			expect(AuthService.prototype.generateCodeVerifier).toHaveBeenCalled();
		});

		it('should set oauth_code_verifier cookie with correct options', async () => {
			// Arrange
			const mockEvent = createMockServerLoadEvent({
				url: mockUrl,
				cookies: {
					get: vi.fn((name: string) => cookies.get(name)),
					getAll: vi.fn(() => []),
					set: vi.fn((name: string, value: string, options: CookieSerializeOptions) => {
						cookies.set(name, value);
						setCookieCalls.push({ name, value, options });
					}),
					delete: vi.fn(),
					serialize: vi.fn(() => ''),
				} as Cookies,
			}) as unknown as LoginLoadEvent;

			// Act
			await expect(loginRoute.load(mockEvent)).rejects.toThrow();

			// Assert
			const verifierCookie = setCookieCalls.find(call => call.name === 'oauth_code_verifier');
			expect(verifierCookie).toBeDefined();
			expect(verifierCookie?.value).toBe('mock-code-verifier-123');
			expect(verifierCookie?.options).toMatchObject({
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 60 * 10, // 10 minutes
			});
		});

		it('should set oauth_state cookie with UUID', async () => {
			// Arrange
			const mockEvent = createMockServerLoadEvent({
				url: mockUrl,
				cookies: {
					get: vi.fn((name: string) => cookies.get(name)),
					getAll: vi.fn(() => []),
					set: vi.fn((name: string, value: string, options: CookieSerializeOptions) => {
						cookies.set(name, value);
						setCookieCalls.push({ name, value, options });
					}),
					delete: vi.fn(),
					serialize: vi.fn(() => ''),
				} as Cookies,
			}) as unknown as LoginLoadEvent;

			// Act
			await expect(loginRoute.load(mockEvent)).rejects.toThrow();

			// Assert
			const stateCookie = setCookieCalls.find(call => call.name === 'oauth_state');
			expect(stateCookie).toBeDefined();
			expect(stateCookie?.value).toBe('mock-state-uuid');
			expect(stateCookie?.options.maxAge).toBe(60 * 10);
		});

		it('should store redirect URL from query params', async () => {
			// Arrange
			mockUrl.searchParams.set('redirect', '/orders');
			const mockEvent = createMockServerLoadEvent({
				url: mockUrl,
				cookies: {
					get: vi.fn((name: string) => cookies.get(name)),
					getAll: vi.fn(() => []),
					set: vi.fn((name: string, value: string, options: CookieSerializeOptions) => {
						cookies.set(name, value);
						setCookieCalls.push({ name, value, options });
					}),
					delete: vi.fn(),
					serialize: vi.fn(() => ''),
				} as Cookies,
			}) as unknown as LoginLoadEvent;

			// Act
			await expect(loginRoute.load(mockEvent)).rejects.toThrow();

			// Assert
			const redirectCookie = setCookieCalls.find(call => call.name === 'post_login_redirect');
			expect(redirectCookie).toBeDefined();
			expect(redirectCookie?.value).toBe('/orders');
		});

		it('should default redirect to / if no query param', async () => {
			// Arrange
			const mockEvent = createMockServerLoadEvent({
				url: mockUrl,
				cookies: {
					get: vi.fn((name: string) => cookies.get(name)),
					getAll: vi.fn(() => []),
					set: vi.fn((name: string, value: string, options: CookieSerializeOptions) => {
						cookies.set(name, value);
						setCookieCalls.push({ name, value, options });
					}),
					delete: vi.fn(),
					serialize: vi.fn(() => ''),
				} as Cookies,
			}) as unknown as LoginLoadEvent;

			// Act
			await expect(loginRoute.load(mockEvent)).rejects.toThrow();

			// Assert
			const redirectCookie = setCookieCalls.find(call => call.name === 'post_login_redirect');
			expect(redirectCookie?.value).toBe('/');
		});

		it('should redirect to Keycloak authorization URL', async () => {
			// Arrange
			const mockEvent = createMockServerLoadEvent({
				url: mockUrl,
				cookies: {
					get: vi.fn((name: string) => cookies.get(name)),
					getAll: vi.fn(() => []),
					set: vi.fn((name: string, value: string, options: CookieSerializeOptions) => {
						cookies.set(name, value);
						setCookieCalls.push({ name, value, options });
					}),
					delete: vi.fn(),
					serialize: vi.fn(() => ''),
				} as Cookies,
			}) as unknown as LoginLoadEvent;

			// Act & Assert
			try {
				await loginRoute.load(mockEvent);
				expect.fail('Should have thrown redirect');
			} catch (error: unknown) {
				expect(isSvelteKitRedirect(error)).toBe(true);
				if (isSvelteKitRedirect(error)) {
					expect(error.status).toBe(302);
					expect(error.location).toBe(
						'http://localhost:8080/auth/realms/host-pos/protocol/openid-connect/auth?...'
					);
				}
			}

			// Verify getAuthorizationUrl called with correct params
			expect(AuthService.prototype.getAuthorizationUrl).toHaveBeenCalledWith(
				'http://localhost:5173/auth/callback',
				'mock-state-uuid',
				'mock-code-verifier-123'
			);
		});
	});

	describe('Callback Route (/auth/callback)', () => {
		beforeEach(() => {
			mockUrl = new URL('http://localhost:5173/auth/callback?code=auth-code-123&state=mock-state');
			cookies.set('oauth_state', 'mock-state');
			cookies.set('oauth_code_verifier', 'mock-verifier');
		});

		it('should handle OAuth error parameter', async () => {
			// Arrange
			mockUrl = new URL(
				'http://localhost:5173/auth/callback?error=access_denied&error_description=User denied'
			);
			const mockEvent = createMockServerLoadEvent({
				url: mockUrl,
				cookies: {
					get: vi.fn((name: string) => cookies.get(name)),
					getAll: vi.fn(() => []),
					set: vi.fn((name: string, value: string, options: CookieSerializeOptions) => {
						cookies.set(name, value);
						setCookieCalls.push({ name, value, options });
					}),
					delete: vi.fn((name: string, options: CookieSerializeOptions) => {
						cookies.delete(name);
						deleteCookieCalls.push({ name, options });
					}),
					serialize: vi.fn(() => ''),
				} as Cookies,
			}) as unknown as CallbackLoadEvent;

			// Act & Assert
			try {
				await callbackRoute.load(mockEvent);
				expect.fail('Should have thrown error');
			} catch (error: unknown) {
				if (!isSvelteKitError(error)) throw error;
				expect(error.status).toBe(400);
				expect(error.body.message).toContain('Authentication failed');
				expect(error.body.message).toContain('User denied');
			}
		});

		it('should require code parameter', async () => {
			// Arrange
			mockUrl = new URL('http://localhost:5173/auth/callback?state=mock-state');
			const mockEvent = createMockServerLoadEvent({
				url: mockUrl,
				cookies: {
					get: vi.fn((name: string) => cookies.get(name)),
					getAll: vi.fn(() => []),
					set: vi.fn(),
					delete: vi.fn(),
					serialize: vi.fn(() => ''),
				} as Cookies,
			}) as unknown as CallbackLoadEvent;

			// Act & Assert
			try {
				await callbackRoute.load(mockEvent);
				expect.fail('Should have thrown error');
			} catch (error: unknown) {
				if (!isSvelteKitError(error)) throw error;
				expect(error.status).toBe(400);
				expect(error.body.message).toContain('Missing authorization code');
			}
		});

		it('should require state parameter', async () => {
			// Arrange
			mockUrl = new URL('http://localhost:5173/auth/callback?code=auth-code-123');
			const mockEvent = createMockServerLoadEvent({
				url: mockUrl,
				cookies: {
					get: vi.fn((name: string) => cookies.get(name)),
					getAll: vi.fn(() => []),
					set: vi.fn(),
					delete: vi.fn(),
					serialize: vi.fn(() => ''),
				} as Cookies,
			}) as unknown as CallbackLoadEvent;

			// Act & Assert
			try {
				await callbackRoute.load(mockEvent);
				expect.fail('Should have thrown error');
			} catch (error: unknown) {
				if (!isSvelteKitError(error)) throw error;
				expect(error.status).toBe(400);
				expect(error.body.message).toContain('Missing authorization code or state');
			}
		});

		it('should validate state matches stored state (CSRF protection)', async () => {
			// Arrange
			cookies.set('oauth_state', 'different-state');
			const mockEvent = createMockServerLoadEvent({
				url: mockUrl,
				cookies: {
					get: vi.fn((name: string) => cookies.get(name)),
					getAll: vi.fn(() => []),
					set: vi.fn(),
					delete: vi.fn(),
					serialize: vi.fn(() => ''),
				} as Cookies,
			}) as unknown as CallbackLoadEvent;

			// Act & Assert
			try {
				await callbackRoute.load(mockEvent);
				expect.fail('Should have thrown error');
			} catch (error: unknown) {
				if (!isSvelteKitError(error)) throw error;
				expect(error.status).toBe(400);
				expect(error.body.message).toContain('Invalid state parameter');
			}
		});

		it('should require code verifier cookie', async () => {
			// Arrange
			cookies.delete('oauth_code_verifier');
			const mockEvent = createMockServerLoadEvent({
				url: mockUrl,
				cookies: {
					get: vi.fn((name: string) => cookies.get(name)),
					getAll: vi.fn(() => []),
					set: vi.fn(),
					delete: vi.fn(),
					serialize: vi.fn(() => ''),
				} as Cookies,
			}) as unknown as CallbackLoadEvent;

			// Act & Assert
			try {
				await callbackRoute.load(mockEvent);
				expect.fail('Should have thrown error');
			} catch (error: unknown) {
				if (!isSvelteKitError(error)) throw error;
				expect(error.status).toBe(400);
				expect(error.body.message).toContain('Missing code verifier');
			}
		});

		it('should exchange code for tokens successfully', async () => {
			// Arrange
			const mockEvent = createMockServerLoadEvent({
				url: mockUrl,
				cookies: {
					get: vi.fn((name: string) => cookies.get(name)),
					getAll: vi.fn(() => []),
					set: vi.fn((name: string, value: string, options: CookieSerializeOptions) => {
						cookies.set(name, value);
						setCookieCalls.push({ name, value, options });
					}),
					delete: vi.fn((name: string, options: CookieSerializeOptions) => {
						cookies.delete(name);
						deleteCookieCalls.push({ name, options });
					}),
					serialize: vi.fn(() => ''),
				} as Cookies,
			}) as unknown as CallbackLoadEvent;

			// Act
			await expect(callbackRoute.load(mockEvent)).rejects.toThrow();

			// Assert
			expect(AuthService.prototype.exchangeCodeForTokens).toHaveBeenCalledWith(
				'auth-code-123',
				'http://localhost:5173/auth/callback',
				'mock-verifier'
			);
		});

		it('should set access_token cookie with correct expiry', async () => {
			// Arrange
			const mockEvent = createMockServerLoadEvent({
				url: mockUrl,
				cookies: {
					get: vi.fn((name: string) => cookies.get(name)),
					getAll: vi.fn(() => []),
					set: vi.fn((name: string, value: string, options: CookieSerializeOptions) => {
						cookies.set(name, value);
						setCookieCalls.push({ name, value, options });
					}),
					delete: vi.fn((name: string, options: CookieSerializeOptions) => {
						cookies.delete(name);
						deleteCookieCalls.push({ name, options });
					}),
					serialize: vi.fn(() => ''),
				} as Cookies,
			}) as unknown as CallbackLoadEvent;

			// Act
			await expect(callbackRoute.load(mockEvent)).rejects.toThrow();

			// Assert
			const accessTokenCookie = setCookieCalls.find(call => call.name === 'access_token');
			expect(accessTokenCookie).toBeDefined();
			expect(accessTokenCookie?.value).toBe('mock-access-token');
			expect(accessTokenCookie?.options).toMatchObject({
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 300,
			});
		});

		it('should set refresh_token cookie if provided', async () => {
			// Arrange
			const mockEvent = createMockServerLoadEvent({
				url: mockUrl,
				cookies: {
					get: vi.fn((name: string) => cookies.get(name)),
					getAll: vi.fn(() => []),
					set: vi.fn((name: string, value: string, options: CookieSerializeOptions) => {
						cookies.set(name, value);
						setCookieCalls.push({ name, value, options });
					}),
					delete: vi.fn((name: string, options: CookieSerializeOptions) => {
						cookies.delete(name);
						deleteCookieCalls.push({ name, options });
					}),
					serialize: vi.fn(() => ''),
				} as Cookies,
			}) as unknown as CallbackLoadEvent;

			// Act
			await expect(callbackRoute.load(mockEvent)).rejects.toThrow();

			// Assert
			const refreshTokenCookie = setCookieCalls.find(call => call.name === 'refresh_token');
			expect(refreshTokenCookie).toBeDefined();
			expect(refreshTokenCookie?.value).toBe('mock-refresh-token');
			expect(refreshTokenCookie?.options.maxAge).toBe(30 * 24 * 60 * 60); // 30 days
		});

		it('should clean up temporary OAuth cookies', async () => {
			// Arrange
			const mockEvent = createMockServerLoadEvent({
				url: mockUrl,
				cookies: {
					get: vi.fn((name: string) => cookies.get(name)),
					getAll: vi.fn(() => []),
					set: vi.fn((name: string, value: string, options: CookieSerializeOptions) => {
						cookies.set(name, value);
						setCookieCalls.push({ name, value, options });
					}),
					delete: vi.fn((name: string, options: CookieSerializeOptions) => {
						cookies.delete(name);
						deleteCookieCalls.push({ name, options });
					}),
					serialize: vi.fn(() => ''),
				} as Cookies,
			}) as unknown as CallbackLoadEvent;

			// Act
			await expect(callbackRoute.load(mockEvent)).rejects.toThrow();

			// Assert
			expect(deleteCookieCalls).toContainEqual({
				name: 'oauth_code_verifier',
				options: { path: '/' },
			});
			expect(deleteCookieCalls).toContainEqual({ name: 'oauth_state', options: { path: '/' } });
		});

		it('should redirect to stored post_login_redirect', async () => {
			// Arrange
			cookies.set('post_login_redirect', '/orders');
			const mockEvent = createMockServerLoadEvent({
				url: mockUrl,
				cookies: {
					get: vi.fn((name: string) => cookies.get(name)),
					getAll: vi.fn(() => []),
					set: vi.fn((name: string, value: string, options: CookieSerializeOptions) => {
						cookies.set(name, value);
						setCookieCalls.push({ name, value, options });
					}),
					delete: vi.fn((name: string, options: CookieSerializeOptions) => {
						cookies.delete(name);
						deleteCookieCalls.push({ name, options });
					}),
					serialize: vi.fn(() => ''),
				} as Cookies,
			}) as unknown as CallbackLoadEvent;

			// Act & Assert
			try {
				await callbackRoute.load(mockEvent);
				expect.fail('Should have thrown redirect');
			} catch (error: unknown) {
				if (!isSvelteKitRedirect(error)) throw error;
				expect(error.status).toBe(302);
				expect(error.location).toBe('/orders');
			}

			// Verify cleanup of post_login_redirect cookie
			expect(deleteCookieCalls).toContainEqual({
				name: 'post_login_redirect',
				options: { path: '/' },
			});
		});

		it('should default redirect to / if no stored redirect', async () => {
			// Arrange
			const mockEvent = createMockServerLoadEvent({
				url: mockUrl,
				cookies: {
					get: vi.fn((name: string) => cookies.get(name)),
					getAll: vi.fn(() => []),
					set: vi.fn((name: string, value: string, options: CookieSerializeOptions) => {
						cookies.set(name, value);
						setCookieCalls.push({ name, value, options });
					}),
					delete: vi.fn((name: string, options: CookieSerializeOptions) => {
						cookies.delete(name);
						deleteCookieCalls.push({ name, options });
					}),
					serialize: vi.fn(() => ''),
				} as Cookies,
			}) as unknown as CallbackLoadEvent;

			// Act & Assert
			try {
				await callbackRoute.load(mockEvent);
				expect.fail('Should have thrown redirect');
			} catch (error: unknown) {
				if (!isSvelteKitRedirect(error)) throw error;
				expect(error.status).toBe(302);
				expect(error.location).toBe('/');
			}
		});

		it('should handle token exchange failure', async () => {
			// Arrange
			vi.mocked(AuthService.prototype.exchangeCodeForTokens).mockRejectedValue(
				new Error('Invalid authorization code')
			);
			const mockEvent = createMockServerLoadEvent({
				url: mockUrl,
				cookies: {
					get: vi.fn((name: string) => cookies.get(name)),
					getAll: vi.fn(() => []),
					set: vi.fn(),
					delete: vi.fn(),
					serialize: vi.fn(() => ''),
				} as Cookies,
			}) as unknown as CallbackLoadEvent;

			// Act & Assert
			try {
				await callbackRoute.load(mockEvent);
				expect.fail('Should have thrown error');
			} catch (error: unknown) {
				if (!isSvelteKitError(error)) throw error;
				expect(error.status).toBe(500);
				expect(error.body.message).toContain('Invalid authorization code');
			}
		});
	});

	describe('Logout Route (/auth/logout)', () => {
		it('should revoke tokens at Keycloak', async () => {
			// Arrange
			cookies.set('refresh_token', 'mock-refresh-token');
			const mockEvent = createMockServerLoadEvent({
				cookies: {
					get: vi.fn((name: string) => cookies.get(name)),
					getAll: vi.fn(() => []),
					set: vi.fn(),
					delete: vi.fn((name: string, options: CookieSerializeOptions) => {
						cookies.delete(name);
						deleteCookieCalls.push({ name, options });
					}),
					serialize: vi.fn(() => ''),
				} as Cookies,
			}) as unknown as LogoutLoadEvent;

			// Act
			await expect(logoutRoute.load(mockEvent)).rejects.toThrow();

			// Assert
			expect(AuthService.prototype.logout).toHaveBeenCalledWith('mock-refresh-token');
		});

		it('should clear access_token cookie', async () => {
			// Arrange
			const mockEvent = createMockServerLoadEvent({
				cookies: {
					get: vi.fn((name: string) => cookies.get(name)),
					getAll: vi.fn(() => []),
					set: vi.fn(),
					delete: vi.fn((name: string, options: CookieSerializeOptions) => {
						cookies.delete(name);
						deleteCookieCalls.push({ name, options });
					}),
					serialize: vi.fn(() => ''),
				} as Cookies,
			}) as unknown as LogoutLoadEvent;

			// Act
			await expect(logoutRoute.load(mockEvent)).rejects.toThrow();

			// Assert
			expect(deleteCookieCalls).toContainEqual({ name: 'access_token', options: { path: '/' } });
		});

		it('should clear refresh_token cookie', async () => {
			// Arrange
			const mockEvent = createMockServerLoadEvent({
				cookies: {
					get: vi.fn((name: string) => cookies.get(name)),
					getAll: vi.fn(() => []),
					set: vi.fn(),
					delete: vi.fn((name: string, options: CookieSerializeOptions) => {
						cookies.delete(name);
						deleteCookieCalls.push({ name, options });
					}),
					serialize: vi.fn(() => ''),
				} as Cookies,
			}) as unknown as LogoutLoadEvent;

			// Act
			await expect(logoutRoute.load(mockEvent)).rejects.toThrow();

			// Assert
			expect(deleteCookieCalls).toContainEqual({ name: 'refresh_token', options: { path: '/' } });
		});

		it('should redirect to login page', async () => {
			// Arrange
			const mockEvent = createMockServerLoadEvent({
				cookies: {
					get: vi.fn((name: string) => cookies.get(name)),
					getAll: vi.fn(() => []),
					set: vi.fn(),
					delete: vi.fn((name: string, options: CookieSerializeOptions) => {
						cookies.delete(name);
						deleteCookieCalls.push({ name, options });
					}),
					serialize: vi.fn(() => ''),
				} as Cookies,
			}) as unknown as LogoutLoadEvent;

			// Act & Assert
			try {
				await logoutRoute.load(mockEvent);
				expect.fail('Should have thrown redirect');
			} catch (error: unknown) {
				if (!isSvelteKitRedirect(error)) throw error;
				expect(error.status).toBe(302);
				expect(error.location).toBe('/auth/login');
			}
		});

		it('should handle Keycloak logout failure gracefully', async () => {
			// Arrange
			cookies.set('refresh_token', 'mock-refresh-token');
			vi.mocked(AuthService.prototype.logout).mockRejectedValue(new Error('Network error'));
			// biome-ignore lint/suspicious/noEmptyBlockStatements: Mock implementation intentionally does nothing
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const mockEvent = createMockServerLoadEvent({
				cookies: {
					get: vi.fn((name: string) => cookies.get(name)),
					getAll: vi.fn(() => []),
					set: vi.fn(),
					delete: vi.fn((name: string, options: CookieSerializeOptions) => {
						cookies.delete(name);
						deleteCookieCalls.push({ name, options });
					}),
					serialize: vi.fn(() => ''),
				} as Cookies,
			}) as unknown as LogoutLoadEvent;

			// Act
			await expect(logoutRoute.load(mockEvent)).rejects.toThrow();

			// Assert - should still clear cookies and redirect
			expect(consoleErrorSpy).toHaveBeenCalledWith('Keycloak logout failed:', expect.any(Error));
			expect(deleteCookieCalls).toContainEqual({ name: 'access_token', options: { path: '/' } });
			expect(deleteCookieCalls).toContainEqual({ name: 'refresh_token', options: { path: '/' } });

			consoleErrorSpy.mockRestore();
		});

		it('should not call logout if no refresh token exists', async () => {
			// Arrange
			const mockEvent = createMockServerLoadEvent({
				cookies: {
					get: vi.fn((name: string) => cookies.get(name)),
					getAll: vi.fn(() => []),
					set: vi.fn(),
					delete: vi.fn((name: string, options: CookieSerializeOptions) => {
						cookies.delete(name);
						deleteCookieCalls.push({ name, options });
					}),
					serialize: vi.fn(() => ''),
				} as Cookies,
			}) as unknown as LogoutLoadEvent;

			// Act
			await expect(logoutRoute.load(mockEvent)).rejects.toThrow();

			// Assert
			expect(AuthService.prototype.logout).not.toHaveBeenCalled();
			expect(deleteCookieCalls).toHaveLength(2); // Still clears cookies
		});
	});
});
