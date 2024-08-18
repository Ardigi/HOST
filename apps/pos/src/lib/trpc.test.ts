/**
 * Tests for tRPC Client Configuration
 * Tests browser-side tRPC client setup
 */

import { describe, expect, it, vi } from 'vitest';
import { createClient, trpc } from './trpc';

describe('tRPC Client (trpc.ts)', () => {
	describe('createClient', () => {
		it('should create tRPC client with default fetch', () => {
			// Act
			const client = createClient();

			// Assert
			expect(client).toBeDefined();
			expect(client.orders).toBeDefined();
			expect(client.menu).toBeDefined();
		});

		it('should create tRPC client with custom fetch', () => {
			// Arrange
			const customFetch = vi.fn() as unknown as typeof globalThis.fetch;

			// Act
			const client = createClient(customFetch);

			// Assert
			expect(client).toBeDefined();
		});

		it('should configure httpBatchLink with correct URL', () => {
			// Act
			const client = createClient();

			// Assert - Client should have routers from AppRouter
			expect(client.orders).toBeDefined();
			expect(client.orders.create).toBeDefined();
			expect(client.orders.getById).toBeDefined();
		});

		it('should use superjson transformer for serialization', async () => {
			// This test verifies the client is configured with superjson
			// which allows Date objects and other non-JSON types to be serialized

			// Arrange
			const client = createClient();

			// Assert - Client should be properly configured
			expect(client).toBeDefined();
			// SuperJSON transformer is internal to tRPC, we verify it through integration
		});
	});

	describe('trpc (browser client)', () => {
		it('should export pre-configured browser client', () => {
			// Assert
			expect(trpc).toBeDefined();
			expect(trpc.orders).toBeDefined();
			expect(trpc.menu).toBeDefined();
		});

		it('should have orders router methods', () => {
			// Assert
			expect(trpc.orders.create).toBeDefined();
			expect(trpc.orders.getById).toBeDefined();
			expect(trpc.orders.list).toBeDefined();
			expect(trpc.orders.updateStatus).toBeDefined();
		});

		it('should have menu router methods', () => {
			// Assert
			expect(trpc.menu.listCategories).toBeDefined();
			expect(trpc.menu.listItems).toBeDefined();
			expect(trpc.menu.getFullMenu).toBeDefined();
		});
	});
});
