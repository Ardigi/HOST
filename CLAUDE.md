# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HOST is a modern POS (Point-of-Sale) system for bars and restaurants built with Svelte 5, SvelteKit 2, and Turso (LibSQL). The project uses a turborepo monorepo structure with Test-Driven Development (TDD) as a core principle.

## Essential Commands

### Development
```bash
# Start all applications
npm run dev

# Start specific applications
npm run dev:pos      # Main POS application
npm run dev:kds      # Kitchen Display System
npm run dev:admin    # Admin dashboard

# Build
npm run build        # Build all apps
npm run build:fresh  # Clean build (removes node_modules and .turbo cache)
```

### Testing (TDD Required)
```bash
# Unit tests
npm run test:unit         # Run once
npm run test:watch        # Watch mode for TDD

# All tests
npm test                  # Run all tests
npm run test:coverage     # Generate coverage report
npm run test:integration  # Integration tests only
npm run test:e2e          # Playwright E2E tests
npm run test:ci           # CI-optimized test run

# Run tests for a specific file
npm test -- order.service.test.ts
```

### Database Operations
```bash
# Drizzle ORM commands (work at monorepo level)
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database with test data
npm run db:studio        # Open Drizzle Studio GUI
npm run db:reset         # Reset database

# Package-level commands (cd packages/database first)
npm run db:generate      # Generate migrations from schema changes
npm run db:push          # Push schema changes directly (dev only)
npm run db:init          # Initialize new database
```

### Code Quality
```bash
npm run lint             # Check with Biome
npm run lint:fix         # Auto-fix issues
npm run typecheck        # TypeScript type checking
npm run format           # Format code with Biome
npm run check:all        # Run lint + typecheck + unit tests
```

## Architecture Overview

### Monorepo Structure
```
host/
├── apps/                 # SvelteKit applications
│   ├── pos/             # Main POS app
│   ├── kds/             # Kitchen Display System
│   └── admin/           # Admin dashboard
├── packages/            # Shared packages
│   ├── database/        # Drizzle ORM schema + migrations
│   ├── shared/          # Business logic, validation schemas (Zod)
│   └── ui/              # Shared Svelte components
└── test/                # Test utilities and factories
```

### Key Technology Decisions

**Frontend:**
- Svelte 5 with runes (`$state`, `$derived`, `$effect`) for reactivity
- SvelteKit 2 for SSR, routing, and form actions
- Material Design 3 via `m3-svelte` (native Svelte implementation)
- Tailwind CSS 4 with CSS-first configuration

**Backend:**
- Turso (LibSQL) with embedded replicas for local-first architecture
- Drizzle ORM 0.36.4+ for type-safe database queries
- Keycloak 26.3 for authentication (OpenID Connect)
- Zod for validation schemas

**Testing:**
- Vitest for unit/integration tests (70% unit, 25% integration, 5% E2E)
- Playwright for E2E tests (implemented in weeks 9-10)
- Minimum 80% code coverage enforced, 85%+ for critical paths

### Database Layer (`packages/database`)

**Critical Pattern:** The database package uses Drizzle ORM with Turso (LibSQL). All database operations should:

1. Define schema in `src/schema/*.ts` files
2. Export from `src/schema/index.ts`
3. Use `createClient()` from `src/client.ts` for connections

**Turso Sync Architecture:**
- Local embedded replica for zero-latency reads/writes
- Background sync to cloud primary (60-second intervals)
- Offline-first capable for POS terminals

**Database Commands:**
```typescript
// packages/database/src/client.ts
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.DATABASE_URL!,           // file:./dev.db or libsql://...
  authToken: process.env.DATABASE_AUTH_TOKEN, // For cloud sync
  syncUrl: process.env.TURSO_SYNC_URL,      // Cloud primary URL
  syncInterval: 60,                          // Background sync interval
});

export const db = drizzle(client, { schema });
```

### Business Logic Layer (`packages/shared`)

Business logic is implemented as services following these patterns:

1. **Repository Pattern:** Database access layer
2. **Service Layer:** Business logic and validation
3. **Schemas:** Zod validation schemas for API contracts

**Service Structure:**
```typescript
// packages/shared/src/services/menu.service.ts
export class MenuService {
  async createItem(data: CreateMenuItemInput) {
    // 1. Validate with Zod
    const validated = menuItemSchema.parse(data);

    // 2. Business logic
    // 3. Database operation via repository
    // 4. Return result
  }
}
```

## Test-Driven Development (TDD) Guidelines

**THIS PROJECT REQUIRES TDD.** Always write tests before implementation.

### Red-Green-Refactor Cycle

1. **RED:** Write a failing test
```typescript
it('should calculate order total with tax', () => {
  const total = calculateTotal([{ price: 10, quantity: 2 }]);
  expect(total).toBe(21.65); // 20 + 8.25% tax
});
```

2. **GREEN:** Write minimal code to pass
```typescript
function calculateTotal(items: OrderItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return subtotal * 1.0825; // Add 8.25% tax
}
```

3. **REFACTOR:** Improve code quality while keeping tests green

### Test File Locations
- Unit tests: `*.test.ts` (co-located with source)
- Integration tests: `*.integration.test.ts`
- E2E tests: `e2e/*.spec.ts`

### Coverage Requirements
- **Minimum:** 80% overall
- **Critical paths:** 85%+ (authentication, payments, orders)
- **Target:** 85% for production readiness

### Test Factories
Use test factories from `test/factories/` for generating test data:
```typescript
import { orderFactory } from '@host/test-factories';

const order = orderFactory.build({ tableId: '5' });
const orders = orderFactory.buildList(10);
```

## Material Design 3 (m3-svelte) Integration

