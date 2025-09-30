/**
 * TDD Example: Order Calculation Tests
 * Demonstrates Red-Green-Refactor cycle
 */

import { describe, expect, it } from 'vitest';
import { calculateOrderTotals, calculateSubtotal, calculateTax } from './order.js';

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
			const items: { price: number; quantity: number }[] = [];

			// Act
			const result = calculateSubtotal(items);

			// Assert
			expect(result).toBe(0);
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
	});
});
