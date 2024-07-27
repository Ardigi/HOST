/**
 * @description Comprehensive tests for order calculation utilities
 * @dependencies None - pure functions
 * @coverage-target 95% (critical business logic)
 */

import { describe, expect, it } from 'vitest';
import { calculateOrderTotals, calculateSubtotal, calculateTax } from './order.js';
import type { OrderItem } from './order.js';

describe('Order Calculations', () => {
	describe('calculateSubtotal', () => {
		it('should calculate subtotal for single item', () => {
			// Arrange
			const items = [{ price: 10, quantity: 2 }];

			// Act
			const result = calculateSubtotal(items);

			// Assert
			expect(result).toBe(20);
		});

		it('should calculate subtotal for multiple items', () => {
			// Arrange
			const items = [
				{ price: 10, quantity: 2 },
				{ price: 5.5, quantity: 3 },
				{ price: 8.25, quantity: 1 },
			];

			// Act
			const result = calculateSubtotal(items);

			// Assert
			expect(result).toBe(44.75); // (10*2) + (5.5*3) + (8.25*1)
		});

		it('should return 0 for empty items array', () => {
			// Arrange
			const items: OrderItem[] = [];

			// Act
			const result = calculateSubtotal(items);

			// Assert
			expect(result).toBe(0);
		});

		it('should handle zero quantity items', () => {
			const items: OrderItem[] = [
				{ price: 10.0, quantity: 0 },
				{ price: 15.0, quantity: 2 },
			];

			const result = calculateSubtotal(items);

			expect(result).toBe(30.0);
		});

		it('should handle large quantities', () => {
			const items: OrderItem[] = [{ price: 1.5, quantity: 100 }];

			const result = calculateSubtotal(items);

			expect(result).toBe(150.0);
		});

		it('should handle high-precision decimal prices', () => {
			const items: OrderItem[] = [
				{ price: 10.999, quantity: 3 },
				{ price: 5.495, quantity: 2 },
			];

			const result = calculateSubtotal(items);

			expect(result).toBeCloseTo(43.987, 3);
		});
	});

	describe('calculateTax', () => {
		it('should calculate tax at 8%', () => {
			// Arrange
			const subtotal = 100;
			const taxRate = 0.08;

			// Act
			const result = calculateTax(subtotal, taxRate);

			// Assert
			expect(result).toBe(8);
		});

		it('should calculate tax at 10%', () => {
			// Arrange
			const subtotal = 50;
			const taxRate = 0.1;

			// Act
			const result = calculateTax(subtotal, taxRate);

			// Assert
			expect(result).toBe(5);
		});

		it('should return 0 for 0% tax rate', () => {
			// Arrange
			const subtotal = 100;
			const taxRate = 0;

			// Act
			const result = calculateTax(subtotal, taxRate);

			// Assert
			expect(result).toBe(0);
		});

		it('should calculate tax at 8.25% rate (Texas standard)', () => {
			const subtotal = 100.0;
			const taxRate = 0.0825;

			const result = calculateTax(subtotal, taxRate);

			expect(result).toBe(8.25);
		});

		it('should handle zero subtotal', () => {
			const subtotal = 0;
			const taxRate = 0.08;

			const result = calculateTax(subtotal, taxRate);

			expect(result).toBe(0);
		});

		it('should calculate tax with decimal subtotal', () => {
			const subtotal = 47.89;
			const taxRate = 0.08;

			const result = calculateTax(subtotal, taxRate);

			expect(result).toBeCloseTo(3.8312, 4);
		});

		it('should handle high tax rate', () => {
			const subtotal = 50.0;
			const taxRate = 0.15; // 15% tax rate

			const result = calculateTax(subtotal, taxRate);

			expect(result).toBe(7.5);
		});
	});

	describe('calculateOrderTotals', () => {
		it('should calculate all totals correctly', () => {
			// Arrange
			const items = [
				{ price: 10, quantity: 2 },
				{ price: 5, quantity: 1 },
			];
			const taxRate = 0.08;

			// Act
			const result = calculateOrderTotals(items, taxRate);

			// Assert
			expect(result).toEqual({
				subtotal: 25,
				tax: 2,
				total: 27,
			});
		});

		it('should round to 2 decimal places', () => {
			// Arrange
			const items = [{ price: 10.99, quantity: 3 }];
			const taxRate = 0.0825; // 8.25%

			// Act
			const result = calculateOrderTotals(items, taxRate);

			// Assert
			expect(result.subtotal).toBe(32.97);
			expect(result.tax).toBe(2.72); // 32.97 * 0.0825 = 2.72
			expect(result.total).toBe(35.69);
		});

		it('should use default tax rate of 8% if not provided', () => {
			// Arrange
			const items = [{ price: 100, quantity: 1 }];

			// Act
			const result = calculateOrderTotals(items);

			// Assert
			expect(result.tax).toBe(8); // Default 8% tax
			expect(result.total).toBe(108);
		});

		it('should handle empty items array', () => {
			const items: OrderItem[] = [];

			const result = calculateOrderTotals(items);

			expect(result.subtotal).toBe(0);
			expect(result.tax).toBe(0);
			expect(result.total).toBe(0);
		});

		it('should calculate complex multi-item order', () => {
			const items: OrderItem[] = [
				{ price: 12.99, quantity: 2 }, // 25.98
				{ price: 8.5, quantity: 3 }, // 25.50
				{ price: 15.75, quantity: 1 }, // 15.75
				{ price: 6.25, quantity: 4 }, // 25.00
			];
			const taxRate = 0.0825; // 8.25% (Texas)

			const result = calculateOrderTotals(items, taxRate);

			expect(result.subtotal).toBe(92.23);
			expect(result.tax).toBe(7.61); // 92.23 * 0.0825 = 7.60898, rounded to 7.61
			expect(result.total).toBe(99.84);
		});

		it('should handle zero tax rate', () => {
			const items: OrderItem[] = [{ price: 50.0, quantity: 1 }];
			const taxRate = 0;

			const result = calculateOrderTotals(items, taxRate);

			expect(result.subtotal).toBe(50.0);
			expect(result.tax).toBe(0);
			expect(result.total).toBe(50.0);
		});

		it('should maintain precision across calculations', () => {
			const items: OrderItem[] = [
				{ price: 9.999, quantity: 3 }, // 29.997 -> rounds to 30.00
			];

			const result = calculateOrderTotals(items);

			expect(result.subtotal).toBe(30.0);
			expect(result.tax).toBe(2.4); // 30.00 * 0.08
			expect(result.total).toBe(32.4);
		});

		it('should handle realistic bar tab scenario', () => {
			const items: OrderItem[] = [
				{ price: 8.0, quantity: 3 }, // 3 beers @ $8 = $24
				{ price: 12.0, quantity: 2 }, // 2 cocktails @ $12 = $24
				{ price: 14.5, quantity: 1 }, // 1 premium cocktail = $14.50
				{ price: 9.5, quantity: 4 }, // 4 appetizers @ $9.50 = $38
			];
			const taxRate = 0.08;

			const result = calculateOrderTotals(items, taxRate);

			expect(result.subtotal).toBe(100.5);
			expect(result.tax).toBe(8.04); // 100.5 * 0.08
			expect(result.total).toBe(108.54);
		});
	});

	describe('Edge Cases and Error Conditions', () => {
		it('should handle negative prices (for validation testing)', () => {
			// Note: Validation should happen at schema/service layer
			const items: OrderItem[] = [{ price: -10.0, quantity: 1 }];

			const result = calculateSubtotal(items);

			expect(result).toBe(-10.0);
		});

		it('should handle negative quantities (refunds/voids)', () => {
			const items: OrderItem[] = [{ price: 10.0, quantity: -1 }];

			const result = calculateSubtotal(items);

			expect(result).toBe(-10.0);
		});

		it('should handle very small decimal values', () => {
			const items: OrderItem[] = [{ price: 0.01, quantity: 1 }];

			const result = calculateOrderTotals(items);

			expect(result.subtotal).toBe(0.01);
			expect(result.tax).toBe(0); // 0.01 * 0.08 = 0.0008, rounds to 0
			expect(result.total).toBe(0.01);
		});

		it('should handle large monetary values', () => {
			const items: OrderItem[] = [{ price: 999999.99, quantity: 1 }];

			const result = calculateOrderTotals(items);

			expect(result.subtotal).toBe(999999.99);
			expect(result.tax).toBe(80000); // 999999.99 * 0.08
			expect(result.total).toBe(1079999.99);
		});

		it('should round edge case: 0.005', () => {
			const items: OrderItem[] = [{ price: 0.0625, quantity: 1 }];
			const taxRate = 0.08;

			const result = calculateOrderTotals(items, taxRate);

			// Tax calculated on unrounded subtotal for accuracy
			// 0.0625 * 0.08 = 0.005, which rounds to 0.01 (0.5 rounds up)
			expect(result.subtotal).toBe(0.06); // 0.0625 rounds to 0.06
			expect(result.tax).toBe(0.01); // 0.005 rounds to 0.01
			expect(result.total).toBe(0.07); // 0.0675 rounds to 0.07
		});
	});
});
