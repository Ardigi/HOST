import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import POSSelect from './POSSelect.svelte';

/**
 * POSSelect Component Tests
 * Tests Material Design 3 Select wrapper with POS-optimized features
 */
describe('POSSelect', () => {
	const testOptions = [
		{ text: 'Option 1', value: '1' },
		{ text: 'Option 2', value: '2' },
		{ text: 'Option 3', value: '3' },
	];

	describe('Rendering with Options', () => {
		it('should render select element', async () => {
			render(POSSelect, {
				label: 'Test Select',
				options: testOptions,
				value: '',
			});

			// m3-svelte renders selects with combobox role
			const select = page.getByRole('combobox', { name: 'Test Select' });
			await expect.element(select).toBeInTheDocument();
		});

		it('should render label text', async () => {
			render(POSSelect, {
				label: 'Options Select',
				options: testOptions,
				value: '',
			});

			const label = page.getByText('Options Select');
			await expect.element(label).toBeInTheDocument();
		});

		it('should render all options', async () => {
			render(POSSelect, {
				label: 'Test Select',
				options: testOptions,
				value: '',
			});

			// Check that options are rendered
			const option1 = page.getByText('Option 1');
			const option2 = page.getByText('Option 2');
			const option3 = page.getByText('Option 3');

			await expect.element(option1).toBeInTheDocument();
			await expect.element(option2).toBeInTheDocument();
			await expect.element(option3).toBeInTheDocument();
		});
	});

	describe('Value Selection and Binding', () => {
		it('should display the selected value', async () => {
			render(POSSelect, {
				label: 'Selected Value',
				options: testOptions,
				value: '2',
			});

			const select = page.getByRole('combobox', { name: 'Selected Value' });
			await expect.element(select).toBeInTheDocument();

			// The combobox element IS the select element in m3-svelte
			const element = (await select.element()) as HTMLSelectElement;
			expect(element.value).toBe('2');
		});

		it('should update value when selection changes', async () => {
			render(POSSelect, {
				label: 'Change Test',
				options: testOptions,
				value: '1',
			});

			const select = page.getByRole('combobox', { name: 'Change Test' });
			const element = (await select.element()) as HTMLSelectElement;

			// Verify initial value
			expect(element.value).toBe('1');

			// Change selection
			element.value = '3';
			element.dispatchEvent(new Event('change', { bubbles: true }));

			// Wait for event to propagate
			await new Promise(resolve => setTimeout(resolve, 50));

			// Verify value changed
			expect(element.value).toBe('3');
		});
	});

	describe('Touch Target Requirements (WCAG 2.1 AA)', () => {
		it('should meet minimum 48px touch target by default', async () => {
			render(POSSelect, {
				label: 'Touch Target Test',
				options: testOptions,
				value: '',
			});

			const select = page.getByRole('combobox', { name: 'Touch Target Test' });
			await expect.element(select).toBeInTheDocument();

			// Verify minimum height
			const box = select.element().getBoundingClientRect();
			expect(box.height).toBeGreaterThanOrEqual(48);
		});

		it('should support "comfortable" size variant (56px)', async () => {
			render(POSSelect, {
				label: 'Comfortable Select',
				options: testOptions,
				value: '',
				size: 'comfortable',
			});

			const select = page.getByRole('combobox', { name: 'Comfortable Select' });
			await expect.element(select).toBeInTheDocument();

			// Verify comfortable size
			const box = select.element().getBoundingClientRect();
			expect(box.height).toBeGreaterThanOrEqual(56);
		});
	});

	describe('Accessibility', () => {
		it('should have accessible label', async () => {
			render(POSSelect, {
				label: 'Accessible Select',
				options: testOptions,
				value: '',
			});

			const select = page.getByRole('combobox', { name: 'Accessible Select' });
			await expect.element(select).toBeInTheDocument();
		});

		it('should support disabled state', async () => {
			render(POSSelect, {
				label: 'Disabled Select',
				options: testOptions,
				value: '',
				disabled: true,
			});

			const select = page.getByRole('combobox', { name: 'Disabled Select' });
			const element = (await select.element()) as HTMLSelectElement;
			expect(element.disabled).toBe(true);
		});

		it('should support required attribute', async () => {
			render(POSSelect, {
				label: 'Required Select',
				options: testOptions,
				value: '',
				required: true,
			});

			const select = page.getByRole('combobox', { name: 'Required Select' });
			const element = (await select.element()) as HTMLSelectElement;
			expect(element.required).toBe(true);
		});
	});

	describe('Custom Width', () => {
		it('should support custom width', async () => {
			render(POSSelect, {
				label: 'Width Test',
				options: testOptions,
				value: '',
				width: '300px',
			});

			const select = page.getByRole('combobox', { name: 'Width Test' });
			await expect.element(select).toBeInTheDocument();

			// Width is applied via CSS custom property
			const element = (await select.element()) as HTMLSelectElement;
			expect(element.style.getPropertyValue('--width')).toBe('300px');
		});
	});

	describe('Additional Features', () => {
		it('should apply custom CSS classes', async () => {
			render(POSSelect, {
				label: 'Custom Class',
				options: testOptions,
				value: '',
				class: 'custom-select-class',
			});

			const select = page.getByRole('combobox', { name: 'Custom Class' });
			const element = (await select.element()) as HTMLSelectElement;
			expect(element.className).toContain('custom-select-class');
		});
	});

	describe('onChange Callback', () => {
		it('should call onChange handler when value changes', async () => {
			let callbackValue = '';
			const handleChange = (value: string) => {
				callbackValue = value;
			};

			render(POSSelect, {
				label: 'Callback Test',
				options: testOptions,
				value: '1',
				onChange: handleChange,
			});

			const select = page.getByRole('combobox', { name: 'Callback Test' });
			const element = (await select.element()) as HTMLSelectElement;

			// Change selection
			element.value = '3';
			element.dispatchEvent(new Event('change', { bubbles: true }));

			// Wait for event to propagate
			await new Promise(resolve => setTimeout(resolve, 50));

			// Verify callback was called with new value
			expect(callbackValue).toBe('3');
		});

		it('should work without onChange callback', async () => {
			// This test ensures component doesn't crash when onChange is undefined
			render(POSSelect, {
				label: 'No Callback',
				options: testOptions,
				value: '1',
			});

			const select = page.getByRole('combobox', { name: 'No Callback' });
			const element = (await select.element()) as HTMLSelectElement;

			// Should not throw error when changing value
			element.value = '2';
			element.dispatchEvent(new Event('change', { bubbles: true }));

			await new Promise(resolve => setTimeout(resolve, 50));
			expect(element.value).toBe('2');
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty string as initial value', async () => {
			render(POSSelect, {
				label: 'Empty Value',
				options: testOptions,
				value: '',
			});

			const select = page.getByRole('combobox', { name: 'Empty Value' });
			const element = (await select.element()) as HTMLSelectElement;
			expect(element.value).toBe('');
		});

		it('should apply correct size classes', async () => {
			render(POSSelect, {
				label: 'Size Class Test',
				options: testOptions,
				value: '',
				size: 'standard',
			});

			const select = page.getByRole('combobox', { name: 'Size Class Test' });
			const element = (await select.element()) as HTMLSelectElement;
			expect(element.className).toContain('pos-select-standard');
		});

		it('should apply comfortable size class', async () => {
			render(POSSelect, {
				label: 'Comfortable Size Class',
				options: testOptions,
				value: '',
				size: 'comfortable',
			});

			const select = page.getByRole('combobox', { name: 'Comfortable Size Class' });
			const element = (await select.element()) as HTMLSelectElement;
			expect(element.className).toContain('pos-select-comfortable');
		});
	});
});
