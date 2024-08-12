/**
 * @description POSTextField Component Tests
 * @component POSTextField
 */

import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import POSTextField from './POSTextField.svelte';

describe('POSTextField', () => {
	describe('Rendering', () => {
		it('should render with label', async () => {
			render(POSTextField, {
				props: {
					label: 'Customer Name',
					value: '',
				},
			});

			const input = page.getByRole('textbox', { name: /customer name/i });
			await expect.element(input).toBeInTheDocument();
		});

		it('should render with initial value', async () => {
			render(POSTextField, {
				props: {
					label: 'Email',
					value: 'test@example.com',
				},
			});

			const input = page.getByRole('textbox');
			await expect.element(input).toHaveValue('test@example.com');
		});
	});

	describe('Touch Targets (WCAG 2.1 AA)', () => {
		it('should meet comfortable touch target height by default (56px)', async () => {
			render(POSTextField, {
				props: {
					label: 'Test Field',
					value: '',
				},
			});

			const container = page.getByRole('textbox').element().closest('.pos-text-field');
			expect(container).toBeTruthy();

			const box = container?.getBoundingClientRect();
			expect(box.height).toBeGreaterThanOrEqual(56);
		});

		it('should support minimum size (48px)', async () => {
			render(POSTextField, {
				props: {
					label: 'Test Field',
					value: '',
					size: 'minimum',
				},
			});

			const container = page.getByRole('textbox').element().closest('.pos-text-field');
			const box = container?.getBoundingClientRect();
			expect(box.height).toBeGreaterThanOrEqual(48);
		});

		it('should support critical size (80px)', async () => {
			render(POSTextField, {
				props: {
					label: 'Test Field',
					value: '',
					size: 'critical',
				},
			});

			const container = page.getByRole('textbox').element().closest('.pos-text-field');
			const box = container?.getBoundingClientRect();
			expect(box.height).toBeGreaterThanOrEqual(80);
		});
	});

	describe('Props', () => {
		it('should support disabled state', async () => {
			render(POSTextField, {
				props: {
					label: 'Test',
					value: '',
					disabled: true,
				},
			});

			const input = page.getByRole('textbox');
			await expect.element(input).toBeDisabled();
		});

		it('should support required attribute', async () => {
			render(POSTextField, {
				props: {
					label: 'Test',
					value: '',
					required: true,
				},
			});

			const input = page.getByRole('textbox');
			const element = input.element() as HTMLInputElement;
			expect(element.required).toBe(true);
		});

		it('should support placeholder text', async () => {
			render(POSTextField, {
				props: {
					label: 'Email',
					value: '',
					placeholder: 'Enter your email',
				},
			});

			const input = page.getByRole('textbox');
			await expect.element(input).toHaveAttribute('placeholder', 'Enter your email');
		});

		it('should support input type variations', async () => {
			render(POSTextField, {
				props: {
					label: 'Password',
					value: '',
					type: 'password',
				},
			});

			const input = page.getByLabelText('Password');
			const element = input.element() as HTMLInputElement;
			expect(element.type).toBe('password');
		});
	});

	describe('Accessibility', () => {
		it('should have proper label association', async () => {
			render(POSTextField, {
				props: {
					label: 'Customer Name',
					value: '',
				},
			});

			const input = page.getByRole('textbox', { name: /customer name/i });
			await expect.element(input).toBeInTheDocument();
		});

		it('should support aria-label for screen readers', async () => {
			render(POSTextField, {
				props: {
					label: 'Search',
					value: '',
					'aria-label': 'Search menu items',
				},
			});

			const input = page.getByRole('textbox');
			await expect.element(input).toHaveAttribute('aria-label', 'Search menu items');
		});

		it('should indicate required fields accessibly', async () => {
			render(POSTextField, {
				props: {
					label: 'Name',
					value: '',
					required: true,
				},
			});

			const input = page.getByRole('textbox');
			const element = input.element() as HTMLInputElement;
			expect(element.required).toBe(true);
			expect(element.getAttribute('aria-required')).toBeTruthy();
		});
	});

	describe('Events', () => {
		it('should handle input events', async () => {
			let inputValue = '';

			render(POSTextField, {
				props: {
					label: 'Test',
					value: '',
					oninput: (e: Event) => {
						const target = e.target as HTMLInputElement;
						inputValue = target.value;
					},
				},
			});

			const input = page.getByRole('textbox');
			await input.fill('test value');

			expect(inputValue).toBe('test value');
		});

		it('should handle blur events', async () => {
			let blurred = false;

			render(POSTextField, {
				props: {
					label: 'Test',
					value: '',
					onblur: () => {
						blurred = true;
					},
				},
			});

			const input = page.getByRole('textbox');
			const element = input.element() as HTMLInputElement;
			element.focus();
			element.blur();

			expect(blurred).toBe(true);
		});

		it('should handle focus events', async () => {
			let focused = false;

			render(POSTextField, {
				props: {
					label: 'Test',
					value: '',
					onfocus: () => {
						focused = true;
					},
				},
			});

			const input = page.getByRole('textbox');
			const element = input.element() as HTMLInputElement;
			element.focus();

			expect(focused).toBe(true);
		});
	});
});
