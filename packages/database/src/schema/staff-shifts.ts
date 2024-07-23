import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { venues } from './venues';

/**
 * Staff Shifts table
 * Tracks staff clock-in/out times, breaks, and shift performance
 */
export const staffShifts = sqliteTable('staff_shifts', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => createId()),
	venueId: text('venue_id')
		.notNull()
		.references(() => venues.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	clockIn: integer('clock_in', { mode: 'timestamp' }).notNull(),
	clockOut: integer('clock_out', { mode: 'timestamp' }),
	breakStart: integer('break_start', { mode: 'timestamp' }),
	breakEnd: integer('break_end', { mode: 'timestamp' }),
	totalSales: real('total_sales').notNull().default(0),
	totalTips: real('total_tips').notNull().default(0),
	orderCount: integer('order_count').notNull().default(0),
	status: text('status', {
		enum: ['active', 'on_break', 'completed', 'pending_approval'],
	})
		.notNull()
		.default('active'),
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
export const staffShiftsRelations = relations(staffShifts, ({ one }) => ({
	venue: one(venues, {
		fields: [staffShifts.venueId],
		references: [venues.id],
	}),
	user: one(users, {
		fields: [staffShifts.userId],
		references: [users.id],
	}),
}));

/**
 * Type exports
 */
export type StaffShift = typeof staffShifts.$inferSelect;
export type NewStaffShift = typeof staffShifts.$inferInsert;
