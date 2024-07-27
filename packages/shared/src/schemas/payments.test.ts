/**
 * Payment Validation Tests
 * Comprehensive validation tests for payment schemas using Zod
 *
 * @phase REFACTOR - Adding runtime validation layer on top of database schema
 * @coverage-target 90%+ (critical payment validation)
 */

import { describe, expect, it } from 'vitest';
import { type NewPayment, type Payment, newPaymentSchema, paymentSchema } from './payments';

describe('Payment Validation Schemas', () => {
	describe('newPaymentSchema', () => {
		it('should validate payment with required fields', () => {
			const validPayment: NewPayment = {
				venueId: 'venue-123',
				orderId: 'order-456',
				amount: 50.0,
				paymentMethod: 'card',
			};

			const result = newPaymentSchema.safeParse(validPayment);
			expect(result.success).toBe(true);
		});

		it('should reject negative payment amounts', () => {
			const invalidPayment = {
				venueId: 'venue-123',
				orderId: 'order-456',
				amount: -50.0,
				paymentMethod: 'card',
			};

			const result = newPaymentSchema.safeParse(invalidPayment);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toContain('greater than zero');
			}
		});

		it('should reject zero payment amounts with specific error', () => {
			const invalidPayment = {
				venueId: 'venue-123',
				orderId: 'order-456',
				amount: 0,
				paymentMethod: 'card',
			};

			const result = newPaymentSchema.safeParse(invalidPayment);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['amount']);
				expect(result.error.issues[0].message).toContain('greater than zero');
			}
		});

		it('should validate all payment methods', () => {
			const methods = ['card', 'cash', 'check', 'gift_card', 'comp'] as const;

			for (const method of methods) {
				const payment = {
					venueId: 'venue-123',
					orderId: 'order-456',
					amount: 25.0,
					paymentMethod: method,
				};

				const result = newPaymentSchema.safeParse(payment);
				expect(result.success).toBe(true);
			}
		});

		it('should reject invalid payment method with specific error', () => {
			const invalidPayment = {
				venueId: 'venue-123',
				orderId: 'order-456',
				amount: 25.0,
				paymentMethod: 'bitcoin',
			};

			const result = newPaymentSchema.safeParse(invalidPayment);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['paymentMethod']);
				expect(result.error.issues[0].message).toMatch(/invalid.*enum/i);
			}
		});

		it('should validate optional tip amount', () => {
			const paymentWithTip = {
				venueId: 'venue-123',
				orderId: 'order-456',
				amount: 50.0,
				paymentMethod: 'card',
				tipAmount: 10.0,
			};

			const result = newPaymentSchema.safeParse(paymentWithTip);
			expect(result.success).toBe(true);
		});

		it('should reject negative tip amounts with specific error', () => {
			const invalidPayment = {
				venueId: 'venue-123',
				orderId: 'order-456',
				amount: 50.0,
				paymentMethod: 'card',
				tipAmount: -5.0,
			};

			const result = newPaymentSchema.safeParse(invalidPayment);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['tipAmount']);
				expect(result.error.issues[0].message).toMatch(/tip amount cannot be negative/i);
			}
		});

		it('should validate card details', () => {
			const cardPayment = {
				venueId: 'venue-123',
				orderId: 'order-456',
				amount: 50.0,
				paymentMethod: 'card',
				cardLastFour: '4242',
				cardBrand: 'visa',
			};

			const result = newPaymentSchema.safeParse(cardPayment);
			expect(result.success).toBe(true);
		});

		it('should enforce 4-digit card last four with specific error', () => {
			const invalidCardPayment = {
				venueId: 'venue-123',
				orderId: 'order-456',
				amount: 50.0,
				paymentMethod: 'card',
				cardLastFour: '42',
			};

			const result = newPaymentSchema.safeParse(invalidCardPayment);
			expect(result.success).toBe(false);
			if (!result.success) {
				// Has 2 errors: length validation AND regex validation
				expect(result.error.issues.length).toBeGreaterThanOrEqual(1);
				const lengthError = result.error.issues.find(issue => issue.path[0] === 'cardLastFour');
				expect(lengthError).toBeDefined();
				expect(lengthError?.message).toMatch(/exactly 4 digits/i);
			}
		});

		it('should validate processor information', () => {
			const paymentWithProcessor = {
				venueId: 'venue-123',
				orderId: 'order-456',
				amount: 50.0,
				paymentMethod: 'card',
				processor: 'stripe',
				processorTransactionId: 'ch_1234567890',
				processorFee: 1.75,
			};

			const result = newPaymentSchema.safeParse(paymentWithProcessor);
			expect(result.success).toBe(true);
		});

		it('should reject negative processor fees with specific error', () => {
			const invalidPayment = {
				venueId: 'venue-123',
				orderId: 'order-456',
				amount: 50.0,
				paymentMethod: 'card',
				processorFee: -1.75,
			};

			const result = newPaymentSchema.safeParse(invalidPayment);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['processorFee']);
				expect(result.error.issues[0].message).toMatch(/processor fee cannot be negative/i);
			}
		});

		it('should validate comp payment with reason', () => {
			const compPayment = {
				venueId: 'venue-123',
				orderId: 'order-456',
				amount: 25.0,
				paymentMethod: 'comp',
				compReason: 'Manager comp - VIP customer',
				compBy: 'manager-123',
			};

			const result = newPaymentSchema.safeParse(compPayment);
			expect(result.success).toBe(true);
		});

		it('should validate all payment statuses', () => {
			const statuses = ['pending', 'completed', 'failed', 'refunded'] as const;

			for (const status of statuses) {
				const payment = {
					venueId: 'venue-123',
					orderId: 'order-456',
					amount: 25.0,
					paymentMethod: 'card',
					status,
				};

				const result = newPaymentSchema.safeParse(payment);
				expect(result.success).toBe(true);
			}
		});

		it('should reject invalid status with specific error', () => {
			const invalidPayment = {
				venueId: 'venue-123',
				orderId: 'order-456',
				amount: 25.0,
				paymentMethod: 'card',
				status: 'processing',
			};

			const result = newPaymentSchema.safeParse(invalidPayment);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['status']);
				expect(result.error.issues[0].message).toMatch(/invalid.*enum/i);
			}
		});

		it('should require venueId to be non-empty with specific error', () => {
			const invalidPayment = {
				venueId: '',
				orderId: 'order-456',
				amount: 25.0,
				paymentMethod: 'card',
			};

			const result = newPaymentSchema.safeParse(invalidPayment);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['venueId']);
				expect(result.error.issues[0].message).toMatch(/venue id is required/i);
			}
		});

		it('should require orderId to be non-empty with specific error', () => {
			const invalidPayment = {
				venueId: 'venue-123',
				orderId: '',
				amount: 25.0,
				paymentMethod: 'card',
			};

			const result = newPaymentSchema.safeParse(invalidPayment);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues).toHaveLength(1);
				expect(result.error.issues[0].path).toEqual(['orderId']);
				expect(result.error.issues[0].message).toMatch(/order id is required/i);
			}
		});
	});

	describe('paymentSchema (full payment)', () => {
		it('should validate complete payment record', () => {
			const fullPayment: Payment = {
				id: 'pay-123',
				venueId: 'venue-123',
				orderId: 'order-456',
				amount: 50.0,
				tipAmount: 10.0,
				paymentMethod: 'card',
				status: 'completed',
				cardLastFour: '4242',
				cardBrand: 'visa',
				processor: 'stripe',
				processorTransactionId: 'ch_1234567890',
				processorFee: 1.75,
				isRefunded: false,
				refundAmount: null,
				refundReason: null,
				refundedAt: null,
				refundedBy: null,
				compReason: null,
				compBy: null,
				processedAt: new Date(),
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = paymentSchema.safeParse(fullPayment);
			expect(result.success).toBe(true);
		});

		it('should validate refunded payment', () => {
			const refundedPayment: Payment = {
				id: 'pay-123',
				venueId: 'venue-123',
				orderId: 'order-456',
				amount: 50.0,
				tipAmount: 0,
				paymentMethod: 'card',
				status: 'refunded',
				cardLastFour: null,
				cardBrand: null,
				processor: null,
				processorTransactionId: null,
				processorFee: null,
				isRefunded: true,
				refundAmount: 50.0,
				refundReason: 'Customer request',
				refundedAt: new Date(),
				refundedBy: 'manager-123',
				compReason: null,
				compBy: null,
				processedAt: new Date(),
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = paymentSchema.safeParse(refundedPayment);
			expect(result.success).toBe(true);
		});

		it('should validate partial refund', () => {
			const partialRefund: Payment = {
				id: 'pay-123',
				venueId: 'venue-123',
				orderId: 'order-456',
				amount: 100.0,
				tipAmount: 0,
				paymentMethod: 'card',
				status: 'completed',
				cardLastFour: null,
				cardBrand: null,
				processor: null,
				processorTransactionId: null,
				processorFee: null,
				isRefunded: true,
				refundAmount: 25.0,
				refundReason: 'Partial refund for item removal',
				refundedAt: new Date(),
				refundedBy: 'server-456',
				compReason: null,
				compBy: null,
				processedAt: new Date(),
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = paymentSchema.safeParse(partialRefund);
			expect(result.success).toBe(true);
		});

		it('should reject refund amount greater than payment amount', () => {
			const invalidRefund: Partial<Payment> = {
				id: 'pay-123',
				venueId: 'venue-123',
				orderId: 'order-456',
				amount: 50.0,
				tipAmount: 0,
				paymentMethod: 'card',
				status: 'refunded',
				isRefunded: true,
				refundAmount: 75.0,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = paymentSchema.safeParse(invalidRefund);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toContain('exceed');
			}
		});

		it('should require id to be non-empty with specific error', () => {
			const invalidPayment = {
				id: '',
				venueId: 'venue-123',
				orderId: 'order-456',
				amount: 25.0,
				paymentMethod: 'card',
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = paymentSchema.safeParse(invalidPayment);
			expect(result.success).toBe(false);
			if (!result.success) {
				// Has multiple errors: id, tipAmount, status, isRefunded are all missing
				expect(result.error.issues.length).toBeGreaterThanOrEqual(1);
				const idError = result.error.issues.find(issue => issue.path[0] === 'id');
				expect(idError).toBeDefined();
				expect(idError?.message).toMatch(/payment id is required/i);
			}
		});
	});
});
