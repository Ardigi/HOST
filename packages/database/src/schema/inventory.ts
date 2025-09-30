import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { venues } from './venues';

/**
 * Inventory Items table
 * Tracks bar/restaurant inventory (liquor, beer, wine, food, supplies)
 */
export const inventoryItems = sqliteTable('inventory_items', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	venueId: text('venue_id')
		.notNull()
		.references(() => venues.id, { onDelete: 'cascade' }),

	// Basic Info
	name: text('name').notNull(),
	sku: text('sku'),
	barcode: text('barcode'),
	category: text('category', { enum: ['liquor', 'beer', 'wine', 'food', 'supplies'] }).notNull(),
	subcategory: text('subcategory'),

	// Units - Important for bars (bottles, kegs, cases, etc.)
	unitType: text('unit_type', {
		enum: ['bottle', 'case', 'keg', 'pound', 'each', 'gallon', 'liter'],
	}).notNull(),
	unitSize: real('unit_size'), // e.g., 750 ml, 30 lb, etc.
	unitSizeUom: text('unit_size_uom'), // ml, oz, lb, kg
	unitsPerCase: integer('units_per_case'),

	// Stock Levels - Critical for bar operations
	quantityOnHand: real('quantity_on_hand').notNull().default(0),
	parLevel: real('par_level'), // Target stock level
	reorderPoint: real('reorder_point'), // When to reorder
	reorderQuantity: real('reorder_quantity'), // How much to order

	// Costs - Essential for pour cost tracking
	unitCost: real('unit_cost').notNull(),
	caseCost: real('case_cost'),
	lastCost: real('last_cost'),
	averageCost: real('average_cost'),

	// Supplier Info
	primaryVendor: text('primary_vendor'),
	vendorItemCode: text('vendor_item_code'),

	// Storage - Important for bars (cooler, freezer, room temp)
	storageLocation: text('storage_location'),
	storageTemp: text('storage_temp', { enum: ['room', 'cooler', 'freezer'] }),

	// Metadata
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdateFn(() => new Date()),
});

/**
 * Inventory Transactions table
 * Tracks all stock movements (purchases, usage/pours, adjustments, waste/spillage)
 */
export const inventoryTransactions = sqliteTable('inventory_transactions', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	venueId: text('venue_id')
		.notNull()
		.references(() => venues.id, { onDelete: 'cascade' }),
	inventoryItemId: text('inventory_item_id')
		.notNull()
		.references(() => inventoryItems.id, { onDelete: 'cascade' }),

	// Transaction Details
	transactionType: text('transaction_type', {
		enum: ['purchase', 'usage', 'adjustment', 'waste', 'transfer'],
	}).notNull(),
	quantityChange: real('quantity_change').notNull(), // Positive for additions, negative for usage/waste
	balanceAfter: real('balance_after').notNull(),

	// Reference Information
	referenceType: text('reference_type'), // purchase_order, order, inventory_count
	referenceId: text('reference_id'),
	reason: text('reason'), // e.g., "spillage", "inventory count", "order #123"

	// Cost Tracking
	unitCostAtTime: real('unit_cost_at_time'), // Cost at time of transaction

	// Audit Trail
	performedBy: text('performed_by').notNull(), // user_id

	// Metadata
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
});

/**
 * Inventory Suppliers table
 * Manages supplier/vendor information for ordering
 */
export const inventorySuppliers = sqliteTable('inventory_suppliers', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	venueId: text('venue_id')
		.notNull()
		.references(() => venues.id, { onDelete: 'cascade' }),

	// Basic Info
	name: text('name').notNull(),
	contactName: text('contact_name').notNull(),
	email: text('email').notNull(),
	phone: text('phone'),

	// Address
	address: text('address'),
	city: text('city'),
	state: text('state'),
	zipCode: text('zip_code'),

	// Business Info
	accountNumber: text('account_number'),
	paymentTerms: text('payment_terms'), // e.g., "Net 30", "COD"
	minimumOrder: real('minimum_order'),
	deliveryDays: text('delivery_days'), // JSON: ["monday", "friday"]

	// Status
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	notes: text('notes'),

	// Metadata
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdateFn(() => new Date()),
});

/**
 * Inventory Purchase Orders table
 * Tracks purchase orders to suppliers
 */
