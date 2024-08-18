import { type Context, appRouter } from '@host/api';
import { db } from '@host/database';
import { MenuService, OrderService, PaymentService } from '@host/database/services';
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
			const orderService = new OrderService(db);
			const paymentService = new PaymentService(db);

			return {
				db,
				user,
				menuService,
				orderService,
				paymentService,
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
			const orderService = new OrderService(db);
			const paymentService = new PaymentService(db);

			return {
				db,
				user,
				menuService,
				orderService,
				paymentService,
			};
		},
	});
};
