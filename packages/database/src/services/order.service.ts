import { and, eq } from 'drizzle-orm';
import type { Database } from '../client';
import { orderItemModifiers, orderItems, orders } from '../schema/orders';
import type { Order, OrderItem } from '../schema/orders';
import {
	type AddOrderItemInput,
	type CreateOrderInput,
	type UpdateOrderItemInput,
	addOrderItemSchema,
	applyDiscountSchema,
	createOrderSchema,
	updateOrderItemSchema,
} from './order.validation';

/**
 * Order Service
 * Handles all order management operations including creation, updates, and status changes
 */
export class OrderService {
	constructor(private db: Database) {}

	/**
	 * Create a new order with auto-generated order number
	 * @throws {ZodError} If validation fails
	 */
	async createOrder(data: CreateOrderInput): Promise<Order> {
		// Validate input
		const validated = createOrderSchema.parse(data);
		// Get the max order number for this venue
		const result = await this.db
			.select({ orderNumber: orders.orderNumber })
			.from(orders)
			.where(eq(orders.venueId, data.venueId))
			.then(rows => rows);

		const maxOrderNumber = result.length > 0 ? Math.max(...result.map(r => r.orderNumber)) : 0;

		const orderNumber = maxOrderNumber + 1;

		const [order] = await this.db
			.insert(orders)
			.values({
				...validated,
				orderNumber,
			})
			.returning();

		if (!order) {
			throw new Error('Failed to create order');
		}

		return order;
	}

	/**
	 * Add an item to an order with optional modifiers
	 * @throws {ZodError} If validation fails
	 * @throws {Error} If order is not found
	 */
	async addItemToOrder(data: AddOrderItemInput): Promise<OrderItem> {
		// Validate input
		const validated = addOrderItemSchema.parse(data);
		const { modifiers, ...itemData } = validated;

		// Calculate modifier total
		const modifierTotal = modifiers?.reduce((sum, mod) => sum + mod.price, 0) || 0;

		// Calculate item total
		const total = itemData.price * itemData.quantity + modifierTotal;

		// Insert order item
		const [item] = await this.db
			.insert(orderItems)
			.values({
				...itemData,
				modifierTotal,
				total,
			})
			.returning();

		if (!item) {
			throw new Error('Failed to add item to order');
		}

		// Insert modifiers if any
		if (modifiers && modifiers.length > 0) {
			await this.db.insert(orderItemModifiers).values(
				modifiers.map(mod => ({
					...mod,
					orderItemId: item.id,
				}))
			);
		}

		// Recalculate order totals
		await this.recalculateOrderTotals(itemData.orderId);

		return item;
	}

	/**
	 * Update an order item (quantity, notes, status)
	 * @throws {ZodError} If validation fails
	 * @throws {Error} If item is not found
	 */
	async updateOrderItem(itemId: string, updates: UpdateOrderItemInput): Promise<OrderItem> {
		// Validate input
		const validated = updateOrderItemSchema.parse(updates);
		// Get current item
		const [currentItem] = await this.db.select().from(orderItems).where(eq(orderItems.id, itemId));

		if (!currentItem) {
			throw new Error('Order item not found');
		}

		// Recalculate total if quantity changed
		let total = currentItem.total;
		if (validated.quantity) {
			total = currentItem.price * validated.quantity + currentItem.modifierTotal;
		}

		// Update item
		const [updatedItem] = await this.db
			.update(orderItems)
			.set({
				...validated,
				total,
			})
			.where(eq(orderItems.id, itemId))
			.returning();

		if (!updatedItem) {
			throw new Error('Failed to update order item');
		}

		// Recalculate order totals
		await this.recalculateOrderTotals(currentItem.orderId);

		return updatedItem;
	}

	/**
	 * Remove an item from an order
	 * @throws {Error} If item is not found
	 */
	async removeOrderItem(itemId: string): Promise<void> {
		// Get item to find order ID
		const [item] = await this.db
			.select({ orderId: orderItems.orderId })
			.from(orderItems)
			.where(eq(orderItems.id, itemId));

		if (!item) {
			throw new Error('Order item not found');
		}

		// Delete item (cascades to modifiers)
		await this.db.delete(orderItems).where(eq(orderItems.id, itemId));

		// Recalculate order totals
		await this.recalculateOrderTotals(item.orderId);
	}

