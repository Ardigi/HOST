import { page } from '@vitest/browser/context';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import HomePage from './+page.svelte';

/**
 * Home Page (Dashboard) Tests
 * Tests the main dashboard page with quick actions and system status
 */
describe('Home Page (Dashboard)', () => {
	beforeEach(() => {
		// Mock Date for consistent time testing
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2025-01-15T14:30:00'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('Page Metadata', () => {
		it('should set correct page title', async () => {
			render(HomePage);

			// Check document title
			expect(document.title).toBe('HOST POS - Dashboard');
		});
	});

	describe('Welcome Section', () => {
		it('should display welcome message', async () => {
			render(HomePage);

			const heading = page.getByRole('heading', { name: /Welcome to HOST POS/i });
			await expect.element(heading).toBeInTheDocument();
		});

		it('should display subtitle', async () => {
			render(HomePage);

			const subtitle = page.getByText(/Modern Point of Sale System for Hospitality/i);
			await expect.element(subtitle).toBeInTheDocument();
		});

		it('should display current time that updates every second', async () => {
			render(HomePage);

			// Initial time should be displayed
			const initialTime = page.getByText(/2:30:00/);
			await expect.element(initialTime).toBeInTheDocument();

			// Advance time by 1 second
			vi.advanceTimersByTime(1000);
			await vi.waitFor(async () => {
				const updatedTime = page.getByText(/2:30:01/);
				await expect.element(updatedTime).toBeInTheDocument();
			});
		});
	});

	describe('Quick Actions', () => {
		it('should render Orders action card', async () => {
			render(HomePage);

			const ordersHeading = page.getByRole('heading', { name: 'Orders' });
			await expect.element(ordersHeading).toBeInTheDocument();

			const ordersLink = page.getByRole('link', { name: /Orders/i });
			await expect.element(ordersLink).toHaveAttribute('href', '/orders');
		});

		it('should render Menu action card', async () => {
			render(HomePage);

			const menuHeading = page.getByRole('heading', { name: 'Menu' });
			await expect.element(menuHeading).toBeInTheDocument();

			const menuLink = page.getByRole('link', { name: /Menu/i });
			await expect.element(menuLink).toHaveAttribute('href', '/menu');
		});

		it('should render Reports action card', async () => {
			render(HomePage);

			const reportsHeading = page.getByRole('heading', { name: 'Reports' });
			await expect.element(reportsHeading).toBeInTheDocument();

			const reportsLink = page.getByRole('link', { name: /Reports/i });
			await expect.element(reportsLink).toHaveAttribute('href', '/reports');
		});
	});

	describe('System Status', () => {
		it('should display development mode status', async () => {
			render(HomePage);

			const devModeHeading = page.getByRole('heading', { name: /Development Mode/i });
			await expect.element(devModeHeading).toBeInTheDocument();

			const activeStatus = page.getByText('Active');
			await expect.element(activeStatus).toBeInTheDocument();
		});

		it('should display project week status', async () => {
			render(HomePage);

			const weekHeading = page.getByRole('heading', { name: /Week 1/i });
			await expect.element(weekHeading).toBeInTheDocument();

			const phaseStatus = page.getByText(/Infrastructure Setup/i);
			await expect.element(phaseStatus).toBeInTheDocument();
		});
	});
});
