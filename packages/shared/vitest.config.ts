import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		exclude: ['**/node_modules/**', '**/dist/**'],
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
				branches: 90,
				functions: 90,
				lines: 95,
				statements: 95,
			},
		},
	},
});
