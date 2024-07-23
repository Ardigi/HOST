import { createId } from '@paralleldrive/cuid2';
import { and, eq, gte } from 'drizzle-orm';
import type { Database } from '../client';
import * as schema from '../schema';

/**
 * Table Service
 * Handles all table-related operations including seating, status management,
 * and order associations
 */
export class TableService {
	constructor(private db: Database) {}

	// ===== Table Management =====

	async createTable(input: {
		venueId: string;
		tableNumber: number;
		sectionName: 'bar' | 'dining' | 'patio' | 'private';
		capacity?: number;
		notes?: string;
	}) {
		// Check for duplicate table number in same venue
		const [existing] = await this.db
			.select()
			.from(schema.tables)
			.where(
				and(
					eq(schema.tables.venueId, input.venueId),
					eq(schema.tables.tableNumber, input.tableNumber)
				)
			)
			.limit(1);

		if (existing) {
			throw new Error(`Table number ${input.tableNumber} already exists in this venue`);
		}

		const [table] = await this.db
			.insert(schema.tables)
			.values({
				id: createId(),
				venueId: input.venueId,
				tableNumber: input.tableNumber,
				sectionName: input.sectionName,
				capacity: input.capacity ?? 4,
				status: 'available',
				notes: input.notes,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		return table;
	}

	async getTableById(tableId: string) {
		const [table] = await this.db
			.select()
			.from(schema.tables)
			.where(eq(schema.tables.id, tableId))
			.limit(1);

		return table || null;
	}

	async listTables(
		venueId: string,
		options?: {
			section?: 'bar' | 'dining' | 'patio' | 'private';
			status?: 'available' | 'occupied' | 'reserved' | 'dirty';
		}
	) {
		const conditions = [eq(schema.tables.venueId, venueId)];

		if (options?.section) {
			conditions.push(eq(schema.tables.sectionName, options.section));
		}

		if (options?.status) {
			conditions.push(eq(schema.tables.status, options.status));
		}

		return await this.db
			.select()
			.from(schema.tables)
			.where(and(...conditions))
			.orderBy(schema.tables.tableNumber);
	}

	async updateTable(
		tableId: string,
		updates: {
			tableNumber?: number;
			sectionName?: 'bar' | 'dining' | 'patio' | 'private';
			capacity?: number;
			notes?: string;
		}
	) {
		const [updated] = await this.db
			.update(schema.tables)
			.set({
				...updates,
				updatedAt: new Date(),
			})
			.where(eq(schema.tables.id, tableId))
			.returning();

		return updated;
	}

	async deleteTable(tableId: string) {
		// Check if table has active order
		const table = await this.getTableById(tableId);
		if (!table) {
			throw new Error('Table not found');
		}

		if (table.currentOrderId) {
			throw new Error('Cannot delete table with active order');
		}

		await this.db.delete(schema.tables).where(eq(schema.tables.id, tableId));
	}

	// ===== Status Management =====

	async updateTableStatus(
		tableId: string,
		status: 'available' | 'occupied' | 'reserved' | 'dirty',
		orderId?: string
	) {
		const updates: {
			status: 'available' | 'occupied' | 'reserved' | 'dirty';
			currentOrderId?: string | null;
			updatedAt: Date;
		} = {
			status,
			updatedAt: new Date(),
		};

		// If status is available, clear the current order
		if (status === 'available') {
			updates.currentOrderId = null;
		}

		// If status is occupied and orderId provided, set current order
		if (status === 'occupied' && orderId) {
			updates.currentOrderId = orderId;
		}

		const [updated] = await this.db
			.update(schema.tables)
			.set(updates)
			.where(eq(schema.tables.id, tableId))
			.returning();

		return updated;
	}

	async occupyTable(tableId: string, orderId: string) {
		// Check if table is available
		const table = await this.getTableById(tableId);
		if (!table) {
			throw new Error('Table not found');
		}

		if (table.status === 'occupied') {
			throw new Error('Table is already occupied');
		}

		return await this.updateTableStatus(tableId, 'occupied', orderId);
	}

	async releaseTable(tableId: string) {
		return await this.updateTableStatus(tableId, 'available');
	}

	// ===== Section Management =====

	async getTablesBySection(venueId: string, section: 'bar' | 'dining' | 'patio' | 'private') {
		return await this.listTables(venueId, { section });
	}

	async getAvailableTables(
		venueId: string,
		section?: 'bar' | 'dining' | 'patio' | 'private',
		minCapacity?: number
	) {
		const conditions = [eq(schema.tables.venueId, venueId), eq(schema.tables.status, 'available')];

		if (section) {
			conditions.push(eq(schema.tables.sectionName, section));
		}

		if (minCapacity !== undefined) {
			conditions.push(gte(schema.tables.capacity, minCapacity));
		}

		return await this.db
			.select()
			.from(schema.tables)
			.where(and(...conditions))
			.orderBy(schema.tables.tableNumber);
	}

	// ===== Order Association =====

	async getTableWithCurrentOrder(tableId: string) {
		const table = await this.getTableById(tableId);
		return table;
	}

	async transferOrder(fromTableId: string, toTableId: string) {
		// Get source table with order
		const fromTable = await this.getTableById(fromTableId);
		if (!fromTable) {
			throw new Error('Source table not found');
		}

		if (!fromTable.currentOrderId) {
			throw new Error('Source table has no active order');
		}

		// Check destination table availability
		const toTable = await this.getTableById(toTableId);
		if (!toTable) {
			throw new Error('Destination table not found');
		}

		if (toTable.status !== 'available') {
			throw new Error('Destination table is not available');
		}

		const orderId = fromTable.currentOrderId;

		// Update order's table_number
		await this.db
			.update(schema.orders)
			.set({
				tableNumber: toTable.tableNumber,
				updatedAt: new Date(),
			})
			.where(eq(schema.orders.id, orderId));

		// Release source table
		await this.releaseTable(fromTableId);

		// Occupy destination table
		await this.occupyTable(toTableId, orderId);
	}
}
