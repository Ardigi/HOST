/**
 * Tests for SvelteKit Server Hooks
 * Covers authentication and authorization logic
 */

import { AuthService } from '@host/shared';
import type { RequestEvent } from '@sveltejs/kit';
import type { CookieSerializeOptions } from 'cookie';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleAuth, handleAuthorization } from './hooks.server';

describe('hooks.server.ts - Authentication & Authorization', () => {
	let mockEvent: RequestEvent;
	let mockResolve: ReturnType<typeof vi.fn>;
	let cookies: Map<string, string>;
	let setCookieCalls: Array<{ name: string; value: string; options: CookieSerializeOptions }>;
	let deleteCookieCalls: Array<{ name: string; options: CookieSerializeOptions }>;

	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks();
		cookies = new Map();
		setCookieCalls = [];
		deleteCookieCalls = [];

		// Spy on AuthService methods
		vi.spyOn(AuthService.prototype, 'validateToken').mockImplementation(vi.fn());
		vi.spyOn(AuthService.prototype, 'refreshAccessToken').mockImplementation(vi.fn());

		// Mock SvelteKit event
		mockResolve = vi.fn().mockResolvedValue(new Response('OK'));

		mockEvent = {
			cookies: {
				get: vi.fn((name: string) => cookies.get(name)),
				set: vi.fn((name: string, value: string, options: CookieSerializeOptions) => {
					cookies.set(name, value);
					setCookieCalls.push({ name, value, options });
				}),
				delete: vi.fn((name: string, options: CookieSerializeOptions) => {
					cookies.delete(name);
					deleteCookieCalls.push({ name, options });
				}),
			},
			locals: { user: null },
			url: new URL('http://localhost:5173/'),
		} as unknown as RequestEvent;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('handleAuth - Token Validation', () => {
		it('should set user in locals when valid access token exists', async () => {
			// Arrange
			const accessToken = 'valid-access-token';
			cookies.set('access_token', accessToken);

			const mockPayload = {
				sub: 'user-123',
				email: 'test@example.com',
				given_name: 'Test',
				family_name: 'User',
				venue_id: 'venue-456',
				realm_access: { roles: ['server', 'manager'] },
				exp: Math.floor(Date.now() / 1000) + 3600,
				iss: 'http://localhost:8080',
				aud: 'host-pos-web',
			};

			vi.mocked(AuthService.prototype.validateToken).mockResolvedValue(mockPayload);

			// Act
			await handleAuth({ event: mockEvent as RequestEvent, resolve: mockResolve });

			// Assert
			expect(AuthService.prototype.validateToken).toHaveBeenCalledWith(accessToken);
			expect(mockEvent.locals.user).toEqual({
				id: 'user-123',
				email: 'test@example.com',
				firstName: 'Test',
				lastName: 'User',
				venueId: 'venue-456',
				roles: ['server', 'manager'],
			});
		});

		it('should set user to null when no access token exists', async () => {
			// Arrange - no cookies set

			// Act
			await handleAuth({ event: mockEvent as RequestEvent, resolve: mockResolve });

			// Assert
			expect(mockEvent.locals.user).toBeNull();
			expect(AuthService.prototype.validateToken).not.toHaveBeenCalled();
		});

		it('should set user to null when token is invalid and no refresh token exists', async () => {
			// Arrange
			cookies.set('access_token', 'invalid-token');
			vi.mocked(AuthService.prototype.validateToken).mockRejectedValue(new Error('Invalid token'));

			// Act
			await handleAuth({ event: mockEvent as RequestEvent, resolve: mockResolve });

			// Assert
			expect(mockEvent.locals.user).toBeNull();
			expect(AuthService.prototype.refreshAccessToken).not.toHaveBeenCalled();
		});
	});

	describe('handleAuth - Token Refresh Logic', () => {
		it('should refresh token when access token is expired and refresh token exists', async () => {
			// Arrange
			cookies.set('access_token', 'expired-token');
			cookies.set('refresh_token', 'valid-refresh-token');

			vi.mocked(AuthService.prototype.validateToken)
				.mockRejectedValueOnce(new Error('Token expired')) // First call fails
				.mockResolvedValueOnce({
					// Second call succeeds with new token
					sub: 'user-123',
					email: 'refreshed@example.com',
					given_name: 'Refreshed',
					family_name: 'User',
					venue_id: 'venue-789',
					realm_access: { roles: ['admin'] },
					exp: Math.floor(Date.now() / 1000) + 3600,
					iss: 'http://localhost:8080',
					aud: 'host-pos-web',
				});

			vi.mocked(AuthService.prototype.refreshAccessToken).mockResolvedValue({
				access_token: 'new-access-token',
				refresh_token: 'new-refresh-token',
				expires_in: 300,
				token_type: 'Bearer',
			});

			// Act
			await handleAuth({ event: mockEvent as RequestEvent, resolve: mockResolve });

			// Assert
			expect(AuthService.prototype.refreshAccessToken).toHaveBeenCalledWith('valid-refresh-token');
			expect(AuthService.prototype.validateToken).toHaveBeenCalledTimes(2);
			expect(AuthService.prototype.validateToken).toHaveBeenNthCalledWith(2, 'new-access-token');
			expect(mockEvent.locals.user).toEqual({
				id: 'user-123',
				email: 'refreshed@example.com',
				firstName: 'Refreshed',
				lastName: 'User',
				venueId: 'venue-789',
				roles: ['admin'],
			});
		});

		it('should clear cookies when token refresh fails', async () => {
			// Arrange
			cookies.set('access_token', 'expired-token');
			cookies.set('refresh_token', 'invalid-refresh-token');

			vi.mocked(AuthService.prototype.validateToken).mockRejectedValue(new Error('Token expired'));
			vi.mocked(AuthService.prototype.refreshAccessToken).mockRejectedValue(
				new Error('Refresh token invalid')
			);

			// Act
			await handleAuth({ event: mockEvent as RequestEvent, resolve: mockResolve });

			// Assert
			expect(deleteCookieCalls).toEqual([
				{ name: 'access_token', options: { path: '/' } },
				{ name: 'refresh_token', options: { path: '/' } },
			]);
			expect(mockEvent.locals.user).toBeNull();
		});

		it('should set appropriate cookie expiration for access token', async () => {
			// Arrange
			cookies.set('access_token', 'expired-token');
			cookies.set('refresh_token', 'valid-refresh-token');

			vi.mocked(AuthService.prototype.validateToken)
				.mockRejectedValueOnce(new Error('Token expired'))
				.mockResolvedValueOnce({
					sub: 'user-123',
					email: 'test@example.com',
					exp: Math.floor(Date.now() / 1000) + 3600,
					iss: 'http://localhost:8080',
					aud: 'host-pos-web',
				});

			const expiresIn = 300; // 5 minutes
			vi.mocked(AuthService.prototype.refreshAccessToken).mockResolvedValue({
				access_token: 'new-access-token',
				expires_in: expiresIn,
				token_type: 'Bearer',
			});

			// Act
			await handleAuth({ event: mockEvent as RequestEvent, resolve: mockResolve });

			// Assert
			const accessTokenCall = setCookieCalls.find(call => call.name === 'access_token');
			expect(accessTokenCall).toBeDefined();
			expect(accessTokenCall?.options.maxAge).toBe(expiresIn);
		});

		it('should update refresh token cookie when new refresh token is provided', async () => {
			// Arrange
			cookies.set('access_token', 'expired-token');
			cookies.set('refresh_token', 'old-refresh-token');

			vi.mocked(AuthService.prototype.validateToken)
				.mockRejectedValueOnce(new Error('Token expired'))
				.mockResolvedValueOnce({
					sub: 'user-123',
					email: 'test@example.com',
					exp: Math.floor(Date.now() / 1000) + 3600,
					iss: 'http://localhost:8080',
					aud: 'host-pos-web',
				});

			vi.mocked(AuthService.prototype.refreshAccessToken).mockResolvedValue({
				access_token: 'new-access-token',
				refresh_token: 'new-refresh-token',
				expires_in: 300,
				token_type: 'Bearer',
			});

			// Act
			await handleAuth({ event: mockEvent as RequestEvent, resolve: mockResolve });

			// Assert
			const refreshTokenCall = setCookieCalls.find(call => call.name === 'refresh_token');
			expect(refreshTokenCall).toBeDefined();
			expect(refreshTokenCall?.value).toBe('new-refresh-token');
			expect(refreshTokenCall?.options.maxAge).toBe(30 * 24 * 60 * 60); // 30 days
		});
	});

	describe('handleAuth - Cookie Security', () => {
		it('should use secure cookie settings for access token', async () => {
			// Arrange
			cookies.set('access_token', 'expired-token');
			cookies.set('refresh_token', 'valid-refresh-token');

			vi.mocked(AuthService.prototype.validateToken)
				.mockRejectedValueOnce(new Error('Token expired'))
				.mockResolvedValueOnce({
					sub: 'user-123',
					email: 'test@example.com',
					exp: Math.floor(Date.now() / 1000) + 3600,
					iss: 'http://localhost:8080',
					aud: 'host-pos-web',
				});

			vi.mocked(AuthService.prototype.refreshAccessToken).mockResolvedValue({
				access_token: 'new-access-token',
				expires_in: 300,
				token_type: 'Bearer',
			});

			// Act
			await handleAuth({ event: mockEvent as RequestEvent, resolve: mockResolve });

			// Assert
			const accessTokenCall = setCookieCalls.find(call => call.name === 'access_token');
			expect(accessTokenCall?.options).toMatchObject({
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
			});
		});
	});

	describe('handleAuthorization - Protected Routes', () => {
		it('should redirect to login for unauthenticated users on protected routes', async () => {
			// Arrange
			mockEvent.url = new URL('http://localhost:5173/orders');
			mockEvent.locals.user = null;

			// Act
			const response = await handleAuthorization({
				event: mockEvent as RequestEvent,
				resolve: mockResolve,
			});

			// Assert
			expect(response.status).toBe(302);
			expect(response.headers.get('location')).toBe('/auth/login?redirect=%2Forders');
		});

		it('should allow access to protected route when user has required role', async () => {
			// Arrange
			mockEvent.url = new URL('http://localhost:5173/orders');
			mockEvent.locals.user = {
				id: 'user-123',
				email: 'server@example.com',
				firstName: 'Test',
				lastName: 'Server',
				venueId: 'venue-456',
				roles: ['server'],
			};

			// Act
			await handleAuthorization({ event: mockEvent as RequestEvent, resolve: mockResolve });

			// Assert
			expect(mockResolve).toHaveBeenCalled();
		});

		it('should redirect to unauthorized page for insufficient permissions', async () => {
			// Arrange
			mockEvent.url = new URL('http://localhost:5173/admin');
			mockEvent.locals.user = {
				id: 'user-123',
				email: 'server@example.com',
				firstName: 'Test',
				lastName: 'Server',
				venueId: 'venue-456',
				roles: ['server'], // Not admin
			};

			// Act
			const response = await handleAuthorization({
				event: mockEvent as RequestEvent,
				resolve: mockResolve,
			});

			// Assert
			expect(response.status).toBe(302);
			expect(response.headers.get('location')).toBe('/unauthorized');
		});

		it('should allow admin users to access manager routes', async () => {
			// Arrange
			mockEvent.url = new URL('http://localhost:5173/manager');
			mockEvent.locals.user = {
				id: 'user-123',
				email: 'admin@example.com',
				firstName: 'Test',
				lastName: 'Admin',
				venueId: 'venue-456',
				roles: ['admin'],
			};

			// Act
			await handleAuthorization({ event: mockEvent as RequestEvent, resolve: mockResolve });

			// Assert
			expect(mockResolve).toHaveBeenCalled();
		});

		it('should require admin or manager role for inventory route', async () => {
			// Arrange
			mockEvent.url = new URL('http://localhost:5173/inventory');
			mockEvent.locals.user = {
				id: 'user-123',
				email: 'server@example.com',
				firstName: 'Test',
				lastName: 'Server',
				venueId: 'venue-456',
				roles: ['server'], // Not admin or manager
			};

			// Act
			const response = await handleAuthorization({
				event: mockEvent as RequestEvent,
				resolve: mockResolve,
			});

			// Assert
			expect(response.status).toBe(302);
			expect(response.headers.get('location')).toBe('/unauthorized');
		});

		it('should allow access to unprotected routes without authentication', async () => {
			// Arrange
			mockEvent.url = new URL('http://localhost:5173/');
			mockEvent.locals.user = null;

			// Act
			await handleAuthorization({ event: mockEvent as RequestEvent, resolve: mockResolve });

			// Assert
			expect(mockResolve).toHaveBeenCalled();
		});
	});

	describe('handleAuth & handleAuthorization - Integration', () => {
		it('should authenticate user and authorize access to protected route', async () => {
			// Arrange
			const accessToken = 'valid-token';
			cookies.set('access_token', accessToken);
			mockEvent.url = new URL('http://localhost:5173/orders');

			vi.mocked(AuthService.prototype.validateToken).mockResolvedValue({
				sub: 'user-123',
				email: 'test@example.com',
				given_name: 'Test',
				family_name: 'User',
				venue_id: 'venue-456',
				realm_access: { roles: ['server'] },
				exp: Math.floor(Date.now() / 1000) + 3600,
				iss: 'http://localhost:8080',
				aud: 'host-pos-web',
			});

			// Act - Call hooks sequentially (simulating SvelteKit's sequence())
			await handleAuth({ event: mockEvent as RequestEvent, resolve: mockResolve });
			await handleAuthorization({ event: mockEvent as RequestEvent, resolve: mockResolve });

			// Assert - both hooks executed successfully
			expect(vi.mocked(AuthService.prototype.validateToken)).toHaveBeenCalled(); // handleAuth
			expect(mockEvent.locals.user).toBeDefined(); // handleAuth set user
			expect(mockResolve).toHaveBeenCalled(); // handleAuthorization allowed access
		});
	});
});
