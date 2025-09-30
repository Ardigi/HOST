import { faker } from '@faker-js/faker';
import type { Order, OrderStatus } from '@host/types';
import { menuItemFactory } from './menu-item.factory';

export const orderFactory = {
	build: (overrides?: Partial<Order>): Order => {
		const subtotal = faker.number.float({ min: 20, max: 500, precision: 0.01 });
		const taxRate = 0.0825;
		const tax = Number((subtotal * taxRate).toFixed(2));
		const tip = Number((subtotal * 0.18).toFixed(2));
		const total = Number((subtotal + tax + tip).toFixed(2));

		return {
			id: faker.string.uuid(),
			orderNumber: faker.number.int({ min: 1000, max: 9999 }),
			status: 'open' as OrderStatus,
			tableId: faker.string.uuid(),
			tableNumber: faker.number.int({ min: 1, max: 50 }),
			serverId: faker.string.uuid(),
			venueId: faker.string.uuid(),
			items: menuItemFactory.buildList(faker.number.int({ min: 1, max: 5 })),
			subtotal,
			tax,
			taxRate,
			total,
			createdAt: faker.date.recent({ days: 1 }),
			updatedAt: faker.date.recent(),
			completedAt: null,
			...overrides,
		};
	},

	buildList: (count: number, overrides?: Partial<Order>): Order[] =>
		Array.from({ length: count }, () => orderFactory.build(overrides)),
};
