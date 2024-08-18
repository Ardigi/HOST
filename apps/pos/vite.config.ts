import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: true, // Listen on all addresses (IPv4 + IPv6) for E2E testing compatibility
		port: 5173,
	},
	ssr: {
		noExternal: ['m3-svelte', '@host/shared', '@host/database'],
	},
	// Test configuration moved to vitest.workspace.ts
	// This allows separate environments for client (browser) and server (node) tests
});
