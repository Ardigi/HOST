import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import POSCardTestWrapper from './test-wrappers/POSCardTestWrapper.svelte';

describe('POSCard (POS App)', () => {
	describe('Material Design 3 Variants', () => {
		it('should render elevated variant by default', async () => {
			render(POSCardTestWrapper, {
				testContent: 'Card Content',
			});

			const content = page.getByText('Card Content');
			await expect.element(content).toBeInTheDocument();

			const cardElement = content.element().closest('.pos-card');
			expect(cardElement).toBeTruthy();
		});

		it('should support filled variant', async () => {
			render(POSCardTestWrapper, {
				variant: 'filled',
				testContent: 'Filled Card',
			});

			const content = page.getByText('Filled Card');
			await expect.element(content).toBeInTheDocument();
		});

		it('should support outlined variant', async () => {
			render(POSCardTestWrapper, {
				variant: 'outlined',
				testContent: 'Outlined Card',
			});

			const content = page.getByText('Outlined Card');
			await expect.element(content).toBeInTheDocument();
		});
	});

	describe('Touch Target Requirements for POS Environment', () => {
		it('should meet comfortable touch target minimum (56px)', async () => {
			render(POSCardTestWrapper, {
				testContent: 'Touch Card',
			});

			const content = page.getByText('Touch Card');
			const cardElement = content.element().closest('.pos-card') as HTMLElement;

			// biome-ignore lint/style/noNonNullAssertion: Element guaranteed to exist from closest() query
			const styles = window.getComputedStyle(cardElement!);
			const minHeight = Number.parseInt(styles.minHeight);

			expect(minHeight).toBeGreaterThanOrEqual(56);
		});

		it('should have POS-optimized padding (24px)', async () => {
			render(POSCardTestWrapper, {
				testContent: 'Padded Card',
			});

			const content = page.getByText('Padded Card');
			const cardElement = content.element().closest('.pos-card') as HTMLElement;

			// biome-ignore lint/style/noNonNullAssertion: Element guaranteed to exist from closest() query
			const styles = window.getComputedStyle(cardElement!);
			const padding = Number.parseInt(styles.padding);

			expect(padding).toBeGreaterThanOrEqual(24);
		});
	});

	describe('Interactive Cards', () => {
		it('should handle click events for menu item selection', async () => {
			const handleClick = vi.fn();
			render(POSCardTestWrapper, {
				onclick: handleClick,
				testContent: 'Menu Item Card',
			});

			const content = page.getByText('Menu Item Card');
			await content.click();

			expect(handleClick).toHaveBeenCalledOnce();
		});

		it('should support static cards without click handlers', async () => {
			render(POSCardTestWrapper, {
				testContent: 'Static Info Card',
			});

			const content = page.getByText('Static Info Card');
			await expect.element(content).toBeInTheDocument();
			await content.click(); // Should not throw
		});
	});

	describe('POS-Specific Use Cases', () => {
		it('should render order summary card with multiple elements', async () => {
			render(POSCardTestWrapper, {
				testContent: 'Order Total: $45.99',
				showTitle: true,
			});

			const title = page.getByText('Card Title');
			await expect.element(title).toBeInTheDocument();

			const total = page.getByText('Order Total: $45.99');
			await expect.element(total).toBeInTheDocument();
		});

		it('should apply custom styling for different card types', async () => {
			render(POSCardTestWrapper, {
				class: 'order-card highlight',
				testContent: 'Special Order',
			});

			const content = page.getByText('Special Order');
			const cardElement = content.element().closest('.pos-card') as HTMLElement;

			expect(cardElement?.className).toContain('order-card');
			expect(cardElement?.className).toContain('highlight');
		});
	});
});
