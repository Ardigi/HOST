import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDatabase } from './client';

// Mock @libsql/client
vi.mock('@libsql/client', () => ({
	createClient: vi.fn(config => ({
		__config: config, // Store config for verification
		execute: vi.fn(),
		close: vi.fn(),
	})),
}));

// Mock drizzle-orm
vi.mock('drizzle-orm/libsql', () => ({
	drizzle: vi.fn((client, options) => ({
		__client: client,
		__schema: options?.schema,
		select: vi.fn(),
		insert: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	})),
}));

describe('Database Client', () => {
	let originalEnv: NodeJS.ProcessEnv;

	beforeEach(() => {
		// Store original env
		originalEnv = { ...process.env };
		// Clear any previous db instance
		vi.resetModules();
	});

	afterEach(() => {
		// Restore env
		process.env = originalEnv;
		vi.clearAllMocks();
	});

	describe('createDatabase', () => {
		it('should create database with local SQLite URL', () => {
			const db = createDatabase({
				url: 'file:./dev.db',
			});

			expect(db).toBeDefined();
			expect(db.__client.__config.url).toBe('file:./dev.db');
		});

		it('should create database with Turso cloud URL', () => {
			const db = createDatabase({
				url: 'libsql://my-db.turso.io',
				authToken: 'test-token',
			});

			expect(db).toBeDefined();
			expect(db.__client.__config.url).toBe('libsql://my-db.turso.io');
			expect(db.__client.__config.authToken).toBe('test-token');
		});

		it('should create database with embedded replica config', () => {
			const db = createDatabase({
				url: 'file:./local.db',
				syncUrl: 'libsql://my-db.turso.io',
				authToken: 'test-token',
				syncInterval: 120,
			});

			expect(db).toBeDefined();
			expect(db.__client.__config.url).toBe('file:./local.db');
			expect(db.__client.__config.syncUrl).toBe('libsql://my-db.turso.io');
			expect(db.__client.__config.authToken).toBe('test-token');
			expect(db.__client.__config.syncInterval).toBe(120);
		});

		it('should use default sync interval of 60 seconds', () => {
			const db = createDatabase({
				url: 'file:./local.db',
				syncUrl: 'libsql://my-db.turso.io',
			});

			expect(db.__client.__config.syncInterval).toBe(60);
		});

		it('should support encryption key', () => {
			const db = createDatabase({
				url: 'file:./encrypted.db',
				encryptionKey: 'test-encryption-key',
			});

			expect(db.__client.__config.encryptionKey).toBe('test-encryption-key');
		});

		it('should pass schema to drizzle', () => {
			const db = createDatabase({
				url: 'file:./dev.db',
			});

			expect(db.__schema).toBeDefined();
		});

		it('should create drizzle instance with client', () => {
			const db = createDatabase({
				url: 'file:./dev.db',
			});

			// Verify drizzle instance has query methods
			expect(db.select).toBeDefined();
			expect(db.insert).toBeDefined();
			expect(db.update).toBeDefined();
			expect(db.delete).toBeDefined();
		});
	});

	describe('Lazy-loaded default db instance', () => {
		it('should throw error when DATABASE_URL is not set', async () => {
			// Clear DATABASE_URL
			process.env.DATABASE_URL = undefined;

			// Re-import to get fresh instance
			const { db } = await import('./client');

			// Accessing db should throw
			expect(() => {
				// Access any property to trigger proxy
				db.select;
			}).toThrow('DATABASE_URL environment variable is required');
		});

		it('should create db with environment variables', async () => {
			process.env.DATABASE_URL = 'file:./test.db';
			process.env.DATABASE_AUTH_TOKEN = 'env-token';
			process.env.TURSO_SYNC_URL = 'libsql://env-sync.turso.io';
			process.env.TURSO_SYNC_INTERVAL = '90';
			process.env.DB_ENCRYPTION_KEY = 'env-encryption-key';

			// Re-import to get fresh instance
			vi.resetModules();
			const { db } = await import('./client');

			// Access property to trigger lazy initialization
			const hasSelect = !!db.select;

			expect(hasSelect).toBe(true);
			expect(db.__client.__config.url).toBe('file:./test.db');
			expect(db.__client.__config.authToken).toBe('env-token');
			expect(db.__client.__config.syncUrl).toBe('libsql://env-sync.turso.io');
			expect(db.__client.__config.syncInterval).toBe(90);
			expect(db.__client.__config.encryptionKey).toBe('env-encryption-key');
		});

		it('should handle undefined optional env variables', async () => {
			process.env.DATABASE_URL = 'file:./test.db';
			process.env.DATABASE_AUTH_TOKEN = undefined;
			process.env.TURSO_SYNC_URL = undefined;
			process.env.TURSO_SYNC_INTERVAL = undefined;
			process.env.DB_ENCRYPTION_KEY = undefined;

			vi.resetModules();
			const { db } = await import('./client');

			// Access property to trigger lazy initialization
			db.select;

			expect(db.__client.__config.url).toBe('file:./test.db');
			expect(db.__client.__config.authToken).toBeUndefined();
			expect(db.__client.__config.syncUrl).toBeUndefined();
			expect(db.__client.__config.syncInterval).toBe(60); // Default
			expect(db.__client.__config.encryptionKey).toBeUndefined();
		});

		it('should parse TURSO_SYNC_INTERVAL as number', async () => {
			process.env.DATABASE_URL = 'file:./test.db';
			process.env.TURSO_SYNC_INTERVAL = '180';

			vi.resetModules();
			const { db } = await import('./client');

			db.select;

			expect(db.__client.__config.syncInterval).toBe(180);
			expect(typeof db.__client.__config.syncInterval).toBe('number');
		});

		it('should initialize only once (singleton pattern)', async () => {
			process.env.DATABASE_URL = 'file:./test.db';

			vi.resetModules();
			const { createClient } = await import('@libsql/client');
			const { db } = await import('./client');

			// Access multiple properties
			db.select;
			db.insert;
			db.update;
			db.delete;

			// createClient should be called only once
			expect(createClient).toHaveBeenCalledTimes(1);
		});
	});

	describe('Proxy pattern for lazy initialization', () => {
		it('should allow importing db without DATABASE_URL during build', async () => {
			process.env.DATABASE_URL = undefined;

			// This should not throw - db is a Proxy
			const { db } = await import('./client');

			expect(db).toBeDefined();
		});

		it('should bind methods correctly', async () => {
			process.env.DATABASE_URL = 'file:./test.db';

			vi.resetModules();
			const { db } = await import('./client');

			// Access method to verify binding
			const selectMethod = db.select;

			expect(typeof selectMethod).toBe('function');
		});

		it('should return non-function values directly', async () => {
			process.env.DATABASE_URL = 'file:./test.db';

			vi.resetModules();
			const { db } = await import('./client');

			// Access __client (non-function property)
			const client = db.__client;

			expect(client).toBeDefined();
			expect(typeof client).toBe('object');
		});
	});
});