export const inventoryPurchaseOrders = sqliteTable('inventory_purchase_orders', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	venueId: text('venue_id')
		.notNull()
		.references(() => venues.id, { onDelete: 'cascade' }),
	supplierId: text('supplier_id')
		.notNull()
		.references(() => inventorySuppliers.id),

	// Order Details
	orderNumber: text('order_number').notNull(),
	status: text('status', { enum: ['draft', 'submitted', 'received', 'cancelled'] })
		.notNull()
		.default('draft'),

	// Dates
	orderDate: integer('order_date', { mode: 'timestamp' }).notNull(),
	expectedDeliveryDate: integer('expected_delivery_date', { mode: 'timestamp' }),
	actualDeliveryDate: integer('actual_delivery_date', { mode: 'timestamp' }),

	// Totals
	subtotal: real('subtotal').notNull().default(0),
	tax: real('tax').notNull().default(0),
	shippingCost: real('shipping_cost').notNull().default(0),
	total: real('total').notNull().default(0),

	// Notes
	notes: text('notes'),
	receivedBy: text('received_by'), // user_id

	// Metadata
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdateFn(() => new Date()),
});

/**
 * Inventory Purchase Order Items table
 * Line items in purchase orders
 */
export const inventoryPurchaseOrderItems = sqliteTable('inventory_purchase_order_items', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	purchaseOrderId: text('purchase_order_id')
		.notNull()
		.references(() => inventoryPurchaseOrders.id, { onDelete: 'cascade' }),
	inventoryItemId: text('inventory_item_id')
		.notNull()
		.references(() => inventoryItems.id),

	// Quantities
	quantityOrdered: real('quantity_ordered').notNull(),
	quantityReceived: real('quantity_received').notNull().default(0),

	// Costs
	unitCost: real('unit_cost').notNull(),
	totalCost: real('total_cost').notNull(),

	// Notes
	notes: text('notes'),

	// Metadata
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
});

/**
 * Define relations between tables
 */
export const inventoryItemsRelations = relations(inventoryItems, ({ one, many }) => ({
	venue: one(venues, {
		fields: [inventoryItems.venueId],
		references: [venues.id],
	}),
	transactions: many(inventoryTransactions),
	purchaseOrderItems: many(inventoryPurchaseOrderItems),
}));

export const inventoryTransactionsRelations = relations(inventoryTransactions, ({ one }) => ({
	venue: one(venues, {
		fields: [inventoryTransactions.venueId],
		references: [venues.id],
	}),
	inventoryItem: one(inventoryItems, {
		fields: [inventoryTransactions.inventoryItemId],
		references: [inventoryItems.id],
	}),
}));

export const inventorySuppliersRelations = relations(inventorySuppliers, ({ one, many }) => ({
	venue: one(venues, {
		fields: [inventorySuppliers.venueId],
		references: [venues.id],
	}),
	purchaseOrders: many(inventoryPurchaseOrders),
}));

export const inventoryPurchaseOrdersRelations = relations(
	inventoryPurchaseOrders,
	({ one, many }) => ({
		venue: one(venues, {
			fields: [inventoryPurchaseOrders.venueId],
			references: [venues.id],
		}),
		supplier: one(inventorySuppliers, {
			fields: [inventoryPurchaseOrders.supplierId],
			references: [inventorySuppliers.id],
		}),
		items: many(inventoryPurchaseOrderItems),
	})
);

export const inventoryPurchaseOrderItemsRelations = relations(
	inventoryPurchaseOrderItems,
	({ one }) => ({
		purchaseOrder: one(inventoryPurchaseOrders, {
			fields: [inventoryPurchaseOrderItems.purchaseOrderId],
			references: [inventoryPurchaseOrders.id],
		}),
		inventoryItem: one(inventoryItems, {
			fields: [inventoryPurchaseOrderItems.inventoryItemId],
			references: [inventoryItems.id],
		}),
	})
);

/**
 * Type exports for use in application
 */
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type NewInventoryItem = typeof inventoryItems.$inferInsert;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type NewInventoryTransaction = typeof inventoryTransactions.$inferInsert;
export type InventorySupplier = typeof inventorySuppliers.$inferSelect;
export type NewInventorySupplier = typeof inventorySuppliers.$inferInsert;
export type InventoryPurchaseOrder = typeof inventoryPurchaseOrders.$inferSelect;
export type NewInventoryPurchaseOrder = typeof inventoryPurchaseOrders.$inferInsert;
export type InventoryPurchaseOrderItem = typeof inventoryPurchaseOrderItems.$inferSelect;
export type NewInventoryPurchaseOrderItem = typeof inventoryPurchaseOrderItems.$inferInsert;
