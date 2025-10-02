/**
 * @description Tests for inventory validation schemas
 * @dependencies Zod
 * @coverage-target 95% (critical validation logic)
 */

import { describe, expect, it } from 'vitest';
import {
	inventoryItemSchema,
	inventoryPurchaseOrderItemSchema,
	inventoryPurchaseOrderSchema,
	inventorySupplierSchema,
	inventoryTransactionSchema,
	newInventoryItemSchema,
	newInventoryPurchaseOrderItemSchema,
	newInventoryPurchaseOrderSchema,
	newInventorySupplierSchema,
	newInventoryTransactionSchema,
} from './inventory.js';

describe('Inventory Validation Schemas', () => {
	describe('Inventory Item Schema', () => {
		it('should validate valid inventory item', () => {
			const validItem = {
				venueId: 'venue-123',
				name: 'Premium Vodka',
				category: 'liquor',
				unitType: 'bottle',
				unitCost: 25.99,
			};

			const result = newInventoryItemSchema.safeParse(validItem);
			expect(result.success).toBe(true);
		});

		it('should reject empty name', () => {
			const invalidItem = {
				venueId: 'venue-123',
				name: '',
				category: 'liquor',
				unitType: 'bottle',
				unitCost: 25.99,
			};

			const result = newInventoryItemSchema.safeParse(invalidItem);
			expect(result.success).toBe(false);
		});

		it('should reject negative unit cost', () => {
			const invalidItem = {
				venueId: 'venue-123',
				name: 'Test Item',
				category: 'food',
				unitType: 'pound',
				unitCost: -5.0,
			};

			const result = newInventoryItemSchema.safeParse(invalidItem);
			expect(result.success).toBe(false);
		});

		it('should reject zero unit cost', () => {
			const invalidItem = {
				venueId: 'venue-123',
				name: 'Test Item',
				category: 'food',
				unitType: 'pound',
				unitCost: 0,
			};

			const result = newInventoryItemSchema.safeParse(invalidItem);
			expect(result.success).toBe(false);
		});

		it('should enforce valid category', () => {
			const invalidItem = {
				venueId: 'venue-123',
				name: 'Test Item',
				category: 'invalid',
				unitType: 'bottle',
				unitCost: 10.0,
			};

			const result = newInventoryItemSchema.safeParse(invalidItem);
			expect(result.success).toBe(false);
		});

		it('should accept all valid categories', () => {
			const categories = ['liquor', 'beer', 'wine', 'food', 'supplies'] as const;

			for (const category of categories) {
				const item = {
					venueId: 'venue-123',
					name: `Test ${category}`,
					category,
					unitType: 'each',
					unitCost: 10.0,
				};

				const result = newInventoryItemSchema.safeParse(item);
				expect(result.success).toBe(true);
			}
		});

		it('should enforce valid unit type', () => {
			const invalidItem = {
				venueId: 'venue-123',
				name: 'Test Item',
				category: 'food',
				unitType: 'invalid',
				unitCost: 10.0,
			};

			const result = newInventoryItemSchema.safeParse(invalidItem);
			expect(result.success).toBe(false);
		});

		it('should accept all valid unit types', () => {
			const unitTypes = ['bottle', 'case', 'keg', 'pound', 'each', 'gallon', 'liter'] as const;

			for (const unitType of unitTypes) {
				const item = {
					venueId: 'venue-123',
					name: 'Test Item',
					category: 'food',
					unitType,
					unitCost: 10.0,
				};

				const result = newInventoryItemSchema.safeParse(item);
				expect(result.success).toBe(true);
			}
		});

		it('should reject negative stock quantities', () => {
			const invalidItem = {
				venueId: 'venue-123',
				name: 'Test Item',
				category: 'food',
				unitType: 'each',
				unitCost: 10.0,
				quantityOnHand: -5,
			};

			const result = newInventoryItemSchema.safeParse(invalidItem);
			expect(result.success).toBe(false);
		});

		it('should accept optional stock level fields', () => {
			const validItem = {
				venueId: 'venue-123',
				name: 'Test Item',
				category: 'food',
				unitType: 'each',
				unitCost: 10.0,
				quantityOnHand: 50,
				parLevel: 100,
				reorderPoint: 25,
				reorderQuantity: 75,
			};

			const result = newInventoryItemSchema.safeParse(validItem);
			expect(result.success).toBe(true);
		});

		it('should accept valid storage temperatures', () => {
			const temps = ['room', 'cooler', 'freezer'] as const;

			for (const temp of temps) {
				const item = {
					venueId: 'venue-123',
					name: 'Test Item',
					category: 'food',
					unitType: 'each',
					unitCost: 10.0,
					storageTemp: temp,
				};

				const result = newInventoryItemSchema.safeParse(item);
				expect(result.success).toBe(true);
			}
		});
	});

	describe('Inventory Transaction Schema', () => {
		it('should validate valid transaction', () => {
			const validTransaction = {
				venueId: 'venue-123',
				inventoryItemId: 'item-123',
				transactionType: 'purchase',
				quantityChange: 10,
				balanceAfter: 50,
				performedBy: 'user-123',
			};

			const result = newInventoryTransactionSchema.safeParse(validTransaction);
			expect(result.success).toBe(true);
		});

		it('should enforce valid transaction types', () => {
			const invalidTransaction = {
				venueId: 'venue-123',
				inventoryItemId: 'item-123',
				transactionType: 'invalid',
				quantityChange: 10,
				balanceAfter: 50,
				performedBy: 'user-123',
			};

			const result = newInventoryTransactionSchema.safeParse(invalidTransaction);
			expect(result.success).toBe(false);
		});

		it('should accept all valid transaction types', () => {
			const types = ['purchase', 'usage', 'adjustment', 'waste', 'transfer'] as const;

			for (const type of types) {
				const transaction = {
					venueId: 'venue-123',
					inventoryItemId: 'item-123',
					transactionType: type,
					quantityChange: type === 'purchase' ? 10 : -5,
					balanceAfter: 50,
					performedBy: 'user-123',
				};

				const result = newInventoryTransactionSchema.safeParse(transaction);
				expect(result.success).toBe(true);
			}
		});

		it('should reject zero quantity change', () => {
			const invalidTransaction = {
				venueId: 'venue-123',
				inventoryItemId: 'item-123',
				transactionType: 'adjustment',
				quantityChange: 0,
				balanceAfter: 50,
				performedBy: 'user-123',
			};

			const result = newInventoryTransactionSchema.safeParse(invalidTransaction);
			expect(result.success).toBe(false);
		});

		it('should accept negative quantity changes (usage, waste)', () => {
			const validTransaction = {
				venueId: 'venue-123',
				inventoryItemId: 'item-123',
				transactionType: 'usage',
				quantityChange: -5,
				balanceAfter: 45,
				performedBy: 'user-123',
			};

			const result = newInventoryTransactionSchema.safeParse(validTransaction);
			expect(result.success).toBe(true);
		});

		it('should reject negative balance after', () => {
			const invalidTransaction = {
				venueId: 'venue-123',
				inventoryItemId: 'item-123',
				transactionType: 'usage',
				quantityChange: -10,
				balanceAfter: -5,
				performedBy: 'user-123',
			};

			const result = newInventoryTransactionSchema.safeParse(invalidTransaction);
			expect(result.success).toBe(false);
		});
	});

	describe('Inventory Supplier Schema', () => {
		it('should validate valid supplier', () => {
			const validSupplier = {
				venueId: 'venue-123',
				name: 'ABC Beverages',
				contactName: 'John Smith',
				email: 'john@abcbev.com',
			};

			const result = newInventorySupplierSchema.safeParse(validSupplier);
			expect(result.success).toBe(true);
		});

		it('should reject invalid email format', () => {
			const invalidSupplier = {
				venueId: 'venue-123',
				name: 'ABC Beverages',
				contactName: 'John Smith',
				email: 'invalid-email',
			};

			const result = newInventorySupplierSchema.safeParse(invalidSupplier);
			expect(result.success).toBe(false);
		});

		it('should reject empty name', () => {
			const invalidSupplier = {
				venueId: 'venue-123',
				name: '',
				contactName: 'John Smith',
				email: 'john@abcbev.com',
			};

			const result = newInventorySupplierSchema.safeParse(invalidSupplier);
			expect(result.success).toBe(false);
		});

		it('should reject empty contact name', () => {
			const invalidSupplier = {
				venueId: 'venue-123',
				name: 'ABC Beverages',
				contactName: '',
				email: 'john@abcbev.com',
			};

			const result = newInventorySupplierSchema.safeParse(invalidSupplier);
			expect(result.success).toBe(false);
		});

		it('should accept optional fields', () => {
			const validSupplier = {
				venueId: 'venue-123',
				name: 'ABC Beverages',
				contactName: 'John Smith',
				email: 'john@abcbev.com',
				phone: '555-0123',
				address: '123 Main St',
				city: 'Chicago',
				state: 'IL',
				zipCode: '60601',
				accountNumber: 'ACC-12345',
				paymentTerms: 'Net 30',
				minimumOrder: 500.0,
				notes: 'Preferred supplier',
			};

			const result = newInventorySupplierSchema.safeParse(validSupplier);
			expect(result.success).toBe(true);
		});

		it('should reject negative minimum order', () => {
			const invalidSupplier = {
				venueId: 'venue-123',
				name: 'ABC Beverages',
				contactName: 'John Smith',
				email: 'john@abcbev.com',
				minimumOrder: -100,
			};

			const result = newInventorySupplierSchema.safeParse(invalidSupplier);
			expect(result.success).toBe(false);
		});
	});

	describe('Purchase Order Schema', () => {
		it('should validate valid purchase order', () => {
			const validPO = {
				venueId: 'venue-123',
				supplierId: 'supplier-123',
				orderNumber: 'PO-001',
				status: 'draft',
				orderDate: new Date(),
			};

			const result = newInventoryPurchaseOrderSchema.safeParse(validPO);
			expect(result.success).toBe(true);
		});

		it('should enforce valid status', () => {
			const invalidPO = {
				venueId: 'venue-123',
				supplierId: 'supplier-123',
				orderNumber: 'PO-001',
				status: 'invalid',
				orderDate: new Date(),
			};

			const result = newInventoryPurchaseOrderSchema.safeParse(invalidPO);
			expect(result.success).toBe(false);
		});

		it('should accept all valid statuses', () => {
			const statuses = ['draft', 'submitted', 'received', 'cancelled'] as const;

			for (const status of statuses) {
				const po = {
					venueId: 'venue-123',
					supplierId: 'supplier-123',
					orderNumber: `PO-${status}`,
					status,
					orderDate: new Date(),
				};

				const result = newInventoryPurchaseOrderSchema.safeParse(po);
				expect(result.success).toBe(true);
			}
		});

		it('should reject negative totals', () => {
			const invalidPO = {
				venueId: 'venue-123',
				supplierId: 'supplier-123',
				orderNumber: 'PO-001',
				status: 'draft',
				orderDate: new Date(),
				subtotal: -100,
			};

			const result = newInventoryPurchaseOrderSchema.safeParse(invalidPO);
			expect(result.success).toBe(false);
		});

		it('should accept valid cost fields', () => {
			const validPO = {
				venueId: 'venue-123',
				supplierId: 'supplier-123',
				orderNumber: 'PO-001',
				status: 'submitted',
				orderDate: new Date(),
				subtotal: 500.0,
				tax: 42.5,
				shippingCost: 25.0,
				total: 567.5,
			};

			const result = newInventoryPurchaseOrderSchema.safeParse(validPO);
			expect(result.success).toBe(true);
		});
	});

	describe('Purchase Order Item Schema', () => {
		it('should validate valid PO item', () => {
			const validItem = {
				purchaseOrderId: 'po-123',
				inventoryItemId: 'item-123',
				quantityOrdered: 50,
				unitCost: 10.0,
				totalCost: 500.0,
			};

			const result = newInventoryPurchaseOrderItemSchema.safeParse(validItem);
			expect(result.success).toBe(true);
		});

		it('should reject non-positive quantity ordered', () => {
			const invalidItem = {
				purchaseOrderId: 'po-123',
				inventoryItemId: 'item-123',
				quantityOrdered: 0,
				unitCost: 10.0,
				totalCost: 0,
			};

			const result = newInventoryPurchaseOrderItemSchema.safeParse(invalidItem);
			expect(result.success).toBe(false);
		});

		it('should reject negative quantity ordered', () => {
			const invalidItem = {
				purchaseOrderId: 'po-123',
				inventoryItemId: 'item-123',
				quantityOrdered: -10,
				unitCost: 10.0,
				totalCost: -100.0,
			};

			const result = newInventoryPurchaseOrderItemSchema.safeParse(invalidItem);
			expect(result.success).toBe(false);
		});

		it('should reject non-positive unit cost', () => {
			const invalidItem = {
				purchaseOrderId: 'po-123',
				inventoryItemId: 'item-123',
				quantityOrdered: 50,
				unitCost: 0,
				totalCost: 0,
			};

			const result = newInventoryPurchaseOrderItemSchema.safeParse(invalidItem);
			expect(result.success).toBe(false);
		});

		it('should accept quantity received up to quantity ordered', () => {
			const validItem = {
				purchaseOrderId: 'po-123',
				inventoryItemId: 'item-123',
				quantityOrdered: 100,
				quantityReceived: 95,
				unitCost: 10.0,
				totalCost: 1000.0,
			};

			const result = newInventoryPurchaseOrderItemSchema.safeParse(validItem);
			expect(result.success).toBe(true);
		});

		it('should reject quantity received exceeding quantity ordered', () => {
			const invalidItem = {
				purchaseOrderId: 'po-123',
				inventoryItemId: 'item-123',
				quantityOrdered: 100,
				quantityReceived: 105,
				unitCost: 10.0,
				totalCost: 1000.0,
			};

			const result = newInventoryPurchaseOrderItemSchema.safeParse(invalidItem);
			expect(result.success).toBe(false);
		});

		it('should reject quantity received exceeding quantity ordered in full schema', () => {
			const invalidItem = {
				id: 'po-item-123',
				purchaseOrderId: 'po-123',
				inventoryItemId: 'item-123',
				quantityOrdered: 100,
				quantityReceived: 105,
				unitCost: 10.0,
				totalCost: 1000.0,
				createdAt: new Date(),
			};

			const result = inventoryPurchaseOrderItemSchema.safeParse(invalidItem);
			expect(result.success).toBe(false);
		});

		it('should accept valid quantity received in full schema', () => {
			const validItem = {
				id: 'po-item-123',
				purchaseOrderId: 'po-123',
				inventoryItemId: 'item-123',
				quantityOrdered: 100,
				quantityReceived: 95,
				unitCost: 10.0,
				totalCost: 1000.0,
				createdAt: new Date(),
			};

			const result = inventoryPurchaseOrderItemSchema.safeParse(validItem);
			expect(result.success).toBe(true);
		});
	});
});
