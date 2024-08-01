import type { Database } from '@host/database';
import * as schema from '@host/database/schema';
import { PaymentService } from '@host/database/services';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Context } from '../trpc';
import { paymentRouter } from './payment.router';

/**
 * Payment Workflow Integration Tests
 * Tests the full stack: tRPC API → PaymentService → Database
 * Uses real in-memory SQLite database (not mocks)
 */
describe('Payment Workflow Integration Tests', () => {
	let db: Database;
	let paymentService: PaymentService;
	let venueId: string;
	let userId: string;
	let orderId: string;

	/**
	 * Create authenticated test context with real services
	 */
	function createIntegrationContext(): Context {
		return {
			db,
			user: {
				id: userId,
				email: 'test@example.com',
				firstName: 'Test',
				lastName: 'Server',
				venueId,
				roles: ['server'],
			},
			// biome-ignore lint/suspicious/noExplicitAny: Integration test context doesn't use all services
			menuService: null as any,
			// biome-ignore lint/suspicious/noExplicitAny: Integration test context doesn't use all services
			orderService: null as any,
			paymentService,
		};
	}

	beforeEach(async () => {
		// Create fresh in-memory database
		const client = createClient({ url: ':memory:' });
		db = drizzle(client, { schema }) as Database;

		// Enable foreign key constraints
		await client.execute('PRAGMA foreign_keys = ON');

		// Create test tables
		await client.batch([
			`CREATE TABLE IF NOT EXISTS venues (
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
			)`,
			`CREATE TABLE IF NOT EXISTS users (
				id TEXT PRIMARY KEY,
				keycloak_id TEXT NOT NULL UNIQUE,
				email TEXT NOT NULL UNIQUE,
				first_name TEXT NOT NULL,
				last_name TEXT NOT NULL,
				phone TEXT,
				venue_id TEXT NOT NULL,
				role TEXT NOT NULL DEFAULT 'server',
				pin_code_hash TEXT,
				is_active INTEGER NOT NULL DEFAULT 1,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL,
				FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
			)`,
			`CREATE TABLE IF NOT EXISTS orders (
				id TEXT PRIMARY KEY,
				venue_id TEXT NOT NULL,
				server_id TEXT,
				order_number INTEGER NOT NULL,
				table_number INTEGER,
				guest_count INTEGER DEFAULT 1,
				order_type TEXT NOT NULL DEFAULT 'dine_in',
				status TEXT NOT NULL DEFAULT 'open',
				subtotal REAL NOT NULL DEFAULT 0,
				tax REAL NOT NULL DEFAULT 0,
				tip REAL DEFAULT 0,
				discount REAL DEFAULT 0,
				total REAL NOT NULL DEFAULT 0,
				notes TEXT,
				completed_at INTEGER,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL,
				FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
				FOREIGN KEY (server_id) REFERENCES users(id)
			)`,
			`CREATE TABLE IF NOT EXISTS payments (
				id TEXT PRIMARY KEY,
				venue_id TEXT NOT NULL,
				order_id TEXT NOT NULL,
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
				updated_at INTEGER NOT NULL,
				FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
				FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
			)`,
		]);

		// Create test venue
		const [venue] = await db
			.insert(schema.venues)
			.values({
				id: 'venue-1',
				name: 'Test Restaurant',
				slug: 'test-restaurant',
				email: 'venue@example.com',
				taxRate: 825,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();
		venueId = venue.id;

		// Create test user
		const [user] = await db
			.insert(schema.users)
			.values({
				id: 'user-1',
				keycloakId: 'keycloak-123',
				email: 'test@example.com',
				firstName: 'Test',
				lastName: 'Server',
				venueId,
				role: 'server',
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();
		userId = user.id;

		// Create test order
		const [order] = await db
			.insert(schema.orders)
			.values({
				id: 'order-1',
				venueId,
				serverId: userId,
				orderNumber: 1,
				tableNumber: 5,
				orderType: 'dine_in',
				status: 'open',
				subtotal: 100,
				tax: 8.25,
				total: 108.25,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();
		orderId = order.id;

		// Initialize PaymentService with real database
		paymentService = new PaymentService(db);
	});

	// ===== Single Payment Processing =====

	describe('Single Payment Processing', () => {
		it('should process card payment with tip through API', async () => {
			const caller = paymentRouter.createCaller(createIntegrationContext());

			const payment = await caller.process({
				venueId,
				orderId,
				amount: 108.25,
				tipAmount: 20,
				paymentMethod: 'card',
				cardLastFour: '4242',
				cardBrand: 'Visa',
				processor: 'stripe',
				processorTransactionId: 'ch_test123',
			});

			expect(payment.id).toBeDefined();
			expect(payment.amount).toBe(108.25);
			expect(payment.tipAmount).toBe(20);
			expect(payment.paymentMethod).toBe('card');
			expect(payment.cardLastFour).toBe('4242');
			expect(payment.status).toBe('completed');
		});

		it('should process cash payment without card details', async () => {
			const caller = paymentRouter.createCaller(createIntegrationContext());

			const payment = await caller.process({
				venueId,
				orderId,
				amount: 108.25,
				paymentMethod: 'cash',
			});

			expect(payment.paymentMethod).toBe('cash');
			expect(payment.cardLastFour).toBeNull();
			expect(payment.cardBrand).toBeNull();
		});

		it('should process comp payment with reason and approver', async () => {
			const caller = paymentRouter.createCaller(createIntegrationContext());

			const payment = await caller.process({
				venueId,
				orderId,
				amount: 108.25,
				paymentMethod: 'comp',
				compReason: 'VIP guest',
				compBy: 'manager-1',
			});

			expect(payment.paymentMethod).toBe('comp');
			expect(payment.compReason).toBe('VIP guest');
			expect(payment.compBy).toBe('manager-1');
		});

		it('should reject comp payment without reason', async () => {
			const caller = paymentRouter.createCaller(createIntegrationContext());

			await expect(
				caller.process({
					venueId,
					orderId,
					amount: 108.25,
					paymentMethod: 'comp',
					compBy: 'manager-1',
				})
			).rejects.toThrow('Comp reason is required');
		});

		it('should reject comp payment without approver', async () => {
			const caller = paymentRouter.createCaller(createIntegrationContext());

			await expect(
				caller.process({
					venueId,
					orderId,
					amount: 108.25,
					paymentMethod: 'comp',
					compReason: 'VIP guest',
				})
			).rejects.toThrow('Comp approver is required');
		});
	});

	// ===== Refund Processing =====

	describe('Refund Processing', () => {
		it('should process full refund through API', async () => {
			const caller = paymentRouter.createCaller(createIntegrationContext());

			// Create payment first
			const payment = await caller.process({
				venueId,
				orderId,
				amount: 108.25,
				paymentMethod: 'card',
			});

			// Refund it
			const refunded = await caller.refund({
				paymentId: payment.id,
				refundAmount: 108.25,
				refundReason: 'Customer complaint',
				refundedBy: userId,
			});

			expect(refunded.isRefunded).toBe(true);
			expect(refunded.refundAmount).toBe(108.25);
			expect(refunded.refundReason).toBe('Customer complaint');
			expect(refunded.status).toBe('refunded');
		});

		it('should process partial refund', async () => {
			const caller = paymentRouter.createCaller(createIntegrationContext());

			const payment = await caller.process({
				venueId,
				orderId,
				amount: 108.25,
				paymentMethod: 'card',
			});

			const refunded = await caller.refund({
				paymentId: payment.id,
				refundAmount: 50,
				refundReason: 'Partial refund for item removal',
				refundedBy: userId,
			});

			expect(refunded.isRefunded).toBe(true);
			expect(refunded.refundAmount).toBe(50);
		});

		it('should reject refund on already refunded payment', async () => {
			const caller = paymentRouter.createCaller(createIntegrationContext());

			const payment = await caller.process({
				venueId,
				orderId,
				amount: 108.25,
				paymentMethod: 'card',
			});

			// First refund
			await caller.refund({
				paymentId: payment.id,
				refundAmount: 108.25,
				refundReason: 'First refund',
				refundedBy: userId,
			});

			// Second refund should fail
			await expect(
				caller.refund({
					paymentId: payment.id,
					refundAmount: 10,
					refundReason: 'Second refund',
					refundedBy: userId,
				})
			).rejects.toThrow('Payment already refunded');
		});

		it('should reject refund exceeding payment amount', async () => {
			const caller = paymentRouter.createCaller(createIntegrationContext());

			const payment = await caller.process({
				venueId,
				orderId,
				amount: 108.25,
				paymentMethod: 'card',
			});

			await expect(
				caller.refund({
					paymentId: payment.id,
					refundAmount: 200,
					refundReason: 'Too much',
					refundedBy: userId,
				})
			).rejects.toThrow('Refund amount cannot exceed payment amount');
		});
	});

	// ===== Payment Queries =====

	describe('Payment Queries', () => {
		it('should get all payments for an order', async () => {
			const caller = paymentRouter.createCaller(createIntegrationContext());

			// Create multiple payments for split check
			await caller.process({
				venueId,
				orderId,
				amount: 50,
				paymentMethod: 'card',
			});

			await caller.process({
				venueId,
				orderId,
				amount: 58.25,
				paymentMethod: 'cash',
			});

			const payments = await caller.getOrderPayments({ orderId });

			expect(payments).toHaveLength(2);
			expect(payments[0].amount).toBe(50);
			expect(payments[1].amount).toBe(58.25);
		});

		it('should calculate total paid amount for order', async () => {
			const caller = paymentRouter.createCaller(createIntegrationContext());

			await caller.process({
				venueId,
				orderId,
				amount: 50,
				tipAmount: 10,
				paymentMethod: 'card',
			});

			await caller.process({
				venueId,
				orderId,
				amount: 58.25,
				tipAmount: 5,
				paymentMethod: 'cash',
			});

			const totalPaid = await caller.getTotalPaid({ orderId });

			// 50 + 10 + 58.25 + 5 = 123.25
			expect(totalPaid).toBeCloseTo(123.25, 2);
		});

		it('should check if order is fully paid', async () => {
			const caller = paymentRouter.createCaller(createIntegrationContext());

			// Order total is 108.25
			await caller.process({
				venueId,
				orderId,
				amount: 108.25,
				paymentMethod: 'card',
			});

			const isFullyPaid = await caller.isFullyPaid({ orderId });

			expect(isFullyPaid).toBe(true);
		});

		it('should return false for partially paid order', async () => {
			const caller = paymentRouter.createCaller(createIntegrationContext());

			// Order total is 108.25, only pay 50
			await caller.process({
				venueId,
				orderId,
				amount: 50,
				paymentMethod: 'card',
			});

			const isFullyPaid = await caller.isFullyPaid({ orderId });

			expect(isFullyPaid).toBe(false);
		});
	});

	// ===== Multi-Venue Isolation =====

	describe('Multi-Venue Data Isolation', () => {
		it('should isolate payments by venue', async () => {
			const caller = paymentRouter.createCaller(createIntegrationContext());

			// Create second venue and order
			const [venue2] = await db
				.insert(schema.venues)
				.values({
					id: 'venue-2',
					name: 'Second Restaurant',
					slug: 'second-restaurant',
					email: 'venue2@example.com',
					taxRate: 825,
					isActive: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			const [order2] = await db
				.insert(schema.orders)
				.values({
					id: 'order-2',
					venueId: venue2.id,
					orderNumber: 1,
					tableNumber: 10,
					orderType: 'dine_in',
					status: 'open',
					subtotal: 50,
					tax: 4.13,
					total: 54.13,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			// Create payment for venue 1
			await caller.process({
				venueId,
				orderId,
				amount: 108.25,
				paymentMethod: 'card',
			});

			// Create caller for venue 2
			const baseContext = createIntegrationContext();
			const caller2 = paymentRouter.createCaller({
				...baseContext,
				user: {
					...baseContext.user,
					venueId: venue2.id,
				},
			});

			await caller2.process({
				venueId: venue2.id,
				orderId: order2.id,
				amount: 54.13,
				paymentMethod: 'cash',
			});

			// List payments for venue 1 - should only see venue 1 payment
			const venue1Payments = await caller.getOrderPayments({ orderId });
			expect(venue1Payments).toHaveLength(1);
			expect(venue1Payments[0].amount).toBe(108.25);

			// List payments for venue 2 - should only see venue 2 payment
			const venue2Payments = await caller2.getOrderPayments({ orderId: order2.id });
			expect(venue2Payments).toHaveLength(1);
			expect(venue2Payments[0].amount).toBe(54.13);
		});
	});
});
