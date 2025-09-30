import { faker } from '@faker-js/faker';
import type { User, UserRole } from '@host/types';

export const userFactory = {
	build: (overrides?: Partial<User>): User => ({
		id: faker.string.uuid(),
		email: faker.internet.email().toLowerCase(),
		name: faker.person.fullName(),
		phone: faker.phone.number(),
		role: 'server' as UserRole,
		venueId: faker.string.uuid(),
		active: true,
		emailVerified: true,
		createdAt: faker.date.recent({ days: 30 }),
		updatedAt: faker.date.recent({ days: 1 }),
		lastLoginAt: faker.date.recent({ days: 7 }),
		...overrides,
	}),

	buildList: (count: number, overrides?: Partial<User>): User[] =>
		Array.from({ length: count }, () => userFactory.build(overrides)),

	buildNew: (
		overrides?: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
	): Omit<User, 'id' | 'createdAt' | 'updatedAt'> => {
		const user = userFactory.build(overrides);
		const { id, createdAt, updatedAt, ...newUser } = user;
		return newUser;
	},

	buildExisting: (overrides?: Partial<User>): User =>
		userFactory.build({
			createdAt: faker.date.past({ years: 1 }),
			updatedAt: faker.date.recent({ days: 7 }),
			...overrides,
		}),
};