**Design System:** This project uses Material Design 3 via the native Svelte library `m3-svelte`.

**Key Components Available:**
- Buttons: `<Button>`, `<IconButton>`, `<FAB>`
- Forms: `<TextField>`, `<Select>`, `<Checkbox>`, `<Switch>`
- Navigation: `<AppBar>`, `<NavigationDrawer>`, `<Tabs>`
- Containers: `<Card>`, `<Dialog>`, `<Menu>`
- Data Display: `<List>`, `<DataTable>`, `<Chips>`

**POS-Optimized Touch Targets:**
- Minimum: 48×48px (WCAG 2.1 AA)
- Comfortable: 56×56px (primary POS actions)
- Critical: 80×80px (transaction buttons)

**Theming:**
```typescript
// Tailwind CSS 4 integration
@theme {
  --color-primary: #2563eb;        // HOST brand blue
  --spacing-touch-min: 48px;
  --spacing-touch-comfortable: 56px;
}
```

## Svelte 5 Specific Patterns

### Runes (New Reactivity Model)
```svelte
<script lang="ts">
  // State
  let count = $state(0);

  // Derived
  let doubled = $derived(count * 2);

  // Effects
  $effect(() => {
    console.log('Count changed:', count);
  });

  // Props
  let { items = [], onSelect }: Props = $props();
</script>
```

### Form Actions (SvelteKit)
```typescript
// src/routes/orders/+page.server.ts
export const actions: Actions = {
  create: async ({ request, locals }) => {
    const data = await request.formData();
    const order = await orderService.create({
      venueId: locals.user.venueId,
      tableId: data.get('tableId') as string
    });
    return { success: true, order };
  }
};
```

### Load Functions
```typescript
// src/routes/menu/+page.ts
export const load: PageLoad = async ({ params, fetch }) => {
  const menu = await api.menu.getByVenue({ venueId: params.venueId }, { fetch });
  return { menu };
};
```

## Common Patterns & Anti-Patterns

### ✅ Good: Repository Pattern
```typescript
export class OrderRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<Order | null> {
    const [order] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);
    return order || null;
  }
}
```

### ✅ Good: Service Layer with Validation
```typescript
export class OrderService {
  async create(data: CreateOrderInput): Promise<Order> {
    // Validate
    const validated = createOrderSchema.parse(data);

    // Business logic
    const order = await this.orderRepo.create(validated);

    // Events
    await this.eventBus.emit('order.created', order);

    return order;
  }
}
```

### ❌ Avoid: Using `any` Types
```typescript
// Bad
function processPayment(data: any) { }

// Good
function processPayment(data: PaymentInput): Promise<PaymentResult> { }
```

### ❌ Avoid: Direct Database Calls in Components
```typescript
// Bad - in Svelte component
const orders = await db.select().from(orders);

// Good - use load function or server action
export const load: PageLoad = async () => {
  const orders = await orderService.list();
  return { orders };
};
```

## Performance Targets

- **API Response Time:** p95 < 200ms
- **Database Query Time:** p95 < 50ms
- **Page Load Time:** < 2 seconds
- **Time to Interactive:** < 3 seconds
- **Touch Response:** < 100ms (Doherty Threshold: < 400ms)

## Working with the Database

### Schema Changes
1. Modify schema in `packages/database/src/schema/*.ts`
2. Generate migration: `npm run db:generate` (in packages/database)
3. Review generated migration in `drizzle/`
4. Apply migration: `npm run db:migrate` (at root level)
5. Write tests for new schema

### Query Patterns
```typescript
// Select with joins
const result = await db
  .select()
  .from(orders)
  .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
  .where(eq(orders.venueId, venueId));

// Insert and return
const [order] = await db
  .insert(orders)
  .values(data)
  .returning();

// Update
await db
  .update(orders)
  .set({ status: 'closed' })
  .where(eq(orders.id, orderId));
```

## Authentication with Keycloak

**Integration:** Keycloak 26.3 LTS for OpenID Connect/OAuth 2.0

**Key Configuration:**
- Realm: `host-pos`
- Client ID: `host-pos-web`
- PKCE enabled for browser security

**Role-Based Access Control (RBAC):**
- `admin`: Full access
- `manager`: Orders, inventory, reports, staff
- `server`: Create/update orders, process payments
- `bartender`: View/update bar orders, view bar inventory

## Deployment & Environments

**Environments:**
- `development`: Local SQLite (`file:./dev.db`)
- `staging`: Turso staging instance
- `production`: Turso production with embedded replicas

**Environment Variables:**
```bash
DATABASE_URL=libsql://your-db.turso.io
DATABASE_AUTH_TOKEN=your-token
TURSO_SYNC_URL=libsql://your-db-main.turso.io
KEYCLOAK_URL=https://auth.host-pos.com
```

## Documentation References

- Architecture: `docs/architecture.md`
- Test Strategy: `docs/test-strategy.md`
- User Stories: `docs/user-stories.md`
- Development Setup: `docs/development-setup.md`
- Tech Stack Details: `docs/TECH_STACK_2025.md`
- Contributing Guidelines: `CONTRIBUTING.md`
- Progress Tracking: `docs/PROGRESS.md`

## Important Notes

1. **TDD is mandatory** - write tests first, implementation second
2. **80%+ test coverage required** before merging PRs
3. **Use Biome** for linting/formatting (not ESLint/Prettier)
4. **TypeScript strict mode** is enabled - no `any` types
5. **Svelte 5 runes** should be used instead of old reactive statements
6. **m3-svelte components** are preferred over custom implementations
7. **Drizzle ORM** for all database operations (not raw SQL)
8. **Turbo commands** run tasks across the monorepo efficiently
