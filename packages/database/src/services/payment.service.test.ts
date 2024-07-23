/**
 * Payment Service Tests
 * TDD tests for payment processing including split checks, tips, refunds, and comps
 */

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Database } from '../client';
import * as schema from '../schema';
import { menuItems } from '../schema/menu';
import { orders } from '../schema/orders';
import { payments } from '../schema/payments';
import { venues } from '../schema/venues';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';

describe('PaymentService', () => {
	let db: Database;
	let paymentService: PaymentService;
	let orderService: OrderService;
	let testVenueId: string;
	let testOrderId: string;

	beforeEach(async () => {
		// Create fresh in-memory database for each test
		const client = createClient({ url: ':memory:' });
		db = drizzle(client, { schema }) as Database;

		// Enable foreign keys
		await client.execute('PRAGMA foreign_keys = ON');

		// Create required tables
		const now = Date.now();

		await client.execute(`
			CREATE TABLE venues (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				slug TEXT NOT NULL UNIQUE,
				email TEXT NOT NULL,
				address TEXT,
				city TEXT,
				state TEXT,
				zip_code TEXT,
				phone TEXT,
				tax_rate INTEGER DEFAULT 825 NOT NULL,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			)
		`);

		await client.execute(`
			CREATE TABLE users (
				id TEXT PRIMARY KEY,
				venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
				keycloak_id TEXT NOT NULL UNIQUE,
				email TEXT NOT NULL UNIQUE,
				first_name TEXT NOT NULL,
				last_name TEXT NOT NULL,
				role TEXT DEFAULT 'server' NOT NULL,
				is_active INTEGER DEFAULT 1 NOT NULL,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			)
		`);

		await client.execute(`
			CREATE TABLE menu_categories (
				id TEXT PRIMARY KEY,
				venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
				name TEXT NOT NULL,
				slug TEXT NOT NULL,
				description TEXT,
				display_order INTEGER NOT NULL,
				is_active INTEGER NOT NULL DEFAULT 1,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			)
		`);

		await client.execute(`
			CREATE TABLE menu_items (
				id TEXT PRIMARY KEY,
				venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
				category_id TEXT NOT NULL REFERENCES menu_categories(id),
				name TEXT NOT NULL,
				slug TEXT NOT NULL,
				description TEXT,
				price REAL NOT NULL,
				is_available INTEGER NOT NULL DEFAULT 1,
				allergens TEXT,
				prep_time_minutes INTEGER DEFAULT 0,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			)
		`);

		await client.execute(`
			CREATE TABLE orders (
				id TEXT PRIMARY KEY,
				order_number INTEGER NOT NULL,
				venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
				server_id TEXT REFERENCES users(id),
				table_id TEXT,
				table_number INTEGER,
				guest_count INTEGER DEFAULT 1,
				status TEXT NOT NULL DEFAULT 'open',
				order_type TEXT NOT NULL DEFAULT 'dine_in',
				subtotal REAL NOT NULL DEFAULT 0,
				tax REAL NOT NULL DEFAULT 0,
				tip REAL DEFAULT 0,
				discount REAL DEFAULT 0,
				total REAL NOT NULL DEFAULT 0,
				notes TEXT,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL,
				completed_at INTEGER
			)
		`);

		await client.execute(`
			CREATE TABLE order_items (
				id TEXT PRIMARY KEY,
				order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
				menu_item_id TEXT NOT NULL,
				name TEXT NOT NULL,
				quantity INTEGER NOT NULL DEFAULT 1,
				price REAL NOT NULL,
				modifier_total REAL NOT NULL DEFAULT 0,
				total REAL NOT NULL,
				notes TEXT,
				status TEXT NOT NULL DEFAULT 'pending',
				sent_to_kitchen_at INTEGER,
				created_at INTEGER NOT NULL
			)
		`);

		await client.execute(`
			CREATE TABLE order_item_modifiers (
				id TEXT PRIMARY KEY,
				order_item_id TEXT NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
				modifier_id TEXT NOT NULL,
				name TEXT NOT NULL,
				price REAL NOT NULL DEFAULT 0,
				quantity INTEGER NOT NULL DEFAULT 1
			)
		`);

		await client.execute(`
			CREATE TABLE payments (
				id TEXT PRIMARY KEY,
				venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
				order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
				amount REAL NOT NULL,
				tip_amount REAL NOT NULL DEFAULT 0,
				payment_method TEXT NOT NULL,
				status TEXT NOT NULL DEFAULT 'pending',
				card_last_four TEXT,
				card_brand TEXT,
				processor TEXT,
				processor_transaction_id TEXT,
				processor_fee REAL,
				is_refunded INTEGER NOT NULL DEFAULT 0,
				refund_amount REAL,
				refund_reason TEXT,
				refunded_at INTEGER,
				refunded_by TEXT,
				comp_reason TEXT,
				comp_by TEXT,
				processed_at INTEGER,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			)
		`);

		// Insert test venue
		await client.execute(`
			INSERT INTO venues (id, name, slug, email, created_at, updated_at)
			VALUES ('venue-1', 'Test Bar', 'test-bar', 'test@bar.com', ${now}, ${now})
		`);
		testVenueId = 'venue-1';

		// Insert test user
		await client.execute(`
			INSERT INTO users (id, venue_id, keycloak_id, email, first_name, last_name, created_at, updated_at)
			VALUES ('user-1', 'venue-1', 'kc-123', 'user@test.com', 'Test', 'User', ${now}, ${now})
		`);

		paymentService = new PaymentService(db);
		orderService = new OrderService(db);

		// Create test menu category
		await client.execute(`
			INSERT INTO menu_categories (id, venue_id, name, slug, display_order, created_at, updated_at)
			VALUES ('cat-1', 'venue-1', 'Drinks', 'drinks', 1, ${now}, ${now})
		`);

		// Create menu item via DB directly
		await client.execute(`
			INSERT INTO menu_items (id, venue_id, category_id, name, slug, price, created_at, updated_at)
			VALUES ('item-1', 'venue-1', 'cat-1', 'Beer', 'beer', 6.0, ${now}, ${now})
		`);

		// Create test order
		const order = await orderService.createOrder({
			venueId: testVenueId,
			serverId: 'user-1',
			tableId: null,
			orderType: 'dine_in',
		});
		testOrderId = order.id;

		// Add item to order
		await orderService.addItemToOrder({
			orderId: order.id,
			menuItemId: 'item-1',
			quantity: 2,
			price: 6.0,
			name: 'Beer',
		});
	});

	describe('Payment Processing', () => {
		it('should process a card payment successfully', async () => {
			const payment = await paymentService.processPayment({
				venueId: testVenueId,
				orderId: testOrderId,
				amount: 12.99,
				tipAmount: 2.0,
				paymentMethod: 'card',
				cardLastFour: '1234',
				cardBrand: 'Visa',
			});

			expect(payment.id).toBeDefined();
			expect(payment.amount).toBe(12.99);
			expect(payment.tipAmount).toBe(2.0);
			expect(payment.paymentMethod).toBe('card');
			expect(payment.status).toBe('completed');
			expect(payment.cardLastFour).toBe('1234');
			expect(payment.cardBrand).toBe('Visa');
			expect(payment.processedAt).toBeInstanceOf(Date);
		});

		it('should process a cash payment successfully', async () => {
			const payment = await paymentService.processPayment({
				venueId: testVenueId,
				orderId: testOrderId,
				amount: 15.0,
				tipAmount: 0,
				paymentMethod: 'cash',
			});

			expect(payment.paymentMethod).toBe('cash');
			expect(payment.status).toBe('completed');
			expect(payment.cardLastFour).toBeNull();
			expect(payment.processedAt).toBeInstanceOf(Date);
		});

		it('should process a comp payment with reason and approver', async () => {
			const payment = await paymentService.processPayment({
				venueId: testVenueId,
				orderId: testOrderId,
				amount: 12.99,
				tipAmount: 0,
				paymentMethod: 'comp',
				compReason: 'Customer complaint',
				compBy: 'manager-123',
			});

			expect(payment.paymentMethod).toBe('comp');
			expect(payment.status).toBe('completed');
			expect(payment.compReason).toBe('Customer complaint');
			expect(payment.compBy).toBe('manager-123');
		});

		it('should process payment with payment processor details', async () => {
			const payment = await paymentService.processPayment({
				venueId: testVenueId,
				orderId: testOrderId,
				amount: 12.99,
				tipAmount: 2.0,
				paymentMethod: 'card',
				processor: 'Stripe',
				processorTransactionId: 'txn_123456',
				processorFee: 0.39,
			});

			expect(payment.processor).toBe('Stripe');
			expect(payment.processorTransactionId).toBe('txn_123456');
			expect(payment.processorFee).toBe(0.39);
		});

		it('should default tip amount to 0 if not provided', async () => {
			const payment = await paymentService.processPayment({
				venueId: testVenueId,
				orderId: testOrderId,
				amount: 12.99,
				paymentMethod: 'cash',
			});

			expect(payment.tipAmount).toBe(0);
		});
	});

	describe('Split Payments', () => {
		it('should allow multiple payments for a single order', async () => {
			const payment1 = await paymentService.processPayment({
				venueId: testVenueId,
				orderId: testOrderId,
				amount: 7.0,
				paymentMethod: 'card',
			});

			const payment2 = await paymentService.processPayment({
				venueId: testVenueId,
				orderId: testOrderId,
				amount: 5.99,
				paymentMethod: 'cash',
			});

			expect(payment1.id).toBeDefined();
			expect(payment2.id).toBeDefined();
			expect(payment1.id).not.toBe(payment2.id);

			const orderPayments = await paymentService.getPaymentsByOrder(testOrderId);
			expect(orderPayments).toHaveLength(2);
		});

		it('should calculate total paid amount for split checks', async () => {
			await paymentService.processPayment({
				venueId: testVenueId,
				orderId: testOrderId,
				amount: 7.0,
				tipAmount: 1.0,
				paymentMethod: 'card',
			});

			await paymentService.processPayment({
				venueId: testVenueId,
				orderId: testOrderId,
				amount: 5.99,
				tipAmount: 1.0,
				paymentMethod: 'cash',
			});

			const totalPaid = await paymentService.getTotalPaidAmount(testOrderId);
			expect(totalPaid).toBe(14.99); // 7.0 + 1.0 + 5.99 + 1.0
		});

		it('should check if order is fully paid', async () => {
			// Get order total
			const order = await orderService.getOrder(testOrderId);
			// biome-ignore lint/style/noNonNullAssertion: Order guaranteed to exist from previous test setup
			const orderTotal = order!.total;

			// Partial payment
			await paymentService.processPayment({
				venueId: testVenueId,
				orderId: testOrderId,
				amount: orderTotal / 2,
				paymentMethod: 'card',
			});

			let isFullyPaid = await paymentService.isOrderFullyPaid(testOrderId);
			expect(isFullyPaid).toBe(false);

			// Complete payment
			await paymentService.processPayment({
				venueId: testVenueId,
				orderId: testOrderId,
				amount: orderTotal / 2,
				paymentMethod: 'cash',
			});

			isFullyPaid = await paymentService.isOrderFullyPaid(testOrderId);
			expect(isFullyPaid).toBe(true);
		});
	});

	describe('Refunds', () => {
		it('should process a full refund', async () => {
			const payment = await paymentService.processPayment({
				venueId: testVenueId,
				orderId: testOrderId,
				amount: 12.99,
				tipAmount: 2.0,
				paymentMethod: 'card',
			});

			const refunded = await paymentService.refundPayment({
				paymentId: payment.id,
				refundAmount: 12.99,
				refundReason: 'Customer requested refund',
				refundedBy: 'manager-123',
			});

			expect(refunded.isRefunded).toBe(true);
			expect(refunded.refundAmount).toBe(12.99);
			expect(refunded.refundReason).toBe('Customer requested refund');
			expect(refunded.refundedBy).toBe('manager-123');
			expect(refunded.refundedAt).toBeInstanceOf(Date);
			expect(refunded.status).toBe('refunded');
		});

		it('should process a partial refund', async () => {
			const payment = await paymentService.processPayment({
				venueId: testVenueId,
				orderId: testOrderId,
				amount: 12.99,
				paymentMethod: 'card',
			});

			const refunded = await paymentService.refundPayment({
				paymentId: payment.id,
				refundAmount: 5.0,
				refundReason: 'Partial item return',
				refundedBy: 'manager-123',
			});

			expect(refunded.isRefunded).toBe(true);
			expect(refunded.refundAmount).toBe(5.0);
			expect(refunded.status).toBe('refunded');
		});

		it('should throw error when refund amount exceeds payment amount', async () => {
			const payment = await paymentService.processPayment({
				venueId: testVenueId,
				orderId: testOrderId,
				amount: 12.99,
				paymentMethod: 'card',
			});

			await expect(
				paymentService.refundPayment({
					paymentId: payment.id,
					refundAmount: 15.0,
					refundReason: 'Test',
					refundedBy: 'manager-123',
				})
			).rejects.toThrow('Refund amount cannot exceed payment amount');
		});

		it('should throw error when refunding already refunded payment', async () => {
			const payment = await paymentService.processPayment({
				venueId: testVenueId,
				orderId: testOrderId,
				amount: 12.99,
				paymentMethod: 'card',
			});

			await paymentService.refundPayment({
				paymentId: payment.id,
				refundAmount: 12.99,
				refundReason: 'First refund',
				refundedBy: 'manager-123',
			});

			await expect(
				paymentService.refundPayment({
					paymentId: payment.id,
					refundAmount: 5.0,
					refundReason: 'Second refund',
					refundedBy: 'manager-123',
				})
			).rejects.toThrow('Payment already refunded');
		});
	});

	describe('Payment Queries', () => {
		it('should get payment by ID', async () => {
			const payment = await paymentService.processPayment({
				venueId: testVenueId,
				orderId: testOrderId,
				amount: 12.99,
				paymentMethod: 'card',
			});

			const retrieved = await paymentService.getPaymentById(payment.id);
			expect(retrieved).toBeDefined();
			expect(retrieved?.id).toBe(payment.id);
		});

		it('should return null for non-existent payment ID', async () => {
			const retrieved = await paymentService.getPaymentById('non-existent-id');
			expect(retrieved).toBeNull();
		});

		it('should get all payments for an order', async () => {
			await paymentService.processPayment({
				venueId: testVenueId,
				orderId: testOrderId,
				amount: 7.0,
				paymentMethod: 'card',
			});

			await paymentService.processPayment({
				venueId: testVenueId,
				orderId: testOrderId,
				amount: 5.99,
				paymentMethod: 'cash',
			});

			const orderPayments = await paymentService.getPaymentsByOrder(testOrderId);
			expect(orderPayments).toHaveLength(2);
			expect(orderPayments[0].orderId).toBe(testOrderId);
			expect(orderPayments[1].orderId).toBe(testOrderId);
		});

		it('should get all payments for a venue', async () => {
			// Create second order
			const order2 = await orderService.createOrder({
				venueId: testVenueId,
				serverId: 'user-1',
				tableId: null,
				orderType: 'dine_in',
			});

			await orderService.addItemToOrder({
				orderId: order2.id,
				menuItemId: 'item-1',
				quantity: 1,
				price: 6.0,
				name: 'Beer',
			});

			// Process payments for both orders
			await paymentService.processPayment({
				venueId: testVenueId,
				orderId: testOrderId,
				amount: 12.99,
				paymentMethod: 'card',
			});

			await paymentService.processPayment({
				venueId: testVenueId,
				orderId: order2.id,
				amount: 6.5,
				paymentMethod: 'cash',
			});

			const venuePayments = await paymentService.getPaymentsByVenue(testVenueId);
			expect(venuePayments.length).toBeGreaterThanOrEqual(2);
		});
	});

	describe('Validation', () => {
		it('should throw error for negative payment amount', async () => {
			await expect(
				paymentService.processPayment({
					venueId: testVenueId,
					orderId: testOrderId,
					amount: -10.0,
					paymentMethod: 'card',
				})
			).rejects.toThrow();
		});

		it('should throw error for zero payment amount', async () => {
			await expect(
				paymentService.processPayment({
					venueId: testVenueId,
					orderId: testOrderId,
					amount: 0,
					paymentMethod: 'card',
				})
			).rejects.toThrow();
		});

		it('should throw error for negative tip amount', async () => {
			await expect(
				paymentService.processPayment({
					venueId: testVenueId,
					orderId: testOrderId,
					amount: 12.99,
					tipAmount: -5.0,
					paymentMethod: 'card',
				})
			).rejects.toThrow();
		});

		it('should throw error for invalid card last four (not 4 digits)', async () => {
			await expect(
				paymentService.processPayment({
					venueId: testVenueId,
					orderId: testOrderId,
					amount: 12.99,
					paymentMethod: 'card',
					cardLastFour: '123',
				})
			).rejects.toThrow();
		});

		it('should throw error for non-numeric card last four', async () => {
			await expect(
				paymentService.processPayment({
					venueId: testVenueId,
					orderId: testOrderId,
					amount: 12.99,
					paymentMethod: 'card',
					cardLastFour: 'abcd',
				})
			).rejects.toThrow();
		});

		it('should require comp reason when payment method is comp', async () => {
			await expect(
				paymentService.processPayment({
					venueId: testVenueId,
					orderId: testOrderId,
					amount: 12.99,
					paymentMethod: 'comp',
				})
			).rejects.toThrow('Comp reason is required for comped payments');
		});

		it('should require comp approver when payment method is comp', async () => {
			await expect(
				paymentService.processPayment({
					venueId: testVenueId,
					orderId: testOrderId,
					amount: 12.99,
					paymentMethod: 'comp',
					compReason: 'Test',
				})
			).rejects.toThrow('Comp approver is required for comped payments');
		});
	});

	describe('Edge Cases', () => {
		it('should handle payments with processor fee', async () => {
			const payment = await paymentService.processPayment({
				venueId: testVenueId,
				orderId: testOrderId,
				amount: 12.99,
				paymentMethod: 'card',
				processorFee: 0.39,
			});

			expect(payment.processorFee).toBe(0.39);
		});

		it('should handle gift card payments', async () => {
			const payment = await paymentService.processPayment({
				venueId: testVenueId,
				orderId: testOrderId,
				amount: 25.0,
				paymentMethod: 'gift_card',
			});

			expect(payment.paymentMethod).toBe('gift_card');
			expect(payment.status).toBe('completed');
		});

		it('should handle check payments', async () => {
			const payment = await paymentService.processPayment({
				venueId: testVenueId,
				orderId: testOrderId,
				amount: 50.0,
				paymentMethod: 'check',
			});

			expect(payment.paymentMethod).toBe('check');
			expect(payment.status).toBe('completed');
		});

		it('should throw error for non-existent order', async () => {
			await expect(
				paymentService.processPayment({
					venueId: testVenueId,
					orderId: 'non-existent-order',
					amount: 12.99,
					paymentMethod: 'card',
				})
			).rejects.toThrow('Order not found');
		});

		it('should allow refund with zero processor fee', async () => {
			const payment = await paymentService.processPayment({
				venueId: testVenueId,
				orderId: testOrderId,
				amount: 12.99,
				paymentMethod: 'card',
				processorFee: 0.39,
			});

			const refunded = await paymentService.refundPayment({
				paymentId: payment.id,
				refundAmount: 12.99,
				refundReason: 'Test',
				refundedBy: 'manager-123',
			});

			expect(refunded.isRefunded).toBe(true);
		});
	});
});
