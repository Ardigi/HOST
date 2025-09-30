import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL environment variable is required');
}

export default defineConfig({
	schema: './src/schema/index.ts',
	out: './drizzle',
	dialect: 'turso',
	dbCredentials: {
		url: databaseUrl,
		authToken: process.env.DATABASE_AUTH_TOKEN,
	},
});
