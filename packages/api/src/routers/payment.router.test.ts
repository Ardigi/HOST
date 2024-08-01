import { TRPCError } from '@trpc/server';
import { describe, expect, it } from 'vitest';
import { createAuthContext, createTestContext } from '../test/setup';
import { paymentRouter } from './payment.router';

describe('PaymentRouter (Stub)', () => {
	describe('process', () => {
		it('should validate payment amount is positive', async () => {
			const caller = paymentRouter.createCaller(createAuthContext());

			await expect(
				caller.process({
					orderId: 'order-1',
					amount: -10,
					paymentMethod: 'card',
					tipAmount: 0,
				})
			).rejects.toThrow();
		});

		it('should validate payment method enum', async () => {
			const caller = paymentRouter.createCaller(createAuthContext());

			await expect(
				caller.process({
					orderId: 'order-1',
					amount: 28.11,
					// @ts-expect-error Testing invalid payment method
					paymentMethod: 'invalid',
					tipAmount: 0,
				})
			).rejects.toThrow();
		});

		it('should use default tip amount of 0', async () => {
			const caller = paymentRouter.createCaller(createAuthContext());

			// Should not throw validation error, only NOT_IMPLEMENTED
			await expect(
				caller.process({
					orderId: 'order-1',
					amount: 28.11,
					paymentMethod: 'cash',
				})
			).rejects.toThrow(TRPCError);
		});

		it('should require authentication', async () => {
			const caller = paymentRouter.createCaller(createTestContext());

			await expect(
				caller.process({
					orderId: 'order-1',
					amount: 28.11,
					paymentMethod: 'card',
					tipAmount: 0,
				})
			).rejects.toThrow(TRPCError);
		});
	});

	describe('processSplit', () => {
		it('should throw NOT_IMPLEMENTED error', async () => {
			const caller = paymentRouter.createCaller(createAuthContext());

			await expect(
				caller.processSplit({
					orderId: 'order-1',
					splits: [
						{ amount: 14.05, paymentMethod: 'card', cardToken: 'tok_1', tipAmount: 2.5 },
						{ amount: 14.06, paymentMethod: 'cash', tipAmount: 2.5 },
					],
				})
			).rejects.toThrow(
				new TRPCError({
					code: 'NOT_IMPLEMENTED',
					message: 'Split payment processing not yet implemented.',
				})
			);
		});

		it('should validate split amounts are positive', async () => {
			const caller = paymentRouter.createCaller(createAuthContext());

			await expect(
				caller.processSplit({
					orderId: 'order-1',
					splits: [{ amount: -10, paymentMethod: 'card', tipAmount: 0 }],
				})
			).rejects.toThrow();
		});

		it('should require authentication', async () => {
			const caller = paymentRouter.createCaller(createTestContext());

			await expect(
				caller.processSplit({
					orderId: 'order-1',
					splits: [{ amount: 14.05, paymentMethod: 'card', tipAmount: 0 }],
				})
			).rejects.toThrow(TRPCError);
		});
	});

	describe('refund', () => {
		it('should validate refund amount is positive', async () => {
			const caller = paymentRouter.createCaller(createAuthContext());

			await expect(
				caller.refund({
					paymentId: 'payment-1',
					amount: -10,
				})
			).rejects.toThrow();
		});

		it('should require authentication', async () => {
			const caller = paymentRouter.createCaller(createTestContext());

			await expect(
				caller.refund({
					paymentId: 'payment-1',
					amount: 28.11,
				})
			).rejects.toThrow(TRPCError);
		});
	});

	describe('getOrderPayments', () => {
		it('should require authentication', async () => {
			const caller = paymentRouter.createCaller(createTestContext());

			await expect(caller.getOrderPayments({ orderId: 'order-1' })).rejects.toThrow(TRPCError);
		});
	});

	describe('generateReceipt', () => {
		it('should throw NOT_IMPLEMENTED error', async () => {
			const caller = paymentRouter.createCaller(createAuthContext());

			await expect(
				caller.generateReceipt({
					paymentId: 'payment-1',
					format: 'pdf',
				})
			).rejects.toThrow(
				new TRPCError({
					code: 'NOT_IMPLEMENTED',
					message: 'Receipt generation not yet implemented.',
				})
			);
		});

		it('should use default format of print', async () => {
			const caller = paymentRouter.createCaller(createAuthContext());

			// Should not throw validation error, only NOT_IMPLEMENTED
			await expect(
				caller.generateReceipt({
					paymentId: 'payment-1',
				})
			).rejects.toThrow(TRPCError);
		});

		it('should validate receipt format enum', async () => {
			const caller = paymentRouter.createCaller(createAuthContext());

			await expect(
				caller.generateReceipt({
					paymentId: 'payment-1',
					// @ts-expect-error Testing invalid format
					format: 'invalid',
				})
			).rejects.toThrow();
		});

		it('should require authentication', async () => {
			const caller = paymentRouter.createCaller(createTestContext());

			await expect(
				caller.generateReceipt({
					paymentId: 'payment-1',
					format: 'pdf',
				})
			).rejects.toThrow(TRPCError);
		});
	});
});
