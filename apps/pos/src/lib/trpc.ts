import type { AppRouter } from '@host/api';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

/**
 * Creates a tRPC client for use in the browser
 * This client can be used in Svelte components
 */
export function createClient(fetch?: typeof globalThis.fetch) {
	return createTRPCClient<AppRouter>({
		links: [
			httpBatchLink({
				url: '/api/trpc',
				// Pass SvelteKit's fetch for SSR
				fetch,
				// Use superjson for serialization (dates, etc.)
				transformer: superjson,
			}),
		],
	});
}

/**
 * Browser-only tRPC client
 * Use this in components (not in load functions)
 */
export const trpc = createClient();
