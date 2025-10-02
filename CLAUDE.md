# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HOST is a modern POS (Point-of-Sale) system for bars and restaurants built with Svelte 5, SvelteKit 2, and Turso (LibSQL). The project uses a turborepo monorepo structure with Test-Driven Development (TDD) as a core principle.

## Code Quality Rules (MUST vs SHOULD)

### MUST Rules (Enforced - Non-Negotiable)

These rules are **enforced by CI/tooling** and **blocking for commits**:

1. **TDD-001 MUST**: Follow Test-Driven Development - write tests FIRST, then implementation
2. **TDD-002 MUST**: Achieve minimum 80% test coverage (85%+ for critical paths)
3. **TEST-001 MUST**: All tests must pass before proposing commits (`npm test`)
4. **TYPE-001 MUST**: TypeScript strict mode with zero errors (`npm run typecheck`)
5. **LINT-001 MUST**: Pass all linting rules (`npm run lint`)
6. **BLOCK-001 MUST**: STOP and ask user when encountering blockers (see "When You Encounter Blockers")
7. **COMMIT-001 MUST**: Never commit without explicit user approval (see "Git Commit Guidelines")
8. **REAL-TEST-001 MUST**: Tests must test actual behavior, not hardcoded constants
9. **NO-WORKAROUND-001 MUST**: Never exclude files from testing/linting to bypass errors
10. **NO-ANY-001 MUST**: No `any` types, `@ts-ignore`, or `skipLibCheck` without user approval

### SHOULD Rules (Strong Recommendations)

These are **best practices** that improve code quality:

1. **CLARIFY-001 SHOULD**: Ask clarifying questions before starting complex work
2. **PLAN-001 SHOULD**: Draft and confirm approach for non-trivial tasks (use plan mode)
3. **SIMPLE-001 SHOULD**: Prefer simple, composable functions over complex ones
4. **COMMENT-001 SHOULD**: Minimize comments - code should be self-documenting
5. **TYPE-002 SHOULD**: Prefer `type` over `interface` for consistency
6. **SINGLE-TEST-001 SHOULD**: Run single tests for performance (`npm test -- file.test.ts`)
7. **CONTEXT-001 SHOULD**: Use `/compact` at natural checkpoints to manage context
8. **SCOPE-001 SHOULD**: Limit scope of requests - ask focused questions

## Custom Quality Commands

Use these shortcuts to enforce quality gates efficiently:

### QCODE - Full Quality Gate
```bash
# Run complete quality validation before proposing commit
npm test && npm run typecheck && npm run lint
```
**Use when**: Ready to propose changes for commit
**Ensures**: Tests pass, types valid, code formatted

### QCHECK - Self-Review
**Before proposing major changes, verify:**
- [ ] All tests test real behavior (no fake tests)
- [ ] No files excluded to bypass errors
- [ ] No dependencies modified as workarounds
- [ ] No configs changed to suppress errors
- [ ] If blocker encountered, user was asked first
- [ ] Function complexity is reasonable
- [ ] Code is maintainable and readable

### QPLAN - Codebase Consistency Check
**Before starting implementation:**
- [ ] Reviewed similar existing patterns in codebase
- [ ] Confirmed approach matches project architecture
- [ ] Identified all files that need changes
- [ ] Estimated complexity and potential blockers

## Communication Protocol

### Before Starting Work (MUST)

**For non-trivial tasks, you MUST:**
1. Ask clarifying questions about requirements
2. Propose 2-3 implementation approaches with tradeoffs
3. Wait for user approval before coding
4. Use plan mode for complex multi-step tasks

**Trivial tasks** (simple edits, obvious fixes) can proceed directly.

### When Reporting Progress (SHOULD)

**Be concise but complete:**
- What was done
- What tests were added/modified
- Any blockers or decisions made
- Next steps (if applicable)

**Don't over-explain** unless user asks for details.

### After Making Mistakes (MUST)

**If you make an error:**
1. Acknowledge it clearly
2. Explain what went wrong
3. Propose how to prevent it next time
4. Ask if CLAUDE.md should be updated with the lesson

## Performance & Efficiency Guidelines

### Testing Performance

- **MUST run single test files** when possible: `npm test -- order.service.test.ts`
  - Running full test suite (255 tests) takes ~20 seconds
  - Single file tests complete in 1-3 seconds
  - Only run full suite when verifying no regressions

