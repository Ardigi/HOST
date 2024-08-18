import { faker } from '@faker-js/faker';
import type { MenuItem, OrderItem } from '@host/types';

/**
 * Factory for generating MenuItem test data
 *
 * @example
 * // Generate menu item
 * const item = menuItemFactory.build();
 *
 * // Generate food item
 * const food = menuItemFactory.buildFood();
 *
 * // Generate drink item
 * const drink = menuItemFactory.buildDrink();
 */
export const menuItemFactory = {
	/**
	 * Build a complete menu item
	 */
	build: (overrides?: Partial<MenuItem>): MenuItem => ({
		id: faker.string.uuid(),
		name: faker.commerce.productName(),
		description: faker.commerce.productDescription(),
		price: faker.number.float({ min: 5, max: 50, precision: 0.01 }),
		category: faker.helpers.arrayElement(['appetizer', 'entree', 'dessert', 'drink', 'side']),
		available: true,
		imageUrl: faker.image.urlLoremFlickr({ category: 'food' }),
		venueId: faker.string.uuid(),
		createdAt: faker.date.past(),
		updatedAt: faker.date.recent(),
		...overrides,
	}),

	/**
	 * Build multiple menu items
	 */
	buildList: (count: number, overrides?: Partial<MenuItem>): MenuItem[] =>
		Array.from({ length: count }, () => menuItemFactory.build(overrides)),

	/**
	 * Build menu item for creation
	 */
	buildNew: (
		overrides?: Partial<Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>>
	): Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'> => {
		const item = menuItemFactory.build(overrides);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { id, createdAt, updatedAt, ...newItem } = item;
		return newItem;
	},

	/**
	 * Build food menu item
	 */
	buildFood: (overrides?: Partial<MenuItem>): MenuItem =>
		menuItemFactory.build({
			category: faker.helpers.arrayElement(['appetizer', 'entree', 'dessert', 'side']),
			name: `${faker.commerce.productName()} ${faker.word.adjective()}`,
			price: faker.number.float({ min: 8, max: 35, precision: 0.01 }),
			...overrides,
		}),

	/**
	 * Build drink menu item
	 */
	buildDrink: (overrides?: Partial<MenuItem>): MenuItem =>
		menuItemFactory.build({
			category: 'drink',
			name: `${faker.commerce.productName()} ${faker.word.adjective()}`,
			price: faker.number.float({ min: 5, max: 15, precision: 0.01 }),
			...overrides,
		}),

	/**
	 * Build order item (menu item + quantity)
	 */
	buildOrderItem: (overrides?: Partial<OrderItem>): OrderItem => {
		const menuItem = menuItemFactory.build();
		const quantity = faker.number.int({ min: 1, max: 5 });

		return {
			id: faker.string.uuid(),
			orderId: faker.string.uuid(),
			menuItemId: menuItem.id,
			name: menuItem.name,
			price: menuItem.price,
			quantity,
			subtotal: Number((menuItem.price * quantity).toFixed(2)),
			notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }),
			modifiers: [],
			createdAt: faker.date.recent(),
			updatedAt: faker.date.recent(),
			...overrides,
		};
	},

	/**
	 * Build list of order items
	 */
	buildOrderItemList: (count: number, overrides?: Partial<OrderItem>): OrderItem[] =>
		Array.from({ length: count }, () => menuItemFactory.buildOrderItem(overrides)),

	/**
	 * Build unavailable menu item
	 */
	buildUnavailable: (overrides?: Partial<MenuItem>): MenuItem =>
		menuItemFactory.build({
			available: false,
			...overrides,
		}),
};
