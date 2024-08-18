import { beforeEach, describe, expect, it } from 'vitest';
import { orderFactory, userFactory } from './factories';

/**
 * Example unit test using TDD approach
 * Reference: test-strategy.md
 */
describe('Order Calculation', () => {
	describe('calculateTotal', () => {
		it('should calculate subtotal from items', () => {
			// Arrange
			const items = [
				{ price: 10, quantity: 2 }, // 20
				{ price: 15, quantity: 1 }, // 15
			];

			// Act
			const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

			// Assert
			expect(subtotal).toBe(35);
		});

		it('should apply tax correctly', () => {
			// Arrange
			const subtotal = 100;
			const taxRate = 0.0825; // 8.25%

			// Act
			const tax = subtotal * taxRate;

			// Assert
			expect(tax).toBe(8.25);
		});

		it('should calculate total with subtotal, tax, and tip', () => {
			// Arrange
			const subtotal = 100;
			const tax = 8.25;
			const tip = 15;

			// Act
			const total = subtotal + tax + tip;

			// Assert
			expect(total).toBe(123.25);
		});
	});

	describe('Order Factory', () => {
		it('should generate valid order with defaults', () => {
			// Act
			const order = orderFactory.build();

			// Assert
			expect(order).toBeDefined();
			expect(order.id).toBeTruthy();
			expect(order.status).toBe('open');
			expect(order.orderType).toBe('dine_in');
		});

		it('should allow overriding defaults', () => {
			// Act
			const order = orderFactory.build({
				status: 'completed',
				tableNumber: 5,
			});

			// Assert
			expect(order.status).toBe('completed');
			expect(order.tableNumber).toBe(5);
		});

		it('should generate multiple orders', () => {
			// Act
			const orders = orderFactory.buildList(5);

			// Assert
			expect(orders).toHaveLength(5);
			expect(orders[0].id).not.toBe(orders[1].id);
		});
	});

	describe('User Factory', () => {
		it('should generate admin user', () => {
			// Act
			const admin = userFactory.buildAdmin();

			// Assert
			expect(admin.role).toBe('admin');
			expect(admin.email).toBe('admin@host-pos.com');
		});

		it('should generate server user', () => {
			// Act
			const server = userFactory.buildServer();

			// Assert
			expect(server.role).toBe('server');
		});
	});
});
