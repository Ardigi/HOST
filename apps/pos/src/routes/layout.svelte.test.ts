/**
 * Tests for App Layout Component
 * Browser tests for header, navigation, footer, and main content rendering
 */

import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LayoutTestWrapper from './test-wrappers/LayoutTestWrapper.svelte';

describe('App Layout', () => {
	describe('Header and Navigation', () => {
		it('should render header with HOST POS title', async () => {
			render(LayoutTestWrapper, {
				testContent: 'Content',
			});

			// Use getByRole to be more specific (avoid footer copyright text)
			const title = page.getByRole('link', { name: 'HOST POS' });
			await expect.element(title).toBeInTheDocument();
		});

		it('should render navigation links', async () => {
			render(LayoutTestWrapper, {
				testContent: 'Content',
			});

			const ordersLink = page.getByRole('link', { name: 'Orders' });
			await expect.element(ordersLink).toBeInTheDocument();

			const menuLink = page.getByRole('link', { name: 'Menu' });
			await expect.element(menuLink).toBeInTheDocument();

			const reportsLink = page.getByRole('link', { name: 'Reports' });
			await expect.element(reportsLink).toBeInTheDocument();
		});

		it('should have correct href attributes for navigation links', async () => {
			render(LayoutTestWrapper, {
				testContent: 'Content',
			});

			const ordersLink = page.getByRole('link', { name: 'Orders' });
			const ordersElement = await ordersLink.element();
			expect((ordersElement as HTMLAnchorElement).href).toContain('/orders');

			const menuLink = page.getByRole('link', { name: 'Menu' });
			const menuElement = await menuLink.element();
			expect((menuElement as HTMLAnchorElement).href).toContain('/menu');

			const reportsLink = page.getByRole('link', { name: 'Reports' });
			const reportsElement = await reportsLink.element();
			expect((reportsElement as HTMLAnchorElement).href).toContain('/reports');
		});

		it('should have HOME link for title', async () => {
			render(LayoutTestWrapper, {
				testContent: 'Content',
			});

			const homeLink = page.getByRole('link', { name: 'HOST POS' });
			await expect.element(homeLink).toBeInTheDocument();

			const element = await homeLink.element();
			expect((element as HTMLAnchorElement).href).toContain('/');
		});
	});

	describe('Main Content Area', () => {
		it('should render main content area', async () => {
			render(LayoutTestWrapper, {
				testContent: 'Content',
			});

			// Check main element exists (has implicit role="main")
			const main = page.getByRole('main');
			await expect.element(main).toBeInTheDocument();
		});

		it('should render children content in main area', async () => {
			render(LayoutTestWrapper, {
				testContent: 'Test Content Area',
			});

			// Verify children content actually renders
			const content = page.getByText('Test Content Area');
			await expect.element(content).toBeInTheDocument();

			// Verify it's inside the main element
			const main = page.getByRole('main');
			const mainElement = await main.element();
			expect(mainElement.textContent).toContain('Test Content Area');
		});

		it('should render complex children with multiple elements', async () => {
			render(LayoutTestWrapper, {
				testContent: 'Complex Content',
				showMultipleElements: true,
			});

			// Verify heading renders
			const heading = page.getByRole('heading', { name: 'Test Heading' });
			await expect.element(heading).toBeInTheDocument();

			// Verify paragraph renders
			const paragraph = page.getByText('Complex Content');
			await expect.element(paragraph).toBeInTheDocument();

			// Verify button renders
			const button = page.getByRole('button', { name: 'Test Button' });
			await expect.element(button).toBeInTheDocument();

			// Verify all are inside main element
			const main = page.getByRole('main');
			const mainElement = await main.element();
			expect(mainElement.querySelector('h2')).toBeTruthy();
			expect(mainElement.querySelector('p')).toBeTruthy();
			expect(mainElement.querySelector('button')).toBeTruthy();
		});
	});

	describe('Footer', () => {
		it('should render footer with copyright text', async () => {
			render(LayoutTestWrapper, {
				testContent: 'Content',
			});

			const copyright = page.getByText(/© 2025 HOST POS/);
			await expect.element(copyright).toBeInTheDocument();
		});

		it('should display full copyright message', async () => {
			render(LayoutTestWrapper, {
				testContent: 'Content',
			});

			const fullMessage = page.getByText('© 2025 HOST POS - Modern Point of Sale System');
			await expect.element(fullMessage).toBeInTheDocument();
		});
	});
});
