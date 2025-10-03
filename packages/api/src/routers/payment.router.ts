import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

/**
 * Payment validation schemas for tRPC
 * TODO: Move to shared package when Payment Service is implemented
 */
const processPaymentSchema = z.object({
	orderId: z.string(),
	amount: z.number().positive(),
	paymentMethod: z.enum(['cash', 'card', 'gift_card']),
	// Card payments
	cardToken: z.string().optional(),
	// Cash payments
	cashReceived: z.number().positive().optional(),
	// Tip
	tipAmount: z.number().min(0).default(0),
});

const refundPaymentSchema = z.object({
	paymentId: z.string(),
	amount: z.number().positive(),
	reason: z.string().optional(),
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
	 * TODO: Integrate with Stripe and Payment Service
	 */
	process: protectedProcedure
		.input(processPaymentSchema)
		.mutation(async ({ ctx: _ctx, input: _input }) => {
			// Stub implementation
			throw new TRPCError({
				code: 'NOT_IMPLEMENTED',
				message: 'Payment processing not yet implemented. Payment Service in development (Week 3).',
			});

			// Future implementation:
			// const payment = await ctx.paymentService.processPayment({
			//   orderId: input.orderId,
			//   amount: input.amount,
			//   method: input.paymentMethod,
			//   cardToken: input.cardToken,
			//   cashReceived: input.cashReceived,
			//   tipAmount: input.tipAmount,
			//   userId: ctx.user.id,
			// });
			// return payment;
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
	 * TODO: Implement refund processing
	 */
	refund: protectedProcedure
		.input(refundPaymentSchema)
		.mutation(async ({ ctx: _ctx, input: _input }) => {
			throw new TRPCError({
				code: 'NOT_IMPLEMENTED',
				message: 'Refund processing not yet implemented.',
			});
		}),

	/**
	 * Get payment history for an order
	 * TODO: Implement payment history query
	 */
	getOrderPayments: protectedProcedure
		.input(z.object({ orderId: z.string() }))
		.query(async ({ ctx: _ctx, input: _input }) => {
			throw new TRPCError({
				code: 'NOT_IMPLEMENTED',
				message: 'Payment history not yet implemented.',
			});
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
