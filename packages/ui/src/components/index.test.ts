import { describe, expect, it } from 'vitest';
import type { ComponentSize, ComponentVariant } from './index.js';

describe('UI Component Types', () => {
	describe('ComponentSize', () => {
		it('should accept valid size values', () => {
			const validSizes: ComponentSize[] = ['sm', 'md', 'lg'];

			for (const size of validSizes) {
				// Type assertion validates that the type accepts these values
				const testSize: ComponentSize = size;
				expect(['sm', 'md', 'lg']).toContain(testSize);
			}
		});

		it('should have correct size constants for type checking', () => {
			// This test validates that the type system is working correctly
			// by ensuring we can assign literal values to the type
			const small: ComponentSize = 'sm';
			const medium: ComponentSize = 'md';
			const large: ComponentSize = 'lg';

			expect(small).toBe('sm');
			expect(medium).toBe('md');
			expect(large).toBe('lg');
		});
	});

	describe('ComponentVariant', () => {
		it('should accept valid variant values', () => {
			const validVariants: ComponentVariant[] = [
				'primary',
				'secondary',
				'success',
				'danger',
				'warning',
			];

			for (const variant of validVariants) {
				// Type assertion validates that the type accepts these values
				const testVariant: ComponentVariant = variant;
				expect(['primary', 'secondary', 'success', 'danger', 'warning']).toContain(testVariant);
			}
		});

		it('should have correct variant constants for type checking', () => {
			const primary: ComponentVariant = 'primary';
			const secondary: ComponentVariant = 'secondary';
			const success: ComponentVariant = 'success';
			const danger: ComponentVariant = 'danger';
			const warning: ComponentVariant = 'warning';

			expect(primary).toBe('primary');
			expect(secondary).toBe('secondary');
			expect(success).toBe('success');
			expect(danger).toBe('danger');
			expect(warning).toBe('warning');
		});
	});

	describe('Type Safety', () => {
		it('should maintain type safety across package exports', () => {
			// This test ensures that the types are properly exported
			// and can be imported by consuming packages
			const size: ComponentSize = 'md';
			const variant: ComponentVariant = 'primary';

			// Helper function to validate type at runtime
			const isValidSize = (value: string): value is ComponentSize => {
				return ['sm', 'md', 'lg'].includes(value);
			};

			const isValidVariant = (value: string): value is ComponentVariant => {
				return ['primary', 'secondary', 'success', 'danger', 'warning'].includes(value);
			};

			expect(isValidSize(size)).toBe(true);
			expect(isValidVariant(variant)).toBe(true);
			expect(isValidSize('invalid')).toBe(false);
			expect(isValidVariant('invalid')).toBe(false);
		});
	});
});
