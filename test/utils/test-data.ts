/**
 * Common Test Data Generators
 * Reusable test data for consistent testing
 */

import { faker } from '@faker-js/faker';

/**
 * Generate a test menu item
 */
export function generateTestMenuItem(overrides?: Partial<TestMenuItem>) {
	return {
		id: faker.string.uuid(),
		name: faker.commerce.productName(),
		price: Number.parseFloat(faker.commerce.price()),
		category: faker.helpers.arrayElement(['food', 'drinks', 'desserts']),
		available: true,
		...overrides,
	};
}

/**
 * Generate a test order
 */
export function generateTestOrder(overrides?: Partial<TestOrder>) {
	return {
		id: faker.string.uuid(),
		status: 'open' as const,
		tableId: faker.number.int({ min: 1, max: 20 }),
		items: [],
		subtotal: 0,
		tax: 0,
		total: 0,
		createdAt: new Date(),
		...overrides,
	};
}

/**
 * Generate a test user
 */
export function generateTestUser(overrides?: Partial<TestUser>) {
	return {
		id: faker.string.uuid(),
		email: faker.internet.email(),
		name: faker.person.fullName(),
		role: faker.helpers.arrayElement(['admin', 'manager', 'server', 'bartender']),
		...overrides,
	};
}

// Type definitions for test data
export interface TestMenuItem {
	id: string;
	name: string;
	price: number;
	category: string;
	available: boolean;
}

export interface TestOrder {
	id: string;
	status: 'open' | 'closed' | 'void';
	tableId: number;
	items: TestOrderItem[];
	subtotal: number;
	tax: number;
	total: number;
	createdAt: Date;
}

export interface TestOrderItem {
	id: string;
	menuItemId: string;
	quantity: number;
	price: number;
	modifiers?: string[];
}

export interface TestUser {
	id: string;
	email: string;
	name: string;
	role: 'admin' | 'manager' | 'server' | 'bartender';
}
