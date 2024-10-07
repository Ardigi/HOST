# HOST Tech Stack Usage Guide

**Complete guide to how we use each technology in the stack**

Last Updated: 2025-10-07

---

## Table of Contents

1. [Philosophy & Architecture](#philosophy--architecture)
2. [Frontend Stack](#frontend-stack)
3. [Backend & API Stack](#backend--api-stack)
4. [Database Stack](#database-stack)
5. [Testing Infrastructure](#testing-infrastructure)
6. [Build & Development Tools](#build--development-tools)
7. [Code Quality & Standards](#code-quality--standards)
8. [Authentication](#authentication)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Development Workflow](#development-workflow)
11. [Real-World Integration Examples](#real-world-integration-examples)
12. [Common Patterns](#common-patterns--anti-patterns)
13. [Troubleshooting](#troubleshooting-guide)

---

## Philosophy & Architecture

### Core Principles

1. **Type Safety First** - End-to-end type safety from database to UI
2. **Test-Driven Development** - Write tests before implementation (99.93% coverage)
3. **Local-First Architecture** - Embedded database replicas for zero-latency operations
4. **Performance by Default** - Sub-400ms response times, <50ms database reads
5. **Developer Experience** - Fast feedback loops, minimal configuration

### Technology Selection Criteria

Every technology was chosen based on:
- **Type Safety**: Full TypeScript support
- **Performance**: Measurable speed improvements
- **Developer Experience**: Minimal boilerplate, fast iteration
- **Production Ready**: Battle-tested, active maintenance
- **Future-Proof**: Modern standards, growing ecosystem

---

## Frontend Stack

### Svelte 5 - Fine-Grained Reactivity

**Why Svelte 5:**
- Compiles to vanilla JavaScript (no virtual DOM overhead)
- Runes provide fine-grained reactivity (30-50% faster than Svelte 4)
- Smaller bundle sizes than React/Vue
- Best-in-class developer experience

**How We Use It:**

#### Runes Pattern

```typescript
// packages/ui/src/components/POSButton.svelte
<script lang="ts">
import type { Props } from './types';

// Props with $props()
let {
  variant = 'standard',
  onClick,
  children
}: Props = $props();

// Reactive state with $state()
let isPressed = $state(false);

// Derived state with $derived()
let buttonClasses = $derived(
  `pos-button pos-btn-${variant} ${isPressed ? 'pressed' : ''}`
);

// Side effects with $effect()
$effect(() => {
  console.log('Button variant changed:', variant);
});
</script>

<button
  class={buttonClasses}
  onclick={() => {
    isPressed = true;
    onClick?.();
    setTimeout(() => isPressed = false, 150);
  }}
>
  {children}
</button>
```

#### Component Patterns

**Wrapper Components:**
We wrap m3-svelte components to:
1. Simplify complex type signatures
2. Add POS-specific defaults (touch targets)
3. Maintain consistent API

```typescript
// Before (m3-svelte directly - complex types)
<Button variant="filled" size="large" type="submit">Submit</Button>

// After (POSButton wrapper - clean types)
<POSButton variant="primary" size="comfortable" type="submit">Submit</POSButton>
```

**Why This Approach:**
- Hide m3-svelte's polymorphic union types (cause TypeScript complexity)
- Enforce touch target minimums (WCAG 2.1 AA: 48px)
- Centralize POS-specific styling

---

### SvelteKit 2 - Full-Stack Framework

**Why SvelteKit:**
- File-based routing (intuitive structure)
- Built-in SSR/SSG (SEO + performance)
- Form actions (progressive enhancement)
- Vite-powered (instant HMR)

**How We Use It:**

#### File-Based Routing

```
apps/pos/src/routes/
├── +layout.svelte              # Root layout
├── +layout.server.ts           # Server-side layout data
├── +page.svelte                # Home page
├── orders/
│   ├── +page.svelte            # Orders list
│   ├── +page.server.ts         # Server actions & load
│   └── [orderId]/
│       ├── +page.svelte        # Order detail
│       └── +page.ts            # Client-side load
└── auth/
    ├── callback/
    │   └── +server.ts          # OAuth callback
    └── logout/
        └── +server.ts          # Logout endpoint
```

#### Server Actions Pattern

```typescript
// apps/pos/src/routes/orders/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  const orders = await trpc.order.list.query({ venueId: locals.user.venueId });
  return { orders };
};

export const actions: Actions = {
  createOrder: async ({ request, locals }) => {
    const formData = await request.formData();
    const tableId = formData.get('tableId') as string;

    try {
      const order = await trpc.order.create.mutate({
        venueId: locals.user.venueId,
        tableId,
        orderType: 'dine_in',
      });

      return { success: true, order };
    } catch (error) {
      return fail(400, { error: 'Failed to create order' });
    }
  },
};
```

#### Props Pattern for Page Components

```svelte
<!-- apps/pos/src/routes/orders/+page.svelte -->
<script lang="ts">
import type { PageData } from './$types';

// ✅ Correct: Receive data as props from load function
let { data }: { data: PageData } = $props();
</script>

<h1>Orders</h1>
{#each data.orders as order}
  <OrderCard {order} />
{/each}

<!-- ❌ Wrong: Don't use $app/state for page data
<script lang="ts">
import { page } from '$app/state';
const orders = page.data.orders; // Anti-pattern!
</script>
-->
```

**Why Props Pattern:**
- Easier to test (just pass mock data)
- No module mocking required
- Explicit data flow
- Standard SvelteKit pattern

---

### Material Design 3 (m3-svelte)

**Why m3-svelte:**
- Native Svelte 5 implementation (not a wrapper)
- 3x smaller bundle size than @material/web
- Built-in accessibility (WCAG 2.1 AA)
- Touch-optimized out of the box

**How We Use It:**

#### SSR Configuration

m3-svelte requires special Vite SSR configuration:

```typescript
// apps/pos/vite.config.ts
export default defineConfig({
  plugins: [sveltekit()],
  ssr: {
    noExternal: ['m3-svelte'], // ✅ Required for SSR
    // ❌ Don't override resolve.conditions - let Vite use defaults
  },
});
```

**Why noExternal:**
- Vite must compile `.svelte` files during SSR
- Without it, m3-svelte imports fail on server

#### patch-package for TypeScript

m3-svelte barrel exports cause slow type checking. We use patch-package for direct imports:

```typescript
// patches/m3-svelte+5.9.0.patch
{
  "exports": {
    "./package/buttons/Button.svelte": {
      "svelte": "./package/buttons/Button.svelte"
    },
    "./package/containers/Card.svelte": {
      "svelte": "./package/containers/Card.svelte"
    }
  }
}

// Then import directly:
import Button from 'm3-svelte/package/buttons/Button.svelte';
```

**Applied automatically via postinstall:**
```json
// package.json
{
  "scripts": {
    "postinstall": "patch-package"
  }
}
```

#### Wrapper Component Pattern

```typescript
// packages/ui/src/components/POSButton.svelte
<script lang="ts">
import Button from 'm3-svelte/package/buttons/Button.svelte';

type Props = {
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'standard' | 'comfortable' | 'critical';
  onClick?: () => void;
  children: any;
};

let { variant = 'standard', size = 'comfortable', onClick, children }: Props = $props();

// Map POS sizes to CSS (WCAG 2.1 AA compliance)
const heightMap = {
  standard: '48px',      // Minimum
  comfortable: '56px',   // Recommended
  critical: '80px',      // High-stakes actions
};
</script>

<Button
  variant={variant === 'primary' ? 'filled' : variant}
  style="min-height: {heightMap[size]};"
  onclick={onClick}
>
  {children}
</Button>
```

---

### Tailwind CSS 4 - Utility-First Styling

**Why Tailwind 4:**
- CSS-first configuration (no JS config file)
- Faster build times (native CSS parser)
- Better IDE support (CSS variables)

**How We Use It:**

#### CSS-First Configuration

```css
/* apps/pos/src/app.css */
@import "tailwindcss";

@theme {
  /* Color System - HOST Brand */
  --color-primary: #2563eb;
  --color-primary-dark: #1e40af;
  --color-secondary: #7c3aed;
  --color-error: #ef4444;
  --color-success: #10b981;

  /* Touch Target Sizes (WCAG 2.1 AA) */
  --spacing-touch-min: 48px;
  --spacing-touch-comfortable: 56px;
  --spacing-touch-critical: 80px;

  /* Typography Scale (Material Design 3) */
  --font-size-display-large: 3.563rem;
  --font-size-headline-medium: 1.75rem;
  --font-size-body-large: 1rem;
  --font-size-label-medium: 0.75rem;
}
```

#### Design Token Integration

```svelte
<button class="
  h-[--spacing-touch-comfortable]
  bg-[--color-primary]
  text-[--font-size-body-large]
  rounded-lg
  shadow-md
">
  Submit Order
</button>
```

---

## Backend & API Stack

### tRPC v11 - Type-Safe APIs

**Why tRPC:**
- End-to-end type safety (database → API → UI)
- No code generation (types inferred automatically)
- RPC-style APIs (simpler than REST/GraphQL)
- SvelteKit integration

**How We Use It:**

#### Router Structure

```typescript
// packages/api/src/routers/order.router.ts
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { OrderService } from '@host/shared';

export const orderRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ venueId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.orderService.list(input.venueId);
    }),

  create: protectedProcedure
    .input(z.object({
      venueId: z.string(),
      tableId: z.string(),
      orderType: z.enum(['dine_in', 'takeout', 'delivery']),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.orderService.create(input);
    }),
});
```

#### SvelteKit Integration

```typescript
// apps/pos/src/lib/trpc.ts
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@host/api';

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
    }),
  ],
});
```

#### End-to-End Type Safety

```typescript
// apps/pos/src/routes/orders/+page.server.ts
export const load: PageServerLoad = async () => {
  // ✅ TypeScript knows the return type automatically
  const orders = await trpc.order.list.query({ venueId: '123' });
  //    ^? Order[] - fully typed!

  return { orders };
};
```

**No Manual Types Needed:**
- tRPC infers return types from your router
- Changes in backend automatically update frontend types
- Catch breaking changes at compile time

---

### Zod - Runtime Validation

**Why Zod:**
- Type-safe schema validation
- Integrates perfectly with tRPC
- Runtime + compile-time safety
- Great error messages

**How We Use It:**

#### Schema Definition

```typescript
// packages/shared/src/schemas/order.schema.ts
import { z } from 'zod';

export const createOrderSchema = z.object({
  venueId: z.string().cuid2(),
  tableId: z.string().cuid2(),
  orderType: z.enum(['dine_in', 'takeout', 'delivery']),
  guestCount: z.number().int().min(1).max(20),
  notes: z.string().max(500).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
```

#### Integration with tRPC

```typescript
// packages/api/src/routers/order.router.ts
import { createOrderSchema } from '@host/shared';

export const orderRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createOrderSchema) // ✅ Zod schema as input validation
    .mutation(async ({ input }) => {
      // input is fully typed and validated
      return orderService.create(input);
    }),
});
```

#### Service Layer Validation

```typescript
// packages/shared/src/services/order.service.ts
export class OrderService {
  async create(data: CreateOrderInput): Promise<Order> {
    // Double validation (defense in depth)
    const validated = createOrderSchema.parse(data);

    // Business logic
    const order = await this.db.insert(orders).values(validated);

    return order;
  }
}
```

---

## Database Stack

### Turso (LibSQL) - Edge Database

**Why Turso:**
- SQLite-compatible (proven reliability)
- Global edge replication (<50ms reads worldwide)
- Embedded replicas (zero-latency local-first)
- 60-second background sync

**How We Use It:**

#### Local-First Architecture

```typescript
// packages/database/src/client.ts
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

const client = createClient({
  url: process.env.DATABASE_URL!,              // file:./dev.db (local) or libsql://... (cloud)
  authToken: process.env.DATABASE_AUTH_TOKEN, // For cloud sync
  syncUrl: process.env.TURSO_SYNC_URL,        // Cloud primary URL
  syncInterval: 60,                            // Sync every 60 seconds
});

export const db = drizzle(client);
```

**How It Works:**
1. Writes go to local embedded replica (0ms latency)
2. Background sync pushes to cloud primary every 60s
3. Reads always hit local replica (instant)
4. Other terminals sync down changes

**Development vs Production:**
```bash
# Development (local SQLite)
DATABASE_URL=file:./dev.db

# Production (Turso cloud with embedded replica)
DATABASE_URL=libsql://host-pos-prod.turso.io
DATABASE_AUTH_TOKEN=eyJhbGc...
TURSO_SYNC_URL=libsql://host-pos-primary.turso.io
```

---

### Drizzle ORM - Type-Safe Database

**Why Drizzle:**
- Best-in-class TypeScript support
- SQL-like query builder (familiar)
- Zero-cost abstractions
- Turso integration

**How We Use It:**

#### Schema Definition

```typescript
// packages/database/src/schema/orders.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  venueId: text('venue_id').notNull().references(() => venues.id, { onDelete: 'cascade' }),
  tableId: text('table_id').references(() => tables.id),
  orderType: text('order_type', { enum: ['dine_in', 'takeout', 'delivery'] }).notNull(),
  status: text('status', { enum: ['open', 'preparing', 'ready', 'completed', 'cancelled'] }).default('open'),
  guestCount: integer('guest_count').notNull().default(1),
  subtotal: real('subtotal').notNull().default(0),
  tax: real('tax').notNull().default(0),
  total: real('total').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
```

#### Type-Safe Queries

```typescript
// packages/database/src/services/order.service.ts
import { db } from '../client';
import { orders, orderItems } from '../schema';
import { eq, and } from 'drizzle-orm';

export class OrderService {
  async getOrderWithItems(orderId: string) {
    // ✅ Fully typed - TypeScript knows exact return type
    const result = await db
      .select()
      .from(orders)
      .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
      .where(eq(orders.id, orderId));

    return result; // Type: { orders: Order; orderItems: OrderItem | null }[]
  }
}
```

#### Migration Workflow

```bash
# 1. Modify schema in src/schema/*.ts

# 2. Generate migration
cd packages/database
npm run db:generate

# 3. Review migration SQL in drizzle/*.sql

# 4. Apply migration
npm run db:migrate

# 5. Verify in Drizzle Studio
npm run db:studio
```

**Configuration:**

```typescript
// packages/database/drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema/!(*.test).ts',  // Exclude test files
  out: './drizzle',                     // Migration output
  dialect: 'turso',                     // ✅ Use 'turso' not 'sqlite'
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
  verbose: true,
  strict: true,
});
```

---

## Testing Infrastructure

### Test-Driven Development Approach

**Philosophy:** Write tests FIRST, then implementation (Red-Green-Refactor)

**Current Coverage:**
- 701 tests passing (99% pass rate)
- 99.93% statement coverage (business logic)
- 100% function coverage (database layer)

**Test Distribution:**
```
Total: 701 tests
├── Database Layer: 241 tests (34%)
│   ├── Schema tests: 113
│   └── Service tests: 128
├── Business Logic: 126 tests (18%)
├── API Layer: 95 tests (14%)
├── Design System: 106 tests (15%)
├── UI Components: 59 tests (8%)
├── POS Application: 155 tests (22%)
└── E2E Tests: 6 tests (1%)
```

---

### Vitest - Unit & Integration Tests

**Why Vitest:**
- Vite-powered (instant startup)
- Jest-compatible API (easy migration)
- Native browser testing with Playwright
- 10x faster than Jest

**How We Use It:**

#### Workspace Configuration (Client vs Server)

```typescript
// apps/pos/vitest.workspace.ts
export default defineWorkspace([
  {
    // Client tests - Svelte components
    test: {
      name: 'client',
      include: ['src/**/*.svelte.test.ts'],
      browser: {
        enabled: true,
        name: 'chromium',
        provider: 'playwright',
      },
      setupFiles: ['vitest-browser-svelte'],
    },
  },
  {
    // Server tests - hooks, actions, load functions
    test: {
      name: 'server',
      include: ['src/**/*.test.ts'],
      environment: 'node',
    },
  },
]);
```

**Why Separate Workspaces:**
- Svelte components need browser APIs
- Server code needs Node.js environment
- Can't mix in single config

#### Component Testing

```typescript
// packages/ui/src/components/POSButton.test.ts
import { render, screen } from '@testing-library/svelte';
import { expect, it, describe } from 'vitest';
import POSButton from './POSButton.svelte';

describe('POSButton', () => {
  it('should render with correct touch target size', async () => {
    const { getByRole } = render(POSButton, {
      props: {
        size: 'comfortable',
        children: 'Click Me',
      },
    });

    const button = getByRole('button');
    const styles = window.getComputedStyle(button);

    expect(styles.minHeight).toBe('56px'); // WCAG 2.1 AA compliant
  });
});
```

#### Service Testing (TDD Example)

```typescript
// packages/database/src/services/order.service.test.ts
describe('OrderService', () => {
  it('should calculate order total with tax', async () => {
    // ARRANGE
    const service = new OrderService(db);
    const order = await service.create({
      venueId: 'v1',
      tableId: 't1',
      orderType: 'dine_in',
    });

    await service.addItem(order.id, {
      menuItemId: 'item1',
      quantity: 2,
      price: 10.00,
    });

    // ACT
    const result = await service.calculateTotal(order.id);

    // ASSERT
    expect(result.subtotal).toBe(20.00);
    expect(result.tax).toBe(1.65);      // 8.25% tax
    expect(result.total).toBe(21.65);
  });
});
```

---

### Playwright - E2E Tests

**Why Playwright:**
- Multi-browser testing (Chromium, Firefox, Safari)
- Fast parallel execution
- Built-in trace viewer
- Network interception

**How We Use It:**

#### Authentication with storageState

```typescript
// e2e/auth.setup.ts
import { test as setup } from '@playwright/test';
import path from 'node:path';

setup('authenticate', async ({ page }) => {
  // Login once
  await page.goto('/auth/login');
  await page.fill('[name="username"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Wait for auth to complete
  await page.waitForURL('/orders');

  // Save authentication state
  await page.context().storageState({
    path: path.join(__dirname, '.auth/user.json')
  });
});
```

**Then reuse in all tests:**

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/
    },
    {
      name: 'chromium',
      use: {
        storageState: '.auth/user.json' // ✅ Pre-authenticated
      },
      dependencies: ['setup'], // Run setup first
    },
  ],
});
```

#### E2E Test Example

```typescript
// e2e/us-003-create-order.spec.ts
import { test, expect } from '@playwright/test';

test('should create new order from orders page', async ({ page }) => {
  await page.goto('/orders');

  // Click New Order button
  await page.click('button:has-text("+ New Order")');

  // Fill form
  await page.selectOption('[name="tableId"]', 'table-5');
  await page.fill('[name="guestCount"]', '4');

  // Submit
  await page.click('button[type="submit"]');

  // Verify success
  await expect(page.locator('[data-testid="order-list"]')).toContainText('Table 5');
  await expect(page.locator('[data-testid="order-list"]')).toContainText('4 guests');
});
```

#### Environment Configuration

```bash
# .env.e2e
DATABASE_URL=file:./test.db
CI=true
NODE_ENV=test
POS_URL=http://127.0.0.1:5173
```

```typescript
// playwright.config.ts
import dotenv from 'dotenv';

dotenv.config({ path: '.env.e2e' });

export default defineConfig({
  use: {
    baseURL: process.env.POS_URL,
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:5173', // IPv4 for Windows compatibility
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Build & Development Tools

### Turborepo - Monorepo Orchestration

**Why Turborepo:**
- Incremental builds (80%+ cache hit rate)
- Parallel task execution (3-4x faster)
- Remote caching (share across team)
- Task dependencies

**How We Use It:**

#### Monorepo Structure

```
host/
├── apps/
│   ├── pos/          # Main POS app
│   ├── kds/          # Kitchen Display (future)
│   └── admin/        # Admin dashboard (future)
└── packages/
    ├── database/     # Drizzle schemas + services
    ├── shared/       # Business logic + validation
    ├── api/          # tRPC routers
    ├── ui/           # Shared Svelte components
    └── design-tokens/# Material Design 3 tokens
```

#### Task Pipeline

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],           // Build dependencies first
      "outputs": [".svelte-kit/**"]
    },
    "test": {
      "dependsOn": ["build"],            // Tests need built packages
      "outputs": ["coverage/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"]            // Need types from built packages
    }
  }
}
```

**How It Works:**
1. Run `npm run build`
2. Turborepo analyzes dependency graph
3. Builds `packages/*` in parallel
4. Then builds `apps/*` that depend on them
5. Caches all outputs
6. Next run: hits cache, skips build (instant)

#### Commands

```bash
# Run task in all packages
npm run build

# Run task in specific package
turbo run dev --filter=@host/pos

# Run tests in parallel
npm test

# Clear cache
npm run clean:turbo
```

---

### Vite - Build Tool

**Why Vite:**
- Instant HMR (<100ms)
- Native ESM (no bundling in dev)
- Optimized production builds
- Plugin ecosystem

**How We Use It:**

#### Development Server

```typescript
// apps/pos/vite.config.ts
export default defineConfig({
  plugins: [sveltekit()],
  server: {
    host: true,  // Listen on IPv4 + IPv6
    port: 5173,
    hmr: {
      overlay: true, // Show errors in browser
    },
  },
  ssr: {
    noExternal: ['m3-svelte'], // Compile .svelte files during SSR
  },
});
```

#### Build Optimization

Vite automatically:
- Tree-shakes unused code
- Minifies JavaScript/CSS
- Code splits by route
- Generates source maps
- Optimizes images

**Production Build:**
```bash
npm run build
# Output: apps/pos/.svelte-kit/output/
# - Server: server/ (Node.js app)
# - Client: client/ (static assets)
```

---

## Code Quality & Standards

### Hybrid Linting Strategy

**Why Both Biome and ESLint:**
- Biome: 10-20x faster for TS/JS/JSON
- ESLint: Svelte-specific rules (a11y, best practices)

#### Biome Configuration

```json
// biome.json
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "warn",        // Catch type safety issues
        "noDoubleEquals": "error"        // Require strict equality
      }
    }
  },
  "formatter": {
    "indentStyle": "tab",
    "lineWidth": 100,
    "lineEnding": "lf"
  },
  "files": {
    "include": ["**/*.js", "**/*.ts", "**/*.json"]
  }
}
```

#### ESLint for Svelte

```javascript
// eslint.config.js
import svelte from 'eslint-plugin-svelte';

export default [
  {
    files: ['**/*.svelte'],
    plugins: { svelte },
    rules: {
      'svelte/valid-compile': 'error',
      'svelte/no-unused-svelte-ignore': 'error',
      'svelte/no-at-html-tags': 'warn',
    },
  },
];
```

#### Pre-Commit Hooks

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts,tsx,json}": ["biome check --write"],
    "*.svelte": ["eslint --fix"]
  }
}
```

**How It Works:**
1. Stage files with `git add`
2. Husky triggers lint-staged
3. Biome lints/formats TS/JS/JSON
4. ESLint lints/fixes Svelte files
5. Commit proceeds if no errors

---

### TypeScript Configuration

```json
// apps/pos/tsconfig.json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "strict": true,                    // ✅ Strict mode
    "skipLibCheck": true,              // ⚠️ Skip m3-svelte types (too complex)
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**Why skipLibCheck:**
- m3-svelte uses complex polymorphic union types
- Causes "Type instantiation is excessively deep" errors
- Doesn't affect YOUR code (only library types)
- Alternative: wrapper components hide complexity

---

## Authentication

### Keycloak + PKCE Flow

**Architecture:**
```
Browser (SvelteKit)
    ↓ 1. Redirect to Keycloak
Keycloak (26.3)
    ↓ 2. User logs in
Browser
    ↓ 3. Callback with code
SvelteKit Server
    ↓ 4. Exchange code for token (PKCE)
    ↓ 5. Validate JWT
    ↓ 6. Set session cookie
POS App (authenticated)
```

#### PKCE Flow Implementation

```typescript
// packages/shared/src/services/auth.service.ts
export class AuthService {
  // Generate PKCE code verifier + challenge
  generatePKCE() {
    const verifier = base64url(randomBytes(32));
    const challenge = base64url(sha256(verifier));

    return { verifier, challenge, method: 'S256' };
  }

  // Build login URL
  getLoginUrl(redirectUri: string) {
    const { verifier, challenge } = this.generatePKCE();

    // Store verifier in session
    sessionStorage.setItem('pkce_verifier', verifier);

    const params = new URLSearchParams({
      client_id: 'host-pos-web',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });

    return `${keycloakUrl}/auth?${params}`;
  }
}
```

#### Server-Side Session

```typescript
// apps/pos/src/hooks.server.ts
export const handleAuth: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('session');

  if (token) {
    try {
      // Validate JWT
      const payload = await jwtVerify(token, publicKey);

      // Add user to locals
      event.locals.user = {
        id: payload.sub,
        email: payload.email,
        roles: payload.realm_access.roles,
      };
    } catch {
      // Invalid token - clear cookie
      event.cookies.delete('session');
    }
  }

  return resolve(event);
};
```

#### Protected Routes

```typescript
export const handleAuthorization: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url;

  // Check if route requires auth
  const protectedRoute = protectedRoutes.find(r =>
    pathname.startsWith(r.path)
  );

  if (protectedRoute && !event.locals.user) {
    // Redirect to login
    return new Response(null, {
      status: 302,
      headers: { location: '/auth/login' },
    });
  }

  // Check roles
  if (protectedRoute && event.locals.user) {
    const hasRole = protectedRoute.roles.some(role =>
      event.locals.user.roles.includes(role)
    );

    if (!hasRole) {
      return new Response(null, {
        status: 302,
        headers: { location: '/unauthorized' },
      });
    }
  }

  return resolve(event);
};
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install chromium
      - run: npm test
      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
```

**Jobs run in parallel** for speed:
- Lint: ~30s
- Typecheck: ~45s
- Test: ~2min
- Build: ~1min

**Total CI time:** ~2 minutes (parallel execution)

---

## Development Workflow

### Day-to-Day Commands

```bash
# Start development
npm run dev:pos              # Start POS app

# Make changes
# ... edit files ...

# Run tests (TDD)
npm test                      # All tests
npm test -- order.test.ts     # Single file

# Quality checks
npm run typecheck             # TypeScript
npm run lint                  # Biome + ESLint
npm run check:all             # All quality gates

# Database operations
npm run db:studio             # Visual editor
npm run db:migrate            # Apply migrations
npm run db:seed               # Seed test data

# Build for production
npm run build
```

### TDD Workflow

**Red-Green-Refactor:**

```bash
# 1. RED - Write failing test
npm test -- order.service.test.ts
# ❌ FAIL: should calculate order total

# 2. GREEN - Implement minimal code
# ... write calculateTotal() ...
npm test -- order.service.test.ts
# ✅ PASS: should calculate order total

# 3. REFACTOR - Improve code quality
# ... extract functions, improve naming ...
npm test -- order.service.test.ts
# ✅ PASS: should calculate order total (still passing)

# 4. Commit
git add .
git commit -m "feat: Add order total calculation"
```

---

## Real-World Integration Examples

### Example 1: Creating an Order (Full Stack)

**Flow:** UI → Validation → API → Service → Database

#### 1. Frontend Form (Svelte)

```svelte
<!-- apps/pos/src/routes/orders/+page.svelte -->
<script lang="ts">
let { data } = $props();

let tableId = $state('');
let guestCount = $state(1);
</script>

<form method="POST" action="?/createOrder">
  <select name="tableId" bind:value={tableId}>
    {#each data.tables as table}
      <option value={table.id}>{table.name}</option>
    {/each}
  </select>

  <input type="number" name="guestCount" bind:value={guestCount} />

  <button type="submit">Create Order</button>
</form>
```

#### 2. Server Action (SvelteKit)

```typescript
// apps/pos/src/routes/orders/+page.server.ts
export const actions: Actions = {
  createOrder: async ({ request, locals }) => {
    const formData = await request.formData();

    // Call tRPC API
    const order = await trpc.order.create.mutate({
      venueId: locals.user.venueId,
      tableId: formData.get('tableId') as string,
      guestCount: Number(formData.get('guestCount')),
      orderType: 'dine_in',
    });

    return { success: true, order };
  },
};
```

#### 3. tRPC Router (API)

```typescript
// packages/api/src/routers/order.router.ts
export const orderRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createOrderSchema) // ✅ Zod validation
    .mutation(async ({ input, ctx }) => {
      return ctx.orderService.create(input);
    }),
});
```

#### 4. Service Layer (Business Logic)

```typescript
// packages/shared/src/services/order.service.ts
export class OrderService {
  async create(data: CreateOrderInput): Promise<Order> {
    // Validate again (defense in depth)
    const validated = createOrderSchema.parse(data);

    // Business logic
    const order = await this.db.insert(orders).values({
      ...validated,
      status: 'open',
      subtotal: 0,
      tax: 0,
      total: 0,
      createdAt: new Date(),
    }).returning();

    return order[0];
  }
}
```

#### 5. Database (Drizzle)

```typescript
// packages/database/src/schema/orders.ts
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  venueId: text('venue_id').notNull(),
  tableId: text('table_id').notNull(),
  orderType: text('order_type', {
    enum: ['dine_in', 'takeout', 'delivery']
  }).notNull(),
  status: text('status', {
    enum: ['open', 'preparing', 'ready', 'completed']
  }).default('open'),
  guestCount: integer('guest_count').notNull(),
  subtotal: real('subtotal').notNull().default(0),
  tax: real('tax').notNull().default(0),
  total: real('total').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }),
});
```

**Type Safety Throughout:**
- SvelteKit knows form action return type
- tRPC infers mutation return type
- Zod validates input shape
- Drizzle provides typed query builder
- **No manual type definitions needed!**

---

### Example 2: Testing Pattern (TDD)

```typescript
// Step 1: Write test FIRST (RED)
describe('OrderService', () => {
  it('should add item to order', async () => {
    const service = new OrderService(db);

    const order = await service.create({ /* ... */ });

    // This will fail - method doesn't exist yet
    await service.addItem(order.id, {
      menuItemId: 'item-1',
      quantity: 2,
      price: 10.00,
    });

    const updated = await service.get(order.id);
    expect(updated.items).toHaveLength(1);
    expect(updated.subtotal).toBe(20.00);
  });
});

