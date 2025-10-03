/**
 * Main tRPC App Router
 * Combines all feature routers
 */

import { menuRouter } from './routers/menu.router';
import { orderRouter } from './routers/order.router';
import { paymentRouter } from './routers/payment.router';
import { router } from './trpc';

/**
 * App Router
 * This is the main router that combines all feature routers
 */
export const appRouter = router({
	menu: menuRouter,
	orders: orderRouter,
	payments: paymentRouter,
	// Add more routers here:
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
