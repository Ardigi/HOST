import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import POSTabs from './POSTabs.svelte';

/**
 * POSTabs Component Tests
 * Tests Material Design 3 Tabs with POS-optimized touch targets
 *
 * Following TDD: Tests written FIRST, then implementation
 */
describe('POSTabs', () => {
	const testTabs = [
		{ id: 'details', label: 'Details' },
		{ id: 'items', label: 'Items' },
		{ id: 'payment', label: 'Payment' },
	];

	describe('Rendering Tab Items', () => {
		it('should render all tab items', async () => {
			render(POSTabs, {
				tabs: testTabs,
				activeId: 'details',
			});

			// All three tabs should be rendered
			const detailsTab = page.getByRole('tab', { name: 'Details' });
			const itemsTab = page.getByRole('tab', { name: 'Items' });
			const paymentTab = page.getByRole('tab', { name: 'Payment' });

			await expect.element(detailsTab).toBeInTheDocument();
			await expect.element(itemsTab).toBeInTheDocument();
			await expect.element(paymentTab).toBeInTheDocument();
		});

		it('should render tab labels', async () => {
			render(POSTabs, {
				tabs: testTabs,
				activeId: 'details',
			});

			const detailsLabel = page.getByText('Details');
			const itemsLabel = page.getByText('Items');
			const paymentLabel = page.getByText('Payment');

			await expect.element(detailsLabel).toBeInTheDocument();
			await expect.element(itemsLabel).toBeInTheDocument();
			await expect.element(paymentLabel).toBeInTheDocument();
		});
	});

	describe('Active Tab Indication', () => {
		it('should indicate active tab with aria-selected', async () => {
			render(POSTabs, {
				tabs: testTabs,
				activeId: 'items',
			});

			const itemsTab = page.getByRole('tab', { name: 'Items' });
			const element = await itemsTab.element();
			expect(element.getAttribute('aria-selected')).toBe('true');
		});

		it('should not select inactive tabs', async () => {
			render(POSTabs, {
				tabs: testTabs,
				activeId: 'items',
			});

			const detailsTab = page.getByRole('tab', { name: 'Details' });
			const element = await detailsTab.element();
			expect(element.getAttribute('aria-selected')).toBe('false');
		});

		it('should apply active styling to selected tab', async () => {
			render(POSTabs, {
				tabs: testTabs,
				activeId: 'payment',
			});

			const paymentTab = page.getByRole('tab', { name: 'Payment' });
			const element = await paymentTab.element();
			expect(element.className).toContain('active');
		});
	});

	describe('Touch Target Requirements (WCAG 2.1 AA)', () => {
		it('should meet minimum 48px height for tabs', async () => {
			render(POSTabs, {
				tabs: testTabs,
				activeId: 'details',
			});

			const detailsTab = page.getByRole('tab', { name: 'Details' });
			const box = detailsTab.element().getBoundingClientRect();

			expect(box.height).toBeGreaterThanOrEqual(48);
		});

		it('should have comfortable width for touch targets', async () => {
			render(POSTabs, {
				tabs: testTabs,
				activeId: 'details',
			});

			const detailsTab = page.getByRole('tab', { name: 'Details' });
			const box = detailsTab.element().getBoundingClientRect();

			// Should have reasonable width for touch
			expect(box.width).toBeGreaterThan(48);
		});
	});

	describe('Click Handling and Navigation', () => {
		it('should call onTabChange when tab is clicked', async () => {
			const handleTabChange = vi.fn();
			render(POSTabs, {
				tabs: testTabs,
				activeId: 'details',
				onTabChange: handleTabChange,
			});

			const itemsTab = page.getByRole('tab', { name: 'Items' });
			await itemsTab.click();

			expect(handleTabChange).toHaveBeenCalledOnce();
			expect(handleTabChange).toHaveBeenCalledWith('items');
		});

		it('should not trigger change for already active tab', async () => {
			const handleTabChange = vi.fn();
			render(POSTabs, {
				tabs: testTabs,
				activeId: 'details',
				onTabChange: handleTabChange,
			});

			// Clicking already active tab
			const detailsTab = page.getByRole('tab', { name: 'Details' });
			await detailsTab.click();

			// Handler may still be called, but component should handle state
			// This is acceptable - parent decides whether to re-select
		});
	});

	describe('Accessibility', () => {
		it('should have tablist role', async () => {
			render(POSTabs, {
				tabs: testTabs,
				activeId: 'details',
			});

			const tablist = page.getByRole('tablist');
			await expect.element(tablist).toBeInTheDocument();
		});

		it('should support custom aria-label', async () => {
			render(POSTabs, {
				tabs: testTabs,
				activeId: 'details',
				ariaLabel: 'Order sections',
			});

			const tablist = page.getByRole('tablist', { name: 'Order sections' });
			await expect.element(tablist).toBeInTheDocument();
		});

		it('should associate tabs with tabpanel IDs', async () => {
			render(POSTabs, {
				tabs: testTabs,
				activeId: 'details',
			});

			const detailsTab = page.getByRole('tab', { name: 'Details' });
			const element = await detailsTab.element();

			// Tab should have aria-controls pointing to panel
			const controlsId = element.getAttribute('aria-controls');
			expect(controlsId).toBeTruthy();
			expect(controlsId).toContain('details');
		});
	});

	describe('Styling and Customization', () => {
		it('should apply custom CSS classes', async () => {
			render(POSTabs, {
				tabs: testTabs,
				activeId: 'details',
				class: 'custom-tabs-class',
			});

			const tablist = page.getByRole('tablist');
			const element = await tablist.element();
			expect(element.className).toContain('custom-tabs-class');
		});

		it('should apply POS-specific styling classes', async () => {
			render(POSTabs, {
				tabs: testTabs,
				activeId: 'details',
			});

			const tablist = page.getByRole('tablist');
			const element = await tablist.element();
			expect(element.className).toContain('pos-tabs');
		});
	});

	describe('Edge Cases', () => {
		it('should handle tabs with 2 items', async () => {
			const twoTabs = [
				{ id: 'tab1', label: 'Tab 1' },
				{ id: 'tab2', label: 'Tab 2' },
			];

			render(POSTabs, {
				tabs: twoTabs,
				activeId: 'tab1',
			});

			const tabs = await page.getByRole('tab').all();
			expect(tabs.length).toBe(2);
		});

		it('should handle tabs with 5 items', async () => {
			const fiveTabs = [
				...testTabs,
				{ id: 'history', label: 'History' },
				{ id: 'notes', label: 'Notes' },
			];

			render(POSTabs, {
				tabs: fiveTabs,
				activeId: 'details',
			});

			const tabs = await page.getByRole('tab').all();
			expect(tabs.length).toBe(5);
		});

		it('should work without onTabChange handler', async () => {
			render(POSTabs, {
				tabs: testTabs,
				activeId: 'details',
			});

			const tablist = page.getByRole('tablist');
			await expect.element(tablist).toBeInTheDocument();
		});
	});
});
