import { faker } from '@faker-js/faker';
import type { User, NewUser } from '@host/database';

/**
 * User Factory
 * Generates test data for users
 */
export const userFactory = {
	/**
	 * Build a single user
	 */
	build: (overrides?: Partial<User>): User => ({
		id: faker.string.uuid(),
		venueId: faker.string.uuid(),
		keycloakId: faker.string.uuid(),
		email: faker.internet.email(),
		firstName: faker.person.firstName(),
		lastName: faker.person.lastName(),
		phone: faker.phone.number(),
		role: 'server',
		pinCodeHash: faker.string.alphanumeric(64),
		isActive: true,
		createdAt: faker.date.past(),
		updatedAt: faker.date.recent(),
		...overrides,
	}),

	/**
	 * Build multiple users
	 */
	buildList: (count: number, overrides?: Partial<User>): User[] =>
		Array.from({ length: count }, () => userFactory.build(overrides)),

	/**
	 * Build new user for insertion
	 */
	buildNew: (overrides?: Partial<NewUser>): NewUser => ({
		venueId: faker.string.uuid(),
		keycloakId: faker.string.uuid(),
		email: faker.internet.email(),
		firstName: faker.person.firstName(),
		lastName: faker.person.lastName(),
		phone: faker.phone.number(),
		role: 'server',
		pinCodeHash: faker.string.alphanumeric(64),
		isActive: true,
		...overrides,
	}),

	/**
	 * Build admin user
	 */
	buildAdmin: (overrides?: Partial<User>): User =>
		userFactory.build({
			role: 'admin',
			email: 'admin@host-pos.com',
			...overrides,
		}),

	/**
	 * Build manager user
	 */
	buildManager: (overrides?: Partial<User>): User =>
		userFactory.build({
			role: 'manager',
			email: 'manager@host-pos.com',
			...overrides,
		}),

	/**
	 * Build server user
	 */
	buildServer: (overrides?: Partial<User>): User =>
		userFactory.build({
			role: 'server',
			...overrides,
		}),
};