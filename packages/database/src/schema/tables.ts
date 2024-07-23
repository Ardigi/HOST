import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { orders } from './orders';
import { venues } from './venues';

/**
 * Tables table
 * Stores physical table information for dine-in service
 */
export const tables = sqliteTable('tables', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	venueId: text('venue_id')
		.notNull()
		.references(() => venues.id, { onDelete: 'cascade' }),
	tableNumber: integer('table_number').notNull(),
	sectionName: text('section_name', {
		enum: ['bar', 'dining', 'patio', 'private'],
	}).notNull(),
	capacity: integer('capacity').notNull().default(4),
	status: text('status', {
		enum: ['available', 'occupied', 'reserved', 'dirty'],
	})
		.notNull()
		.default('available'),
	currentOrderId: text('current_order_id').references(() => orders.id, {
		onDelete: 'set null',
	}),
	notes: text('notes'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdateFn(() => new Date()),
});

/**
 * Define relations
 */
export const tablesRelations = relations(tables, ({ one }) => ({
	venue: one(venues, {
		fields: [tables.venueId],
		references: [venues.id],
	}),
	currentOrder: one(orders, {
		fields: [tables.currentOrderId],
		references: [orders.id],
	}),
}));

/**
 * Type exports
 */
export type Table = typeof tables.$inferSelect;
export type NewTable = typeof tables.$inferInsert;
