import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import POSButton from './POSButton.svelte';

describe('POSButton', () => {
	describe('Touch Target Requirements (WCAG 2.1 AA)', () => {
		it('should meet minimum 48px touch target by default', async () => {
			render(POSButton, { label: 'Test Button' });
			const button = page.getByRole('button', { name: 'Test Button' });

			await expect.element(button).toBeInTheDocument();

			// Get computed styles and verify minimum height
			const box = button.element().getBoundingClientRect();
			expect(box.height).toBeGreaterThanOrEqual(48);
		});

		it('should support "comfortable" size variant (56px)', async () => {
			render(POSButton, {
				label: 'Comfortable Button',
				size: 'comfortable',
			});
			const button = page.getByRole('button', { name: 'Comfortable Button' });

			await expect.element(button).toBeInTheDocument();

			const box = button.element().getBoundingClientRect();
			expect(box.height).toBeGreaterThanOrEqual(56);
		});

		it('should support "critical" size variant (80px)', async () => {
			render(POSButton, {
				label: 'Critical Button',
				size: 'critical',
			});
			const button = page.getByRole('button', { name: 'Critical Button' });

			await expect.element(button).toBeInTheDocument();

			const box = button.element().getBoundingClientRect();
			expect(box.height).toBeGreaterThanOrEqual(80);
		});
	});

	describe('Material Design 3 Integration', () => {
		it('should render using m3-svelte Button component', async () => {
			render(POSButton, { label: 'MD3 Button' });
			const button = page.getByRole('button', { name: 'MD3 Button' });

			await expect.element(button).toBeInTheDocument();
			await expect.element(button).toHaveAccessibleName('MD3 Button');
		});

		it('should support Material Design 3 variants', async () => {
			const variants: Array<'filled' | 'outlined' | 'text' | 'elevated' | 'tonal'> = [
				'filled',
				'outlined',
				'text',
				'elevated',
				'tonal',
			];

			for (const variant of variants) {
				render(POSButton, {
					label: `${variant} Button`,
					variant,
				});
				const button = page.getByRole('button', { name: `${variant} Button` });
				await expect.element(button).toBeInTheDocument();
			}
		});
	});

	describe('Click Handling', () => {
		it('should call onclick handler when clicked', async () => {
			const handleClick = vi.fn();
			render(POSButton, {
				label: 'Clickable Button',
				onclick: handleClick,
			});
			const button = page.getByRole('button', { name: 'Clickable Button' });

			await button.click();

			expect(handleClick).toHaveBeenCalledOnce();
		});

		it('should not call onclick when disabled', async () => {
			const handleClick = vi.fn();
			render(POSButton, {
				label: 'Disabled Button',
				onclick: handleClick,
				disabled: true,
			});
			const button = page.getByRole('button', { name: 'Disabled Button' });

			await expect.element(button).toBeDisabled();

			// Attempting to click a disabled button should not trigger the handler
			// Note: Playwright's click on disabled elements is a no-op
			await button.click({ force: true });

			expect(handleClick).not.toHaveBeenCalled();
		});
	});

	describe('Accessibility', () => {
		it('should render label as button text', async () => {
			render(POSButton, { label: 'Accessible Button' });
			const button = page.getByRole('button', { name: 'Accessible Button' });

			await expect.element(button).toBeInTheDocument();
			await expect.element(button).toHaveTextContent('Accessible Button');
		});

		it('should support disabled state', async () => {
			render(POSButton, {
				label: 'Disabled Button',
				disabled: true,
			});
			const button = page.getByRole('button', { name: 'Disabled Button' });

			await expect.element(button).toBeDisabled();
		});

		it('should apply additional CSS classes', async () => {
			render(POSButton, {
				label: 'Custom Class Button',
				class: 'custom-class',
			});
			const button = page.getByRole('button', { name: 'Custom Class Button' });

			await expect.element(button).toBeInTheDocument();

			const element = await button.element();
			expect(element.className).toContain('custom-class');
		});
	});

	describe('Icon Support', () => {
		it('should render with leading icon', async () => {
			render(POSButton, {
				label: 'Icon Button',
				leadingIcon: 'add',
			});
			const button = page.getByRole('button', { name: 'Icon Button' });

			await expect.element(button).toBeInTheDocument();
			await expect.element(button).toHaveTextContent('Icon Button');

			// Verify icon is present
			const element = await button.element();
			const iconSpan = element.querySelector('.material-symbols-outlined');
			expect(iconSpan).toBeTruthy();
			expect(iconSpan?.textContent).toContain('add');
		});

		it('should render with trailing icon', async () => {
			render(POSButton, {
				label: 'Icon Button',
				trailingIcon: 'arrow_forward',
			});
			const button = page.getByRole('button', { name: 'Icon Button' });

			await expect.element(button).toBeInTheDocument();
			await expect.element(button).toHaveTextContent('Icon Button');

			// Verify icon is present
			const element = await button.element();
			const iconSpan = element.querySelector('.material-symbols-outlined');
			expect(iconSpan).toBeTruthy();
			expect(iconSpan?.textContent).toContain('arrow_forward');
		});

		it('should render with both leading and trailing icons', async () => {
			render(POSButton, {
				label: 'Icon Button',
				leadingIcon: 'add',
				trailingIcon: 'arrow_forward',
			});
			const button = page.getByRole('button', { name: 'Icon Button' });

			await expect.element(button).toBeInTheDocument();

			// Verify both icons are present
			const element = await button.element();
			const iconSpans = element.querySelectorAll('.material-symbols-outlined');
			expect(iconSpans.length).toBe(2);
		});
	});
});
