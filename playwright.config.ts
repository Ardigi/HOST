import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load E2E test environment variables
dotenv.config({ path: path.join(__dirname, '.env.e2e') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [
		['html'],
		['json', { outputFile: 'test-results/results.json' }],
		['junit', { outputFile: 'test-results/results.xml' }],
	],
	use: {
		baseURL: process.env.POS_URL || 'http://127.0.0.1:5173', // Use explicit IPv4 address for Windows compatibility
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
	},

	projects: [
		// Setup project to run authentication once before all tests
		{
			name: 'setup',
			testMatch: /.*\.setup\.ts/,
		},

		// Main test projects - all depend on setup and use the saved auth state
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				storageState: path.join(__dirname, '.auth/user.json'),
			},
			dependencies: ['setup'],
		},

		{
			name: 'firefox',
			use: {
				...devices['Desktop Firefox'],
				storageState: path.join(__dirname, '.auth/user.json'),
			},
			dependencies: ['setup'],
		},

		{
			name: 'webkit',
			use: {
				...devices['Desktop Safari'],
				storageState: path.join(__dirname, '.auth/user.json'),
			},
			dependencies: ['setup'],
		},

		/* Test against mobile viewports. */
		{
			name: 'Mobile Chrome',
			use: {
				...devices['Pixel 5'],
				storageState: path.join(__dirname, '.auth/user.json'),
			},
			dependencies: ['setup'],
		},
		{
			name: 'Mobile Safari',
			use: {
				...devices['iPhone 12'],
				storageState: path.join(__dirname, '.auth/user.json'),
			},
			dependencies: ['setup'],
		},

		/* Test against tablet viewports */
		{
			name: 'Tablet',
			use: {
				...devices['iPad Pro'],
				storageState: path.join(__dirname, '.auth/user.json'),
			},
			dependencies: ['setup'],
		},
	],

	/* Run your local dev server before starting the tests */
	webServer: {
		command: 'cd apps/pos && npx vite dev', // Run Vite directly to avoid turbo output buffering issues
		url: process.env.POS_URL || 'http://127.0.0.1:5173', // Use explicit IPv4 address for Windows compatibility
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000,
		stdout: 'pipe', // Explicitly pipe stdout
		stderr: 'pipe', // Explicitly pipe stderr
		env: {
			// Build absolute path for DATABASE_URL if not already set
			// The webServer runs from apps/pos, so we need to resolve the path from monorepo root
			DATABASE_URL: process.env.DATABASE_URL
				? process.env.DATABASE_URL.startsWith('file:')
					? `file:${path.resolve(__dirname, process.env.DATABASE_URL.replace('file:', ''))}`
					: process.env.DATABASE_URL
				: `file:${path.join(__dirname, 'packages/database/dev.db')}`,
			CI: process.env.CI || 'true', // Enable E2E mode in hooks.server.ts
			NODE_ENV: process.env.NODE_ENV || 'test',
		},
	},
});
