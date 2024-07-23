import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@libsql/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = createClient({
	url: process.env.DATABASE_URL || 'file:./dev.db',
	authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function initDatabase() {
	console.log('🗄️  Initializing database...\n');

	try {
		// Read all migration SQL files in order
		const migrationsDir = join(__dirname, '..', 'drizzle');
		const migrationFiles = ['0000_friendly_husk.sql', '0001_secret_forge.sql'];

		let totalStatements = 0;

		for (const migrationFile of migrationFiles) {
			const migrationPath = join(migrationsDir, migrationFile);

			try {
				const migrationSQL = readFileSync(migrationPath, 'utf-8');
				const statements = migrationSQL
					.split('--> statement-breakpoint')
					.map(s => s.trim())
					.filter(s => s.length > 0);

				for (const statement of statements) {
					try {
						await client.execute(statement);
						totalStatements++;
					} catch (error: unknown) {
						// Skip if table already exists
						const err = error as { message?: string };
						if (!err.message?.includes('already exists')) {
							throw error;
						}
					}
				}
			} catch (error: unknown) {
				const err = error as { code?: string };
				if (!err.code || err.code !== 'ENOENT') {
					throw error;
				}
				// Migration file doesn't exist yet, skip it
			}
		}

		console.log(`📝 Executed ${totalStatements} SQL statements\n`);
		console.log('✅ Database initialized successfully!\n');
		process.exit(0);
	} catch (error) {
		console.error('❌ Database initialization failed:', error);
		process.exit(1);
	}
}

initDatabase();
