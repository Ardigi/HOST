/**
 * Main tRPC App Router
 * Combines all feature routers
 */

import { orderRouter } from './routers/order.router';
import { router } from './trpc';

/**
 * App Router
 * This is the main router that combines all feature routers
 */
export const appRouter = router({
	orders: orderRouter,
	// Add more routers here:
	// menu: menuRouter,
	// payments: paymentRouter,
	// inventory: inventoryRouter,
	// auth: authRouter,
});

/**
 * Export type router type signature for client
 */
export type AppRouter = typeof appRouter;

/**
 * Export everything needed for setting up tRPC
 */
export { router, publicProcedure, protectedProcedure, adminProcedure } from './trpc';
export type { Context } from './trpc';
