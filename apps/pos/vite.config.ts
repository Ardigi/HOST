import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		noExternal: ['m3-svelte'],
		resolve: {
			conditions: ['svelte', 'browser', 'import'],
		},
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		// Use Vitest Browser Mode with Playwright for real browser testing
		browser: {
			enabled: true,
			name: 'chromium',
			provider: 'playwright',
			headless: true,
		},
		setupFiles: ['vitest-browser-svelte', './src/test/setup.ts'],
		globals: true,
	},
	resolve: {
		alias: {
			$lib: '/src/lib',
			$components: '/src/lib/components',
			$stores: '/src/lib/stores',
			$utils: '/src/lib/utils',
		},
		conditions: ['svelte', 'browser', 'import'],
	},
});
