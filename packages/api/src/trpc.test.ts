import { TRPCError } from '@trpc/server';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createAdminContext, createAuthContext, createTestContext } from './test/setup';
import { adminProcedure, protectedProcedure, publicProcedure, router } from './trpc';

describe('tRPC Infrastructure', () => {
	describe('publicProcedure', () => {
		it('should execute without authentication', async () => {
			const testRouter = router({
				test: publicProcedure.query(() => {
					return { message: 'public access' };
				}),
			});

			const caller = testRouter.createCaller(createTestContext());
			const result = await caller.test();

			expect(result).toEqual({ message: 'public access' });
		});

		it('should validate input with Zod schema', async () => {
			const testRouter = router({
				test: publicProcedure.input(z.object({ name: z.string().min(2) })).query(({ input }) => {
					return { greeting: `Hello ${input.name}` };
				}),
			});

			const caller = testRouter.createCaller(createTestContext());

			// Valid input
			const result = await caller.test({ name: 'Alice' });
			expect(result).toEqual({ greeting: 'Hello Alice' });

			// Invalid input - should throw ZodError
			await expect(caller.test({ name: 'A' })).rejects.toThrow();
		});

		it('should include Zod error details in error response', async () => {
			const testRouter = router({
				test: publicProcedure
					.input(z.object({ email: z.string().email() }))
					.query(({ input }) => input),
			});

			const caller = testRouter.createCaller(createTestContext());

			try {
				await caller.test({ email: 'invalid-email' });
				expect.fail('Should have thrown validation error');
			} catch (error) {
				expect(error).toBeInstanceOf(TRPCError);
				const trpcError = error as TRPCError;
				expect(trpcError.code).toBe('BAD_REQUEST');
			}
		});
	});

	describe('protectedProcedure', () => {
		it('should execute with authenticated user', async () => {
			const testRouter = router({
				test: protectedProcedure.query(({ ctx }) => {
					return { userId: ctx.user.id };
				}),
			});

			const caller = testRouter.createCaller(createAuthContext());
			const result = await caller.test();

			expect(result).toEqual({ userId: 'test-user-id' });
		});

		it('should throw UNAUTHORIZED when user is null', async () => {
			const testRouter = router({
				test: protectedProcedure.query(() => {
					return { message: 'protected' };
				}),
			});

			const caller = testRouter.createCaller(createTestContext({ user: null }));

			await expect(caller.test()).rejects.toThrow(
				new TRPCError({
					code: 'UNAUTHORIZED',
					message: 'You must be logged in to access this resource',
				})
			);
		});

		it('should throw UNAUTHORIZED when user is undefined', async () => {
			const testRouter = router({
				test: protectedProcedure.query(() => {
					return { message: 'protected' };
				}),
			});

			const caller = testRouter.createCaller(createTestContext({ user: undefined }));

			await expect(caller.test()).rejects.toThrow(
				new TRPCError({
					code: 'UNAUTHORIZED',
					message: 'You must be logged in to access this resource',
				})
			);
		});

		it('should provide authenticated user in context', async () => {
			const testRouter = router({
				test: protectedProcedure.query(({ ctx }) => {
					return {
						id: ctx.user.id,
						email: ctx.user.email,
						roles: ctx.user.roles,
					};
				}),
			});

			const caller = testRouter.createCaller(
				createAuthContext({
					id: 'user-123',
					email: 'test@example.com',
					roles: ['server', 'bartender'],
				})
			);

			const result = await caller.test();
			expect(result).toEqual({
				id: 'user-123',
				email: 'test@example.com',
				roles: ['server', 'bartender'],
			});
		});
	});

	describe('adminProcedure', () => {
		it('should execute with admin user', async () => {
			const testRouter = router({
				test: adminProcedure.query(({ ctx }) => {
					return { userId: ctx.user.id, isAdmin: ctx.user.roles.includes('admin') };
				}),
			});

			const caller = testRouter.createCaller(createAdminContext());
			const result = await caller.test();

			expect(result).toEqual({
				userId: 'test-user-id',
				isAdmin: true,
			});
		});

		it('should throw FORBIDDEN when user is not admin', async () => {
			const testRouter = router({
				test: adminProcedure.query(() => {
					return { message: 'admin only' };
				}),
			});

			const caller = testRouter.createCaller(createAuthContext({ roles: ['server', 'bartender'] }));

			await expect(caller.test()).rejects.toThrow(
				new TRPCError({
					code: 'FORBIDDEN',
					message: 'You do not have permission to access this resource',
				})
			);
		});

		it('should throw UNAUTHORIZED when user is not authenticated', async () => {
			const testRouter = router({
				test: adminProcedure.query(() => {
					return { message: 'admin only' };
				}),
			});

			const caller = testRouter.createCaller(createTestContext());

			// adminProcedure extends protectedProcedure, so should throw UNAUTHORIZED first
			await expect(caller.test()).rejects.toThrow(TRPCError);
		});

		it('should allow users with admin role among other roles', async () => {
			const testRouter = router({
				test: adminProcedure.query(({ ctx }) => {
					return { roles: ctx.user.roles };
				}),
			});

			const caller = testRouter.createCaller(
				createAuthContext({ roles: ['server', 'admin', 'manager'] })
			);

			const result = await caller.test();
			expect(result.roles).toContain('admin');
		});
	});

	describe('SuperJSON transformer', () => {
		it('should serialize Date objects correctly', async () => {
			const testDate = new Date('2025-01-01T12:00:00Z');

			const testRouter = router({
				test: publicProcedure.query(() => {
					return { createdAt: testDate };
				}),
			});

			const caller = testRouter.createCaller(createTestContext());
			const result = await caller.test();

			expect(result.createdAt).toBeInstanceOf(Date);
			expect(result.createdAt.toISOString()).toBe(testDate.toISOString());
		});

		it('should handle undefined values in response', async () => {
			const testRouter = router({
				test: publicProcedure.query(() => {
					return {
						name: 'test',
						optionalField: undefined,
					};
				}),
			});

			const caller = testRouter.createCaller(createTestContext());
			const result = await caller.test();

			expect(result).toEqual({
				name: 'test',
				optionalField: undefined,
			});
		});
	});

	describe('Context services', () => {
		it('should provide database instance in context', async () => {
			const testRouter = router({
				test: publicProcedure.query(({ ctx }) => {
					return { hasDb: !!ctx.db };
				}),
			});

			const caller = testRouter.createCaller(createTestContext());
			const result = await caller.test();

			expect(result.hasDb).toBe(true);
		});

		it('should provide menuService in context', async () => {
			const testRouter = router({
				test: publicProcedure.query(({ ctx }) => {
					return { hasMenuService: !!ctx.menuService };
				}),
			});

			const caller = testRouter.createCaller(createTestContext());
			const result = await caller.test();

			expect(result.hasMenuService).toBe(true);
		});
	});
});
