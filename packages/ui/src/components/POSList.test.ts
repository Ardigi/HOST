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

	describe('Interactive vs Non-Interactive Rendering', () => {
		it('should render interactive items as buttons', async () => {
			render(POSList, {
				items: testItems,
				interactive: true,
			});

			// Interactive items should be rendered as buttons
			const buttons = await page.getByRole('button').all();
			expect(buttons.length).toBe(3); // 3 items = 3 buttons
		});

		it('should render non-interactive items without buttons', async () => {
			render(POSList, {
				items: testItems,
				interactive: false,
			});

			// Non-interactive items should not have buttons
			const buttons = await page.getByRole('button').all();
			expect(buttons.length).toBe(0);
		});
	});

	describe('Edge Cases', () => {
		it('should handle items with unique IDs but same text', async () => {
			const duplicateTextItems = [
				{ id: '1', text: 'Same Text' },
				{ id: '2', text: 'Same Text' },
				{ id: '3', text: 'Same Text' },
			];

			const handleClick = vi.fn();
			render(POSList, {
				items: duplicateTextItems,
				onItemClick: handleClick,
			});

			// All three items should be rendered
			const items = await page.getByRole('listitem').all();
			expect(items.length).toBe(3);

			// Clicking each should call handler with correct ID
			const allTextElements = await page.getByText('Same Text').all();
			await allTextElements[0].click();
			expect(handleClick).toHaveBeenCalledWith('1');

			await allTextElements[1].click();
			expect(handleClick).toHaveBeenCalledWith('2');
		});

		it('should apply correct size classes', async () => {
			render(POSList, {
				items: testItems,
				size: 'standard',
			});

			const list = page.getByRole('list');
			const element = await list.element();
			expect(element.className).toContain('pos-list-standard');
		});

		it('should apply comfortable size class', async () => {
			render(POSList, {
				items: testItems,
				size: 'comfortable',
			});

			const list = page.getByRole('list');
			const element = await list.element();
			expect(element.className).toContain('pos-list-comfortable');
		});

		it('should work without onItemClick callback', async () => {
			// Should not throw error when clicking without callback
			render(POSList, {
				items: testItems,
				interactive: true,
				// No onItemClick callback
			});

			const item1 = page.getByText('Item 1');
			// Should not throw
			await item1.click();
		});
	});

	describe('Keyboard Navigation', () => {
		it('should focus interactive items with keyboard', async () => {
			render(POSList, {
				items: testItems,
				interactive: true,
			});

			const buttons = await page.getByRole('button').all();
			expect(buttons.length).toBe(3);

			// Focus first button
			await buttons[0].element().focus();

			// Verify button is focused
			const activeElement = document.activeElement;
			expect(activeElement?.textContent).toContain('Item 1');
		});
	});
});
