/**
 * Payment Service
 * Handles payment processing, split checks, tips, refunds, and comps
 */

import { newPaymentSchema } from '@host/shared';
import { eq } from 'drizzle-orm';
import type { Database } from '../client';
import { orders } from '../schema/orders';
import { payments } from '../schema/payments';
import type { Payment } from '../schema/payments';

/**
 * Input for processing a payment
 */
export interface ProcessPaymentInput {
	venueId: string;
	orderId: string;
	amount: number;
	tipAmount?: number;
	paymentMethod: 'card' | 'cash' | 'check' | 'gift_card' | 'comp';
	cardLastFour?: string;
	cardBrand?: string;
	processor?: string;
	processorTransactionId?: string;
	processorFee?: number;
	compReason?: string;
	compBy?: string;
}

/**
 * Input for refunding a payment
 */
export interface RefundPaymentInput {
	paymentId: string;
	refundAmount: number;
	refundReason: string;
	refundedBy: string;
}

/**
 * Payment Service
 */
export class PaymentService {
	constructor(private db: Database) {}

	/**
	 * Process a payment for an order
	 * @throws {ZodError} If validation fails
	 * @throws {Error} If order is not found or business rules violated
	 */
	async processPayment(data: ProcessPaymentInput): Promise<Payment> {
		// Validate order exists
		const [order] = await this.db.select().from(orders).where(eq(orders.id, data.orderId));

		if (!order) {
			throw new Error('Order not found');
		}

		// Business rule: Comp payments require reason and approver
		if (data.paymentMethod === 'comp') {
			if (!data.compReason) {
				throw new Error('Comp reason is required for comped payments');
			}
			if (!data.compBy) {
				throw new Error('Comp approver is required for comped payments');
			}
		}

		// Validate input with Zod schema
		const validated = newPaymentSchema.parse({
			...data,
			tipAmount: data.tipAmount ?? 0,
			status: 'completed',
			processedAt: new Date(),
		});

		// Insert payment
		const [payment] = await this.db
			.insert(payments)
			.values({
				...validated,
				processedAt: new Date(),
			})
			.returning();

		if (!payment) {
			throw new Error('Failed to process payment');
		}

		return payment;
	}

	/**
	 * Refund a payment (full or partial)
	 * @throws {Error} If payment not found, already refunded, or refund amount exceeds payment
	 */
	async refundPayment(data: RefundPaymentInput): Promise<Payment> {
		// Get payment
		const payment = await this.getPaymentById(data.paymentId);
		if (!payment) {
			throw new Error('Payment not found');
		}

		// Check if already refunded
		if (payment.isRefunded) {
			throw new Error('Payment already refunded');
		}

		// Validate refund amount
		if (data.refundAmount > payment.amount) {
			throw new Error('Refund amount cannot exceed payment amount');
		}

		// Update payment with refund info
		const [refunded] = await this.db
			.update(payments)
			.set({
				isRefunded: true,
				refundAmount: data.refundAmount,
				refundReason: data.refundReason,
				refundedBy: data.refundedBy,
				refundedAt: new Date(),
				status: 'refunded',
			})
			.where(eq(payments.id, data.paymentId))
			.returning();

		if (!refunded) {
			throw new Error('Failed to refund payment');
		}

		return refunded;
	}

	/**
	 * Get payment by ID
	 */
	async getPaymentById(paymentId: string): Promise<Payment | null> {
		const [payment] = await this.db.select().from(payments).where(eq(payments.id, paymentId));

		return payment || null;
	}

	/**
	 * Get all payments for an order
	 */
	async getPaymentsByOrder(orderId: string): Promise<Payment[]> {
		return await this.db.select().from(payments).where(eq(payments.orderId, orderId));
	}

	/**
	 * Get all payments for a venue
	 */
	async getPaymentsByVenue(venueId: string): Promise<Payment[]> {
		return await this.db.select().from(payments).where(eq(payments.venueId, venueId));
	}

	/**
	 * Calculate total amount paid for an order (including tips)
	 */
	async getTotalPaidAmount(orderId: string): Promise<number> {
		const orderPayments = await this.getPaymentsByOrder(orderId);

		// Sum payment amounts + tips, excluding refunded payments
		const total = orderPayments
			.filter(p => !p.isRefunded)
			.reduce((sum, payment) => sum + payment.amount + payment.tipAmount, 0);

		return total;
	}

	/**
	 * Check if an order is fully paid
	 */
	async isOrderFullyPaid(orderId: string): Promise<boolean> {
		// Get order
		const [order] = await this.db.select().from(orders).where(eq(orders.id, orderId));

		if (!order) {
			throw new Error('Order not found');
		}

		// Get total paid
		const totalPaid = await this.getTotalPaidAmount(orderId);

		// Check if paid amount >= order total
		return totalPaid >= order.total;
	}
}
