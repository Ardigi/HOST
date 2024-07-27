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

		it('should reject empty name with specific error', () => {
			const invalidItem = {
				venueId: 'venue-123',
				name: '',
				category: 'liquor',
				unitType: 'bottle',
				unitCost: 25.99,
			};

			const result = newInventoryItemSchema.safeParse(invalidItem);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['name']);
				expect(result.error.issues[0].message).toMatch(/string must contain at least 1 character/i);
			}
		});

		it('should reject negative unit cost with specific error', () => {
			const invalidItem = {
				venueId: 'venue-123',
				name: 'Test Item',
				category: 'food',
				unitType: 'pound',
				unitCost: -5.0,
			};

			const result = newInventoryItemSchema.safeParse(invalidItem);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['unitCost']);
				expect(result.error.issues[0].message).toMatch(/unit cost must be greater than zero/i);
			}
		});

		it('should reject zero unit cost with specific error', () => {
			const invalidItem = {
				venueId: 'venue-123',
				name: 'Test Item',
				category: 'food',
				unitType: 'pound',
				unitCost: 0,
			};

			const result = newInventoryItemSchema.safeParse(invalidItem);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['unitCost']);
				expect(result.error.issues[0].message).toMatch(/unit cost must be greater than zero/i);
			}
		});

		it('should enforce valid category with specific error', () => {
			const invalidItem = {
				venueId: 'venue-123',
				name: 'Test Item',
				category: 'invalid',
				unitType: 'bottle',
				unitCost: 10.0,
			};

			const result = newInventoryItemSchema.safeParse(invalidItem);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['category']);
				expect(result.error.issues[0].message).toMatch(/invalid.*enum/i);
			}
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

		it('should enforce valid unit type with specific error', () => {
			const invalidItem = {
				venueId: 'venue-123',
				name: 'Test Item',
				category: 'food',
				unitType: 'invalid',
				unitCost: 10.0,
			};

			const result = newInventoryItemSchema.safeParse(invalidItem);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['unitType']);
				expect(result.error.issues[0].message).toMatch(/invalid.*enum/i);
			}
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

		it('should reject negative stock quantities with specific error', () => {
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
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['quantityOnHand']);
				expect(result.error.issues[0].message).toMatch(/must be greater than or equal to 0/i);
			}
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

		it('should enforce valid transaction types with specific error', () => {
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
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['transactionType']);
				expect(result.error.issues[0].message).toMatch(/invalid.*enum/i);
			}
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

		it('should reject zero quantity change with specific error', () => {
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
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['quantityChange']);
				expect(result.error.issues[0].message).toMatch(/quantity change cannot be zero/i);
			}
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

		it('should reject negative balance after with specific error', () => {
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
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['balanceAfter']);
				expect(result.error.issues[0].message).toMatch(/balance after cannot be negative/i);
			}
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

		it('should reject invalid email format with specific error', () => {
			const invalidSupplier = {
				venueId: 'venue-123',
				name: 'ABC Beverages',
				contactName: 'John Smith',
				email: 'invalid-email',
			};

			const result = newInventorySupplierSchema.safeParse(invalidSupplier);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['email']);
				expect(result.error.issues[0].message).toMatch(/invalid.*email/i);
			}
		});

		it('should reject empty name with specific error', () => {
			const invalidSupplier = {
				venueId: 'venue-123',
				name: '',
				contactName: 'John Smith',
				email: 'john@abcbev.com',
			};

			const result = newInventorySupplierSchema.safeParse(invalidSupplier);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['name']);
				expect(result.error.issues[0].message).toMatch(/string must contain at least 1 character/i);
			}
		});

		it('should reject empty contact name with specific error', () => {
			const invalidSupplier = {
				venueId: 'venue-123',
				name: 'ABC Beverages',
				contactName: '',
				email: 'john@abcbev.com',
			};

			const result = newInventorySupplierSchema.safeParse(invalidSupplier);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['contactName']);
				expect(result.error.issues[0].message).toMatch(/string must contain at least 1 character/i);
			}
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

		it('should reject negative minimum order with specific error', () => {
			const invalidSupplier = {
				venueId: 'venue-123',
				name: 'ABC Beverages',
				contactName: 'John Smith',
				email: 'john@abcbev.com',
				minimumOrder: -100,
			};

			const result = newInventorySupplierSchema.safeParse(invalidSupplier);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['minimumOrder']);
				expect(result.error.issues[0].message).toMatch(/must be greater than or equal to 0/i);
			}
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

		it('should enforce valid status with specific error', () => {
			const invalidPO = {
				venueId: 'venue-123',
				supplierId: 'supplier-123',
				orderNumber: 'PO-001',
				status: 'invalid',
				orderDate: new Date(),
			};

			const result = newInventoryPurchaseOrderSchema.safeParse(invalidPO);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['status']);
				expect(result.error.issues[0].message).toMatch(/invalid.*enum/i);
			}
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

		it('should reject negative totals with specific error', () => {
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
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['subtotal']);
				expect(result.error.issues[0].message).toMatch(/must be greater than or equal to 0/i);
			}
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

		it('should reject non-positive quantity ordered with specific error', () => {
			const invalidItem = {
				purchaseOrderId: 'po-123',
				inventoryItemId: 'item-123',
				quantityOrdered: 0,
				unitCost: 10.0,
				totalCost: 0,
			};

			const result = newInventoryPurchaseOrderItemSchema.safeParse(invalidItem);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['quantityOrdered']);
				expect(result.error.issues[0].message).toMatch(
					/quantity ordered must be greater than zero/i
				);
			}
		});

		it('should reject negative quantity ordered with specific error', () => {
			const invalidItem = {
				purchaseOrderId: 'po-123',
				inventoryItemId: 'item-123',
				quantityOrdered: -10,
				unitCost: 10.0,
				totalCost: -100.0,
			};

			const result = newInventoryPurchaseOrderItemSchema.safeParse(invalidItem);
			expect(result.success).toBe(false);
			if (!result.success) {
				// May have 2 errors: too_small (generic) AND custom positive() validation
				expect(result.error.issues.length).toBeGreaterThanOrEqual(1);
				const quantityError = result.error.issues.find(
					issue => issue.path[0] === 'quantityOrdered'
				);
				expect(quantityError).toBeDefined();
				expect(quantityError?.message).toMatch(/quantity ordered must be greater than zero/i);
			}
		});

		it('should reject non-positive unit cost with specific error', () => {
			const invalidItem = {
				purchaseOrderId: 'po-123',
				inventoryItemId: 'item-123',
				quantityOrdered: 50,
				unitCost: 0,
				totalCost: 0,
			};

			const result = newInventoryPurchaseOrderItemSchema.safeParse(invalidItem);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['unitCost']);
				expect(result.error.issues[0].message).toMatch(/unit cost must be greater than zero/i);
			}
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

		it('should reject quantity received exceeding quantity ordered with specific error', () => {
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
			if (!result.success) {
				expect(result.error.issues.length).toBeGreaterThanOrEqual(1);
				const refineError = result.error.issues.find(
					issue => issue.code === 'custom' || issue.path[0] === 'quantityReceived'
				);
				expect(refineError).toBeDefined();
				expect(refineError?.message).toMatch(/quantity received cannot exceed quantity ordered/i);
			}
		});

		it('should reject quantity received exceeding quantity ordered in full schema with specific error', () => {
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
			if (!result.success) {
				expect(result.error.issues.length).toBeGreaterThanOrEqual(1);
				const refineError = result.error.issues.find(
					issue => issue.code === 'custom' || issue.path[0] === 'quantityReceived'
				);
				expect(refineError).toBeDefined();
				expect(refineError?.message).toMatch(/quantity received cannot exceed quantity ordered/i);
			}
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
