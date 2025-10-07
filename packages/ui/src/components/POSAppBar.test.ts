import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import POSAppBar from './POSAppBar.svelte';

/**
 * POSAppBar Component Tests
 * Tests Material Design 3 Top App Bar with POS-optimized features
 *
 * Following TDD: Tests written FIRST, then implementation
 */
describe('POSAppBar', () => {
	describe('Rendering and Content', () => {
		it('should render app bar with title', async () => {
			render(POSAppBar, {
				title: 'HOST POS',
			});

			const title = page.getByText('HOST POS');
			await expect.element(title).toBeInTheDocument();
		});

		it('should render navigation icon button', async () => {
			const handleNavClick = vi.fn();
			render(POSAppBar, {
				title: 'Orders',
				onNavigationClick: handleNavClick,
			});

			// Should have a navigation button (menu icon)
			const navButton = page.getByRole('button', { name: /menu/i });
			await expect.element(navButton).toBeInTheDocument();
		});

		it('should call onNavigationClick when menu button is clicked', async () => {
			const handleNavClick = vi.fn();
			render(POSAppBar, {
				title: 'Orders',
				onNavigationClick: handleNavClick,
			});

			const navButton = page.getByRole('button', { name: /menu/i });
			await navButton.click();

			expect(handleNavClick).toHaveBeenCalledOnce();
		});

		it('should render user info when provided', async () => {
			render(POSAppBar, {
				title: 'Orders',
				user: {
					name: 'John Doe',
					email: 'john@example.com',
				},
			});

			// User name should be visible
			const userName = page.getByText('John Doe');
			await expect.element(userName).toBeInTheDocument();
		});

		it('should render without user info', async () => {
			render(POSAppBar, {
				title: 'Orders',
			});

			// Should still render without errors
			const title = page.getByText('Orders');
			await expect.element(title).toBeInTheDocument();
		});
	});

	describe('Touch Target Requirements (WCAG 2.1 AA)', () => {
		it('should meet minimum 56px height for comfortable POS use', async () => {
			render(POSAppBar, {
				title: 'Orders',
			});

			// AppBar should have banner role or toolbar role
			const appBar = page.getByRole('banner');
			await expect.element(appBar).toBeInTheDocument();

			const box = appBar.element().getBoundingClientRect();
			expect(box.height).toBeGreaterThanOrEqual(56);
		});

		it('should have touch-friendly navigation button (48px minimum)', async () => {
			const handleNavClick = vi.fn();
			render(POSAppBar, {
				title: 'Orders',
				onNavigationClick: handleNavClick,
			});

			const navButton = page.getByRole('button', { name: /menu/i });
			const box = navButton.element().getBoundingClientRect();

			// Minimum touch target 48px
			expect(box.width).toBeGreaterThanOrEqual(48);
			expect(box.height).toBeGreaterThanOrEqual(48);
		});
	});

	describe('Accessibility', () => {
		it('should have banner landmark role', async () => {
			render(POSAppBar, {
				title: 'Orders',
			});

			const appBar = page.getByRole('banner');
			await expect.element(appBar).toBeInTheDocument();
		});

		it('should have accessible navigation button label', async () => {
			const handleNavClick = vi.fn();
			render(POSAppBar, {
				title: 'Orders',
				onNavigationClick: handleNavClick,
			});

			// Button should have accessible label
			const navButton = page.getByRole('button', { name: /menu/i });
			await expect.element(navButton).toBeInTheDocument();
		});

		it('should support custom aria-label', async () => {
			render(POSAppBar, {
				title: 'Orders',
				ariaLabel: 'Main navigation bar',
			});

			const appBar = page.getByRole('banner', { name: 'Main navigation bar' });
			await expect.element(appBar).toBeInTheDocument();
		});
	});

	describe('User Menu Functionality', () => {
		it('should display user menu button when user is provided', async () => {
			render(POSAppBar, {
				title: 'Orders',
				user: {
					name: 'Jane Smith',
					email: 'jane@example.com',
				},
			});

			// Should have a button with user's name or email
			const userButton = page.getByRole('button', { name: /Jane Smith/i });
			await expect.element(userButton).toBeInTheDocument();
		});

		it('should call onLogout when logout is clicked', async () => {
			const handleLogout = vi.fn();
			render(POSAppBar, {
				title: 'Orders',
				user: {
					name: 'Jane Smith',
					email: 'jane@example.com',
				},
				onLogout: handleLogout,
			});

			// Open user menu
			const userButton = page.getByRole('button', { name: /Jane Smith/i });
			await userButton.click();

			// Wait for menu to appear and click logout
			const logoutButton = page.getByRole('button', { name: /logout/i });
			await logoutButton.click();

			expect(handleLogout).toHaveBeenCalledOnce();
		});
	});

	describe('Styling and Customization', () => {
		it('should apply custom CSS classes', async () => {
			render(POSAppBar, {
				title: 'Orders',
				class: 'custom-appbar-class',
			});

			const appBar = page.getByRole('banner');
			const element = await appBar.element();
			expect(element.className).toContain('custom-appbar-class');
		});

		it('should apply POS-specific styling classes', async () => {
			render(POSAppBar, {
				title: 'Orders',
			});

			const appBar = page.getByRole('banner');
			const element = await appBar.element();
			expect(element.className).toContain('pos-appbar');
		});
	});

	describe('Edge Cases', () => {
		it('should handle long titles gracefully', async () => {
			const longTitle = 'This is a very long title that might overflow the app bar';
			render(POSAppBar, {
				title: longTitle,
			});

			const title = page.getByText(longTitle);
			await expect.element(title).toBeInTheDocument();

			// Title should not cause layout issues
			const element = await title.element();
			const box = element.getBoundingClientRect();
			expect(box.width).toBeGreaterThan(0);
		});

		it('should work without navigation click handler', async () => {
			// Should render without onNavigationClick
			render(POSAppBar, {
				title: 'Orders',
			});

			const title = page.getByText('Orders');
			await expect.element(title).toBeInTheDocument();
		});

		it('should work without logout handler', async () => {
			// Should render user menu without onLogout handler
			render(POSAppBar, {
				title: 'Orders',
				user: {
					name: 'Test User',
					email: 'test@example.com',
				},
			});

			const userName = page.getByText('Test User');
			await expect.element(userName).toBeInTheDocument();
		});
	});

	describe('Responsive Behavior', () => {
		it('should maintain touch targets on narrow viewports', async () => {
			render(POSAppBar, {
				title: 'Orders',
				onNavigationClick: vi.fn(),
			});

			const navButton = page.getByRole('button', { name: /menu/i });
			const box = navButton.element().getBoundingClientRect();

			// Touch targets should still be 48px+ even on mobile
			expect(box.width).toBeGreaterThanOrEqual(48);
			expect(box.height).toBeGreaterThanOrEqual(48);
		});
	});
});
