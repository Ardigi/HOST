import * as schema from '@host/database/schema';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

/**
 * Order validation schemas
 */
const createOrderSchema = z.object({
	venueId: z.string(),
	tableNumber: z.number().int().positive(),
	guestCount: z.number().int().positive().default(1),
	orderType: z.enum(['dine_in', 'takeout', 'delivery', 'bar']).default('dine_in'),
	notes: z.string().optional(),
});

const addItemSchema = z.object({
	orderId: z.string(),
	items: z.array(
		z.object({
			menuItemId: z.string(),
			quantity: z.number().int().positive(),
			modifiers: z
				.array(
					z.object({
						modifierId: z.string(),
						quantity: z.number().int().positive().default(1),
					})
				)
				.optional(),
			notes: z.string().optional(),
		})
	),
});

const updateOrderStatusSchema = z.object({
	orderId: z.string(),
	status: z.enum(['open', 'sent', 'completed', 'cancelled', 'voided']),
});

/**
 * Order Router
 * Handles all order-related operations
 */
export const orderRouter = router({
	// Queries
	list: protectedProcedure
		.input(
			z.object({
				venueId: z.string(),
				status: z.enum(['open', 'sent', 'completed', 'cancelled', 'voided']).optional(),
				limit: z.number().int().positive().default(50),
				offset: z.number().int().nonnegative().default(0),
			})
		)
		.query(async ({ ctx, input }) => {
			// Access authenticated user (for logging/auditing)
			// const userId = ctx.user.id;

			// Fetch orders from database
			const orders = await ctx.db.query.orders.findMany({
				where: (orders, { eq, and }) => {
					const conditions = [eq(orders.venueId, input.venueId)];

					if (input.status) {
						conditions.push(eq(orders.status, input.status));
					}

					return and(...conditions);
				},
				limit: input.limit,
				offset: input.offset,
				with: {
					items: {
						with: {
							modifiers: true,
						},
					},
					server: true,
				},
				orderBy: (orders, { desc }) => [desc(orders.createdAt)],
			});

			return {
				orders,
				total: orders.length,
			};
		}),

	getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
		const order = await ctx.db.query.orders.findFirst({
			where: (orders, { eq }) => eq(orders.id, input.id),
			with: {
				items: {
					with: {
						modifiers: true,
					},
				},
				server: true,
				venue: true,
			},
		});

		if (!order) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Order not found',
			});
		}

		return order;
	}),

	listTables: protectedProcedure
		.input(z.object({ venueId: z.string() }))
		.query(async ({ ctx, input }) => {
			const tables = await ctx.db.query.tables.findMany({
				where: (tables, { eq }) => eq(tables.venueId, input.venueId),
				orderBy: (tables, { asc }) => [asc(tables.tableNumber)],
			});

			return { tables };
		}),

	// Mutations
	create: protectedProcedure.input(createOrderSchema).mutation(async ({ ctx, input }) => {
		// Generate order number
		const todayOrders = await ctx.db.query.orders.findMany({
			where: (orders, { eq, and, gte }) => {
				const startOfDay = new Date();
				startOfDay.setHours(0, 0, 0, 0);

				return and(eq(orders.venueId, input.venueId), gte(orders.createdAt, startOfDay));
			},
		});

		const orderNumber = todayOrders.length + 1;

		// Create order
		const [newOrder] = await ctx.db
			.insert(schema.orders)
			.values({
				...input,
				orderNumber,
				serverId: ctx.user.id,
			})
			.returning();

		return newOrder;
	}),

	addItems: protectedProcedure.input(addItemSchema).mutation(async ({ ctx, input }) => {
		// Verify order exists and is open
		const order = await ctx.db.query.orders.findFirst({
			where: (orders, { eq }) => eq(orders.id, input.orderId),
		});

		if (!order) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Order not found',
			});
		}

		if (order.status !== 'open') {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'Cannot add items to a closed order',
			});
		}

		// Add items to order
		const orderItems = await Promise.all(
			input.items.map(async item => {
				// Fetch menu item details
				const menuItem = await ctx.db.query.menuItems.findFirst({
					where: (items, { eq }) => eq(items.id, item.menuItemId),
				});

				if (!menuItem) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: `Menu item ${item.menuItemId} not found`,
					});
				}

				// Calculate modifier total
				let modifierTotal = 0;
				if (item.modifiers) {
					const modifierPrices = await Promise.all(
						item.modifiers.map(async mod => {
							// Note: Drizzle relational query types are inferred and extremely complex
							// TypeScript cannot properly type these callback parameters without `any`
							const modifier = await ctx.db.query.menuModifiers.findFirst({
								// biome-ignore lint/suspicious/noExplicitAny: Drizzle query builder callback types are too complex
								where: (menuModifiers: any, { eq }: any) => eq(menuModifiers.id, mod.modifierId),
							});
							return (modifier?.priceAdjustment || 0) * mod.quantity;
						})
					);
					modifierTotal = modifierPrices.reduce((sum, price) => sum + price, 0);
				}

				const itemTotal = (menuItem.price + modifierTotal) * item.quantity;

				// Insert order item
				const [orderItem] = await ctx.db
					.insert(schema.orderItems)
					.values({
						orderId: input.orderId,
						menuItemId: item.menuItemId,
						name: menuItem.name,
						quantity: item.quantity,
						price: menuItem.price,
						modifierTotal,
						total: itemTotal,
						notes: item.notes,
					})
					.returning();

				// Insert modifiers
				if (item.modifiers && orderItem) {
					await Promise.all(
						item.modifiers.map(async mod => {
							const modifier = await ctx.db.query.menuModifiers.findFirst({
								// biome-ignore lint/suspicious/noExplicitAny: Drizzle query builder callback types are too complex
								where: (menuModifiers: any, { eq }: any) => eq(menuModifiers.id, mod.modifierId),
							});

							if (modifier) {
								await ctx.db.insert(schema.orderItemModifiers).values({
									orderItemId: orderItem.id,
									modifierId: mod.modifierId,
									name: modifier.name,
									price: modifier.priceAdjustment,
									quantity: mod.quantity,
								});
							}
						})
					);
				}

				return orderItem;
			})
		);

		// TODO: Recalculate order totals when OrderService is implemented
		// await ctx.orderService.recalculateTotals(input.orderId);

		return { orderItems };
	}),

	updateStatus: protectedProcedure
		.input(updateOrderStatusSchema)
		.mutation(async ({ ctx, input }) => {
			const [updatedOrder] = await ctx.db
				.update(schema.orders)
				.set({
					status: input.status,
					...(input.status === 'completed' && { completedAt: new Date() }),
				})
				.where(eq(schema.orders.id, input.orderId))
				.returning();

			if (!updatedOrder) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Order not found',
				});
			}

			return updatedOrder;
		}),

	// TODO: Subscriptions (for real-time updates) - implement when eventBus is added
	// onOrderUpdate: protectedProcedure
	// 	.input(z.object({ orderId: z.string() }))
	// 	.subscription(async ({ ctx, input }) => {
	// 		return observable<Order>(emit => {
	// 			const unsubscribe = ctx.eventBus.subscribe(`order.${input.orderId}.updated`, order => {
	// 				emit.next(order);
	// 			});
	//
	// 			return unsubscribe;
	// 		});
	// 	}),
});
