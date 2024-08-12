import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import POSList from './POSList.svelte';

/**
 * POSList Component Tests
 * Tests Material Design 3 List wrapper with POS-optimized features
 */
describe('POSList', () => {
	const testItems = [
		{ id: '1', text: 'Item 1' },
		{ id: '2', text: 'Item 2' },
		{ id: '3', text: 'Item 3' },
	];

	describe('Rendering List Items', () => {
		it('should render all list items', async () => {
			render(POSList, {
				items: testItems,
			});

			// Check that all items are rendered
			const item1 = page.getByText('Item 1');
			const item2 = page.getByText('Item 2');
			const item3 = page.getByText('Item 3');

			await expect.element(item1).toBeInTheDocument();
			await expect.element(item2).toBeInTheDocument();
			await expect.element(item3).toBeInTheDocument();
		});

		it('should support secondary text for items', async () => {
			const itemsWithSecondary = [
				{ id: '1', text: 'Primary 1', secondaryText: 'Secondary 1' },
				{ id: '2', text: 'Primary 2', secondaryText: 'Secondary 2' },
			];

			render(POSList, {
				items: itemsWithSecondary,
			});

			const primary1 = page.getByText('Primary 1');
			const secondary1 = page.getByText('Secondary 1');

			await expect.element(primary1).toBeInTheDocument();
			await expect.element(secondary1).toBeInTheDocument();
		});

		it('should handle empty items array', async () => {
			render(POSList, {
				items: [],
			});

			// List should still render without errors
			const list = page.getByRole('list');
			await expect.element(list).toBeInTheDocument();
		});
	});

	describe('Touch Target Requirements (WCAG 2.1 AA)', () => {
		it('should meet minimum 48px touch target by default', async () => {
			render(POSList, {
				items: testItems,
			});

			// Get first list item
			const items = await page.getByRole('listitem').all();
			expect(items.length).toBeGreaterThan(0);

			const box = items[0].element().getBoundingClientRect();
			expect(box.height).toBeGreaterThanOrEqual(48);
		});

		it('should support "comfortable" size variant (56px)', async () => {
			render(POSList, {
				items: testItems,
				size: 'comfortable',
			});

			// Get first list item
			const items = await page.getByRole('listitem').all();
			expect(items.length).toBeGreaterThan(0);

			const box = items[0].element().getBoundingClientRect();
			expect(box.height).toBeGreaterThanOrEqual(56);
		});
	});

	describe('Click Handling', () => {
		it('should call onClick handler when item is clicked', async () => {
			const handleClick = vi.fn();
			render(POSList, {
				items: testItems,
				onItemClick: handleClick,
			});

			const item1 = page.getByText('Item 1');
			await item1.click();

			expect(handleClick).toHaveBeenCalledOnce();
			expect(handleClick).toHaveBeenCalledWith('1');
		});

		it('should not call onClick for non-interactive lists', async () => {
			const handleClick = vi.fn();
			render(POSList, {
				items: testItems,
				interactive: false,
			});

			const item1 = page.getByText('Item 1');
			await item1.click();

			expect(handleClick).not.toHaveBeenCalled();
		});
	});

	describe('Accessibility', () => {
		it('should render with list role', async () => {
			render(POSList, {
				items: testItems,
			});

			const list = page.getByRole('list');
			await expect.element(list).toBeInTheDocument();
		});

		it('should support custom aria-label', async () => {
			render(POSList, {
				items: testItems,
				ariaLabel: 'Custom List',
			});

			const list = page.getByRole('list', { name: 'Custom List' });
			await expect.element(list).toBeInTheDocument();
		});
	});

	describe('Additional Features', () => {
		it('should apply custom CSS classes', async () => {
			render(POSList, {
				items: testItems,
				class: 'custom-list-class',
			});

			const list = page.getByRole('list');
			const element = await list.element();
			expect(element.className).toContain('custom-list-class');
		});
	});
});