### Output Management

- **Limit tool output size** to avoid context bloat:
  - Use `head -20` when showing file previews
  - Use `grep` with specific patterns instead of reading entire files
  - Request specific line ranges when reading large files

### Query Specificity

- **Be specific in searches and queries**:
  - ✅ Good: "Check menu.service.ts for duplicate validation logic"
  - ❌ Bad: "check all files for issues"
  - Specific queries are faster and use less context

### When Context Gets Large

**Signs you should suggest the user run `/compact` or `/clear`:**
- Conversation has gone through multiple unrelated topics
- You're repeatedly referencing old context that's no longer relevant
- Response times are slowing down
- Context window warnings appear

**Suggest to user**: "The conversation context is getting large. Consider using `/compact` to preserve important context while reducing tokens, or `/clear` if we're switching to an unrelated task."

**Never**: Pretend you can run these commands yourself

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
# Unit tests (Vitest + Playwright Browser Mode)
npm run test:unit         # Vitest with Chromium browser testing
npm run test:watch        # Watch mode for TDD

# All tests
npm test                  # Run all tests (214 passing)
npm run test:coverage     # Generate coverage report
npm run test:integration  # Integration tests only
npm run test:e2e          # Playwright E2E tests
npm run test:ci           # CI-optimized test run

# Run tests for a specific file
npm test -- order.service.test.ts

# Browser Testing
# Tests run in real Chromium browser via Playwright
# Component tests use vitest-browser-svelte for Svelte 5 support
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
# Hybrid Linting (Biome + ESLint)
npm run lint             # Run both Biome and ESLint
npm run lint:biome       # Biome for TS/JS/JSON (fast)
npm run lint:eslint      # ESLint for Svelte files (Svelte-specific rules)
npm run lint:fix         # Auto-fix issues with both linters

# Type Checking
npm run typecheck        # TypeScript type checking (all packages)
npm run format           # Format code with Biome

# All Checks
npm run check:all        # Run lint + typecheck + unit tests
```

## CRITICAL: When You Encounter Blockers

**⚠️ STOP IMMEDIATELY if you encounter ANY of the following situations:**

### Situations Requiring User Approval

1. **Dependency Version Conflicts**
   - Package version mismatches between package.json and installed versions
   - Peer dependency warnings or errors
   - Module export errors (e.g., "does not provide an export named...")

2. **Test Failures You Can't Fix Immediately**
   - Tests failing after implementation
   - Browser/environment incompatibility issues
   - Missing test utilities or setup

3. **TypeScript Errors**
   - Type errors you can't resolve with proper typing
   - Complex union type issues
   - Module resolution problems

4. **Build Errors**
   - Vite/build configuration issues
   - Plugin compatibility problems
   - Import/export resolution failures

5. **Missing Library Features**
   - Required functionality not available in current library version
   - API changes between library versions
   - Incompatible library interfaces

### Required Process When Blocked

**DO NOT implement workarounds. Instead:**

1. **STOP working immediately** - Do not proceed with implementation
2. **Explain the blocker clearly:**
   - What is the exact error message?
   - What action triggered it?
   - What have you already tried?
3. **Propose 2-3 solution options** with honest tradeoffs:
   - Option A: [solution] - Pros: [...] Cons: [...]
   - Option B: [solution] - Pros: [...] Cons: [...]
   - Option C: [solution] - Pros: [...] Cons: [...]
4. **Wait for user approval** before implementing ANY solution
5. **Never commit workarounds** without explicit user permission

### Red Flags: You're About to Create a Workaround

**If you're doing ANY of these, STOP and ask the user:**

- ❌ Adding `exclude: ['**/*.svelte']` or similar exclusions to test configs
- ❌ Changing test environment from `browser` to `node` to avoid rendering issues
- ❌ Creating "type-only" tests that don't test actual runtime behavior
- ❌ Downgrading or removing dependencies to make errors disappear
- ❌ Adding `skipLibCheck`, `@ts-ignore`, or `any` types to suppress errors
- ❌ Modifying configs to bypass errors without understanding root cause
- ❌ Adding comments like "tested elsewhere", "not needed", or "will test later"
- ❌ Using incompatible library versions and "making it work"
- ❌ Excluding files from linting/type-checking to bypass issues

### Example: Proper Blocker Handling

**WRONG (Workaround):**
```
❌ Hit version conflict → Exclude Svelte files from testing → Create fake tests → Commit
```

**RIGHT (Ask First):**
```
✅ Hit version conflict → STOP → Explain: "@sveltejs/vite-plugin-svelte v5.1.1 requires Vite 6, but we have Vite 5.4.20"
✅ Propose options:
   A. Downgrade plugin to v4.0.4 (matches POS app, proven working)
   B. Upgrade Vite to v6 (breaking changes, need to test all apps)
   C. Keep v5 and configure compatibility mode (may have issues)
