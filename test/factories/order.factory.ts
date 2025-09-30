import { faker } from '@faker-js/faker';
import type { Order, OrderItem, NewOrder, NewOrderItem } from '@host/database';

/**
 * Order Factory
 * Generates test data for orders
 */
export const orderFactory = {
	/**
	 * Build a single order with defaults
	 */
	build: (overrides?: Partial<Order>): Order => ({
		id: faker.string.uuid(),
		orderNumber: faker.number.int({ min: 1000, max: 9999 }),
		venueId: faker.string.uuid(),
		serverId: faker.string.uuid(),
		tableNumber: faker.number.int({ min: 1, max: 50 }),
		guestCount: faker.number.int({ min: 1, max: 10 }),
		status: 'open',
		orderType: 'dine_in',
		subtotal: faker.number.float({ min: 10, max: 200, precision: 0.01 }),
		tax: faker.number.float({ min: 1, max: 20, precision: 0.01 }),
		tip: faker.number.float({ min: 0, max: 40, precision: 0.01 }),
		discount: 0,
		total: faker.number.float({ min: 15, max: 250, precision: 0.01 }),
		notes: faker.helpers.maybe(() => faker.lorem.sentence()),
		createdAt: faker.date.recent(),
		updatedAt: faker.date.recent(),
		completedAt: null,
		...overrides,
	}),

	/**
	 * Build multiple orders
	 */
	buildList: (count: number, overrides?: Partial<Order>): Order[] =>
		Array.from({ length: count }, () => orderFactory.build(overrides)),

	/**
	 * Build order for insertion (without generated fields)
	 */
	buildNew: (overrides?: Partial<NewOrder>): NewOrder => ({
		orderNumber: faker.number.int({ min: 1000, max: 9999 }),
		venueId: faker.string.uuid(),
		serverId: faker.string.uuid(),
		tableNumber: faker.number.int({ min: 1, max: 50 }),
		guestCount: faker.number.int({ min: 1, max: 10 }),
		status: 'open',
		orderType: 'dine_in',
		subtotal: faker.number.float({ min: 10, max: 200, precision: 0.01 }),
		tax: faker.number.float({ min: 1, max: 20, precision: 0.01 }),
		tip: faker.number.float({ min: 0, max: 40, precision: 0.01 }),
		discount: 0,
		total: faker.number.float({ min: 15, max: 250, precision: 0.01 }),
		...overrides,
	}),

	/**
	 * Build open order
	 */
	buildOpen: (overrides?: Partial<Order>): Order =>
		orderFactory.build({
			status: 'open',
			completedAt: null,
			...overrides,
		}),

	/**
	 * Build completed order
	 */
	buildCompleted: (overrides?: Partial<Order>): Order =>
		orderFactory.build({
			status: 'completed',
			completedAt: faker.date.recent(),
			...overrides,
		}),
};

/**
 * Order Item Factory
 */
export const orderItemFactory = {
	/**
	 * Build a single order item
	 */
	build: (overrides?: Partial<OrderItem>): OrderItem => ({
		id: faker.string.uuid(),
		orderId: faker.string.uuid(),
		menuItemId: faker.string.uuid(),
		name: faker.commerce.productName(),
		quantity: faker.number.int({ min: 1, max: 5 }),
		price: faker.number.float({ min: 5, max: 50, precision: 0.01 }),
		modifierTotal: faker.number.float({ min: 0, max: 10, precision: 0.01 }),
		total: faker.number.float({ min: 5, max: 60, precision: 0.01 }),
		notes: faker.helpers.maybe(() => faker.lorem.sentence()),
		status: 'pending',
		sentToKitchenAt: null,
		createdAt: faker.date.recent(),
		...overrides,
	}),

	/**
	 * Build multiple order items
	 */
	buildList: (count: number, overrides?: Partial<OrderItem>): OrderItem[] =>
		Array.from({ length: count }, () => orderItemFactory.build(overrides)),

	/**
	 * Build order item for insertion
	 */
	buildNew: (overrides?: Partial<NewOrderItem>): NewOrderItem => ({
		orderId: faker.string.uuid(),
		menuItemId: faker.string.uuid(),
		name: faker.commerce.productName(),
		quantity: faker.number.int({ min: 1, max: 5 }),
		price: faker.number.float({ min: 5, max: 50, precision: 0.01 }),
		modifierTotal: faker.number.float({ min: 0, max: 10, precision: 0.01 }),
		total: faker.number.float({ min: 5, max: 60, precision: 0.01 }),
		...overrides,
	}),
};