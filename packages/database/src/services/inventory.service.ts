import { createId } from '@paralleldrive/cuid2';
import { and, desc, eq, lte, sql } from 'drizzle-orm';
import type { Database } from '../client';
import * as schema from '../schema';

/**
 * Inventory Service
 * Handles all inventory-related operations including items, stock levels,
 * suppliers, and purchase orders
 */
export class InventoryService {
	constructor(private db: Database) {}

	// ===== Inventory Item Management =====

	async createItem(input: {
		venueId: string;
		name: string;
		sku?: string;
		barcode?: string;
		category: 'liquor' | 'beer' | 'wine' | 'food' | 'supplies';
		subcategory?: string;
		unitType: 'bottle' | 'case' | 'keg' | 'pound' | 'each' | 'gallon' | 'liter';
		unitSize?: number;
		unitSizeUom?: string;
		unitsPerCase?: number;
		quantityOnHand?: number;
		parLevel?: number;
		reorderPoint?: number;
		reorderQuantity?: number;
		unitCost: number;
		caseCost?: number;
		lastCost?: number;
		averageCost?: number;
		primaryVendor?: string;
		vendorItemCode?: string;
		storageLocation?: string;
		storageTemp?: 'room' | 'cooler' | 'freezer';
	}) {
		const [item] = await this.db
			.insert(schema.inventoryItems)
			.values({
				id: createId(),
				venueId: input.venueId,
				name: input.name,
				sku: input.sku,
				barcode: input.barcode,
				category: input.category,
				subcategory: input.subcategory,
				unitType: input.unitType,
				unitSize: input.unitSize,
				unitSizeUom: input.unitSizeUom,
				unitsPerCase: input.unitsPerCase,
				quantityOnHand: input.quantityOnHand ?? 0,
				parLevel: input.parLevel,
				reorderPoint: input.reorderPoint,
				reorderQuantity: input.reorderQuantity,
				unitCost: input.unitCost,
				caseCost: input.caseCost,
				lastCost: input.lastCost,
				averageCost: input.averageCost,
				primaryVendor: input.primaryVendor,
				vendorItemCode: input.vendorItemCode,
				storageLocation: input.storageLocation,
				storageTemp: input.storageTemp,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		return item;
	}

	async getItemById(itemId: string) {
		const [item] = await this.db
			.select()
			.from(schema.inventoryItems)
			.where(eq(schema.inventoryItems.id, itemId))
			.limit(1);

		return item || null;
	}

	async listItems(
		venueId: string,
		options?: {
			category?: 'liquor' | 'beer' | 'wine' | 'food' | 'supplies';
		}
	) {
		const conditions = [eq(schema.inventoryItems.venueId, venueId)];

		if (options?.category) {
			conditions.push(eq(schema.inventoryItems.category, options.category));
		}

		return await this.db
			.select()
			.from(schema.inventoryItems)
			.where(and(...conditions))
			.orderBy(schema.inventoryItems.name);
	}

	async getLowStockItems(venueId: string) {
		return await this.db
			.select()
			.from(schema.inventoryItems)
			.where(
				and(
					eq(schema.inventoryItems.venueId, venueId),
					sql`${schema.inventoryItems.reorderPoint} IS NOT NULL`,
					lte(schema.inventoryItems.quantityOnHand, schema.inventoryItems.reorderPoint)
				)
			)
			.orderBy(schema.inventoryItems.name);
	}

	async updateItem(
		itemId: string,
		updates: {
			name?: string;
			sku?: string;
			barcode?: string;
			category?: 'liquor' | 'beer' | 'wine' | 'food' | 'supplies';
			subcategory?: string;
			unitType?: 'bottle' | 'case' | 'keg' | 'pound' | 'each' | 'gallon' | 'liter';
			unitSize?: number;
			unitSizeUom?: string;
			unitsPerCase?: number;
			parLevel?: number;
			reorderPoint?: number;
			reorderQuantity?: number;
			unitCost?: number;
			caseCost?: number;
			lastCost?: number;
			averageCost?: number;
			primaryVendor?: string;
			vendorItemCode?: string;
			storageLocation?: string;
			storageTemp?: 'room' | 'cooler' | 'freezer';
		}
	) {
		const [updated] = await this.db
			.update(schema.inventoryItems)
			.set({
				...updates,
				updatedAt: new Date(),
			})
			.where(eq(schema.inventoryItems.id, itemId))
			.returning();

		return updated;
	}

	async deleteItem(itemId: string) {
		await this.db.delete(schema.inventoryItems).where(eq(schema.inventoryItems.id, itemId));
	}

	// ===== Stock Level Management =====

	async adjustStock(input: {
		inventoryItemId: string;
		venueId: string;
		quantityChange: number;
		transactionType: 'purchase' | 'usage' | 'adjustment' | 'waste' | 'transfer';
		performedBy: string;
		referenceType?: string;
		referenceId?: string;
		reason?: string;
		unitCostAtTime?: number;
	}) {
		// Get current item
		const item = await this.getItemById(input.inventoryItemId);
		if (!item) {
			throw new Error('Inventory item not found');
		}

		// Calculate new balance
		const balanceAfter = item.quantityOnHand + input.quantityChange;

		// Prevent negative stock
		if (balanceAfter < 0) {
			throw new Error('Insufficient stock');
		}

		// Create transaction record
		const [transaction] = await this.db
			.insert(schema.inventoryTransactions)
			.values({
				id: createId(),
				venueId: input.venueId,
				inventoryItemId: input.inventoryItemId,
				transactionType: input.transactionType,
				quantityChange: input.quantityChange,
				balanceAfter,
				referenceType: input.referenceType,
				referenceId: input.referenceId,
				reason: input.reason,
				unitCostAtTime: input.unitCostAtTime,
				performedBy: input.performedBy,
				createdAt: new Date(),
			})
			.returning();

		// Update item quantity
		const [updatedItem] = await this.db
			.update(schema.inventoryItems)
			.set({
				quantityOnHand: balanceAfter,
				lastCost: input.unitCostAtTime ?? item.lastCost,
				updatedAt: new Date(),
			})
			.where(eq(schema.inventoryItems.id, input.inventoryItemId))
			.returning();

		return {
			transaction,
			updatedItem,
		};
	}

	async getTransactionHistory(inventoryItemId: string) {
		return await this.db
			.select()
			.from(schema.inventoryTransactions)
			.where(eq(schema.inventoryTransactions.inventoryItemId, inventoryItemId))
			.orderBy(desc(schema.inventoryTransactions.createdAt));
	}

	// ===== Supplier Management =====

	async createSupplier(input: {
		venueId: string;
		name: string;
		contactName: string;
		email: string;
		phone?: string;
		address?: string;
		city?: string;
		state?: string;
		zipCode?: string;
		accountNumber?: string;
		paymentTerms?: string;
		minimumOrder?: number;
		deliveryDays?: string;
		isActive?: boolean;
		notes?: string;
	}) {
		const [supplier] = await this.db
			.insert(schema.inventorySuppliers)
			.values({
				id: createId(),
				venueId: input.venueId,
				name: input.name,
				contactName: input.contactName,
				email: input.email,
				phone: input.phone,
				address: input.address,
				city: input.city,
				state: input.state,
				zipCode: input.zipCode,
				accountNumber: input.accountNumber,
				paymentTerms: input.paymentTerms,
				minimumOrder: input.minimumOrder,
				deliveryDays: input.deliveryDays,
				isActive: input.isActive ?? true,
				notes: input.notes,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		return supplier;
	}

	async listSuppliers(venueId: string, options?: { includeInactive?: boolean }) {
		const conditions = [eq(schema.inventorySuppliers.venueId, venueId)];

		if (!options?.includeInactive) {
			conditions.push(eq(schema.inventorySuppliers.isActive, true));
		}

		return await this.db
			.select()
			.from(schema.inventorySuppliers)
			.where(and(...conditions))
			.orderBy(schema.inventorySuppliers.name);
	}

	async updateSupplier(
		supplierId: string,
		updates: {
			name?: string;
			contactName?: string;
			email?: string;
			phone?: string;
			address?: string;
			city?: string;
			state?: string;
			zipCode?: string;
			accountNumber?: string;
			paymentTerms?: string;
			minimumOrder?: number;
			deliveryDays?: string;
			isActive?: boolean;
			notes?: string;
		}
	) {
		const [updated] = await this.db
			.update(schema.inventorySuppliers)
			.set({
				...updates,
				updatedAt: new Date(),
			})
			.where(eq(schema.inventorySuppliers.id, supplierId))
			.returning();

		return updated;
	}

	// ===== Purchase Order Management =====

	async createPurchaseOrder(input: {
		venueId: string;
		supplierId: string;
		orderNumber: string;
		orderDate: Date;
		expectedDeliveryDate?: Date;
		notes?: string;
	}) {
		const [po] = await this.db
			.insert(schema.inventoryPurchaseOrders)
			.values({
				id: createId(),
				venueId: input.venueId,
				supplierId: input.supplierId,
				orderNumber: input.orderNumber,
				status: 'draft',
				orderDate: input.orderDate,
				expectedDeliveryDate: input.expectedDeliveryDate,
				subtotal: 0,
				tax: 0,
				shippingCost: 0,
				total: 0,
				notes: input.notes,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		return po;
	}

	async getPurchaseOrderById(purchaseOrderId: string) {
		const [po] = await this.db
			.select()
			.from(schema.inventoryPurchaseOrders)
			.where(eq(schema.inventoryPurchaseOrders.id, purchaseOrderId))
			.limit(1);

		return po || null;
	}

	async addPurchaseOrderItem(input: {
		purchaseOrderId: string;
		inventoryItemId: string;
		quantityOrdered: number;
		unitCost: number;
		notes?: string;
	}) {
		const totalCost = input.quantityOrdered * input.unitCost;

		// Add item to PO
		const [poItem] = await this.db
			.insert(schema.inventoryPurchaseOrderItems)
			.values({
				id: createId(),
				purchaseOrderId: input.purchaseOrderId,
				inventoryItemId: input.inventoryItemId,
				quantityOrdered: input.quantityOrdered,
				quantityReceived: 0,
				unitCost: input.unitCost,
				totalCost,
				notes: input.notes,
				createdAt: new Date(),
			})
			.returning();

		// Update PO totals
		await this.updatePurchaseOrderTotals(input.purchaseOrderId);

		return poItem;
	}

	private async updatePurchaseOrderTotals(purchaseOrderId: string) {
		// Get all items for this PO
		const items = await this.db
			.select()
			.from(schema.inventoryPurchaseOrderItems)
			.where(eq(schema.inventoryPurchaseOrderItems.purchaseOrderId, purchaseOrderId));

		const subtotal = items.reduce((sum, item) => sum + item.totalCost, 0);

		// Get current PO
		const po = await this.getPurchaseOrderById(purchaseOrderId);
		if (!po) throw new Error('Purchase order not found');

		const total = subtotal + po.tax + po.shippingCost;

		// Update PO
		await this.db
			.update(schema.inventoryPurchaseOrders)
			.set({
				subtotal,
				total,
				updatedAt: new Date(),
			})
			.where(eq(schema.inventoryPurchaseOrders.id, purchaseOrderId));
	}

	async submitPurchaseOrder(purchaseOrderId: string) {
		// Get PO items count
		const items = await this.db
			.select()
			.from(schema.inventoryPurchaseOrderItems)
			.where(eq(schema.inventoryPurchaseOrderItems.purchaseOrderId, purchaseOrderId));

		if (items.length === 0) {
			throw new Error('Cannot submit purchase order with no items');
		}

		const [updated] = await this.db
			.update(schema.inventoryPurchaseOrders)
			.set({
				status: 'submitted',
				updatedAt: new Date(),
			})
			.where(eq(schema.inventoryPurchaseOrders.id, purchaseOrderId))
			.returning();

		return updated;
	}

	async receivePurchaseOrder(input: {
		purchaseOrderId: string;
		receivedBy: string;
		actualDeliveryDate: Date;
		receivedQuantities?: Array<{
			inventoryItemId: string;
			quantityReceived: number;
		}>;
	}) {
		// Get PO with venueId first
		const po = await this.getPurchaseOrderById(input.purchaseOrderId);
		if (!po) throw new Error('Purchase order not found');

		// Get PO items
		const items = await this.db
			.select()
			.from(schema.inventoryPurchaseOrderItems)
			.where(eq(schema.inventoryPurchaseOrderItems.purchaseOrderId, input.purchaseOrderId));

		// Process each item
		for (const item of items) {
			// Determine quantity received (full order or partial)
			const receivedQty = input.receivedQuantities
				? (input.receivedQuantities.find(rq => rq.inventoryItemId === item.inventoryItemId)
						?.quantityReceived ?? item.quantityOrdered)
				: item.quantityOrdered;

			// Update PO item
			await this.db
				.update(schema.inventoryPurchaseOrderItems)
				.set({
					quantityReceived: receivedQty,
				})
				.where(eq(schema.inventoryPurchaseOrderItems.id, item.id));

			// Update inventory stock
			await this.adjustStock({
				inventoryItemId: item.inventoryItemId,
				venueId: po.venueId,
				quantityChange: receivedQty,
				transactionType: 'purchase',
				performedBy: input.receivedBy,
				referenceType: 'purchase_order',
				referenceId: input.purchaseOrderId,
				unitCostAtTime: item.unitCost,
			});
		}

		// Update PO status
		const [updated] = await this.db
			.update(schema.inventoryPurchaseOrders)
			.set({
				status: 'received',
				receivedBy: input.receivedBy,
				actualDeliveryDate: input.actualDeliveryDate,
				updatedAt: new Date(),
			})
			.where(eq(schema.inventoryPurchaseOrders.id, input.purchaseOrderId))
			.returning();

		return updated;
	}

	async cancelPurchaseOrder(purchaseOrderId: string) {
		// Get current PO
		const po = await this.getPurchaseOrderById(purchaseOrderId);
		if (!po) throw new Error('Purchase order not found');

		if (po.status === 'received') {
			throw new Error('Cannot cancel received purchase order');
		}

		const [updated] = await this.db
			.update(schema.inventoryPurchaseOrders)
			.set({
				status: 'cancelled',
				updatedAt: new Date(),
			})
			.where(eq(schema.inventoryPurchaseOrders.id, purchaseOrderId))
			.returning();

		return updated;
	}
}
