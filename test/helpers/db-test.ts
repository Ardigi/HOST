/**
 * Database Test Helpers
 * Utilities for setting up and tearing down test databases
 */

import { createClient } from '@libsql/client';
import type { Client } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import type { Database } from '../../packages/database/src/client';
import * as schema from '../../packages/database/src/schema';

let testClient: Client | null = null;
let testDb: Database | null = null;

/**
 * Create a test database with Drizzle ORM
 * Uses in-memory SQLite for fast, isolated tests
 */
export async function createTestDatabase(): Promise<Database> {
	testClient = createClient({
		url: ':memory:',
	});

	testDb = drizzle(testClient, { schema }) as Database;

	// Run migrations to set up schema
	// Note: In a real setup, you'd run actual migrations here
	// For now, we'll create tables directly in tests

	return testDb;
}

/**
 * Cleanup test database
 * Closes connection and cleans up resources
 */
export async function cleanupTestDatabase(_db: Database): Promise<void> {
	if (testClient) {
		testClient.close();
		testClient = null;
		testDb = null;
	}
}

/**
 * Reset the test database
 * Clears all tables and resets sequences
 */
export async function resetTestDb(client: Client): Promise<void> {
	// Get all table names
	const tables = await client.execute(`
		SELECT name FROM sqlite_master
		WHERE type='table'
		AND name NOT LIKE 'sqlite_%'
	`);

	// Drop all tables
	for (const table of tables.rows) {
		await client.execute(`DROP TABLE IF EXISTS ${table.name}`);
	}
}

/**
 * Close the test database connection
 * @deprecated Use cleanupTestDatabase instead
 */
export async function closeTestDb(): Promise<void> {
	if (testClient) {
		testClient.close();
		testClient = null;
	}
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use createTestDatabase instead
 */
export function createTestDb(): Client {
	if (testClient) {
		return testClient;
	}

	testClient = createClient({
		url: ':memory:',
	});

	return testClient;
}

/**
 * Seed test data
 * Create common test data for use across tests
 */
export async function seedTestData(_client: Client): Promise<void> {
	// TODO: Add seed data after schema is defined
	// Example:
	// await _client.execute(`
	//   INSERT INTO venues (id, name, slug)
	//   VALUES ('venue-1', 'Test Restaurant', 'test-restaurant')
	// `);
}

/**
 * Clear all data from tables without dropping them
 */
export async function clearTestData(client: Client): Promise<void> {
	const tables = await client.execute(`
		SELECT name FROM sqlite_master
		WHERE type='table'
		AND name NOT LIKE 'sqlite_%'
	`);

	// Delete from all tables
	for (const table of tables.rows) {
		await client.execute(`DELETE FROM ${table.name}`);
	}
}