✅ Wait for approval
✅ Implement approved solution
✅ Only commit when explicitly told to do so
```

## Git Commit Guidelines

### Golden Rule: Never Commit Without Permission

**You must NEVER commit code unless explicitly told to do so by the user.**

Phrases that mean you should commit:
- "commit this"
- "commit these changes"
- "create a commit"
- "git commit"

**Do NOT commit when you:**
- Finish implementing a feature (wait for user review)
- Fix all tests (user may want to review first)
- Complete a task from the todo list (ask if ready to commit)

### Pre-Commit Quality Checklist

**Before EVERY commit, verify ALL of these:**

- [ ] **Real Tests**: All tests actually test real behavior, not hardcoded constants
- [ ] **No Exclusions**: No files excluded from testing/linting to bypass errors
- [ ] **No Workaround Dependencies**: No dependencies added/removed to work around issues
- [ ] **No Config Hacks**: No configs modified to suppress errors without fixing root cause
- [ ] **Blocker Approval**: If you encountered a blocker, you got user approval for the solution
- [ ] **Tests Pass**: All tests pass (`npm test` shows 100% passing)
- [ ] **Type Check Passes**: No TypeScript errors (`npm run typecheck`)
- [ ] **Linting Passes**: No linting errors (`npm run lint`)
- [ ] **User Approved**: User explicitly said to commit

### Commit Message Format

Follow existing patterns in `git log`:

```bash
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `docs`: Documentation updates
- `chore`: Maintenance tasks

