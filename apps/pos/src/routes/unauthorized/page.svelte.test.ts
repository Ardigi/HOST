/**
 * Tests for Unauthorized Page
 * Browser tests for access denied page rendering and user information display
 */

import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import UnauthorizedPage from './+page.svelte';

describe('Unauthorized Page', () => {
	describe('Basic Content', () => {
		it('should render access denied heading', async () => {
			render(UnauthorizedPage, {
				data: { user: null },
			});

			const heading = page.getByRole('heading', { name: 'Access Denied' });
			await expect.element(heading).toBeInTheDocument();
		});

		it('should display permission message', async () => {
			render(UnauthorizedPage, {
				data: { user: null },
			});

			const message = page.getByText("You don't have permission to access this page.");
			await expect.element(message).toBeInTheDocument();
		});

		it('should show required roles hint', async () => {
			render(UnauthorizedPage, {
				data: { user: null },
			});

			const hint = page.getByText('Required roles: admin, manager, or server');
			await expect.element(hint).toBeInTheDocument();
		});
	});

	describe('Navigation Actions', () => {
		it('should render Go to Home button with correct href', async () => {
			render(UnauthorizedPage, {
				data: { user: null },
			});

			const homeButton = page.getByRole('link', { name: 'Go to Home' });
			await expect.element(homeButton).toBeInTheDocument();

			const element = await homeButton.element();
			expect((element as HTMLAnchorElement).href).toContain('/');
		});

		it('should render Logout button with correct href', async () => {
			render(UnauthorizedPage, {
				data: { user: null },
			});

			const logoutButton = page.getByRole('link', { name: 'Logout' });
			await expect.element(logoutButton).toBeInTheDocument();

			const element = await logoutButton.element();
			expect((element as HTMLAnchorElement).href).toContain('/auth/logout');
		});
	});

	describe('User Information Display', () => {
		it('should not display user info section when no user data exists', async () => {
			render(UnauthorizedPage, {
				data: { user: null },
			});

			// User info section should not be present
			const userInfo = page.getByText('Current user:');
			await expect.element(userInfo).not.toBeInTheDocument();
		});

		it('should display user email when user data exists', async () => {
			render(UnauthorizedPage, {
				data: {
					user: {
						id: 'user_123',
						email: 'test@example.com',
						firstName: 'Test',
						lastName: 'User',
						venueId: 'venue_123',
						roles: ['viewer'],
					},
				},
			});

			// User email should be displayed
			const userEmail = page.getByText('Current user: test@example.com');
			await expect.element(userEmail).toBeInTheDocument();
		});

		it('should display user roles when user data exists', async () => {
			render(UnauthorizedPage, {
				data: {
					user: {
						id: 'user_456',
						email: 'staff@example.com',
						firstName: 'Staff',
						lastName: 'Member',
						venueId: 'venue_123',
						roles: ['viewer', 'cashier'],
					},
				},
			});

			// User roles should be displayed
			const userRoles = page.getByText('Your roles: viewer, cashier');
			await expect.element(userRoles).toBeInTheDocument();
		});

		it('should display single role correctly', async () => {
			render(UnauthorizedPage, {
				data: {
					user: {
						id: 'user_789',
						email: 'user@example.com',
						firstName: 'Guest',
						lastName: 'User',
						venueId: 'venue_123',
						roles: ['guest'],
					},
				},
			});

			// Single role should be displayed
			const userRoles = page.getByText('Your roles: guest');
			await expect.element(userRoles).toBeInTheDocument();
		});
	});
});
