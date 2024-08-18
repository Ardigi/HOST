/**
 * Database Test Helpers
 * Utilities for setting up and tearing down test databases
 */
import type { Client } from '@libsql/client';
import type { Database } from '../../packages/database/src/client';
/**
 * Create a test database with Drizzle ORM
 * Uses in-memory SQLite for fast, isolated tests
 */
export declare function createTestDatabase(): Promise<Database>;
/**
 * Cleanup test database
 * Closes connection and cleans up resources
 */
export declare function cleanupTestDatabase(_db: Database): Promise<void>;
/**
 * Reset the test database
 * Clears all tables and resets sequences
 */
export declare function resetTestDb(client: Client): Promise<void>;
/**
 * Close the test database connection
 * @deprecated Use cleanupTestDatabase instead
 */
export declare function closeTestDb(): Promise<void>;
/**
 * Legacy function for backward compatibility
 * @deprecated Use createTestDatabase instead
 */
export declare function createTestDb(): Client;
/**
 * Seed test data
 * Create common test data for use across tests
 */
export declare function seedTestData(_client: Client): Promise<void>;
/**
 * Clear all data from tables without dropping them
 */
export declare function clearTestData(client: Client): Promise<void>;
//# sourceMappingURL=db-test.d.ts.map
