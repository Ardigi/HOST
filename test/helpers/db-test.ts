/**
 * Database Test Helpers
 * Utilities for setting up and tearing down test databases
 */

import { createClient } from '@libsql/client';
import type { Client } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
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
			email TEXT NOT NULL,
			phone TEXT,
			address TEXT,
			city TEXT,
			state TEXT,
			zip_code TEXT,
			country TEXT DEFAULT 'US',
			timezone TEXT DEFAULT 'America/New_York',
			currency TEXT DEFAULT 'USD',
			tax_rate INTEGER NOT NULL DEFAULT 825,
			is_active INTEGER NOT NULL DEFAULT 1,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL
		)
	`);

	// Insert test venues for testing
	await client.execute(`
		INSERT OR IGNORE INTO venues (id, name, slug, email, tax_rate, created_at, updated_at)
		VALUES
			('venue-1', 'Test Venue 1', 'test-venue-1', 'venue1@test.com', 825, ${Date.now()}, ${Date.now()}),
			('venue-2', 'Test Venue 2', 'test-venue-2', 'venue2@test.com', 825, ${Date.now()}, ${Date.now()})
	`);

	// Create users table (dependency for orders)
	await client.execute(`
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
			keycloak_id TEXT NOT NULL UNIQUE,
			email TEXT NOT NULL UNIQUE,
			first_name TEXT NOT NULL,
			last_name TEXT NOT NULL,
			phone TEXT,
			role TEXT NOT NULL DEFAULT 'server' CHECK(role IN ('admin', 'manager', 'server', 'bartender', 'kitchen')),
			pin_code_hash TEXT,
			is_active INTEGER NOT NULL DEFAULT 1,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL
		)
	`);

	// Insert test user for testing
	await client.execute(`
		INSERT OR IGNORE INTO users (id, venue_id, keycloak_id, email, first_name, last_name, role, created_at, updated_at)
		VALUES ('user-1', 'venue-1', 'keycloak-test', 'test@example.com', 'Test', 'User', 'server', ${Date.now()}, ${Date.now()})
	`);

	// Create orders table
	await client.execute(`
		CREATE TABLE IF NOT EXISTS orders (
			id TEXT PRIMARY KEY,
			order_number INTEGER NOT NULL,
			venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
			server_id TEXT NOT NULL REFERENCES users(id),
			table_number INTEGER,
			guest_count INTEGER DEFAULT 1,
			status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'sent', 'completed', 'cancelled', 'voided')),
			order_type TEXT NOT NULL DEFAULT 'dine_in' CHECK(order_type IN ('dine_in', 'takeout', 'delivery', 'bar')),
			subtotal REAL NOT NULL DEFAULT 0,
			tax REAL NOT NULL DEFAULT 0,
			tip REAL DEFAULT 0,
			discount REAL DEFAULT 0,
			total REAL NOT NULL DEFAULT 0,
			notes TEXT,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL,
			completed_at INTEGER
		)
	`);

	// Insert test order for testing
	await client.execute(`
		INSERT OR IGNORE INTO orders (id, order_number, venue_id, server_id, status, order_type, subtotal, tax, total, created_at, updated_at)
		VALUES ('order-1', 1, 'venue-1', 'user-1', 'open', 'bar', 50.00, 4.25, 54.25, ${Date.now()}, ${Date.now()})
	`);

	// Create order_items table
	await client.execute(`
		CREATE TABLE IF NOT EXISTS order_items (
			id TEXT PRIMARY KEY,
			order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
			menu_item_id TEXT NOT NULL,
			name TEXT NOT NULL,
			quantity INTEGER NOT NULL DEFAULT 1,
			price REAL NOT NULL,
			modifier_total REAL NOT NULL DEFAULT 0,
			total REAL NOT NULL,
			notes TEXT,
			status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'preparing', 'ready', 'delivered')),
			sent_to_kitchen_at INTEGER,
			created_at INTEGER NOT NULL
		)
	`);

	// Create order_item_modifiers table
	await client.execute(`
		CREATE TABLE IF NOT EXISTS order_item_modifiers (
			id TEXT PRIMARY KEY,
			order_item_id TEXT NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
			modifier_id TEXT NOT NULL,
			name TEXT NOT NULL,
			price REAL NOT NULL DEFAULT 0,
			quantity INTEGER NOT NULL DEFAULT 1
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

	// Create inventory_items table
	await client.execute(`
		CREATE TABLE IF NOT EXISTS inventory_items (
			id TEXT PRIMARY KEY,
			venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
			name TEXT NOT NULL,
			sku TEXT,
			barcode TEXT,
			category TEXT NOT NULL CHECK(category IN ('liquor', 'beer', 'wine', 'food', 'supplies')),
			subcategory TEXT,
			unit_type TEXT NOT NULL CHECK(unit_type IN ('bottle', 'case', 'keg', 'pound', 'each', 'gallon', 'liter')),
			unit_size REAL,
			unit_size_uom TEXT,
			units_per_case INTEGER,
			quantity_on_hand REAL NOT NULL DEFAULT 0,
			par_level REAL,
			reorder_point REAL,
			reorder_quantity REAL,
			unit_cost REAL NOT NULL,
			case_cost REAL,
			last_cost REAL,
			average_cost REAL,
			primary_vendor TEXT,
			vendor_item_code TEXT,
			storage_location TEXT,
			storage_temp TEXT CHECK(storage_temp IN ('room', 'cooler', 'freezer')),
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL
		)
	`);

	// Create inventory_transactions table
	await client.execute(`
		CREATE TABLE IF NOT EXISTS inventory_transactions (
			id TEXT PRIMARY KEY,
			venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
			inventory_item_id TEXT NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
			transaction_type TEXT NOT NULL CHECK(transaction_type IN ('purchase', 'usage', 'adjustment', 'waste', 'transfer')),
			quantity_change REAL NOT NULL,
			balance_after REAL NOT NULL,
			reference_type TEXT,
			reference_id TEXT,
			reason TEXT,
			unit_cost_at_time REAL,
			performed_by TEXT NOT NULL,
			created_at INTEGER NOT NULL
		)
	`);

	// Create inventory_suppliers table
	await client.execute(`
		CREATE TABLE IF NOT EXISTS inventory_suppliers (
			id TEXT PRIMARY KEY,
			venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
			name TEXT NOT NULL,
			contact_name TEXT NOT NULL,
			email TEXT NOT NULL,
			phone TEXT,
			address TEXT,
			city TEXT,
			state TEXT,
			zip_code TEXT,
			account_number TEXT,
			payment_terms TEXT,
			minimum_order REAL,
			delivery_days TEXT,
			is_active INTEGER NOT NULL DEFAULT 1,
			notes TEXT,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL
		)
	`);

	// Create inventory_purchase_orders table
	await client.execute(`
		CREATE TABLE IF NOT EXISTS inventory_purchase_orders (
			id TEXT PRIMARY KEY,
			venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
			supplier_id TEXT NOT NULL REFERENCES inventory_suppliers(id),
			order_number TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'submitted', 'received', 'cancelled')),
			order_date INTEGER NOT NULL,
			expected_delivery_date INTEGER,
			actual_delivery_date INTEGER,
			subtotal REAL NOT NULL DEFAULT 0,
			tax REAL NOT NULL DEFAULT 0,
			shipping_cost REAL NOT NULL DEFAULT 0,
			total REAL NOT NULL DEFAULT 0,
			notes TEXT,
			received_by TEXT,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL
		)
	`);

	// Create inventory_purchase_order_items table
	await client.execute(`
		CREATE TABLE IF NOT EXISTS inventory_purchase_order_items (
			id TEXT PRIMARY KEY,
			purchase_order_id TEXT NOT NULL REFERENCES inventory_purchase_orders(id) ON DELETE CASCADE,
			inventory_item_id TEXT NOT NULL REFERENCES inventory_items(id),
			quantity_ordered REAL NOT NULL,
			quantity_received REAL NOT NULL DEFAULT 0,
			unit_cost REAL NOT NULL,
			total_cost REAL NOT NULL,
			notes TEXT,
			created_at INTEGER NOT NULL
		)
	`);

	// Create payments table
	await client.execute(`
		CREATE TABLE IF NOT EXISTS payments (
			id TEXT PRIMARY KEY,
			venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
			order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
			amount REAL NOT NULL,
			tip_amount REAL NOT NULL DEFAULT 0,
			payment_method TEXT NOT NULL CHECK(payment_method IN ('card', 'cash', 'check', 'gift_card', 'comp')),
			status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
			card_last_four TEXT,
			card_brand TEXT,
			processor TEXT,
			processor_transaction_id TEXT,
			processor_fee REAL,
			is_refunded INTEGER NOT NULL DEFAULT 0,
			refund_amount REAL,
			refund_reason TEXT,
			refunded_at INTEGER,
			refunded_by TEXT,
			comp_reason TEXT,
			comp_by TEXT,
			processed_at INTEGER,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL
		)
	`);

	// Create staff_shifts table
	await client.execute(`
		CREATE TABLE IF NOT EXISTS staff_shifts (
			id TEXT PRIMARY KEY,
			venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
			user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			clock_in INTEGER NOT NULL,
			clock_out INTEGER,
			break_start INTEGER,
			break_end INTEGER,
			total_sales REAL NOT NULL DEFAULT 0,
			total_tips REAL NOT NULL DEFAULT 0,
			order_count INTEGER NOT NULL DEFAULT 0,
			status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'on_break', 'completed', 'pending_approval')),
			notes TEXT,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL
		)
	`);

	// Create tables table
	await client.execute(`
		CREATE TABLE IF NOT EXISTS tables (
			id TEXT PRIMARY KEY,
			venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
			table_number INTEGER NOT NULL,
			section_name TEXT NOT NULL CHECK(section_name IN ('bar', 'dining', 'patio', 'private')),
			capacity INTEGER NOT NULL DEFAULT 4,
			status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available', 'occupied', 'reserved', 'dirty')),
			current_order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
			notes TEXT,
			created_at INTEGER NOT NULL,
			updated_at INTEGER NOT NULL
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
