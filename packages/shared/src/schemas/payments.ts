/**
 * Payment Validation Schemas
 * Runtime validation for payment entities using Zod
 * Bar-specific features: split checks, tips, comps, refunds
 */

import { z } from 'zod';

/**
 * New Payment Schema
 * Validation for creating new payment records
 */
export const newPaymentSchema = z.object({
	venueId: z.string().min(1, 'Venue ID is required'),
	orderId: z.string().min(1, 'Order ID is required'),
	amount: z.number().positive('Payment amount must be greater than zero'),
	tipAmount: z.number().min(0, 'Tip amount cannot be negative').optional(),
	paymentMethod: z.enum(['card', 'cash', 'check', 'gift_card', 'comp']),
	status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),

	// Card Details
	cardLastFour: z
		.string()
		.length(4, 'Card last four must be exactly 4 digits')
		.regex(/^\d{4}$/, 'Card last four must be numeric')
		.optional(),
	cardBrand: z.string().optional(),

	// Payment Processor
	processor: z.string().optional(),
	processorTransactionId: z.string().optional(),
	processorFee: z.number().min(0, 'Processor fee cannot be negative').optional(),

	// Refund Tracking
	isRefunded: z.boolean().optional(),
	refundAmount: z.number().min(0, 'Refund amount cannot be negative').optional(),
	refundReason: z.string().optional(),
	refundedAt: z.date().optional(),
	refundedBy: z.string().optional(),

	// Comp/House Tracking (bar-specific)
	compReason: z.string().optional(),
	compBy: z.string().optional(),

	// Timestamps
	processedAt: z.date().optional(),
});

/**
 * Payment Schema (Full)
 * Validation for complete payment records including generated fields
 */
const basePaymentSchema = z.object({
	venueId: z.string().min(1, 'Venue ID is required'),
	orderId: z.string().min(1, 'Order ID is required'),
	amount: z.number().positive('Payment amount must be greater than zero'),
	tipAmount: z.number().min(0, 'Tip amount cannot be negative'),
	paymentMethod: z.enum(['card', 'cash', 'check', 'gift_card', 'comp']),
	status: z.enum(['pending', 'completed', 'failed', 'refunded']),

	// Card Details
	cardLastFour: z
		.string()
		.length(4, 'Card last four must be exactly 4 digits')
		.regex(/^\d{4}$/, 'Card last four must be numeric')
		.nullable()
		.optional(),
	cardBrand: z.string().nullable().optional(),

	// Payment Processor
	processor: z.string().nullable().optional(),
	processorTransactionId: z.string().nullable().optional(),
	processorFee: z.number().min(0, 'Processor fee cannot be negative').nullable().optional(),

	// Refund Tracking
	isRefunded: z.boolean(),
	refundAmount: z.number().min(0, 'Refund amount cannot be negative').nullable().optional(),
	refundReason: z.string().nullable().optional(),
	refundedAt: z.date().nullable().optional(),
	refundedBy: z.string().nullable().optional(),

	// Comp/House Tracking (bar-specific)
	compReason: z.string().nullable().optional(),
	compBy: z.string().nullable().optional(),

	// Timestamps
	processedAt: z.date().nullable().optional(),
});

export const paymentSchema = basePaymentSchema
	.extend({
		id: z.string().min(1, 'Payment ID is required'),
		createdAt: z.date(),
		updatedAt: z.date(),
	})
	.refine(
		data => {
			// Validate refund amount doesn't exceed payment amount
			if (data.refundAmount && data.refundAmount > data.amount) {
				return false;
			}
			return true;
		},
		{
			message: 'Refund amount cannot exceed payment amount',
			path: ['refundAmount'],
		}
	);

// Type exports
export type NewPayment = z.infer<typeof newPaymentSchema>;
export type Payment = z.infer<typeof paymentSchema>;
