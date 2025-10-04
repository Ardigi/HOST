/**
 * Test data factories
 * Generate realistic test data for menu items, categories, orders, etc.
 */

export const menuCategoryFactory = {
	build: (overrides?: Partial<ReturnType<typeof menuCategoryFactory.build>>) => ({
		id: 'category-1',
		venueId: 'test-venue-id',
		name: 'Appetizers',
		slug: 'appetizers',
		description: 'Start your meal right',
		displayOrder: 0,
		isActive: true,
		createdAt: new Date('2025-01-01'),
		updatedAt: new Date('2025-01-01'),
		...overrides,
	}),

	buildList: (count: number, overrides?: Partial<ReturnType<typeof menuCategoryFactory.build>>) =>
		Array.from({ length: count }, (_, i) =>
			menuCategoryFactory.build({
				id: `category-${i + 1}`,
				name: `Category ${i + 1}`,
				slug: `category-${i + 1}`,
				displayOrder: i,
				...overrides,
			})
		),
};

export const menuItemFactory = {
	build: (overrides?: Partial<ReturnType<typeof menuItemFactory.build>>) => ({
		id: 'item-1',
		venueId: 'test-venue-id',
		categoryId: 'category-1',
		name: 'Buffalo Wings',
		slug: 'buffalo-wings',
		description: 'Spicy chicken wings with blue cheese',
		price: 12.99,
		calories: 850,
		isVegetarian: false,
		isVegan: false,
		isGlutenFree: false,
		isActive: true,
		isAvailable: true,
		preparationTime: 15,
		displayOrder: 0,
		createdAt: new Date('2025-01-01'),
		updatedAt: new Date('2025-01-01'),
		...overrides,
	}),

	buildList: (count: number, overrides?: Partial<ReturnType<typeof menuItemFactory.build>>) =>
		Array.from({ length: count }, (_, i) =>
			menuItemFactory.build({
				id: `item-${i + 1}`,
				name: `Item ${i + 1}`,
				slug: `item-${i + 1}`,
				price: 10 + i,
				displayOrder: i,
				...overrides,
			})
		),
};

export const orderFactory = {
	build: (overrides?: Partial<ReturnType<typeof orderFactory.build>>) => ({
		id: 'order-1',
		venueId: 'test-venue-id',
		tableNumber: '5',
		orderNumber: 1001,
		status: 'open' as const,
		orderType: 'dine_in' as const,
		guestCount: 2,
		subtotal: 25.98,
		tax: 2.13,
		tip: 0,
		total: 28.11,
		createdAt: new Date('2025-01-01'),
		updatedAt: new Date('2025-01-01'),
		...overrides,
	}),

	buildList: (count: number, overrides?: Partial<ReturnType<typeof orderFactory.build>>) =>
		Array.from({ length: count }, (_, i) =>
			orderFactory.build({
				id: `order-${i + 1}`,
				orderNumber: 1001 + i,
				tableNumber: `${i + 1}`,
				...overrides,
			})
		),
};

export const orderItemFactory = {
	build: (overrides?: Partial<ReturnType<typeof orderItemFactory.build>>) => ({
		id: 'order-item-1',
		orderId: 'order-1',
		menuItemId: 'item-1',
		quantity: 1,
		unitPrice: 12.99,
		subtotal: 12.99,
		specialInstructions: null,
		createdAt: new Date('2025-01-01'),
		...overrides,
	}),

	buildList: (count: number, overrides?: Partial<ReturnType<typeof orderItemFactory.build>>) =>
		Array.from({ length: count }, (_, i) =>
			orderItemFactory.build({
				id: `order-item-${i + 1}`,
				menuItemId: `item-${i + 1}`,
				quantity: i + 1,
				...overrides,
			})
		),
};

export const paymentFactory = {
	build: (overrides?: Partial<ReturnType<typeof paymentFactory.build>>) => ({
		id: 'payment-1',
		orderId: 'order-1',
		venueId: 'test-venue-id',
		amount: 28.11,
		paymentMethod: 'card' as const,
		status: 'completed' as const,
		transactionId: 'txn_123456',
		createdAt: new Date('2025-01-01'),
		...overrides,
	}),
};
