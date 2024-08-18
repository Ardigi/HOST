import { type Context, appRouter } from '@host/api';
import { db } from '@host/database';
import { MenuService, OrderService, PaymentService } from '@host/database/services';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Creates a tRPC caller for server-side use
 * Use this in +page.server.ts load functions
 */
export function createServerCaller(event: RequestEvent) {
	const user = event.locals.user;
	const menuService = new MenuService(db);
	const orderService = new OrderService(db);
	const paymentService = new PaymentService(db);

	const context: Context = {
		db,
		user,
		menuService,
		orderService,
		paymentService,
	};

	return appRouter.createCaller(context);
}
