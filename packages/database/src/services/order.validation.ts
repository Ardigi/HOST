import { z } from 'zod';

/**
 * Validation schemas for Order Service operations
 */

export const createOrderSchema = z.object({
	venueId: z.string().min(1, 'Venue ID is required'),
	serverId: z.string().min(1, 'Server ID is required'),
	tableNumber: z.number().int().positive().optional().nullable(),
	guestCount: z.number().int().positive().optional(),
	orderType: z.enum(['dine_in', 'takeout', 'delivery', 'bar']).default('dine_in'),
	notes: z.string().optional().nullable(),
});

export const addOrderItemModifierSchema = z.object({
	modifierId: z.string().min(1, 'Modifier ID is required'),
	name: z.string().min(1, 'Modifier name is required'),
	price: z.number().min(0, 'Modifier price cannot be negative'),
	quantity: z.number().int().positive().default(1),
});

export const addOrderItemSchema = z.object({
	orderId: z.string().min(1, 'Order ID is required'),
	menuItemId: z.string().min(1, 'Menu item ID is required'),
	name: z.string().min(1, 'Item name is required'),
	quantity: z.number().int().positive('Quantity must be at least 1'),
	price: z.number().positive('Price must be greater than zero'),
	notes: z.string().optional().nullable(),
	modifiers: z.array(addOrderItemModifierSchema).optional(),
});

export const updateOrderItemSchema = z.object({
	quantity: z.number().int().positive().optional(),
	notes: z.string().optional().nullable(),
	status: z.enum(['pending', 'sent', 'preparing', 'ready', 'delivered']).optional(),
});

export const applyDiscountSchema = z.object({
	orderId: z.string().min(1, 'Order ID is required'),
	discountAmount: z.number().positive('Discount must be greater than zero'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type AddOrderItemInput = z.infer<typeof addOrderItemSchema>;
export type UpdateOrderItemInput = z.infer<typeof updateOrderItemSchema>;
export type ApplyDiscountInput = z.infer<typeof applyDiscountSchema>;
