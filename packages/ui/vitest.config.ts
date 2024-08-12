import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [svelte()],
	test: {
		globals: true,
		include: ['src/**/*.{test,spec}.{js,ts}'],
		exclude: ['**/node_modules/**', '**/dist/**'],
		// Use Vitest Browser Mode with Playwright for real browser testing
		browser: {
			enabled: true,
			name: 'chromium',
			provider: 'playwright',
			headless: true,
		},
		setupFiles: ['vitest-browser-svelte'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'lcov'],
			exclude: [
				'**/node_modules/**',
				'**/dist/**',
				'**/*.config.{js,ts}',
				'**/*.d.ts',
				'**/index.ts', // Barrel exports
			],
			thresholds: {
				branches: 80,
				functions: 80,
				lines: 80,
				statements: 80,
			},
		},
	},
});
