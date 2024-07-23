import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Database } from '../client';
import * as schema from '../schema';
import { InventoryService } from './inventory.service';

describe('InventoryService - TDD', () => {
	let db: Database;
	let service: InventoryService;
	let venueId: string;

	beforeEach(async () => {
		// Create fresh in-memory database
		const client = createClient({ url: ':memory:' });
		db = drizzle(client, { schema }) as Database;

		await client.execute('PRAGMA foreign_keys = ON');

		// Create test tables
		await client.execute(`
			CREATE TABLE venues (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				slug TEXT NOT NULL UNIQUE,
				email TEXT NOT NULL,
				phone TEXT,
				address TEXT,
				city TEXT,
				state TEXT,
				zip_code TEXT,
				country TEXT DEFAULT 'US',
				timezone TEXT DEFAULT 'America/New_York',
				currency TEXT DEFAULT 'USD',
				tax_rate INTEGER NOT NULL DEFAULT 825,
				is_active INTEGER NOT NULL DEFAULT 1,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			)
		`);

		await client.execute(`
			CREATE TABLE inventory_items (
				id TEXT PRIMARY KEY,
				venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
				name TEXT NOT NULL,
				sku TEXT,
				barcode TEXT,
				category TEXT NOT NULL,
				subcategory TEXT,
				unit_type TEXT NOT NULL,
				unit_size REAL,
				unit_size_uom TEXT,
				units_per_case INTEGER,
				quantity_on_hand REAL NOT NULL DEFAULT 0,
				par_level REAL,
				reorder_point REAL,
				reorder_quantity REAL,
				unit_cost REAL NOT NULL,
				case_cost REAL,
				last_cost REAL,
				average_cost REAL,
				primary_vendor TEXT,
				vendor_item_code TEXT,
				storage_location TEXT,
				storage_temp TEXT,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			)
		`);

		await client.execute(`
			CREATE TABLE inventory_transactions (
				id TEXT PRIMARY KEY,
				venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
				inventory_item_id TEXT NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
				transaction_type TEXT NOT NULL,
				quantity_change REAL NOT NULL,
				balance_after REAL NOT NULL,
				reference_type TEXT,
				reference_id TEXT,
				reason TEXT,
				unit_cost_at_time REAL,
				performed_by TEXT NOT NULL,
				created_at INTEGER NOT NULL
			)
		`);

		await client.execute(`
			CREATE TABLE inventory_suppliers (
				id TEXT PRIMARY KEY,
				venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
				name TEXT NOT NULL,
				contact_name TEXT NOT NULL,
				email TEXT NOT NULL,
				phone TEXT,
				address TEXT,
				city TEXT,
				state TEXT,
				zip_code TEXT,
				account_number TEXT,
				payment_terms TEXT,
				minimum_order REAL,
				delivery_days TEXT,
				is_active INTEGER NOT NULL DEFAULT 1,
				notes TEXT,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			)
		`);

		await client.execute(`
			CREATE TABLE inventory_purchase_orders (
				id TEXT PRIMARY KEY,
				venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
				supplier_id TEXT NOT NULL REFERENCES inventory_suppliers(id),
				order_number TEXT NOT NULL,
				status TEXT NOT NULL DEFAULT 'draft',
				order_date INTEGER NOT NULL,
				expected_delivery_date INTEGER,
				actual_delivery_date INTEGER,
				subtotal REAL NOT NULL DEFAULT 0,
				tax REAL NOT NULL DEFAULT 0,
				shipping_cost REAL NOT NULL DEFAULT 0,
				total REAL NOT NULL DEFAULT 0,
				notes TEXT,
				received_by TEXT,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			)
		`);

		await client.execute(`
			CREATE TABLE inventory_purchase_order_items (
				id TEXT PRIMARY KEY,
				purchase_order_id TEXT NOT NULL REFERENCES inventory_purchase_orders(id) ON DELETE CASCADE,
				inventory_item_id TEXT NOT NULL REFERENCES inventory_items(id),
				quantity_ordered REAL NOT NULL,
				quantity_received REAL NOT NULL DEFAULT 0,
				unit_cost REAL NOT NULL,
				total_cost REAL NOT NULL,
				notes TEXT,
				created_at INTEGER NOT NULL
			)
		`);

		// Create test venue
		venueId = 'test-venue-1';
		await db.insert(schema.venues).values({
			id: venueId,
			name: 'Test Bar',
			slug: 'test-bar',
			email: 'test@bar.com',
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		// Initialize service
		service = new InventoryService(db);
	});

	describe('Inventory Item Management', () => {
		describe('createItem', () => {
			it('should create a new inventory item with required fields', async () => {
				const item = await service.createItem({
					venueId,
					name: "Tito's Vodka",
					category: 'liquor',
					unitType: 'bottle',
					unitCost: 18.99,
				});

				expect(item.id).toBeDefined();
				expect(item.name).toBe("Tito's Vodka");
				expect(item.category).toBe('liquor');
				expect(item.unitType).toBe('bottle');
				expect(item.unitCost).toBe(18.99);
				expect(item.quantityOnHand).toBe(0);
			});

			it('should create item with optional fields (sku, barcode, subcategory)', async () => {
				const item = await service.createItem({
					venueId,
					name: 'Grey Goose Vodka',
					sku: 'GG-750',
					barcode: '0123456789',
					category: 'liquor',
					subcategory: 'vodka',
					unitType: 'bottle',
					unitSize: 750,
					unitSizeUom: 'ml',
					unitCost: 28.99,
				});

				expect(item.sku).toBe('GG-750');
				expect(item.barcode).toBe('0123456789');
				expect(item.subcategory).toBe('vodka');
				expect(item.unitSize).toBe(750);
				expect(item.unitSizeUom).toBe('ml');
			});

			it('should create item with stock level settings (par, reorder point)', async () => {
				const item = await service.createItem({
					venueId,
					name: 'Well Vodka',
					category: 'liquor',
					unitType: 'bottle',
					unitCost: 12.99,
					parLevel: 12,
					reorderPoint: 6,
					reorderQuantity: 12,
				});

				expect(item.parLevel).toBe(12);
				expect(item.reorderPoint).toBe(6);
				expect(item.reorderQuantity).toBe(12);
			});

			it('should create item with storage information', async () => {
				const item = await service.createItem({
					venueId,
					name: 'Corona Extra',
					category: 'beer',
					unitType: 'case',
					unitCost: 24.99,
					storageLocation: 'Walk-in Cooler A',
					storageTemp: 'cooler',
				});

				expect(item.storageLocation).toBe('Walk-in Cooler A');
				expect(item.storageTemp).toBe('cooler');
			});
		});

		describe('getItemById', () => {
			it('should retrieve an item by id', async () => {
				const created = await service.createItem({
					venueId,
					name: "Jack Daniel's",
					category: 'liquor',
					unitType: 'bottle',
					unitCost: 22.99,
				});

				const retrieved = await service.getItemById(created.id);

				expect(retrieved).toBeDefined();
				expect(retrieved?.id).toBe(created.id);
				expect(retrieved?.name).toBe("Jack Daniel's");
			});

			it('should return null for non-existent item', async () => {
				const item = await service.getItemById('non-existent-id');
				expect(item).toBeNull();
			});
		});

		describe('listItems', () => {
			it('should list all items for a venue', async () => {
				await service.createItem({
					venueId,
					name: 'Item 1',
					category: 'liquor',
					unitType: 'bottle',
					unitCost: 10,
				});

				await service.createItem({
					venueId,
					name: 'Item 2',
					category: 'beer',
					unitType: 'case',
					unitCost: 20,
				});

				const items = await service.listItems(venueId);

				expect(items).toHaveLength(2);
			});

			it('should filter items by category', async () => {
				await service.createItem({
					venueId,
					name: 'Vodka',
					category: 'liquor',
					unitType: 'bottle',
					unitCost: 10,
				});

				await service.createItem({
					venueId,
					name: 'Beer',
					category: 'beer',
					unitType: 'case',
					unitCost: 20,
				});

				const liquorItems = await service.listItems(venueId, { category: 'liquor' });

				expect(liquorItems).toHaveLength(1);
				expect(liquorItems[0].category).toBe('liquor');
			});

			it('should identify items at or below reorder point', async () => {
				await service.createItem({
					venueId,
					name: 'Low Stock Item',
					category: 'liquor',
					unitType: 'bottle',
					unitCost: 10,
					quantityOnHand: 5,
					reorderPoint: 6,
				});

				await service.createItem({
					venueId,
					name: 'Good Stock Item',
					category: 'liquor',
					unitType: 'bottle',
					unitCost: 10,
					quantityOnHand: 10,
					reorderPoint: 6,
				});

				const lowStockItems = await service.getLowStockItems(venueId);

				expect(lowStockItems).toHaveLength(1);
				expect(lowStockItems[0].name).toBe('Low Stock Item');
			});
		});

		describe('updateItem', () => {
			it('should update item details', async () => {
				const item = await service.createItem({
					venueId,
					name: 'Old Name',
					category: 'liquor',
					unitType: 'bottle',
					unitCost: 10,
				});

				const updated = await service.updateItem(item.id, {
					name: 'New Name',
					unitCost: 15,
				});

				expect(updated.name).toBe('New Name');
				expect(updated.unitCost).toBe(15);
			});

			it('should update stock level settings', async () => {
				const item = await service.createItem({
					venueId,
					name: 'Test Item',
					category: 'liquor',
					unitType: 'bottle',
					unitCost: 10,
				});

				const updated = await service.updateItem(item.id, {
					parLevel: 12,
					reorderPoint: 6,
					reorderQuantity: 12,
				});

				expect(updated.parLevel).toBe(12);
				expect(updated.reorderPoint).toBe(6);
				expect(updated.reorderQuantity).toBe(12);
			});
		});

		describe('deleteItem', () => {
			it('should delete an inventory item', async () => {
				const item = await service.createItem({
					venueId,
					name: 'To Delete',
					category: 'liquor',
					unitType: 'bottle',
					unitCost: 10,
				});

				await service.deleteItem(item.id);

				const retrieved = await service.getItemById(item.id);
				expect(retrieved).toBeNull();
			});
		});
	});

	describe('Stock Level Management', () => {
		describe('adjustStock', () => {
			it('should increase stock with purchase transaction', async () => {
				const item = await service.createItem({
					venueId,
					name: 'Whiskey',
					category: 'liquor',
					unitType: 'bottle',
					unitCost: 25,
					quantityOnHand: 10,
				});

				const result = await service.adjustStock({
					inventoryItemId: item.id,
					venueId,
					quantityChange: 6,
					transactionType: 'purchase',
					performedBy: 'user-1',
					unitCostAtTime: 25,
				});

				expect(result.transaction.quantityChange).toBe(6);
				expect(result.transaction.balanceAfter).toBe(16);
				expect(result.transaction.transactionType).toBe('purchase');
				expect(result.updatedItem.quantityOnHand).toBe(16);
			});

			it('should decrease stock with usage transaction', async () => {
				const item = await service.createItem({
					venueId,
					name: 'Rum',
					category: 'liquor',
					unitType: 'bottle',
					unitCost: 20,
					quantityOnHand: 10,
				});

				const result = await service.adjustStock({
					inventoryItemId: item.id,
					venueId,
					quantityChange: -3,
					transactionType: 'usage',
					performedBy: 'user-1',
					reason: 'Sold at bar',
				});

				expect(result.transaction.quantityChange).toBe(-3);
				expect(result.transaction.balanceAfter).toBe(7);
				expect(result.updatedItem.quantityOnHand).toBe(7);
			});

			it('should record waste transaction', async () => {
				const item = await service.createItem({
					venueId,
					name: 'Wine',
					category: 'wine',
					unitType: 'bottle',
					unitCost: 30,
					quantityOnHand: 10,
				});

				const result = await service.adjustStock({
					inventoryItemId: item.id,
					venueId,
					quantityChange: -1,
					transactionType: 'waste',
					performedBy: 'user-1',
					reason: 'Bottle broke during service',
				});

				expect(result.transaction.transactionType).toBe('waste');
				expect(result.transaction.reason).toBe('Bottle broke during service');
				expect(result.updatedItem.quantityOnHand).toBe(9);
			});

			it('should handle manual adjustment transaction', async () => {
				const item = await service.createItem({
					venueId,
					name: 'Beer',
					category: 'beer',
					unitType: 'case',
					unitCost: 25,
					quantityOnHand: 10,
				});

				const result = await service.adjustStock({
					inventoryItemId: item.id,
					venueId,
					quantityChange: 2,
					transactionType: 'adjustment',
					performedBy: 'user-1',
					reason: 'Inventory count correction',
				});

				expect(result.transaction.transactionType).toBe('adjustment');
				expect(result.updatedItem.quantityOnHand).toBe(12);
			});

			it('should prevent negative stock levels', async () => {
				const item = await service.createItem({
					venueId,
					name: 'Gin',
					category: 'liquor',
					unitType: 'bottle',
					unitCost: 22,
					quantityOnHand: 5,
				});

				await expect(
					service.adjustStock({
						inventoryItemId: item.id,
						venueId,
						quantityChange: -10,
						transactionType: 'usage',
						performedBy: 'user-1',
					})
				).rejects.toThrow('Insufficient stock');
			});
		});

		describe('getTransactionHistory', () => {
			it('should retrieve transaction history for an item', async () => {
				const item = await service.createItem({
					venueId,
					name: 'Tequila',
					category: 'liquor',
					unitType: 'bottle',
					unitCost: 28,
					quantityOnHand: 10,
				});

				await service.adjustStock({
					inventoryItemId: item.id,
					venueId,
					quantityChange: 5,
					transactionType: 'purchase',
					performedBy: 'user-1',
				});

				// Small delay to ensure different timestamps (SQLite stores timestamps in seconds)
				await new Promise(resolve => setTimeout(resolve, 1001));

				await service.adjustStock({
					inventoryItemId: item.id,
					venueId,
					quantityChange: -2,
					transactionType: 'usage',
					performedBy: 'user-1',
				});

				const history = await service.getTransactionHistory(item.id);

				expect(history).toHaveLength(2);
				expect(history[0].transactionType).toBe('usage'); // Most recent first
				expect(history[1].transactionType).toBe('purchase');
			});
		});
	});

	describe('Supplier Management', () => {
		describe('createSupplier', () => {
			it('should create a new supplier with required fields', async () => {
				const supplier = await service.createSupplier({
					venueId,
					name: 'ABC Distributors',
					contactName: 'John Smith',
					email: 'john@abc.com',
				});

				expect(supplier.id).toBeDefined();
				expect(supplier.name).toBe('ABC Distributors');
				expect(supplier.contactName).toBe('John Smith');
				expect(supplier.email).toBe('john@abc.com');
				expect(supplier.isActive).toBe(true);
			});

			it('should create supplier with full address and business info', async () => {
				const supplier = await service.createSupplier({
					venueId,
					name: 'XYZ Beverages',
					contactName: 'Jane Doe',
					email: 'jane@xyz.com',
					phone: '555-1234',
					address: '123 Main St',
					city: 'Austin',
					state: 'TX',
					zipCode: '78701',
					accountNumber: 'ACC-12345',
					paymentTerms: 'Net 30',
					minimumOrder: 500,
				});

				expect(supplier.address).toBe('123 Main St');
				expect(supplier.city).toBe('Austin');
				expect(supplier.state).toBe('TX');
				expect(supplier.accountNumber).toBe('ACC-12345');
				expect(supplier.paymentTerms).toBe('Net 30');
				expect(supplier.minimumOrder).toBe(500);
			});
		});

		describe('listSuppliers', () => {
			it('should list all active suppliers for a venue', async () => {
				await service.createSupplier({
					venueId,
					name: 'Supplier 1',
					contactName: 'Contact 1',
					email: 'contact1@supplier.com',
				});

				await service.createSupplier({
					venueId,
					name: 'Supplier 2',
					contactName: 'Contact 2',
					email: 'contact2@supplier.com',
					isActive: false,
				});

				const suppliers = await service.listSuppliers(venueId);

				expect(suppliers).toHaveLength(1);
				expect(suppliers[0].name).toBe('Supplier 1');
			});

			it('should include inactive suppliers when requested', async () => {
				await service.createSupplier({
					venueId,
					name: 'Active Supplier',
					contactName: 'Contact 1',
					email: 'contact1@supplier.com',
				});

				await service.createSupplier({
					venueId,
					name: 'Inactive Supplier',
					contactName: 'Contact 2',
					email: 'contact2@supplier.com',
					isActive: false,
				});

				const suppliers = await service.listSuppliers(venueId, { includeInactive: true });

				expect(suppliers).toHaveLength(2);
			});
		});

		describe('updateSupplier', () => {
			it('should update supplier information', async () => {
				const supplier = await service.createSupplier({
					venueId,
					name: 'Old Name',
					contactName: 'Old Contact',
					email: 'old@email.com',
				});

				const updated = await service.updateSupplier(supplier.id, {
					name: 'New Name',
					contactName: 'New Contact',
					email: 'new@email.com',
				});

				expect(updated.name).toBe('New Name');
				expect(updated.contactName).toBe('New Contact');
				expect(updated.email).toBe('new@email.com');
			});

			it('should deactivate a supplier', async () => {
				const supplier = await service.createSupplier({
					venueId,
					name: 'To Deactivate',
					contactName: 'Contact',
					email: 'contact@supplier.com',
				});

				const updated = await service.updateSupplier(supplier.id, {
					isActive: false,
				});

				expect(updated.isActive).toBe(false);
			});
		});
	});

	describe('Purchase Order Management', () => {
		let supplierId: string;

		beforeEach(async () => {
			const supplier = await service.createSupplier({
				venueId,
				name: 'Test Supplier',
				contactName: 'Test Contact',
				email: 'test@supplier.com',
			});
			supplierId = supplier.id;
		});

		describe('createPurchaseOrder', () => {
			it('should create a new purchase order in draft status', async () => {
				const po = await service.createPurchaseOrder({
					venueId,
					supplierId,
					orderNumber: 'PO-001',
					orderDate: new Date(),
				});

				expect(po.id).toBeDefined();
				expect(po.orderNumber).toBe('PO-001');
				expect(po.status).toBe('draft');
				expect(po.supplierId).toBe(supplierId);
				expect(po.subtotal).toBe(0);
				expect(po.total).toBe(0);
			});

			it('should create purchase order with expected delivery date', async () => {
				const expectedDate = new Date('2025-12-25');

				const po = await service.createPurchaseOrder({
					venueId,
					supplierId,
					orderNumber: 'PO-002',
					orderDate: new Date(),
					expectedDeliveryDate: expectedDate,
				});

				expect(po.expectedDeliveryDate).toEqual(expectedDate);
			});
		});

		describe('addPurchaseOrderItem', () => {
			it('should add item to purchase order and update totals', async () => {
				const item = await service.createItem({
					venueId,
					name: 'Vodka',
					category: 'liquor',
					unitType: 'bottle',
					unitCost: 20,
				});

				const po = await service.createPurchaseOrder({
					venueId,
					supplierId,
					orderNumber: 'PO-003',
					orderDate: new Date(),
				});

				const poItem = await service.addPurchaseOrderItem({
					purchaseOrderId: po.id,
					inventoryItemId: item.id,
					quantityOrdered: 12,
					unitCost: 20,
				});

				expect(poItem.quantityOrdered).toBe(12);
				expect(poItem.unitCost).toBe(20);
				expect(poItem.totalCost).toBe(240);

				// Verify PO totals updated
				const updatedPO = await service.getPurchaseOrderById(po.id);
				expect(updatedPO?.subtotal).toBe(240);
				expect(updatedPO?.total).toBe(240);
			});

			it('should handle multiple items in purchase order', async () => {
				const item1 = await service.createItem({
					venueId,
					name: 'Vodka',
					category: 'liquor',
					unitType: 'bottle',
					unitCost: 20,
				});

				const item2 = await service.createItem({
					venueId,
					name: 'Rum',
					category: 'liquor',
					unitType: 'bottle',
					unitCost: 25,
				});

				const po = await service.createPurchaseOrder({
					venueId,
					supplierId,
					orderNumber: 'PO-004',
					orderDate: new Date(),
				});

				await service.addPurchaseOrderItem({
					purchaseOrderId: po.id,
					inventoryItemId: item1.id,
					quantityOrdered: 12,
					unitCost: 20,
				});

				await service.addPurchaseOrderItem({
					purchaseOrderId: po.id,
					inventoryItemId: item2.id,
					quantityOrdered: 6,
					unitCost: 25,
				});

				const updatedPO = await service.getPurchaseOrderById(po.id);
				expect(updatedPO?.subtotal).toBe(390); // (12 * 20) + (6 * 25)
			});
		});

		describe('submitPurchaseOrder', () => {
			it('should change status from draft to submitted', async () => {
				const item = await service.createItem({
					venueId,
					name: 'Test Item',
					category: 'liquor',
					unitType: 'bottle',
					unitCost: 20,
				});

				const po = await service.createPurchaseOrder({
					venueId,
					supplierId,
					orderNumber: 'PO-005',
					orderDate: new Date(),
				});

				await service.addPurchaseOrderItem({
					purchaseOrderId: po.id,
					inventoryItemId: item.id,
					quantityOrdered: 12,
					unitCost: 20,
				});

				const submitted = await service.submitPurchaseOrder(po.id);

				expect(submitted.status).toBe('submitted');
			});

			it('should prevent submitting empty purchase order', async () => {
				const po = await service.createPurchaseOrder({
					venueId,
					supplierId,
					orderNumber: 'PO-006',
					orderDate: new Date(),
				});

				await expect(service.submitPurchaseOrder(po.id)).rejects.toThrow(
					'Cannot submit purchase order with no items'
				);
			});
		});

		describe('receivePurchaseOrder', () => {
			it('should mark purchase order as received and update stock', async () => {
				const item = await service.createItem({
					venueId,
					name: 'Whiskey',
					category: 'liquor',
					unitType: 'bottle',
					unitCost: 30,
					quantityOnHand: 5,
				});

				const po = await service.createPurchaseOrder({
					venueId,
					supplierId,
					orderNumber: 'PO-007',
					orderDate: new Date(),
				});

				await service.addPurchaseOrderItem({
					purchaseOrderId: po.id,
					inventoryItemId: item.id,
					quantityOrdered: 12,
					unitCost: 30,
				});

				await service.submitPurchaseOrder(po.id);

				const received = await service.receivePurchaseOrder({
					purchaseOrderId: po.id,
					receivedBy: 'user-1',
					actualDeliveryDate: new Date(),
				});

				expect(received.status).toBe('received');
				expect(received.receivedBy).toBe('user-1');

				// Verify stock updated
				const updatedItem = await service.getItemById(item.id);
				expect(updatedItem?.quantityOnHand).toBe(17); // 5 + 12
			});

			it('should handle partial receipts', async () => {
				const item = await service.createItem({
					venueId,
					name: 'Gin',
					category: 'liquor',
					unitType: 'bottle',
					unitCost: 25,
					quantityOnHand: 10,
				});

				const po = await service.createPurchaseOrder({
					venueId,
					supplierId,
					orderNumber: 'PO-008',
					orderDate: new Date(),
				});

				await service.addPurchaseOrderItem({
					purchaseOrderId: po.id,
					inventoryItemId: item.id,
					quantityOrdered: 12,
					unitCost: 25,
				});

				await service.submitPurchaseOrder(po.id);

				await service.receivePurchaseOrder({
					purchaseOrderId: po.id,
					receivedBy: 'user-1',
					actualDeliveryDate: new Date(),
					receivedQuantities: [
						{
							inventoryItemId: item.id,
							quantityReceived: 8, // Partial receipt
						},
					],
				});

				const updatedItem = await service.getItemById(item.id);
				expect(updatedItem?.quantityOnHand).toBe(18); // 10 + 8 (not 12)
			});
		});

		describe('cancelPurchaseOrder', () => {
			it('should cancel a purchase order', async () => {
				const po = await service.createPurchaseOrder({
					venueId,
					supplierId,
					orderNumber: 'PO-009',
					orderDate: new Date(),
				});

				const cancelled = await service.cancelPurchaseOrder(po.id);

				expect(cancelled.status).toBe('cancelled');
			});

			it('should prevent cancelling received purchase order', async () => {
				const item = await service.createItem({
					venueId,
					name: 'Tequila',
					category: 'liquor',
					unitType: 'bottle',
					unitCost: 28,
				});

				const po = await service.createPurchaseOrder({
					venueId,
					supplierId,
					orderNumber: 'PO-010',
					orderDate: new Date(),
				});

				await service.addPurchaseOrderItem({
					purchaseOrderId: po.id,
					inventoryItemId: item.id,
					quantityOrdered: 6,
					unitCost: 28,
				});

				await service.submitPurchaseOrder(po.id);

				await service.receivePurchaseOrder({
					purchaseOrderId: po.id,
					receivedBy: 'user-1',
					actualDeliveryDate: new Date(),
				});

				await expect(service.cancelPurchaseOrder(po.id)).rejects.toThrow(
					'Cannot cancel received purchase order'
				);
			});
		});
	});
});
