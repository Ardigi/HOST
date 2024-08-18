import { defineWorkspace } from 'vitest/config';

/**
 * Vitest Workspace Configuration for POS App
 *
 * Separates test environments for client-side and server-side code:
 * - Client Project: Browser mode for Svelte component tests
 * - Server Project: Node environment for hooks, load functions, and actions
 *
 * Pattern from: Scott Spence (2025) + Vitest official docs
 * @see https://scottspence.com/posts/testing-with-vitest-browser-svelte-guide
 * @see https://vitest.dev/guide/workspace
 */
export default defineWorkspace([
	{
		// Client-side tests (Svelte components)
		extends: './vite.config.ts',
		test: {
			name: 'client',
			include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
			exclude: [
				'**/node_modules/**',
				'**/.svelte-kit/**',
				'**/dist/**',
				'src/**/*.ssr.{test,spec}.{js,ts}',
			],
			// Browser mode for real Chromium testing
			browser: {
				enabled: true,
				name: 'chromium',
				provider: 'playwright',
				headless: true,
			},
			setupFiles: ['vitest-browser-svelte', './src/test/setup.ts'],
			globals: true,
		},
	},
	{
		// Server-side tests (hooks, load functions, actions)
		// Note: Minimal config matching packages/api to avoid module resolution conflicts
		test: {
			name: 'server',
			environment: 'node',
			globals: true,
			include: ['src/**/*.{test,spec}.{js,ts}'],
			exclude: [
				'**/node_modules/**',
				'**/.svelte-kit/**',
				'**/dist/**',
				'src/**/*.svelte.{test,spec}.{js,ts}',
			],
			setupFiles: ['./src/test/setup.ts'],
		},
	},
]);
