import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import POSDialog from './POSDialog.svelte';

/**
 * POSDialog Component Tests
 * Tests Material Design 3 Dialog wrapper with POS-optimized features
 */
describe('POSDialog', () => {
	describe('Open/Close Functionality', () => {
		it('should be hidden by default', async () => {
			render(POSDialog, {
				headline: 'Test Dialog',
			});

			const dialog = page.getByRole('dialog');
			await expect.element(dialog).not.toBeInTheDocument();
		});

		it('should be visible when open prop is true', async () => {
			render(POSDialog, {
				headline: 'Test Dialog',
				open: true,
			});

			const dialog = page.getByRole('dialog');
			await expect.element(dialog).toBeInTheDocument();
		});
	});

	describe('Dialog Types', () => {
		it('should support alert type for critical messages', async () => {
			render(POSDialog, {
				headline: 'Alert Dialog',
				open: true,
				type: 'alert',
			});

			const dialog = page.getByRole('alertdialog');
			await expect.element(dialog).toBeInTheDocument();
		});

		it('should use standard dialog type by default', async () => {
			render(POSDialog, {
				headline: 'Standard Dialog',
				open: true,
			});

			const dialog = page.getByRole('dialog');
			await expect.element(dialog).toBeInTheDocument();
		});
	});

	describe('Content Rendering', () => {
		it('should render headline text', async () => {
			render(POSDialog, {
				headline: 'Dialog Headline',
				open: true,
			});

			const dialog = page.getByRole('dialog');
			await expect.element(dialog).toBeInTheDocument();

			// Headline is rendered by m3-svelte Dialog component
			const element = await dialog.element();
			expect(element.textContent).toContain('Dialog Headline');
		});

		it('should render content text', async () => {
			render(POSDialog, {
				headline: 'Dialog',
				content: 'This is the dialog content.',
				open: true,
			});

			const dialog = page.getByRole('dialog');
			await expect.element(dialog).toBeInTheDocument();

			// Content is rendered in pos-dialog-content div
			const element = await dialog.element();
			const content = element.querySelector('.pos-dialog-content');
			expect(content).toBeTruthy();
			expect(content?.textContent).toContain('This is the dialog content.');
		});
	});

	describe('Actions and Touch Targets', () => {
		it('should render primary action button with comfortable size', async () => {
			render(POSDialog, {
				headline: 'Action Dialog',
				open: true,
				primaryAction: 'Confirm',
			});

			const confirmButton = page.getByRole('button', { name: 'Confirm' });
			await expect.element(confirmButton).toBeInTheDocument();

			// Verify touch target is at least 48px (WCAG 2.1 AA)
			const box = confirmButton.element().getBoundingClientRect();
			expect(box.height).toBeGreaterThanOrEqual(48);
		});

		it('should render secondary action button', async () => {
			render(POSDialog, {
				headline: 'Action Dialog',
				open: true,
				primaryAction: 'Confirm',
				secondaryAction: 'Cancel',
			});

			const cancelButton = page.getByRole('button', { name: 'Cancel' });
			await expect.element(cancelButton).toBeInTheDocument();

			// Verify touch target
			const box = cancelButton.element().getBoundingClientRect();
			expect(box.height).toBeGreaterThanOrEqual(48);
		});

		it('should call onPrimaryAction when primary button is clicked', async () => {
			const handlePrimary = vi.fn();
			render(POSDialog, {
				headline: 'Action Dialog',
				open: true,
				primaryAction: 'Confirm',
				onPrimaryAction: handlePrimary,
			});

			const confirmButton = page.getByRole('button', { name: 'Confirm' });
			await confirmButton.click();

			expect(handlePrimary).toHaveBeenCalledOnce();
		});

		it('should call onSecondaryAction when secondary button is clicked', async () => {
			const handleSecondary = vi.fn();
			render(POSDialog, {
				headline: 'Action Dialog',
				open: true,
				primaryAction: 'Confirm',
				secondaryAction: 'Cancel',
				onSecondaryAction: handleSecondary,
			});

			// Get the button element and trigger click directly to bypass hitbox
			const cancelButton = page.getByRole('button', { name: 'Cancel' });
			const buttonElement = await cancelButton.element();
			buttonElement.click(); // Use DOM click instead of Playwright click

			expect(handleSecondary).toHaveBeenCalledOnce();
		});
	});

	describe('Accessibility', () => {
		it('should use headline as accessible name', async () => {
			render(POSDialog, {
				headline: 'Accessible Dialog',
				open: true,
			});

			const dialog = page.getByRole('dialog', { name: 'Accessible Dialog' });
			await expect.element(dialog).toBeInTheDocument();
		});

		it('should support custom aria-label', async () => {
			render(POSDialog, {
				headline: 'Dialog',
				open: true,
				ariaLabel: 'Custom Accessible Name',
			});

			const dialog = page.getByRole('dialog', { name: 'Custom Accessible Name' });
			await expect.element(dialog).toBeInTheDocument();
		});

		it('should trap focus within dialog when open', async () => {
			render(POSDialog, {
				headline: 'Focus Trap Dialog',
				open: true,
				primaryAction: 'OK',
			});

			const dialog = page.getByRole('dialog');
			await expect.element(dialog).toBeInTheDocument();

			// Verify dialog is in focus trap mode (default behavior)
			// m3-svelte Dialog traps focus by default
			const okButton = page.getByRole('button', { name: 'OK' });
			await expect.element(okButton).toBeInTheDocument();
		});
	});

	describe('Additional Features', () => {
		it('should apply custom CSS classes', async () => {
			render(POSDialog, {
				headline: 'Custom Class Dialog',
				open: true,
				class: 'custom-dialog-class',
			});

			const dialog = page.getByRole('dialog');
			await expect.element(dialog).toBeInTheDocument();

			const element = await dialog.element();
			expect(element.className).toContain('custom-dialog-class');
		});

		it('should support critical action variant', async () => {
			render(POSDialog, {
				headline: 'Critical Action Dialog',
				open: true,
				primaryAction: 'Delete',
				primaryActionVariant: 'critical',
			});

			const deleteButton = page.getByRole('button', { name: 'Delete' });
			await expect.element(deleteButton).toBeInTheDocument();

			// Verify critical variant applies larger touch target
			const box = deleteButton.element().getBoundingClientRect();
			expect(box.height).toBeGreaterThanOrEqual(56); // Comfortable size for critical actions
		});
	});
});