// Step 2: Run test
// npm test -- order.service.test.ts
// ❌ FAIL: service.addItem is not a function

// Step 3: Implement minimal code (GREEN)
export class OrderService {
  async addItem(orderId: string, data: AddItemInput) {
    await this.db.insert(orderItems).values({
      orderId,
      menuItemId: data.menuItemId,
      quantity: data.quantity,
      price: data.price,
    });

    // Recalculate totals
    await this.calculateTotal(orderId);
  }
}

// Step 4: Run test again
// npm test -- order.service.test.ts
// ✅ PASS: should add item to order

// Step 5: Refactor if needed (code quality)
```

---

## Common Patterns & Anti-Patterns

### ✅ Good Patterns

**Repository + Service Layer:**
```typescript
// ✅ Separate data access from business logic
class OrderRepository {
  async findById(id: string) { /* ... */ }
}

class OrderService {
  constructor(private repo: OrderRepository) {}

  async calculateTotal(orderId: string) {
    const order = await this.repo.findById(orderId);
    // Business logic here
  }
}
```

**Props for SvelteKit Pages:**
```svelte
<script lang="ts">
// ✅ Receive data as props
let { data } = $props();
</script>

<h1>{data.title}</h1>
```

**Typed Mock Factories:**
```typescript
// ✅ Type-safe test mocks
function createMockOrder(overrides?: Partial<Order>): Order {
  return {
    id: createId(),
    venueId: 'v1',
    status: 'open',
    ...overrides,
  };
}
```

---

### ❌ Anti-Patterns to Avoid

**Using $app/state for Page Data:**
```typescript
// ❌ Don't do this
import { page } from '$app/state';
const data = page.data; // Hard to test!

