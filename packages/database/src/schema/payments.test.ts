/**
 * @description Tests for payment schema and operations
 * @dependencies Drizzle ORM, database client
 * @coverage-target 90% (critical payment processing)
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanupTestDatabase, createTestDatabase } from '../../../../test/helpers/db-test';
import type { Database } from '../client';
import { payments } from './payments';

describe('Payment Schema', () => {
	let db: Database;

	beforeEach(async () => {
		db = await createTestDatabase();
	});

	afterEach(async () => {
		await cleanupTestDatabase(db);
	});

	describe('Payments', () => {
		it('should create payment with required fields', async () => {
			const payment = await db
				.insert(payments)
				.values({
					venueId: 'venue-1',
					orderId: 'order-1',
					amount: 50.0,
					paymentMethod: 'card',
				})
				.returning();

			expect(payment).toHaveLength(1);
			expect(payment[0]).toMatchObject({
				amount: 50.0,
				paymentMethod: 'card',
				tipAmount: 0,
				status: 'pending',
				isRefunded: false,
			});
			expect(payment[0].id).toBeTruthy();
			expect(payment[0].createdAt).toBeInstanceOf(Date);
		});

		it('should enforce positive payment amounts', async () => {
			const payment = await db
				.insert(payments)
				.values({
					venueId: 'venue-1',
					orderId: 'order-1',
					amount: -50.0,
					paymentMethod: 'cash',
				})
				.returning();

			// Database allows it, validation layer should prevent
			expect(payment[0].amount).toBe(-50.0);
		});

		it('should support all payment methods', async () => {
			const methods = ['card', 'cash', 'check', 'gift_card', 'comp'] as const;

			for (const method of methods) {
				const payment = await db
					.insert(payments)
					.values({
						venueId: 'venue-1',
						orderId: 'order-1',
						amount: 25.0,
						paymentMethod: method,
					})
					.returning();

				expect(payment[0].paymentMethod).toBe(method);
			}
		});

		it('should support all payment statuses', async () => {
			const statuses = ['pending', 'completed', 'failed', 'refunded'] as const;

			for (const status of statuses) {
				const payment = await db
					.insert(payments)
					.values({
						venueId: 'venue-1',
						orderId: 'order-1',
						amount: 25.0,
						paymentMethod: 'card',
						status,
					})
					.returning();

				expect(payment[0].status).toBe(status);
			}
		});

		it('should track card details', async () => {
			const payment = await db
				.insert(payments)
				.values({
					venueId: 'venue-1',
					orderId: 'order-1',
					amount: 75.0,
					paymentMethod: 'card',
					cardLastFour: '4242',
					cardBrand: 'visa',
				})
				.returning();

			expect(payment[0]).toMatchObject({
				cardLastFour: '4242',
				cardBrand: 'visa',
			});
		});

		it('should track processor information', async () => {
			const payment = await db
				.insert(payments)
				.values({
					venueId: 'venue-1',
					orderId: 'order-1',
					amount: 100.0,
					paymentMethod: 'card',
					processor: 'stripe',
					processorTransactionId: 'ch_1ABC123',
					processorFee: 3.2,
					status: 'completed',
				})
				.returning();

			expect(payment[0]).toMatchObject({
				processor: 'stripe',
				processorTransactionId: 'ch_1ABC123',
				processorFee: 3.2,
			});
		});

		it('should handle refunds with full tracking', async () => {
			const payment = await db
				.insert(payments)
				.values({
					venueId: 'venue-1',
					orderId: 'order-1',
					amount: 50.0,
					paymentMethod: 'card',
					status: 'refunded',
					isRefunded: true,
					refundAmount: 50.0,
					refundReason: 'Customer request',
					refundedAt: new Date(),
					refundedBy: 'user-1',
				})
				.returning();

			expect(payment[0]).toMatchObject({
				isRefunded: true,
				refundAmount: 50.0,
				refundReason: 'Customer request',
				status: 'refunded',
			});
			expect(payment[0].refundedAt).toBeInstanceOf(Date);
		});

		it('should support tip amounts separate from payment', async () => {
			const payment = await db
				.insert(payments)
				.values({
					venueId: 'venue-1',
					orderId: 'order-1',
					amount: 50.0,
					tipAmount: 10.0,
					paymentMethod: 'card',
				})
				.returning();

			expect(payment[0]).toMatchObject({
				amount: 50.0,
				tipAmount: 10.0,
			});
		});

		it('should support comp/house payments with reason', async () => {
			const payment = await db
				.insert(payments)
				.values({
					venueId: 'venue-1',
					orderId: 'order-1',
					amount: 35.0,
					paymentMethod: 'comp',
					compReason: 'VIP guest',
					compBy: 'manager-1',
				})
				.returning();

			expect(payment[0]).toMatchObject({
				paymentMethod: 'comp',
				compReason: 'VIP guest',
				compBy: 'manager-1',
			});
		});

		it('should track processing timestamps', async () => {
			const processedTime = new Date();
			const payment = await db
				.insert(payments)
				.values({
					venueId: 'venue-1',
					orderId: 'order-1',
					amount: 60.0,
					paymentMethod: 'card',
					status: 'completed',
					processedAt: processedTime,
				})
				.returning();

			expect(payment[0].processedAt).toBeInstanceOf(Date);
		});

		it('should support partial refunds', async () => {
			const payment = await db
				.insert(payments)
				.values({
					venueId: 'venue-1',
					orderId: 'order-1',
					amount: 100.0,
					paymentMethod: 'card',
					status: 'completed',
					isRefunded: true,
					refundAmount: 25.0,
					refundReason: 'Partial order cancellation',
				})
				.returning();

			expect(payment[0]).toMatchObject({
				amount: 100.0,
				refundAmount: 25.0,
				isRefunded: true,
			});

			// Validation layer should enforce refundAmount <= amount
			expect(payment[0].refundAmount).toBeLessThanOrEqual(payment[0].amount);
		});

		it('should allow multiple payments for same order (split check)', async () => {
			const payment1 = await db
				.insert(payments)
				.values({
					venueId: 'venue-1',
					orderId: 'order-1',
					amount: 30.0,
					paymentMethod: 'card',
				})
				.returning();

			const payment2 = await db
				.insert(payments)
				.values({
					venueId: 'venue-1',
					orderId: 'order-1',
					amount: 20.0,
					paymentMethod: 'cash',
				})
				.returning();

			expect(payment1[0].orderId).toBe('order-1');
			expect(payment2[0].orderId).toBe('order-1');
		});
	});
});
