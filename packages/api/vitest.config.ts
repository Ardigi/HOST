import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		passWithNoTests: true, // Temporary: allows CI to pass while we implement tests
		include: ['**/*.{test,spec}.{js,ts}'],
		exclude: ['**/node_modules/**', '**/dist/**'],
	},
});
