/**
 * E2E Test User Configuration
 *
 * Defines the mock user used for E2E testing.
 * This user is automatically injected by hooks.server.ts when CI=true.
 *
 * IMPORTANT: This configuration must match a real user from seed data
 * to ensure foreign key constraints are satisfied.
 */

export const E2E_TEST_USER = {
	id: 'c7e09y2rft0uvt3b38ahzut2', // Bob Smith from packages/database/seed/index.ts
	email: 'bob.smith@test.com',
	firstName: 'Bob',
	lastName: 'Smith',
	venueId: 't759aeemb3pqqokugmru0tqs', // The Whiskey Barrel from seed data
	roles: ['admin', 'manager', 'server'], // All roles for comprehensive testing
} as const;

/**
 * Type definition for the test user
 */
export type E2ETestUser = typeof E2E_TEST_USER;
