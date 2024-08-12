import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import POSCardTestWrapper from './test-wrappers/POSCardTestWrapper.svelte';

describe('POSCard', () => {
	describe('Material Design 3 Variants', () => {
		it('should render elevated variant by default', async () => {
			render(POSCardTestWrapper, {
				props: {
					testContent: 'Card Content',
				},
			});

			// Find the card content
			const content = page.getByText('Card Content');
			await expect.element(content).toBeInTheDocument();

			// Verify it has the pos-card class
			const cardElement = content.element().closest('.pos-card');
			expect(cardElement).toBeTruthy();
		});

		it('should support filled variant', async () => {
			render(POSCardTestWrapper, {
				props: {
					variant: 'filled',
					testContent: 'Filled Card',
				},
			});

			const content = page.getByText('Filled Card');
			await expect.element(content).toBeInTheDocument();
		});

		it('should support outlined variant', async () => {
			render(POSCardTestWrapper, {
				props: {
					variant: 'outlined',
					testContent: 'Outlined Card',
				},
			});

			const content = page.getByText('Outlined Card');
			await expect.element(content).toBeInTheDocument();
		});
	});

	describe('Touch Target Requirements', () => {
		it('should meet comfortable touch target minimum (56px)', async () => {
			render(POSCardTestWrapper, {
				props: {
					testContent: 'Touch Target Card',
				},
			});

			const content = page.getByText('Touch Target Card');
			const cardElement = content.element().closest('.pos-card') as HTMLElement;
			expect(cardElement).toBeTruthy();

			// Get computed styles
			// biome-ignore lint/style/noNonNullAssertion: Element guaranteed to exist from closest() query
			const styles = window.getComputedStyle(cardElement!);
			const minHeight = Number.parseInt(styles.minHeight);

			// Should be at least 56px (comfortable touch target)
			expect(minHeight).toBeGreaterThanOrEqual(56);
		});

		it('should have enhanced padding for POS use (24px)', async () => {
			render(POSCardTestWrapper, {
				props: {
					testContent: 'Padded Card',
				},
			});

			const content = page.getByText('Padded Card');
			const cardElement = content.element().closest('.pos-card') as HTMLElement;

			// biome-ignore lint/style/noNonNullAssertion: Element guaranteed to exist from closest() query
			const styles = window.getComputedStyle(cardElement!);
			const padding = Number.parseInt(styles.padding);

			// Should have 24px padding (1.5rem)
			expect(padding).toBeGreaterThanOrEqual(24);
		});
	});

	describe('Click Handling', () => {
		it('should call onclick handler when clicked', async () => {
			const handleClick = vi.fn();
			render(POSCardTestWrapper, {
				props: {
					onclick: handleClick,
					testContent: 'Clickable Card',
				},
			});

			const content = page.getByText('Clickable Card');
			await content.click();

			expect(handleClick).toHaveBeenCalledOnce();
		});

		it('should work without onclick handler', async () => {
			render(POSCardTestWrapper, {
				props: {
					testContent: 'Static Card',
				},
			});

			const content = page.getByText('Static Card');
			await expect.element(content).toBeInTheDocument();

			// Should not throw when clicking without handler
			await content.click();
		});
	});

	describe('Content Rendering', () => {
		it('should render children content using Svelte 5 snippets', async () => {
			render(POSCardTestWrapper, {
				props: {
					testContent: 'Test Content',
				},
			});

			await expect.element(page.getByText('Test Content')).toBeInTheDocument();
		});

		it('should render complex children with multiple elements', async () => {
			render(POSCardTestWrapper, {
				props: {
					testContent: 'Complex Content',
					showTitle: true,
				},
			});

			const content = page.getByText('Card Title');
			await expect.element(content).toBeInTheDocument();

			const desc = page.getByText('Complex Content');
			await expect.element(desc).toBeInTheDocument();
		});
	});

	describe('Styling & CSS Classes', () => {
		it('should apply additional CSS classes', async () => {
			render(POSCardTestWrapper, {
				props: {
					class: 'custom-card-class',
					testContent: 'Custom Class Card',
				},
			});

			const content = page.getByText('Custom Class Card');
			const cardElement = content.element().closest('.pos-card') as HTMLElement;

			expect(cardElement?.className).toContain('custom-card-class');
		});

		it('should apply pos-card class for consistent styling', async () => {
			render(POSCardTestWrapper, {
				props: {
					testContent: 'Styled Card',
				},
			});

			const content = page.getByText('Styled Card');
			const cardElement = content.element().closest('.pos-card');

			expect(cardElement).toBeTruthy();
		});
	});
});