	/**
	 * Send order to kitchen and update all items to 'sent' status
	 * @throws {Error} If order is empty or not found
	 */
	async sendToKitchen(orderId: string): Promise<Order> {
		// Check if order has items
		const items = await this.getOrderItems(orderId);
		if (items.length === 0) {
			throw new Error('Cannot send empty order');
		}

		// Update order status
		const [order] = await this.db
			.update(orders)
			.set({ status: 'sent' })
			.where(eq(orders.id, orderId))
			.returning();

		if (!order) {
			throw new Error('Failed to send order to kitchen');
		}

		// Update item statuses
		await this.db
			.update(orderItems)
			.set({
				status: 'sent',
				sentToKitchenAt: new Date(),
			})
			.where(eq(orderItems.orderId, orderId));

		return order;
	}

	/**
	 * Apply discount amount to order total
	 * @throws {ZodError} If validation fails
	 * @throws {Error} If order is not found or discount exceeds subtotal
	 */
	async applyDiscount(orderId: string, discountAmount: number): Promise<Order> {
		// Validate input
		applyDiscountSchema.parse({ orderId, discountAmount });
		// Get current order
		const order = await this.getOrder(orderId);
		if (!order) {
			throw new Error('Order not found');
		}

		// Validate discount
		if (discountAmount > order.subtotal) {
			throw new Error('Discount cannot exceed subtotal');
		}

		// Calculate new total
		const total = order.subtotal + order.tax - discountAmount;

		// Update order
		const [updated] = await this.db
			.update(orders)
			.set({
				discount: discountAmount,
				total,
			})
			.where(eq(orders.id, orderId))
			.returning();

		if (!updated) {
			throw new Error('Failed to apply discount');
		}

		return updated;
	}

	/**
	 * Void an order (cannot be voided if already completed)
	 * @throws {Error} If order is not found or already completed
	 */
	async voidOrder(orderId: string): Promise<Order> {
		// Get current order
		const order = await this.getOrder(orderId);
		if (!order) {
			throw new Error('Order not found');
		}

		// Check if order can be voided
		if (order.status === 'completed') {
			throw new Error('Cannot void completed order');
		}

		// Update order
		const [voided] = await this.db
			.update(orders)
			.set({ status: 'voided' })
			.where(eq(orders.id, orderId))
			.returning();

		if (!voided) {
			throw new Error('Failed to void order');
		}

		return voided;
	}

	/**
	 * Complete an order and set completion timestamp
	 * @throws {Error} If order is empty or not found
	 */
	async completeOrder(orderId: string): Promise<Order> {
		// Check if order has items
		const items = await this.getOrderItems(orderId);
		if (items.length === 0) {
			throw new Error('Cannot complete empty order');
		}

		// Update order
		const [completed] = await this.db
			.update(orders)
			.set({
				status: 'completed',
				completedAt: new Date(),
			})
			.where(eq(orders.id, orderId))
			.returning();

		if (!completed) {
			throw new Error('Failed to complete order');
		}

		return completed;
	}

	/**
	 * Get order by ID
	 */
	async getOrder(orderId: string): Promise<Order | null> {
		const [order] = await this.db.select().from(orders).where(eq(orders.id, orderId));

		return order || null;
	}

	/**
	 * Get all items for an order
	 */
	async getOrderItems(orderId: string): Promise<OrderItem[]> {
		return await this.db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
	}

	/**
	 * Get all open orders for a venue
	 */
	async getOpenOrdersByVenue(venueId: string): Promise<Order[]> {
		return await this.db
			.select()
			.from(orders)
			.where(and(eq(orders.venueId, venueId), eq(orders.status, 'open')));
	}

	/**
	 * Recalculate order totals based on items
	 */
	private async recalculateOrderTotals(orderId: string): Promise<void> {
		// Get all items
		const items = await this.getOrderItems(orderId);

		// Calculate subtotal
		const subtotal = items.reduce((sum, item) => sum + item.total, 0);

		// Get order to check venue tax rate
		const order = await this.getOrder(orderId);
		if (!order) {
			throw new Error('Order not found');
		}

		// Calculate tax (8.25% default - should come from venue)
		const taxRate = 0.0825;
		const tax = subtotal * taxRate;

		// Calculate total
		const total = subtotal + tax - (order.discount || 0);

		// Update order
		await this.db
			.update(orders)
			.set({
				subtotal,
				tax,
				total,
			})
			.where(eq(orders.id, orderId));
	}
}
