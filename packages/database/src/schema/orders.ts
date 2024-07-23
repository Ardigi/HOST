import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { venues } from './venues';

/**
 * Orders table
 * Stores order information including status, totals, and timestamps
 */
export const orders = sqliteTable('orders', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	orderNumber: integer('order_number').notNull(),
	venueId: text('venue_id')
		.notNull()
		.references(() => venues.id, { onDelete: 'cascade' }),
	serverId: text('server_id')
		.notNull()
		.references(() => users.id),
	tableNumber: integer('table_number'),
	guestCount: integer('guest_count').default(1),
	status: text('status', {
		enum: ['open', 'sent', 'completed', 'cancelled', 'voided'],
	})
		.notNull()
		.default('open'),
	orderType: text('order_type', { enum: ['dine_in', 'takeout', 'delivery', 'bar'] })
		.notNull()
		.default('dine_in'),
	subtotal: real('subtotal').notNull().default(0),
	tax: real('tax').notNull().default(0),
	tip: real('tip').default(0),
	discount: real('discount').default(0),
	total: real('total').notNull().default(0),
	notes: text('notes'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdateFn(() => new Date()),
	completedAt: integer('completed_at', { mode: 'timestamp' }),
});

/**
 * Order Items table
 * Stores individual items in an order with modifiers and pricing
 */
export const orderItems = sqliteTable('order_items', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	orderId: text('order_id')
		.notNull()
		.references(() => orders.id, { onDelete: 'cascade' }),
	menuItemId: text('menu_item_id').notNull(),
	name: text('name').notNull(),
	quantity: integer('quantity').notNull().default(1),
	price: real('price').notNull(),
	modifierTotal: real('modifier_total').notNull().default(0),
	total: real('total').notNull(),
	notes: text('notes'),
	status: text('status', { enum: ['pending', 'sent', 'preparing', 'ready', 'delivered'] })
		.notNull()
		.default('pending'),
	sentToKitchenAt: integer('sent_to_kitchen_at', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
});

/**
 * Order Item Modifiers table
 * Stores modifications to order items (e.g., extra cheese, no onions)
 */
export const orderItemModifiers = sqliteTable('order_item_modifiers', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	orderItemId: text('order_item_id')
		.notNull()
		.references(() => orderItems.id, { onDelete: 'cascade' }),
	modifierId: text('modifier_id').notNull(),
	name: text('name').notNull(),
	price: real('price').notNull().default(0),
	quantity: integer('quantity').notNull().default(1),
});

/**
 * Define relations between tables
 */
export const ordersRelations = relations(orders, ({ one, many }) => ({
	venue: one(venues, {
		fields: [orders.venueId],
		references: [venues.id],
	}),
	server: one(users, {
		fields: [orders.serverId],
		references: [users.id],
	}),
	items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id],
	}),
	modifiers: many(orderItemModifiers),
}));

export const orderItemModifiersRelations = relations(orderItemModifiers, ({ one }) => ({
	orderItem: one(orderItems, {
		fields: [orderItemModifiers.orderItemId],
		references: [orderItems.id],
	}),
}));

/**
 * Type exports for use in application
 */
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type OrderItemModifier = typeof orderItemModifiers.$inferSelect;
export type NewOrderItemModifier = typeof orderItemModifiers.$inferInsert;
