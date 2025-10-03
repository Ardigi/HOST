import { type Context, appRouter } from '@host/api';
import { db } from '@host/database';
import { MenuService } from '@host/database/services';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { RequestHandler } from './$types';

/**
 * tRPC API handler for SvelteKit
 * Handles all tRPC requests at /api/trpc/*
 */
export const GET: RequestHandler = async event => {
	return fetchRequestHandler({
		endpoint: '/api/trpc',
		req: event.request,
		router: appRouter,
		createContext: async (): Promise<Context> => {
			// Get user from session (set by hooks.server.ts)
			const user = event.locals.user;

			// Initialize services
			const menuService = new MenuService(db);

			return {
				db,
				user,
				menuService,
				// Add other services here as they're implemented
				// orderService: new OrderService(db),
				// paymentService: new PaymentService(db),
			};
		},
	});
};

export const POST: RequestHandler = async event => {
	return fetchRequestHandler({
		endpoint: '/api/trpc',
		req: event.request,
		router: appRouter,
		createContext: async (): Promise<Context> => {
			const user = event.locals.user;
			const menuService = new MenuService(db);

			return {
				db,
				user,
				menuService,
			};
		},
	});
};
