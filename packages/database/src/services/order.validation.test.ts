/**
 * Tests for Order Validation Schemas
 * Critical path - validates all order operation inputs
 */

import { describe, expect, it } from 'vitest';
import {
	addOrderItemModifierSchema,
	addOrderItemSchema,
	applyDiscountSchema,
	createOrderSchema,
	updateOrderItemSchema,
} from './order.validation';

describe('Order Validation Schemas', () => {
	describe('createOrderSchema', () => {
		it('should validate correct order creation data', () => {
			const validData = {
				venueId: 'venue_123',
				serverId: 'server_456',
				tableNumber: 5,
				guestCount: 4,
				orderType: 'dine_in' as const,
				notes: 'Birthday celebration',
			};

			const result = createOrderSchema.parse(validData);
			expect(result).toEqual(validData);
		});

		it('should accept minimal required fields', () => {
			const minimalData = {
				venueId: 'venue_123',
				serverId: 'server_456',
			};

			const result = createOrderSchema.parse(minimalData);
			expect(result.venueId).toBe('venue_123');
			expect(result.serverId).toBe('server_456');
			expect(result.orderType).toBe('dine_in'); // default
		});

		it('should accept null tableNumber', () => {
			const data = {
				venueId: 'venue_123',
				serverId: 'server_456',
				tableNumber: null,
			};

			const result = createOrderSchema.parse(data);
			expect(result.tableNumber).toBeNull();
		});

		it('should accept null notes', () => {
			const data = {
				venueId: 'venue_123',
				serverId: 'server_456',
				notes: null,
			};

			const result = createOrderSchema.parse(data);
			expect(result.notes).toBeNull();
		});

		it('should reject empty venueId', () => {
			const invalidData = {
				venueId: '',
				serverId: 'server_456',
			};

			expect(() => createOrderSchema.parse(invalidData)).toThrow('Venue ID is required');
		});

		it('should reject empty serverId', () => {
			const invalidData = {
				venueId: 'venue_123',
				serverId: '',
			};

			expect(() => createOrderSchema.parse(invalidData)).toThrow('Server ID is required');
		});

		it('should reject negative tableNumber', () => {
			const invalidData = {
				venueId: 'venue_123',
				serverId: 'server_456',
				tableNumber: -5,
			};

			expect(() => createOrderSchema.parse(invalidData)).toThrow();
		});

		it('should reject non-integer tableNumber', () => {
			const invalidData = {
				venueId: 'venue_123',
				serverId: 'server_456',
				tableNumber: 5.5,
			};

			expect(() => createOrderSchema.parse(invalidData)).toThrow();
		});

		it('should reject zero guestCount', () => {
			const invalidData = {
				venueId: 'venue_123',
				serverId: 'server_456',
				guestCount: 0,
			};

			expect(() => createOrderSchema.parse(invalidData)).toThrow();
		});

		it('should reject negative guestCount', () => {
			const invalidData = {
				venueId: 'venue_123',
				serverId: 'server_456',
				guestCount: -2,
			};

			expect(() => createOrderSchema.parse(invalidData)).toThrow();
		});

		it('should reject invalid orderType', () => {
			const invalidData = {
				venueId: 'venue_123',
				serverId: 'server_456',
				orderType: 'invalid_type',
			};

			expect(() => createOrderSchema.parse(invalidData)).toThrow();
		});

		it('should accept all valid orderType values', () => {
			const orderTypes = ['dine_in', 'takeout', 'delivery', 'bar'] as const;

			for (const orderType of orderTypes) {
				const data = {
					venueId: 'venue_123',
					serverId: 'server_456',
					orderType,
				};
				const result = createOrderSchema.parse(data);
				expect(result.orderType).toBe(orderType);
			}
		});
	});

	describe('addOrderItemModifierSchema', () => {
		it('should validate correct modifier data', () => {
			const validData = {
				modifierId: 'mod_123',
				name: 'Extra Cheese',
				price: 2.5,
				quantity: 1,
			};

			const result = addOrderItemModifierSchema.parse(validData);
			expect(result).toEqual(validData);
		});

		it('should default quantity to 1', () => {
			const data = {
				modifierId: 'mod_123',
				name: 'Extra Cheese',
				price: 2.5,
			};

			const result = addOrderItemModifierSchema.parse(data);
			expect(result.quantity).toBe(1);
		});

		it('should accept zero price for free modifiers', () => {
			const data = {
				modifierId: 'mod_123',
				name: 'No Cheese',
				price: 0,
			};

			const result = addOrderItemModifierSchema.parse(data);
			expect(result.price).toBe(0);
		});

		it('should reject empty modifierId', () => {
			const invalidData = {
				modifierId: '',
				name: 'Extra Cheese',
				price: 2.5,
			};

			expect(() => addOrderItemModifierSchema.parse(invalidData)).toThrow(
				'Modifier ID is required'
			);
		});

		it('should reject empty name', () => {
			const invalidData = {
				modifierId: 'mod_123',
				name: '',
				price: 2.5,
			};

			expect(() => addOrderItemModifierSchema.parse(invalidData)).toThrow(
				'Modifier name is required'
			);
		});

		it('should reject negative price', () => {
			const invalidData = {
				modifierId: 'mod_123',
				name: 'Extra Cheese',
				price: -2.5,
			};

			expect(() => addOrderItemModifierSchema.parse(invalidData)).toThrow(
				'Modifier price cannot be negative'
			);
		});

		it('should reject zero quantity', () => {
			const invalidData = {
				modifierId: 'mod_123',
				name: 'Extra Cheese',
				price: 2.5,
				quantity: 0,
			};

			expect(() => addOrderItemModifierSchema.parse(invalidData)).toThrow();
		});

		it('should reject negative quantity', () => {
			const invalidData = {
				modifierId: 'mod_123',
				name: 'Extra Cheese',
				price: 2.5,
				quantity: -1,
			};

			expect(() => addOrderItemModifierSchema.parse(invalidData)).toThrow();
		});
	});

	describe('addOrderItemSchema', () => {
		it('should validate correct order item data', () => {
			const validData = {
				orderId: 'order_123',
				menuItemId: 'item_456',
				name: 'Margherita Pizza',
				quantity: 2,
				price: 12.99,
				notes: 'Extra crispy',
				modifiers: [
					{
						modifierId: 'mod_789',
						name: 'Extra Cheese',
						price: 2.5,
						quantity: 1,
					},
				],
			};

			const result = addOrderItemSchema.parse(validData);
			expect(result).toEqual(validData);
		});

		it('should accept item without modifiers', () => {
			const data = {
				orderId: 'order_123',
				menuItemId: 'item_456',
				name: 'Margherita Pizza',
				quantity: 2,
				price: 12.99,
			};

			const result = addOrderItemSchema.parse(data);
			expect(result.modifiers).toBeUndefined();
		});

		it('should accept item without notes', () => {
			const data = {
				orderId: 'order_123',
				menuItemId: 'item_456',
				name: 'Margherita Pizza',
				quantity: 2,
				price: 12.99,
			};

			const result = addOrderItemSchema.parse(data);
			expect(result.notes).toBeUndefined();
		});

		it('should accept null notes', () => {
			const data = {
				orderId: 'order_123',
				menuItemId: 'item_456',
				name: 'Margherita Pizza',
				quantity: 2,
				price: 12.99,
				notes: null,
			};

			const result = addOrderItemSchema.parse(data);
			expect(result.notes).toBeNull();
		});

		it('should reject empty orderId', () => {
			const invalidData = {
				orderId: '',
				menuItemId: 'item_456',
				name: 'Margherita Pizza',
				quantity: 2,
				price: 12.99,
			};

			expect(() => addOrderItemSchema.parse(invalidData)).toThrow('Order ID is required');
		});

		it('should reject empty menuItemId', () => {
			const invalidData = {
				orderId: 'order_123',
				menuItemId: '',
				name: 'Margherita Pizza',
				quantity: 2,
				price: 12.99,
			};

			expect(() => addOrderItemSchema.parse(invalidData)).toThrow('Menu item ID is required');
		});

		it('should reject empty name', () => {
			const invalidData = {
				orderId: 'order_123',
				menuItemId: 'item_456',
				name: '',
				quantity: 2,
				price: 12.99,
			};

			expect(() => addOrderItemSchema.parse(invalidData)).toThrow('Item name is required');
		});

		it('should reject zero quantity', () => {
			const invalidData = {
				orderId: 'order_123',
				menuItemId: 'item_456',
				name: 'Margherita Pizza',
				quantity: 0,
				price: 12.99,
			};

			expect(() => addOrderItemSchema.parse(invalidData)).toThrow('Quantity must be at least 1');
		});

		it('should reject negative quantity', () => {
			const invalidData = {
				orderId: 'order_123',
				menuItemId: 'item_456',
				name: 'Margherita Pizza',
				quantity: -2,
				price: 12.99,
			};

			expect(() => addOrderItemSchema.parse(invalidData)).toThrow('Quantity must be at least 1');
		});

		it('should reject zero price', () => {
			const invalidData = {
				orderId: 'order_123',
				menuItemId: 'item_456',
				name: 'Margherita Pizza',
				quantity: 2,
				price: 0,
			};

			expect(() => addOrderItemSchema.parse(invalidData)).toThrow(
				'Price must be greater than zero'
			);
		});

		it('should reject negative price', () => {
			const invalidData = {
				orderId: 'order_123',
				menuItemId: 'item_456',
				name: 'Margherita Pizza',
				quantity: 2,
				price: -12.99,
			};

			expect(() => addOrderItemSchema.parse(invalidData)).toThrow(
				'Price must be greater than zero'
			);
		});

		it('should validate nested modifiers array', () => {
			const data = {
				orderId: 'order_123',
				menuItemId: 'item_456',
				name: 'Margherita Pizza',
				quantity: 2,
				price: 12.99,
				modifiers: [
					{
						modifierId: 'mod_789',
						name: 'Extra Cheese',
						price: 2.5,
						quantity: 1,
					},
					{
						modifierId: 'mod_790',
						name: 'Gluten Free Base',
						price: 3.0,
						quantity: 1,
					},
				],
			};

			const result = addOrderItemSchema.parse(data);
			expect(result.modifiers).toHaveLength(2);
			expect(result.modifiers?.[0].name).toBe('Extra Cheese');
			expect(result.modifiers?.[1].name).toBe('Gluten Free Base');
		});

		it('should reject invalid modifier in modifiers array', () => {
			const invalidData = {
				orderId: 'order_123',
				menuItemId: 'item_456',
				name: 'Margherita Pizza',
				quantity: 2,
				price: 12.99,
				modifiers: [
					{
						modifierId: '', // Invalid: empty ID
						name: 'Extra Cheese',
						price: 2.5,
					},
				],
			};

			expect(() => addOrderItemSchema.parse(invalidData)).toThrow();
		});
	});

	describe('updateOrderItemSchema', () => {
		it('should validate all optional fields', () => {
			const validData = {
				quantity: 3,
				notes: 'Updated notes',
				status: 'preparing' as const,
			};

			const result = updateOrderItemSchema.parse(validData);
			expect(result).toEqual(validData);
		});

		it('should accept quantity only', () => {
			const data = {
				quantity: 5,
			};

			const result = updateOrderItemSchema.parse(data);
			expect(result.quantity).toBe(5);
		});

		it('should accept notes only', () => {
			const data = {
				notes: 'No onions',
			};

			const result = updateOrderItemSchema.parse(data);
			expect(result.notes).toBe('No onions');
		});

		it('should accept null notes', () => {
			const data = {
				notes: null,
			};

			const result = updateOrderItemSchema.parse(data);
			expect(result.notes).toBeNull();
		});

		it('should accept status only', () => {
			const data = {
				status: 'ready' as const,
			};

			const result = updateOrderItemSchema.parse(data);
			expect(result.status).toBe('ready');
		});

		it('should accept empty object', () => {
			const data = {};

			const result = updateOrderItemSchema.parse(data);
			expect(result).toEqual({});
		});

		it('should reject zero quantity', () => {
			const invalidData = {
				quantity: 0,
			};

			expect(() => updateOrderItemSchema.parse(invalidData)).toThrow();
		});

		it('should reject negative quantity', () => {
			const invalidData = {
				quantity: -1,
			};

			expect(() => updateOrderItemSchema.parse(invalidData)).toThrow();
		});

		it('should reject invalid status', () => {
			const invalidData = {
				status: 'invalid_status',
			};

			expect(() => updateOrderItemSchema.parse(invalidData)).toThrow();
		});

		it('should accept all valid status values', () => {
			const statuses = ['pending', 'sent', 'preparing', 'ready', 'delivered'] as const;

			for (const status of statuses) {
				const data = { status };
				const result = updateOrderItemSchema.parse(data);
				expect(result.status).toBe(status);
			}
		});
	});

	describe('applyDiscountSchema', () => {
		it('should validate correct discount data', () => {
			const validData = {
				orderId: 'order_123',
				discountAmount: 10.0,
			};

			const result = applyDiscountSchema.parse(validData);
			expect(result).toEqual(validData);
		});

		it('should accept decimal discount amounts', () => {
			const data = {
				orderId: 'order_123',
				discountAmount: 5.75,
			};

			const result = applyDiscountSchema.parse(data);
			expect(result.discountAmount).toBe(5.75);
		});

		it('should reject empty orderId', () => {
			const invalidData = {
				orderId: '',
				discountAmount: 10.0,
			};

			expect(() => applyDiscountSchema.parse(invalidData)).toThrow('Order ID is required');
		});

		it('should reject zero discount', () => {
			const invalidData = {
				orderId: 'order_123',
				discountAmount: 0,
			};

			expect(() => applyDiscountSchema.parse(invalidData)).toThrow(
				'Discount must be greater than zero'
			);
		});

		it('should reject negative discount', () => {
			const invalidData = {
				orderId: 'order_123',
				discountAmount: -10.0,
			};

			expect(() => applyDiscountSchema.parse(invalidData)).toThrow(
				'Discount must be greater than zero'
			);
		});
	});
});
