import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';

/**
 * Venues table
 * Stores restaurant/bar information
 */
export const venues = sqliteTable('venues', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	email: text('email').notNull(),
	phone: text('phone'),
	address: text('address'),
	city: text('city'),
	state: text('state'),
	zipCode: text('zip_code'),
	country: text('country').default('US'),
	timezone: text('timezone').default('America/New_York'),
	currency: text('currency').default('USD'),
	taxRate: integer('tax_rate').notNull().default(825), // 8.25% stored as basis points
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
		.$onUpdateFn(() => new Date()),
});

export type Venue = typeof venues.$inferSelect;
export type NewVenue = typeof venues.$inferInsert;