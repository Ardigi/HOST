/**
 * Inventory Validation Schemas
 * Runtime validation for inventory entities using Zod
 */

import { z } from 'zod';

/**
 * Inventory Item Schemas
 */
export const newInventoryItemSchema = z.object({
	venueId: z.string().min(1),
	name: z.string().min(1),
	sku: z.string().optional(),
	barcode: z.string().optional(),
	category: z.enum(['liquor', 'beer', 'wine', 'food', 'supplies']),
	subcategory: z.string().optional(),

	// Units
	unitType: z.enum(['bottle', 'case', 'keg', 'pound', 'each', 'gallon', 'liter']),
	unitSize: z.number().positive().optional(),
	unitSizeUom: z.string().optional(),
	unitsPerCase: z.number().int().positive().optional(),

	// Stock Levels
	quantityOnHand: z.number().min(0).optional(),
	parLevel: z.number().positive().optional(),
	reorderPoint: z.number().positive().optional(),
	reorderQuantity: z.number().positive().optional(),

	// Costs
	unitCost: z.number().positive('Unit cost must be greater than zero'),
	caseCost: z.number().positive().optional(),
	lastCost: z.number().positive().optional(),
	averageCost: z.number().positive().optional(),

	// Supplier
	primaryVendor: z.string().optional(),
	vendorItemCode: z.string().optional(),

	// Storage
	storageLocation: z.string().optional(),
	storageTemp: z.enum(['room', 'cooler', 'freezer']).optional(),
});

export const inventoryItemSchema = newInventoryItemSchema.extend({
	id: z.string().min(1),
	createdAt: z.date(),
	updatedAt: z.date(),
});

/**
 * Inventory Transaction Schemas
 */
export const newInventoryTransactionSchema = z.object({
	venueId: z.string().min(1),
	inventoryItemId: z.string().min(1),
	transactionType: z.enum(['purchase', 'usage', 'adjustment', 'waste', 'transfer']),
	quantityChange: z.number().refine(val => val !== 0, {
		message: 'Quantity change cannot be zero',
	}),
	balanceAfter: z.number().min(0, 'Balance after cannot be negative'),
	referenceType: z.string().optional(),
	referenceId: z.string().optional(),
	reason: z.string().optional(),
	unitCostAtTime: z.number().positive().optional(),
	performedBy: z.string().min(1),
});

export const inventoryTransactionSchema = newInventoryTransactionSchema.extend({
	id: z.string().min(1),
	createdAt: z.date(),
});

/**
 * Inventory Supplier Schemas
 */
export const newInventorySupplierSchema = z.object({
	venueId: z.string().min(1),
	name: z.string().min(1),
	contactName: z.string().min(1),
	email: z.string().email(),
	phone: z.string().optional(),

	// Address
	address: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	zipCode: z.string().optional(),

	// Business Info
	accountNumber: z.string().optional(),
	paymentTerms: z.string().optional(),
	minimumOrder: z.number().min(0).optional(),
	deliveryDays: z.string().optional(), // JSON string

	// Status
	isActive: z.boolean().optional(),
	notes: z.string().optional(),
});

export const inventorySupplierSchema = newInventorySupplierSchema.extend({
	id: z.string().min(1),
	isActive: z.boolean(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

/**
 * Purchase Order Schemas
 */
export const newInventoryPurchaseOrderSchema = z.object({
	venueId: z.string().min(1),
	supplierId: z.string().min(1),
	orderNumber: z.string().min(1),
	status: z.enum(['draft', 'submitted', 'received', 'cancelled']).optional(),
	orderDate: z.date(),
	expectedDeliveryDate: z.date().optional(),
	actualDeliveryDate: z.date().optional(),

	// Totals
	subtotal: z.number().min(0).optional(),
	tax: z.number().min(0).optional(),
	shippingCost: z.number().min(0).optional(),
	total: z.number().min(0).optional(),

	// Notes
	notes: z.string().optional(),
	receivedBy: z.string().optional(),
});

export const inventoryPurchaseOrderSchema = newInventoryPurchaseOrderSchema.extend({
	id: z.string().min(1),
	status: z.enum(['draft', 'submitted', 'received', 'cancelled']),
	subtotal: z.number().min(0),
	tax: z.number().min(0),
	shippingCost: z.number().min(0),
	total: z.number().min(0),
	createdAt: z.date(),
	updatedAt: z.date(),
});

/**
 * Purchase Order Item Schemas
 */
const purchaseOrderItemBaseSchema = z.object({
	purchaseOrderId: z.string().min(1),
	inventoryItemId: z.string().min(1),
	quantityOrdered: z.number().positive('Quantity ordered must be greater than zero'),
	quantityReceived: z.number().min(0).optional(),
	unitCost: z.number().positive('Unit cost must be greater than zero'),
	totalCost: z.number().min(0),
	notes: z.string().optional(),
});

export const newInventoryPurchaseOrderItemSchema = purchaseOrderItemBaseSchema.refine(
	data => {
		// Quantity received should not exceed quantity ordered
		if (data.quantityReceived !== undefined) {
			return data.quantityReceived <= data.quantityOrdered;
		}
		return true;
	},
	{
		message: 'Quantity received cannot exceed quantity ordered',
		path: ['quantityReceived'],
	}
);

export const inventoryPurchaseOrderItemSchema = purchaseOrderItemBaseSchema
	.extend({
		id: z.string().min(1),
		quantityReceived: z.number().min(0),
		createdAt: z.date(),
	})
	.refine(
		data => {
			// Quantity received should not exceed quantity ordered
			return data.quantityReceived <= data.quantityOrdered;
		},
		{
			message: 'Quantity received cannot exceed quantity ordered',
			path: ['quantityReceived'],
		}
	);

/**
 * Type exports
 */
export type NewInventoryItem = z.infer<typeof newInventoryItemSchema>;
export type InventoryItem = z.infer<typeof inventoryItemSchema>;
export type NewInventoryTransaction = z.infer<typeof newInventoryTransactionSchema>;
export type InventoryTransaction = z.infer<typeof inventoryTransactionSchema>;
export type NewInventorySupplier = z.infer<typeof newInventorySupplierSchema>;
export type InventorySupplier = z.infer<typeof inventorySupplierSchema>;
export type NewInventoryPurchaseOrder = z.infer<typeof newInventoryPurchaseOrderSchema>;
export type InventoryPurchaseOrder = z.infer<typeof inventoryPurchaseOrderSchema>;
export type NewInventoryPurchaseOrderItem = z.infer<typeof newInventoryPurchaseOrderItemSchema>;
export type InventoryPurchaseOrderItem = z.infer<typeof inventoryPurchaseOrderItemSchema>;
