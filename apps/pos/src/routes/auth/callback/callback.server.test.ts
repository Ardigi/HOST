/**
 * Tests for OAuth Callback Handler
 * Critical auth path - validates OAuth flow, CSRF protection, token exchange
 */

import { AuthService } from '@host/shared';
import { error, redirect } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { load } from './+page.server';

// Mock @host/shared
vi.mock('@host/shared', () => ({
	AuthService: vi.fn(),
}));

// Mock @sveltejs/kit
vi.mock('@sveltejs/kit', () => ({
	error: vi.fn((status, body) => {
		const err = new Error(body.message) as Error & { status: number; body: typeof body };
		err.status = status;
		err.body = body;
		return err;
	}),
	redirect: vi.fn((status, location) => {
		const err = new Error('Redirect') as Error & { status: number; location: string };
		err.status = status;
		err.location = location;
		throw err;
	}),
}));

describe('OAuth Callback Handler', () => {
	const mockExchangeCodeForTokens = vi.fn();
	const mockAuthService = {
		exchangeCodeForTokens: mockExchangeCodeForTokens,
	};

	const mockCookies = {
		get: vi.fn(),
		set: vi.fn(),
		delete: vi.fn(),
	};

	const createMockUrl = (params: Record<string, string>) => {
		const searchParams = new URLSearchParams(params);
		return {
			searchParams,
			origin: 'http://localhost:5173',
		} as URL;
	};

	const createMockEvent = (urlParams: Record<string, string>) => ({
		url: createMockUrl(urlParams),
		cookies: mockCookies,
	});

	beforeEach(() => {
		vi.clearAllMocks();
		// @ts-expect-error - mocking constructor
		AuthService.mockImplementation(() => mockAuthService);
	});

	describe('OAuth error handling', () => {
		it('should throw error when OAuth error parameter is present', async () => {
			const event = createMockEvent({
				error: 'access_denied',
				error_description: 'User denied access',
			});

			// biome-ignore lint/suspicious/noExplicitAny: Test mock object with minimal properties
			// biome-ignore lint/suspicious/noExplicitAny: Test mock object with minimal properties
			await expect(load(event as any)).rejects.toThrow('Authentication failed: User denied access');
			expect(error).toHaveBeenCalledWith(400, {
				message: 'Authentication failed: User denied access',
			});
		});

		it('should throw error when OAuth error without description', async () => {
			const event = createMockEvent({
				error: 'server_error',
			});

			// biome-ignore lint/suspicious/noExplicitAny: Test mock object with minimal properties
			// biome-ignore lint/suspicious/noExplicitAny: Test mock object with minimal properties
			await expect(load(event as any)).rejects.toThrow('Authentication failed: server_error');
			expect(error).toHaveBeenCalledWith(400, {
				message: 'Authentication failed: server_error',
			});
		});
	});

	describe('Parameter validation', () => {
		it('should throw error when code is missing', async () => {
			const event = createMockEvent({
				state: 'valid_state',
			});

			// biome-ignore lint/suspicious/noExplicitAny: Test mock object with minimal properties
			await expect(load(event as any)).rejects.toThrow('Missing authorization code or state');
			expect(error).toHaveBeenCalledWith(400, {
				message: 'Missing authorization code or state',
			});
		});

		it('should throw error when state is missing', async () => {
			const event = createMockEvent({
				code: 'auth_code_123',
			});

			// biome-ignore lint/suspicious/noExplicitAny: Test mock object with minimal properties
			await expect(load(event as any)).rejects.toThrow('Missing authorization code or state');
			expect(error).toHaveBeenCalledWith(400, {
				message: 'Missing authorization code or state',
			});
		});

		it('should throw error when both code and state are missing', async () => {
			const event = createMockEvent({});

			// biome-ignore lint/suspicious/noExplicitAny: Test mock object with minimal properties
			await expect(load(event as any)).rejects.toThrow('Missing authorization code or state');
			expect(error).toHaveBeenCalledWith(400, {
				message: 'Missing authorization code or state',
			});
		});
	});

	describe('CSRF state validation', () => {
		it('should throw error when stored state is missing', async () => {
			const event = createMockEvent({
				code: 'auth_code_123',
				state: 'state_abc',
			});

			mockCookies.get.mockReturnValue(undefined);

			// biome-ignore lint/suspicious/noExplicitAny: Test mock object with minimal properties
			await expect(load(event as any)).rejects.toThrow('Invalid state parameter');
			expect(error).toHaveBeenCalledWith(400, {
				message: 'Invalid state parameter',
			});
		});

		it('should throw error when state does not match', async () => {
			const event = createMockEvent({
				code: 'auth_code_123',
				state: 'state_abc',
			});

			mockCookies.get.mockReturnValue('different_state');

			// biome-ignore lint/suspicious/noExplicitAny: Test mock object with minimal properties
			await expect(load(event as any)).rejects.toThrow('Invalid state parameter');
			expect(error).toHaveBeenCalledWith(400, {
				message: 'Invalid state parameter',
			});
		});

		it('should proceed when state matches', async () => {
			const event = createMockEvent({
				code: 'auth_code_123',
				state: 'state_abc',
			});

			mockCookies.get.mockImplementation((name: string) => {
				if (name === 'oauth_state') return 'state_abc';
				if (name === 'oauth_code_verifier') return 'verifier_xyz';
				return undefined;
			});

			mockExchangeCodeForTokens.mockResolvedValue({
				access_token: 'access_123',
				expires_in: 3600,
			});

			// biome-ignore lint/suspicious/noExplicitAny: Test mock object with minimal properties
			await expect(load(event as any)).rejects.toThrow('Redirect');
		});
	});

	describe('Code verifier validation', () => {
		it('should throw error when code verifier is missing', async () => {
			const event = createMockEvent({
				code: 'auth_code_123',
				state: 'state_abc',
			});

			mockCookies.get.mockImplementation((name: string) => {
				if (name === 'oauth_state') return 'state_abc';
				return undefined;
			});

			// biome-ignore lint/suspicious/noExplicitAny: Test mock object with minimal properties
			await expect(load(event as any)).rejects.toThrow('Missing code verifier');
			expect(error).toHaveBeenCalledWith(400, {
				message: 'Missing code verifier',
			});
		});
	});

	describe('Token exchange', () => {
		it('should exchange code for tokens successfully', async () => {
			const event = createMockEvent({
				code: 'auth_code_123',
				state: 'state_abc',
			});

			mockCookies.get.mockImplementation((name: string) => {
				if (name === 'oauth_state') return 'state_abc';
				if (name === 'oauth_code_verifier') return 'verifier_xyz';
				return undefined;
			});

			mockExchangeCodeForTokens.mockResolvedValue({
				access_token: 'access_123',
				expires_in: 3600,
			});

			// biome-ignore lint/suspicious/noExplicitAny: Test mock object with minimal properties
			await expect(load(event as any)).rejects.toThrow('Redirect');

			expect(mockExchangeCodeForTokens).toHaveBeenCalledWith(
				'auth_code_123',
				'http://localhost:5173/auth/callback',
				'verifier_xyz'
			);
		});

		it('should set access token cookie with correct options', async () => {
			const event = createMockEvent({
				code: 'auth_code_123',
				state: 'state_abc',
			});

			mockCookies.get.mockImplementation((name: string) => {
				if (name === 'oauth_state') return 'state_abc';
				if (name === 'oauth_code_verifier') return 'verifier_xyz';
				return undefined;
			});

			mockExchangeCodeForTokens.mockResolvedValue({
				access_token: 'access_123',
				expires_in: 3600,
			});

			// biome-ignore lint/suspicious/noExplicitAny: Test mock object with minimal properties
			await expect(load(event as any)).rejects.toThrow('Redirect');

			expect(mockCookies.set).toHaveBeenCalledWith('access_token', 'access_123', {
				path: '/',
				httpOnly: true,
				secure: false, // in test env, PROD is false
				sameSite: 'lax',
				maxAge: 3600,
			});
		});

		it('should set refresh token cookie when provided', async () => {
			const event = createMockEvent({
				code: 'auth_code_123',
				state: 'state_abc',
			});

			mockCookies.get.mockImplementation((name: string) => {
				if (name === 'oauth_state') return 'state_abc';
				if (name === 'oauth_code_verifier') return 'verifier_xyz';
				return undefined;
			});

			mockExchangeCodeForTokens.mockResolvedValue({
				access_token: 'access_123',
				expires_in: 3600,
				refresh_token: 'refresh_456',
			});

			// biome-ignore lint/suspicious/noExplicitAny: Test mock object with minimal properties
			await expect(load(event as any)).rejects.toThrow('Redirect');

			expect(mockCookies.set).toHaveBeenCalledWith('refresh_token', 'refresh_456', {
				path: '/',
				httpOnly: true,
				secure: false,
				sameSite: 'lax',
				maxAge: 30 * 24 * 60 * 60, // 30 days
			});
		});

		it('should not set refresh token cookie when not provided', async () => {
			const event = createMockEvent({
				code: 'auth_code_123',
				state: 'state_abc',
			});

			mockCookies.get.mockImplementation((name: string) => {
				if (name === 'oauth_state') return 'state_abc';
				if (name === 'oauth_code_verifier') return 'verifier_xyz';
				return undefined;
			});

			mockExchangeCodeForTokens.mockResolvedValue({
				access_token: 'access_123',
				expires_in: 3600,
			});

			// biome-ignore lint/suspicious/noExplicitAny: Test mock object with minimal properties
			await expect(load(event as any)).rejects.toThrow('Redirect');

			const refreshTokenCalls = mockCookies.set.mock.calls.filter(
				call => call[0] === 'refresh_token'
			);
			expect(refreshTokenCalls).toHaveLength(0);
		});
	});

	describe('Temporary cookie cleanup', () => {
		it('should delete temporary cookies after successful token exchange', async () => {
			const event = createMockEvent({
				code: 'auth_code_123',
				state: 'state_abc',
			});

			mockCookies.get.mockImplementation((name: string) => {
				if (name === 'oauth_state') return 'state_abc';
				if (name === 'oauth_code_verifier') return 'verifier_xyz';
				return undefined;
			});

			mockExchangeCodeForTokens.mockResolvedValue({
				access_token: 'access_123',
				expires_in: 3600,
			});

			// biome-ignore lint/suspicious/noExplicitAny: Test mock object with minimal properties
			await expect(load(event as any)).rejects.toThrow('Redirect');

			expect(mockCookies.delete).toHaveBeenCalledWith('oauth_code_verifier', { path: '/' });
			expect(mockCookies.delete).toHaveBeenCalledWith('oauth_state', { path: '/' });
		});
	});

	describe('Post-login redirect', () => {
		it('should redirect to home when no redirect URL is stored', async () => {
			const event = createMockEvent({
				code: 'auth_code_123',
				state: 'state_abc',
			});

			mockCookies.get.mockImplementation((name: string) => {
				if (name === 'oauth_state') return 'state_abc';
				if (name === 'oauth_code_verifier') return 'verifier_xyz';
				return undefined;
			});

			mockExchangeCodeForTokens.mockResolvedValue({
				access_token: 'access_123',
				expires_in: 3600,
			});

			// biome-ignore lint/suspicious/noExplicitAny: Test mock object with minimal properties
			await expect(load(event as any)).rejects.toThrow('Redirect');

			expect(redirect).toHaveBeenCalledWith(302, '/');
		});

		it('should redirect to stored post-login URL', async () => {
			const event = createMockEvent({
				code: 'auth_code_123',
				state: 'state_abc',
			});

			mockCookies.get.mockImplementation((name: string) => {
				if (name === 'oauth_state') return 'state_abc';
				if (name === 'oauth_code_verifier') return 'verifier_xyz';
				if (name === 'post_login_redirect') return '/orders';
				return undefined;
			});

			mockExchangeCodeForTokens.mockResolvedValue({
				access_token: 'access_123',
				expires_in: 3600,
			});

			// biome-ignore lint/suspicious/noExplicitAny: Test mock object with minimal properties
			await expect(load(event as any)).rejects.toThrow('Redirect');

			expect(redirect).toHaveBeenCalledWith(302, '/orders');
		});

		it('should delete post-login redirect cookie after use', async () => {
			const event = createMockEvent({
				code: 'auth_code_123',
				state: 'state_abc',
			});

			mockCookies.get.mockImplementation((name: string) => {
				if (name === 'oauth_state') return 'state_abc';
				if (name === 'oauth_code_verifier') return 'verifier_xyz';
				if (name === 'post_login_redirect') return '/orders';
				return undefined;
			});

			mockExchangeCodeForTokens.mockResolvedValue({
				access_token: 'access_123',
				expires_in: 3600,
			});

			// biome-ignore lint/suspicious/noExplicitAny: Test mock object with minimal properties
			await expect(load(event as any)).rejects.toThrow('Redirect');

			expect(mockCookies.delete).toHaveBeenCalledWith('post_login_redirect', { path: '/' });
		});
	});

	describe('Error handling', () => {
		it('should throw 500 error when token exchange fails', async () => {
			const event = createMockEvent({
				code: 'auth_code_123',
				state: 'state_abc',
			});

			mockCookies.get.mockImplementation((name: string) => {
				if (name === 'oauth_state') return 'state_abc';
				if (name === 'oauth_code_verifier') return 'verifier_xyz';
				return undefined;
			});

			mockExchangeCodeForTokens.mockRejectedValue(new Error('Token exchange failed'));

			// biome-ignore lint/suspicious/noExplicitAny: Test mock object with minimal properties
			await expect(load(event as any)).rejects.toThrow('Token exchange failed');

			expect(error).toHaveBeenCalledWith(500, {
				message: 'Token exchange failed',
			});
		});

		it('should handle non-Error exceptions in token exchange', async () => {
			const event = createMockEvent({
				code: 'auth_code_123',
				state: 'state_abc',
			});

			mockCookies.get.mockImplementation((name: string) => {
				if (name === 'oauth_state') return 'state_abc';
				if (name === 'oauth_code_verifier') return 'verifier_xyz';
				return undefined;
			});

			mockExchangeCodeForTokens.mockRejectedValue('String error');

			// biome-ignore lint/suspicious/noExplicitAny: Test mock object with minimal properties
			await expect(load(event as any)).rejects.toThrow();

			expect(error).toHaveBeenCalledWith(500, {
				message: 'Failed to exchange authorization code',
			});
		});

		it('should re-throw SvelteKit redirects without converting to errors', async () => {
			const event = createMockEvent({
				code: 'auth_code_123',
				state: 'state_abc',
			});

			mockCookies.get.mockImplementation((name: string) => {
				if (name === 'oauth_state') return 'state_abc';
				if (name === 'oauth_code_verifier') return 'verifier_xyz';
				return undefined;
			});

			mockExchangeCodeForTokens.mockResolvedValue({
				access_token: 'access_123',
				expires_in: 3600,
			});

			try {
				// biome-ignore lint/suspicious/noExplicitAny: Test mock object with minimal properties
				await load(event as any);
			} catch (err) {
				// Should be redirect, not error
				expect(err).toHaveProperty('status', 302);
				expect(err).toHaveProperty('location', '/');
			}
		});
	});
});
