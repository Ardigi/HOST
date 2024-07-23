import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

/**
 * Create a database client with Turso (LibSQL)
 * Supports three modes:
 * 1. Local SQLite: file:./local.db
 * 2. Turso Cloud: libsql://your-db.turso.io
 * 3. Embedded Replica (Local-First): file + syncUrl
 */
export function createDatabase(config: {
	url: string;
	authToken?: string;
	syncUrl?: string;
	syncInterval?: number;
	encryptionKey?: string;
}) {
	const client = createClient({
		url: config.url,
		authToken: config.authToken,
		syncUrl: config.syncUrl,
		syncInterval: config.syncInterval || 60,
		encryptionKey: config.encryptionKey,
	});

	return drizzle(client, { schema });
}

/**
 * Default database instance (lazy-loaded)
 * Uses environment variables for configuration
 * Only initializes when first accessed to allow builds without DATABASE_URL
 */
let _db: ReturnType<typeof createDatabase> | null = null;

function getDb() {
	if (!_db) {
		const databaseUrl = process.env.DATABASE_URL;

		if (!databaseUrl) {
			throw new Error('DATABASE_URL environment variable is required');
		}

		_db = createDatabase({
			url: databaseUrl,
			authToken: process.env.DATABASE_AUTH_TOKEN,
			syncUrl: process.env.TURSO_SYNC_URL,
			syncInterval: process.env.TURSO_SYNC_INTERVAL
				? Number(process.env.TURSO_SYNC_INTERVAL)
				: undefined,
			encryptionKey: process.env.DB_ENCRYPTION_KEY,
		});
	}

	return _db;
}

/**
 * Database instance using Proxy for lazy initialization
 * Allows imports during build without requiring DATABASE_URL
 * Error only thrown when db is actually used (runtime)
 */
export const db = new Proxy({} as ReturnType<typeof createDatabase>, {
	get(_target, prop) {
		const instance = getDb();
		const value = instance[prop as keyof typeof instance];
		return typeof value === 'function' ? value.bind(instance) : value;
	},
});

export type Database = typeof db;
