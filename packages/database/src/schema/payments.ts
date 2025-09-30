/**
 * Payment Schema
 * Payment processing with support for split checks, tips, refunds, and comp tracking
 */

import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { orders } from './orders';
import { venues } from './venues';

export const payments = sqliteTable('payments', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	venueId: text('venue_id')
		.notNull()
		.references(() => venues.id, { onDelete: 'cascade' }),
	orderId: text('order_id')
		.notNull()
		.references(() => orders.id, { onDelete: 'cascade' }),

	// Payment Details
	amount: real('amount').notNull(),
	tipAmount: real('tip_amount').notNull().default(0),
	paymentMethod: text('payment_method', {
		enum: ['card', 'cash', 'check', 'gift_card', 'comp'],
	}).notNull(),
	status: text('status', {
		enum: ['pending', 'completed', 'failed', 'refunded'],
	})
		.notNull()
		.default('pending'),

	// Card Details
	cardLastFour: text('card_last_four'),
	cardBrand: text('card_brand'),

	// Payment Processor
	processor: text('processor'),
	processorTransactionId: text('processor_transaction_id'),
	processorFee: real('processor_fee'),

	// Refund Tracking
	isRefunded: integer('is_refunded', { mode: 'boolean' }).notNull().default(false),
	refundAmount: real('refund_amount'),
	refundReason: text('refund_reason'),
	refundedAt: integer('refunded_at', { mode: 'timestamp' }),
	refundedBy: text('refunded_by'),

	// Comp/House Tracking
	compReason: text('comp_reason'),
	compBy: text('comp_by'),

	// Timestamps
	processedAt: integer('processed_at', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdate(() => new Date()),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
	venue: one(venues, {
		fields: [payments.venueId],
		references: [venues.id],
	}),
	order: one(orders, {
		fields: [payments.orderId],
		references: [orders.id],
	}),
}));

// Types
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
