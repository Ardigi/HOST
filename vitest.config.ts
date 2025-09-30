import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['**/*.{test,spec}.{js,ts}'],
		exclude: ['**/node_modules/**', '**/dist/**', '**/.svelte-kit/**'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'lcov'],
			exclude: [
				'**/node_modules/**',
				'**/dist/**',
				'**/.svelte-kit/**',
				'**/*.config.{js,ts}',
				'**/*.d.ts',
				'**/test/**',
				'**/tests/**',
			],
			thresholds: {
				branches: 80,
				functions: 80,
				lines: 85,
				statements: 85,
			},
		},
		setupFiles: ['./test/setup.ts'],
	},
});