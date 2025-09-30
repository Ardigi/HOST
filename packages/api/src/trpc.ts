import { initTRPC, TRPCError } from '@trpc/server';
import { type Database } from '@host/database';
import superjson from 'superjson';

/**
 * tRPC Context
 * Available in all procedures
 */
export interface Context {
	db: Database;
	user: {
		id: string;
		email: string;
		venueId: string;
		role: string;
	} | null;
	// Add other services here
	// orderService: OrderService;
	// eventBus: EventBus;
}

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create({
	transformer: superjson,
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				zodError:
					error.cause instanceof Error && error.cause.name === 'ZodError'
						? error.cause
						: null,
			},
		};
	},
});

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
	if (!ctx.user) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'You must be logged in to access this resource',
		});
	}

	return next({
		ctx: {
			...ctx,
			user: ctx.user,
		},
	});
});

/**
 * Admin procedure - requires admin role
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
	if (ctx.user.role !== 'admin') {
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: 'You do not have permission to access this resource',
		});
	}

	return next({ ctx });
});