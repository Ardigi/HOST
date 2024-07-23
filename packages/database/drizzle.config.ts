import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error(
		'DATABASE_URL environment variable is required for Drizzle Kit CLI operations (migrations, push, studio)'
	);
}

export default defineConfig({
	schema: './src/schema/!(*.test).ts',
	out: './drizzle',
	dialect: 'turso',
	dbCredentials: {
		url: databaseUrl,
		authToken: process.env.DATABASE_AUTH_TOKEN,
	},
	verbose: true,
	strict: true,
});
