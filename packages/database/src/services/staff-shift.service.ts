import { createId } from '@paralleldrive/cuid2';
import { and, eq } from 'drizzle-orm';
import type { Database } from '../client';
import * as schema from '../schema';

/**
 * StaffShift Service
 * Handles all staff shift operations including clock in/out, breaks,
 * performance tracking, and shift approval
 */
export class StaffShiftService {
	constructor(private db: Database) {}

	// ===== Clock In/Out =====

	async clockIn(input: { userId: string; venueId: string }) {
		// Check if user already has an active shift
		const [existing] = await this.db
			.select()
			.from(schema.staffShifts)
			.where(
				and(eq(schema.staffShifts.userId, input.userId), eq(schema.staffShifts.status, 'active'))
			)
			.limit(1);

		if (existing) {
			throw new Error('User already has an active shift');
		}

		const [shift] = await this.db
			.insert(schema.staffShifts)
			.values({
				id: createId(),
				venueId: input.venueId,
				userId: input.userId,
				clockIn: new Date(),
				status: 'active',
				totalSales: 0,
				totalTips: 0,
				orderCount: 0,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		return shift;
	}

	async clockOut(shiftId: string) {
		const shift = await this.getShiftById(shiftId);
		if (!shift) {
			throw new Error('Shift not found');
		}

		if (shift.clockOut) {
			throw new Error('Shift already completed');
		}

		const [updated] = await this.db
			.update(schema.staffShifts)
			.set({
				clockOut: new Date(),
				status: 'completed',
				updatedAt: new Date(),
			})
			.where(eq(schema.staffShifts.id, shiftId))
			.returning();

		return updated;
	}

	// ===== Break Management =====

	async startBreak(shiftId: string) {
		const shift = await this.getShiftById(shiftId);
		if (!shift) {
			throw new Error('Shift not found');
		}

		if (shift.status !== 'active') {
			throw new Error('Shift is not active');
		}

		const [updated] = await this.db
			.update(schema.staffShifts)
			.set({
				breakStart: new Date(),
				status: 'on_break',
				updatedAt: new Date(),
			})
			.where(eq(schema.staffShifts.id, shiftId))
			.returning();

		return updated;
	}

	async endBreak(shiftId: string) {
		const shift = await this.getShiftById(shiftId);
		if (!shift) {
			throw new Error('Shift not found');
		}

		if (shift.status !== 'on_break') {
			throw new Error('Shift is not on break');
		}

		const [updated] = await this.db
			.update(schema.staffShifts)
			.set({
				breakEnd: new Date(),
				status: 'active',
				updatedAt: new Date(),
			})
			.where(eq(schema.staffShifts.id, shiftId))
			.returning();

		return updated;
	}

	// ===== Performance Tracking =====

	async updateShiftStats(
		shiftId: string,
		stats: {
			totalSales?: number;
			totalTips?: number;
			orderCount?: number;
		}
	) {
		const [updated] = await this.db
			.update(schema.staffShifts)
			.set({
				...stats,
				updatedAt: new Date(),
			})
			.where(eq(schema.staffShifts.id, shiftId))
			.returning();

		return updated;
	}

	// ===== Shift Queries =====

	async getActiveShift(userId: string) {
		const [shift] = await this.db
			.select()
			.from(schema.staffShifts)
			.where(and(eq(schema.staffShifts.userId, userId), eq(schema.staffShifts.status, 'active')))
			.limit(1);

		return shift || null;
	}

	async getShiftById(shiftId: string) {
		const [shift] = await this.db
			.select()
			.from(schema.staffShifts)
			.where(eq(schema.staffShifts.id, shiftId))
			.limit(1);

		return shift || null;
	}

	async listShifts(
		venueId: string,
		options?: {
			userId?: string;
			status?: 'active' | 'on_break' | 'completed' | 'pending_approval';
		}
	) {
		const conditions = [eq(schema.staffShifts.venueId, venueId)];

		if (options?.userId) {
			conditions.push(eq(schema.staffShifts.userId, options.userId));
		}

		if (options?.status) {
			conditions.push(eq(schema.staffShifts.status, options.status));
		}

		return await this.db
			.select()
			.from(schema.staffShifts)
			.where(and(...conditions))
			.orderBy(schema.staffShifts.clockIn);
	}

	// ===== Shift Calculations =====

	async getShiftStats(shiftId: string) {
		const shift = await this.getShiftById(shiftId);
		if (!shift) {
			throw new Error('Shift not found');
		}

		const clockInMs = shift.clockIn.getTime();
		const clockOutMs = shift.clockOut ? shift.clockOut.getTime() : Date.now();
		const totalMinutes = Math.floor((clockOutMs - clockInMs) / 1000 / 60);

		let breakMinutes = 0;
		if (shift.breakStart && shift.breakEnd) {
			breakMinutes = Math.floor(
				(shift.breakEnd.getTime() - shift.breakStart.getTime()) / 1000 / 60
			);
		}

		const workMinutes = totalMinutes - breakMinutes;
		const workHours = workMinutes / 60;

		const salesPerHour = workHours > 0 ? shift.totalSales / workHours : 0;
		const tipsPerHour = workHours > 0 ? shift.totalTips / workHours : 0;

		return {
			totalMinutes,
			breakMinutes,
			workMinutes,
			workHours,
			salesPerHour,
			tipsPerHour,
			averageOrderValue: shift.orderCount > 0 ? shift.totalSales / shift.orderCount : 0,
		};
	}

	// ===== Shift Approval =====

	async approveShift(shiftId: string) {
		const shift = await this.getShiftById(shiftId);
		if (!shift) {
			throw new Error('Shift not found');
		}

		const [updated] = await this.db
			.update(schema.staffShifts)
			.set({
				status: 'pending_approval',
				updatedAt: new Date(),
			})
			.where(eq(schema.staffShifts.id, shiftId))
			.returning();

		return updated;
	}
}
