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

	// Create all tables using SQL from schema
	await createTables(testClient);

	return testDb;
}

/**
 * Create database tables for testing
 * Generates CREATE TABLE statements from Drizzle schema
 */
async function createTables(client: Client): Promise<void> {
	// Enable foreign key constraints
	await client.execute('PRAGMA foreign_keys = ON');

	// Create venues table (dependency for menu tables)
	await client.execute(`
		CREATE TABLE IF NOT EXISTS venues (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			slug TEXT NOT NULL UNIQUE,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL
		)
	`);

	// Insert test venues for testing
	await client.execute(`
		INSERT OR IGNORE INTO venues (id, name, slug, created_at, updated_at)
		VALUES
			('venue-1', 'Test Venue 1', 'test-venue-1', ${Date.now()}, ${Date.now()}),
			('venue-2', 'Test Venue 2', 'test-venue-2', ${Date.now()}, ${Date.now()})
	`);

	// Create users table (dependency for orders)
	await client.execute(`
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			email TEXT NOT NULL UNIQUE,
			role TEXT NOT NULL,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL
		)
	`);

	// Create menu_categories table
	await client.execute(`
		CREATE TABLE IF NOT EXISTS menu_categories (
			id TEXT PRIMARY KEY,
			venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
			name TEXT NOT NULL,
			slug TEXT NOT NULL,
			description TEXT,
			display_order INTEGER NOT NULL,
			is_active INTEGER NOT NULL DEFAULT 1,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL,
			UNIQUE(venue_id, slug)
		)
	`);

	// Create menu_items table
	await client.execute(`
		CREATE TABLE IF NOT EXISTS menu_items (
			id TEXT PRIMARY KEY,
			venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
			category_id TEXT NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
			name TEXT NOT NULL,
			slug TEXT NOT NULL,
			description TEXT,
			price REAL NOT NULL,
			image_url TEXT,
			calories INTEGER,
			is_vegetarian INTEGER DEFAULT 0,
			is_vegan INTEGER DEFAULT 0,
			is_gluten_free INTEGER DEFAULT 0,
			preparation_time INTEGER,
			display_order INTEGER NOT NULL,
			is_active INTEGER NOT NULL DEFAULT 1,
			is_available INTEGER NOT NULL DEFAULT 1,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL,
			UNIQUE(venue_id, slug)
		)
	`);

	// Create menu_modifier_groups table
	await client.execute(`
		CREATE TABLE IF NOT EXISTS menu_modifier_groups (
			id TEXT PRIMARY KEY,
			venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
			name TEXT NOT NULL,
			display_order INTEGER NOT NULL,
			selection_type TEXT NOT NULL CHECK(selection_type IN ('single', 'multiple')),
			is_required INTEGER NOT NULL DEFAULT 0,
			min_selections INTEGER,
			max_selections INTEGER,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL
		)
	`);

	// Create menu_modifiers table
	await client.execute(`
		CREATE TABLE IF NOT EXISTS menu_modifiers (
			id TEXT PRIMARY KEY,
			group_id TEXT NOT NULL REFERENCES menu_modifier_groups(id) ON DELETE CASCADE,
			name TEXT NOT NULL,
			price_adjustment REAL NOT NULL,
			display_order INTEGER NOT NULL,
			is_active INTEGER NOT NULL DEFAULT 1,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL
		)
	`);

	// Create menu_item_modifier_groups junction table
	await client.execute(`
		CREATE TABLE IF NOT EXISTS menu_item_modifier_groups (
			id TEXT PRIMARY KEY,
			item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
			group_id TEXT NOT NULL REFERENCES menu_modifier_groups(id) ON DELETE CASCADE,
			display_order INTEGER NOT NULL,
			created_at INTEGER NOT NULL
		)
	`);
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