// ✅ Do this instead
let { data } = $props(); // Easy to test
```

**Type Assertions:**
```typescript
// ❌ Avoid
const user = data as User;

// ✅ Validate instead
const user = userSchema.parse(data);
```

**Mixing Test Environments:**
```typescript
// ❌ Don't mix browser + node in same config
{
  test: {
    environment: 'node',
    browser: { enabled: true } // Conflicting!
  }
}

// ✅ Use workspace
export default defineWorkspace([
  { test: { browser: { enabled: true } } },
  { test: { environment: 'node' } },
]);
```

---

## Troubleshooting Guide

### m3-svelte SSR Errors

**Problem:** `ReferenceError: window is not defined`

**Solution:**
```typescript
// vite.config.ts
export default defineConfig({
  ssr: {
    noExternal: ['m3-svelte'], // ✅ Add this
    // DON'T override resolve.conditions
  },
});
```

---

### Test Flakiness

**Problem:** Tests randomly fail in CI

**Solution:**
1. Increase timeouts for animations:
   ```typescript
   await button.click({ timeout: 5000 });
   ```

2. Use `Promise.all` for concurrent waits:
   ```typescript
   await Promise.all([
     page.waitForSelector('[role="dialog"]'),
     button.click(),
   ]);
   ```

3. Skip known flaky tests:
   ```typescript
   it.skip('flaky test', async () => { /* ... */ });
   ```

---

### TypeScript Errors

**Problem:** "Type instantiation is excessively deep"

**Solution:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": true // ⚠️ Last resort for library types
  }
}
```

Or create wrapper components to hide complex types.

---

### Database Connection Errors

**Problem:** `DATABASE_URL environment variable is required`

**Solution:**
```bash
# Create .env.local
echo "DATABASE_URL=file:./dev.db" > packages/database/.env.local
```

---

## Conclusion

This guide demonstrates how all pieces of the HOST tech stack work together to create a production-ready POS system with:

- **End-to-end type safety** (database → API → UI)
- **99.93% test coverage** with TDD methodology
- **Sub-400ms response times** with local-first architecture
- **Professional development workflow** with automated quality checks

For more information, see:
- [TECH_STACK_2025.md](./TECH_STACK_2025.md) - Version reference
- [architecture.md](./architecture.md) - System architecture
- [test-strategy.md](./test-strategy.md) - Testing approach
- [CLAUDE.md](../CLAUDE.md) - Development guidelines

---

*This guide is maintained as the project evolves. Last updated: 2025-10-07*
