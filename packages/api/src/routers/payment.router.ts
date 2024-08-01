import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

/**
 * Payment validation schemas for tRPC
 * TODO: Move to shared package when Payment Service is implemented
 */
const processPaymentSchema = z.object({
	venueId: z.string(),
	orderId: z.string(),
	amount: z.number().positive(),
	paymentMethod: z.enum(['cash', 'card', 'check', 'gift_card', 'comp']),
	// Tip
	tipAmount: z.number().min(0).optional(),
	// Card details
	cardLastFour: z.string().optional(),
	cardBrand: z.string().optional(),
	processor: z.string().optional(),
	processorTransactionId: z.string().optional(),
	processorFee: z.number().optional(),
	// Comp details
	compReason: z.string().optional(),
	compBy: z.string().optional(),
});

const refundPaymentSchema = z.object({
	paymentId: z.string(),
	refundAmount: z.number().positive(),
	refundReason: z.string(),
	refundedBy: z.string(),
});

const splitPaymentSchema = z.object({
	orderId: z.string(),
	splits: z.array(
		z.object({
			amount: z.number().positive(),
			paymentMethod: z.enum(['cash', 'card', 'gift_card']),
			cardToken: z.string().optional(),
			tipAmount: z.number().min(0).default(0),
		})
	),
});

/**
 * Payment Router (STUB)
 * TODO: Implement full payment processing when Payment Service is ready
 *
 * Planned Features:
 * - Stripe Connect integration
 * - Cash payment handling
 * - Split payments
 * - Refund processing
 * - Receipt generation
 * - Payment history
 */
export const paymentRouter = router({
	/**
	 * Process a single payment
	 */
	process: protectedProcedure.input(processPaymentSchema).mutation(async ({ ctx, input }) => {
		try {
			const payment = await ctx.paymentService.processPayment({
				venueId: input.venueId,
				orderId: input.orderId,
				amount: input.amount,
				tipAmount: input.tipAmount,
				paymentMethod: input.paymentMethod,
				cardLastFour: input.cardLastFour,
				cardBrand: input.cardBrand,
				processor: input.processor,
				processorTransactionId: input.processorTransactionId,
				processorFee: input.processorFee,
				compReason: input.compReason,
				compBy: input.compBy,
			});

			return payment;
		} catch (error) {
			if (error instanceof Error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error.message,
				});
			}
			throw error;
		}
	}),

	/**
	 * Process split payment
	 * TODO: Implement split payment logic
	 */
	processSplit: protectedProcedure
		.input(splitPaymentSchema)
		.mutation(async ({ ctx: _ctx, input: _input }) => {
			throw new TRPCError({
				code: 'NOT_IMPLEMENTED',
				message: 'Split payment processing not yet implemented.',
			});
		}),

	/**
	 * Refund a payment
	 */
	refund: protectedProcedure.input(refundPaymentSchema).mutation(async ({ ctx, input }) => {
		try {
			const refunded = await ctx.paymentService.refundPayment({
				paymentId: input.paymentId,
				refundAmount: input.refundAmount,
				refundReason: input.refundReason,
				refundedBy: input.refundedBy,
			});

			return refunded;
		} catch (error) {
			if (error instanceof Error) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: error.message,
				});
			}
			throw error;
		}
	}),

	/**
	 * Get payment history for an order
	 */
	getOrderPayments: protectedProcedure
		.input(z.object({ orderId: z.string() }))
		.query(async ({ ctx, input }) => {
			return await ctx.paymentService.getPaymentsByOrder(input.orderId);
		}),

	/**
	 * Get total paid amount for an order
	 */
	getTotalPaid: protectedProcedure
		.input(z.object({ orderId: z.string() }))
		.query(async ({ ctx, input }) => {
			return await ctx.paymentService.getTotalPaidAmount(input.orderId);
		}),

	/**
	 * Check if order is fully paid
	 */
	isFullyPaid: protectedProcedure
		.input(z.object({ orderId: z.string() }))
		.query(async ({ ctx, input }) => {
			return await ctx.paymentService.isOrderFullyPaid(input.orderId);
		}),

	/**
	 * Generate receipt
	 * TODO: Implement receipt generation
	 */
	generateReceipt: protectedProcedure
		.input(
			z.object({
				paymentId: z.string(),
				format: z.enum(['pdf', 'email', 'print']).default('print'),
			})
		)
		.mutation(async ({ ctx: _ctx, input: _input }) => {
			throw new TRPCError({
				code: 'NOT_IMPLEMENTED',
				message: 'Receipt generation not yet implemented.',
			});
		}),
});