**Example:**
```
feat: Add POSTextField wrapper component with browser testing

Implemented POSTextField following POSCard/POSButton pattern:
- Clean Props interface hiding m3-svelte complexity
- Touch-optimized sizing (48px/56px/80px)
- 15 browser-based component tests with Playwright
- WCAG 2.1 AA compliant touch targets

Testing Infrastructure:
- Configured Vitest browser mode with Playwright
- Added vitest-browser-svelte for Svelte 5 support
- All 255 tests passing across monorepo

Files:
- packages/ui/src/components/POSTextField.svelte
- packages/ui/src/components/POSTextField.test.ts
- packages/ui/vitest.config.ts
- packages/ui/package.json
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
- Playwright Browser Mode for component testing (Chromium)
- vitest-browser-svelte for Svelte 5 component testing
- Playwright for E2E tests (implemented in weeks 9-10)
- Current: 214 tests passing (85 DB + 111 shared + 13 POS + 5 UI)
- Coverage: 100% functions, 99.93% statements (shared package)
- Minimum 80% code coverage enforced, 85%+ for critical paths

### Database Layer (`packages/database`) ✅ Complete

**Status:** 9 schemas implemented, 2 services (Menu, Order) with TDD, 85 tests passing

**Critical Pattern:** The database package uses Drizzle ORM with Turso (LibSQL). All database operations should:

1. Define schema in `src/schema/*.ts` files
2. Export from `src/schema/index.ts`
3. Use `createClient()` from `src/client.ts` for connections

**Implemented Schemas:**
- venues, users (with keycloakId), menuCategories, menuItems, menuModifierGroups
- menuModifiers, orders, orderItems, orderItemModifiers
- tables, staffShifts, payments, inventoryItems, inventoryTransactions
- inventorySuppliers, inventoryPurchaseOrders, inventoryPurchaseOrderItems

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

### Business Logic Layer (`packages/shared`) ✅ Complete

**Status:** Zod schemas for all entities, utility functions, 111 tests passing

Business logic is implemented as services following these patterns:

1. **Repository Pattern:** Database access layer
2. **Service Layer:** Business logic and validation (Menu, Order services implemented)
3. **Schemas:** Zod validation schemas for API contracts (menu, inventory, payments, orders)

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

### UI Layer (`packages/ui`) 🟡 In Progress

**Status:** 5 tests passing, 2 of 14 POS components implemented

**Implemented Components:**
- POSCard: Material Card wrapper with clean type interface
- POSButton: Material Button wrapper with clean type interface

**Purpose:** Wrapper components provide clean, simple type signatures that hide m3-svelte's complex polymorphic union types from application code. See `docs/m3-svelte-integration.md` for details.

**Pending Components:** TextField, Dialog, Select, NavigationBar, AppBar, List, DataTable, Menu, Chip, FAB, IconButton, Tabs

### Design Tokens (`packages/design-tokens`) 🟡 Structure Only

**Status:** README and package structure defined, no implementation yet

**Planned Features:**
- Material Design 3 color token generation (HCT color space)
- Tailwind CSS 4 @theme directive integration
- Dark mode CSS variable switching
- Typography scale tokens
- Elevation/shadow tokens

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

**Design System:** This project uses Material Design 3 via the native Svelte library `m3-svelte` (v5.9.0).

**Key Components Available:**
- Buttons: `<Button>`, `<IconButton>`, `<FAB>`
- Forms: `<TextField>`, `<Select>`, `<Checkbox>`, `<Switch>`
- Navigation: `<AppBar>`, `<NavigationDrawer>`, `<Tabs>`
- Containers: `<Card>`, `<Dialog>`, `<Menu>`
- Data Display: `<List>`, `<DataTable>`, `<Chips>`

**TypeScript Configuration:**
The POS app uses `skipLibCheck: true` because m3-svelte's complex polymorphic component union types exceed TypeScript's type complexity limits. These are library-level type definition errors in node_modules, NOT runtime errors. Our wrapper components (POSCard, POSButton) provide clean type signatures while hiding this complexity. All APPLICATION code is fully type-checked with strict mode. See `docs/m3-svelte-integration.md` (lines 75-122) and `apps/pos/tsconfig.json` for full explanation.

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

**Integration:** Keycloak 26.3 LTS for OpenID Connect/OAuth 2.0 (planned for Week 3)

**Key Configuration:**
- Realm: `host-pos`
- Client ID: `host-pos-web`
- PKCE enabled for browser security

**Role-Based Access Control (RBAC):**
- `admin`: Full access
- `manager`: Orders, inventory, reports, staff
- `server`: Create/update orders, process payments
- `bartender`: View/update bar orders, view bar inventory

**Current Status:** User schema has `keycloakId` field ready for integration

## CI/CD Pipeline

**GitHub Actions Workflows:**
1. **CI Workflow** (`.github/workflows/ci.yml`): Runs on push/PR to main/develop
   - Lint job: Hybrid Biome (TS/JS/JSON) + ESLint (Svelte files)
   - Typecheck job: TypeScript across all packages (with skipLibCheck for m3-svelte)
   - Test job: 214 tests with coverage reporting to Codecov
   - Build job: Turbo build of all apps and packages

2. **Additional Workflows** (planned):
   - Release workflow for versioning
   - Deployment workflow for Vercel/staging

**Concurrency:** Workflows cancel in-progress runs for the same branch to save CI resources

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
2. **80%+ test coverage required** before merging PRs (current: 99.93% shared, 100% database functions)
3. **Hybrid linting approach**:
   - Biome for TS/JS/JSON (fast, zero-config for non-Svelte)
   - ESLint for Svelte files (Svelte-specific rules, a11y checks)
   - Run both with `npm run lint` or `npm run lint:fix`
4. **TypeScript strict mode** is enabled - no `any` types
5. **Svelte 5 runes** should be used instead of old reactive statements (`$state`, `$derived`, `$effect`, `$props`)
6. **m3-svelte components** are preferred over custom implementations (with wrapper components for clean types)
7. **Drizzle ORM** for all database operations (not raw SQL)
8. **Turbo commands** run tasks across the monorepo efficiently
9. **Browser testing** uses Playwright Browser Mode with Chromium for component tests
10. **skipLibCheck: true** in apps/pos/tsconfig.json is intentional for m3-svelte library type complexity
11. **NEVER commit code without explicit user approval** - see "Git Commit Guidelines" section
12. **When blocked, STOP and ask** - never implement workarounds without user approval - see "CRITICAL: When You Encounter Blockers" section
