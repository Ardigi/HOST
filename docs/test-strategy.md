# HOST Test Strategy & TDD Guidelines
## Test-Driven Development Framework for HOST POS System

---

## Test Philosophy

### Core Principles
1. **Test First, Code Second**: Write failing tests before implementation
2. **Red-Green-Refactor**: Follow the TDD cycle rigorously
3. **Fast Feedback**: Tests must run quickly to maintain flow
4. **Isolated Testing**: Each test should be independent
5. **Behavior-Driven**: Test behavior, not implementation details

### Test Pyramid Structure

```
         /\
        /  \    E2E Tests (5%)
       /    \   - Critical user journeys
      /______\  - Payment flows
     /        \
    /          \  Integration Tests (25%)
   /            \ - API endpoints
  /              \- Database operations
 /________________\
/                  \ Unit Tests (70%)
/                    \- Business logic
/______________________\- Components
```

---

## Testing Stack

### Core Testing Frameworks
- **Unit Testing**: Vitest
- **Component Testing**: Svelte Testing Library + Vitest
- **Integration Testing**: Vitest + Supertest
- **E2E Testing**: Playwright
- **Performance Testing**: Lighthouse CI
- **Accessibility Testing**: vitest-axe + Playwright

### Supporting Tools
- **Code Coverage**: Vitest coverage (c8)
- **Mocking**: Vitest mocks + MSW for API mocking
- **Test Data**: Faker.js + Factory functions
- **Database Testing**: Turso test instances
- **Snapshot Testing**: Vitest snapshots (sparingly)

---

## Test Coverage Requirements

### Unified Coverage Standards

**Minimum Coverage Targets** (Enforced by CI):
```javascript
// vitest.config.ts coverage thresholds
{
  branches: 80,    // Minimum 80%
  functions: 80,   // Minimum 80%
  lines: 85,       // Target 85%
  statements: 85   // Target 85%
}
```

**Component-Specific Targets**:

| Component Type | Minimum | Target | Priority | Rationale |
|---------------|---------|--------|----------|-----------|
| Authentication | 85% | 95% | Critical | Security-critical |
| Payment Processing | 85% | 95% | Critical | Financial accuracy |
| Order Management | 85% | 90% | Critical | Core business logic |
| Database Layer | 85% | 90% | High | Data integrity |
| API Endpoints | 85% | 90% | High | Contract validation |
| Business Logic | 80% | 85% | High | Complex calculations |
| UI Components | 80% | 85% | Medium | User-facing features |
| Utility Functions | 85% | 90% | Medium | Reused across app |
| Reports | 80% | 85% | Medium | Analytics accuracy |

**Coverage Philosophy**:
- **80% Minimum**: All code must meet this baseline
- **85% Target**: Goal for production readiness
- **90%+ Critical Paths**: Authentication, payments, orders
- **100% Exceptions**: Security utilities, payment calculators

---

## Test Categories

### 1. Unit Tests
**Location**: `*.test.ts`, `*.test.tsx`
**Naming Convention**: `describe('ComponentName', () => { it('should ...') })`

#### What to Test
- Pure functions
- Business logic calculations
- Component rendering
- State changes
- Event handlers
- Utility functions

#### Example Structure
```typescript
// order.service.test.ts
describe('OrderService', () => {
  describe('calculateTotal', () => {
    it('should calculate subtotal correctly', () => {
      // Arrange
      const items = [{ price: 10, quantity: 2 }];

      // Act
      const result = calculateTotal(items);

      // Assert
      expect(result).toBe(20);
    });

    it('should apply tax correctly', () => {
      // Test tax calculation
    });
  });
});
```

### 2. Integration Tests
**Location**: `*.integration.test.ts`
**Database**: Isolated test database

#### What to Test
- API endpoint responses
- Database operations
- Service layer interactions
- Authentication flows
- Third-party integrations

#### Example Structure
```typescript
// order.api.integration.test.ts
describe('POST /api/orders', () => {
  beforeEach(async () => {
    await resetDatabase();
    await seedTestData();
  });

  it('should create order with valid data', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', 'Bearer token')
      .send(validOrderData);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      status: 'open'
    });
  });
});
```

### 3. E2E Tests
**Location**: `e2e/*.spec.ts`
**Scope**: Complete user workflows
**Framework**: Playwright

#### Infrastructure Timeline
E2E testing infrastructure will be established in **Weeks 9-10** of the MVP timeline:

- **Week 9**: Playwright setup, authentication test utilities, CI integration
- **Week 10**: Critical path tests (order flow, payment processing)
- **Weeks 11-12**: Extended coverage (inventory, shift management, reports)

**Note**: E2E tests are developed **after** core features are implemented and integration tests are passing. This ensures stable functionality before testing complete user workflows.

#### Critical E2E Scenarios
1. **Order Flow** (Week 10 - Priority 1)
   - Login → Create order → Add items → Process payment → Close order

2. **Payment Processing** (Week 10 - Priority 1)
   - Card payment → Receipt generation
   - Cash payment → Change calculation
   - Split check → Multiple payments

3. **Inventory Flow** (Week 11 - Priority 2)
   - Receive stock → Track depletion → Generate alerts

4. **Shift Management** (Week 11 - Priority 2)
   - Clock in → Process orders → Clock out → View report

#### E2E Testing Patterns (Implemented 2025-10-06)

**Authentication Pattern**:
- Use Playwright's storageState pattern with setup project
- Create `e2e/auth.setup.ts` that runs once before all tests
- All test projects depend on setup and reuse saved auth state from `.auth/user.json`
- Centralize test user configuration in separate config file (`e2e/test-user.config.ts`)

**Environment Configuration**:
- Use dotenv to load `.env.e2e` file in `playwright.config.ts`
- Store test-specific variables: DATABASE_URL, POS_URL, CI flags
- Resolve relative paths to absolute in webServer env config
- Example: `file:${path.resolve(__dirname, process.env.DATABASE_URL.replace('file:', ''))}`

**Wait Patterns for Dialogs**:
- Use `Promise.all` for concurrent wait + click: `await Promise.all([page.waitForSelector('[role="dialog"]'), button.click()])`
- Increase timeouts for Svelte animations (10000ms recommended)
- Prefer semantic selectors: `role="dialog"` over text content

**Platform Compatibility**:
- Node 18+ resolves `localhost` to IPv6 by default
- Use `127.0.0.1` explicitly in Playwright config for IPv4
- Configure Vite with `host: true` for dual-stack IPv4/IPv6 support

**References**:
- [Playwright Authentication Guide](https://playwright.dev/docs/auth)
- [Playwright webServer Configuration](https://playwright.dev/docs/test-webserver)

---

## Test Data Management

### Test Data Strategy
```typescript
// test/factories/order.factory.ts
export const orderFactory = {
  build: (overrides?: Partial<Order>): Order => ({
    id: faker.datatype.uuid(),
    status: 'open',
    items: [],
    total: 0,
    ...overrides
  }),

  buildList: (count: number, overrides?: Partial<Order>): Order[] =>
    Array.from({ length: count }, () => orderFactory.build(overrides))
};
```

### Database Seeding
```typescript
// test/seeds/test-data.ts
export async function seedTestData(db: Database) {
  // Create test venue
  const venue = await db.insert(venues).values({
    name: 'Test Restaurant',
    slug: 'test-restaurant'
  });

  // Create test users
  const users = await Promise.all([
    createTestUser('admin'),
    createTestUser('server'),
    createTestUser('bartender')
  ]);

  return { venue, users };
}
```

### Typed Test Mocks Pattern

**Problem**: Using `as any` type assertions in tests disables type checking, allowing schema mismatches and runtime errors to slip through.

**Solution**: Create typed mock factory functions that return properly typed data matching your database schema and API contracts.

#### Why Typed Mocks Matter

```typescript
// ❌ BAD: Type assertions hide schema mismatches
const mockData = {
  orders: [],
  tables: [],
  user: mockUser,
} as any;

render(OrdersPage, { data: mockData });
// Compiles fine, fails at runtime if schema changes!
```

```typescript
// ✅ GOOD: Typed factories catch errors at compile time
const mockData = createMockPageData({
  orders: [createMockOrder({ tableNumber: 5 })],
  tables: [createMockTable({ tableNumber: 5 })],
});

render(OrdersPage, { data: mockData });
// TypeScript validates all fields match PageData type!
```

#### Pattern Implementation

**Step 1: Import Generated Types**

Use SvelteKit's generated types from `./$types` for page data:

```typescript
import type { PageData } from './$types';
```

**Step 2: Create Typed Factory Functions**

Build factory functions that return properly typed objects with sensible defaults:

```typescript
// Helper to create properly typed mock PageData
function createMockPageData(overrides?: Partial<PageData>): PageData {
  const defaults: PageData = {
    orders: [],
    tables: [],
    user: mockUser,
  };
  return { ...defaults, ...overrides };
}

// Helper to create mock order with all required fields including relations
function createMockOrder(
  overrides?: Partial<NonNullable<PageData['orders']>[number]>
): NonNullable<PageData['orders']>[number] {
  const defaults: NonNullable<PageData['orders']>[number] = {
    id: 'order_1',
    orderNumber: 1001,
    venueId: 'venue_test_123',
    serverId: 'user_test_123',
    tableNumber: 5,
    guestCount: 2,
    status: 'open' as const,
    orderType: 'dine_in' as const,
    subtotal: 45.99,
    tax: 0,
    tip: 0,
    discount: 0,
    total: 45.99,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null,
    // Relations from database query
    items: [],
    server: {
      id: 'user_test_123',
      email: 'server@test.com',
      firstName: 'Test',
      lastName: 'Server',
      venueId: 'venue_test_123',
      role: 'server' as const,  // Note: singular 'role', not 'roles'
      phone: null,
      isActive: true,
      pinCodeHash: null,
      keycloakId: 'keycloak_test_123',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
  return { ...defaults, ...overrides };
}

// Helper to create mock table with all required fields
function createMockTable(
  overrides?: Partial<NonNullable<PageData['tables']>[number]>
): NonNullable<PageData['tables']>[number] {
  const defaults: NonNullable<PageData['tables']>[number] = {
    id: 'table_1',
    venueId: 'venue_test_123',
    tableNumber: 5,
    sectionName: 'dining' as const,  // Enum: 'dining' | 'bar' | 'patio' | 'private'
    capacity: 4,
    status: 'available' as const,
    notes: null,
    currentOrderId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return { ...defaults, ...overrides };
}
```

**Step 3: Use Factories in Tests**

Replace all `as any` assertions with factory function calls:

```typescript
describe('Orders Page', () => {
  it('should render orders grid with mock data', async () => {
    const mockData = createMockPageData({
      orders: [
        createMockOrder({
          id: 'order_1',
          orderNumber: 1001,
          tableNumber: 5,
          status: 'open',
          total: 45.99,
        }),
        createMockOrder({
          id: 'order_2',
          orderNumber: 1002,
          tableNumber: 12,
          status: 'sent',
          total: 78.5,
        }),
      ],
    });

    render(OrdersPage, {
      data: mockData,  // ✅ Fully typed, no `as any`!
    });

    const heading = page.getByRole('heading', { name: 'Orders' });
    await expect.element(heading).toBeInTheDocument();
  });
});
```

#### Benefits of Typed Mocks

1. **Compile-Time Validation**: TypeScript catches schema mismatches before tests run
2. **Autocomplete**: IDE suggests available fields and their types
3. **Refactoring Safety**: Schema changes break tests at compile time, not runtime
4. **Documentation**: Factory code documents expected data structure
5. **Zero Linter Errors**: Eliminates Biome/ESLint warnings about `any` usage
6. **Consistent Test Data**: All tests use same default values, reducing duplication

#### Common Schema Mismatches Caught by Typed Mocks

```typescript
// Example errors caught at compile time:

// ❌ User has 'role' (singular), not 'roles' (plural)
server: {
  roles: ['server']  // TypeScript error: Property 'roles' does not exist
}

// ✅ Correct field name
server: {
  role: 'server'  // Compiles successfully
}

// ❌ Missing required fields
server: {
  id: 'user_123',
  email: 'test@example.com',
  // Missing: firstName, lastName, venueId, etc.
}  // TypeScript error: Missing required properties

// ✅ Factory provides all required fields with defaults
createMockOrder()  // Compiles with all fields present

// ❌ Wrong enum value
sectionName: 'Main'  // TypeScript error: Type '"Main"' is not assignable to type 'dining' | 'bar' | ...

// ✅ Correct enum value (lowercase)
sectionName: 'dining'  // Compiles successfully
```

#### Factory Pattern Best Practices

1. **One factory per data type**: Separate factories for PageData, orders, tables, users, etc.
2. **Default to valid data**: Factories should return valid objects without overrides
3. **Allow partial overrides**: Use `Partial<T>` for override parameter
4. **Include all required fields**: Even if null, include all schema fields
5. **Match database relations**: Include nested objects like `server`, `items`, `modifiers`
6. **Use `as const` for enums**: Ensure literal types match schema enums
7. **Co-locate with tests**: Define factories in same file or shared test utilities

#### Migration Strategy

If you have existing tests with `as any`:

1. Run TypeScript with `--noImplicitAny` to find all `as any` usage
2. Create typed factories for each data type
3. Replace `as any` with factory calls
4. Fix schema mismatches revealed by TypeScript errors
5. Run tests to verify behavior unchanged
6. Run `npm run lint` to confirm zero `any` usage

**Result**: Full type safety in tests, catching bugs at compile time instead of runtime.

---

## TDD Workflow

### Development Cycle
1. **Write User Story**
   ```gherkin
   Given a server is logged in
   When they create a new order for table 5
   Then an order should be created with status "open"
   ```

2. **Write Failing Test**
   ```typescript
   it('should create order for table', async () => {
     const result = await createOrder({ tableId: 5 });
     expect(result.status).toBe('open');
   }); // RED
   ```

3. **Write Minimal Code**
   ```typescript
   function createOrder({ tableId }) {
     return { status: 'open', tableId };
   } // GREEN
   ```

4. **Refactor**
   ```typescript
   function createOrder({ tableId, serverId }) {
     return orderRepository.create({
       status: OrderStatus.OPEN,
       tableId,
       serverId,
       createdAt: new Date()
     });
   } // REFACTOR
   ```

---

## Test Patterns & Best Practices

### AAA Pattern (Arrange-Act-Assert)
```typescript
it('should calculate tip correctly', () => {
  // Arrange
  const subtotal = 100;
  const tipPercentage = 20;

  // Act
  const tip = calculateTip(subtotal, tipPercentage);

  // Assert
  expect(tip).toBe(20);
});
```

### Testing Async Operations
```typescript
it('should process payment asynchronously', async () => {
  const payment = await processPayment(paymentData);

  expect(payment.status).toBe('completed');

  // Alternative with promises
  await expect(processPayment(invalidData))
    .rejects.toThrow('Invalid payment data');
});
```

### Component Testing
```typescript
// OrderItem.test.ts
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import OrderItem from './OrderItem.svelte';

describe('OrderItem Component', () => {
  it('should render item details', () => {
    const { getByText } = render(OrderItem, {
      props: { item: mockItem }
    });

    expect(getByText(mockItem.name)).toBeInTheDocument();
    expect(getByText(`$${mockItem.price}`)).toBeInTheDocument();
  });

  it('should handle modifier selection', async () => {
    const onModifierSelect = vi.fn();
    const { getByRole, getByText } = render(OrderItem, {
      props: {
        item: mockItem,
        onModifierSelect
      }
    });

    await fireEvent.click(getByRole('button', { name: /add modifier/i }));
    await fireEvent.click(getByText('Extra cheese'));

    expect(onModifierSelect).toHaveBeenCalledWith('extra-cheese');
  });
});
```

### Svelte-Specific Testing Patterns

```typescript
// Testing Svelte Stores
import { get } from 'svelte/store';
import { orderStore } from '$lib/stores/order';

describe('Order Store', () => {
  it('should update order total when items added', () => {
    orderStore.addItem({ id: '1', price: 10, quantity: 2 });

    const state = get(orderStore);
    expect(state.items).toHaveLength(1);
    expect(state.total).toBe(20);
  });

  it('should handle reactive statements', async () => {
    const { component } = render(MenuComponent, {
      props: { items: [] }
    });

    // Update props and test reactive updates
    await component.$set({ items: mockItems });
    await tick(); // Wait for Svelte reactivity

    expect(getByText('10 items')).toBeInTheDocument();
  });
});

// Testing SvelteKit Load Functions
describe('Menu Page Load', () => {
  it('should fetch menu data on load', async () => {
    const load = (await import('./+page.ts')).load;

    const result = await load({
      params: { venueId: 'test-venue' },
      fetch: mockFetch
    });

    expect(result.menu).toBeDefined();
    expect(result.menu.items).toHaveLength(10);
  });
});

// Testing Form Actions with RequestEvent Mock Factory
describe('Order Form Actions', () => {
  // Create route-specific RequestEvent factory
  function createMockRequestEvent(
    overrides: Partial<RequestEvent<Record<string, string>, '/orders'>> = {}
  ): RequestEvent<Record<string, string>, '/orders'> {
    const mockCookies: Cookies = {
      get: vi.fn(() => undefined),
      getAll: vi.fn(() => []),
      set: vi.fn(),
      delete: vi.fn(),
      serialize: vi.fn(() => ''),
    };

    const defaultEvent = {
      cookies: mockCookies,
      fetch: vi.fn(globalThis.fetch),
      getClientAddress: vi.fn(() => '127.0.0.1'),
      locals: { user: null },
      params: {},
      platform: undefined,
      request: new Request('http://localhost:5173/orders?/createOrder', { method: 'POST' }),
      route: { id: '/orders' as const },  // Hardcode route-specific ID
      setHeaders: vi.fn(),
      url: new URL('http://localhost:5173/orders?/createOrder'),
      isDataRequest: false,
      isSubRequest: false,
      isRemoteRequest: false,
      tracing: { enabled: false, root: {} as any, current: {} as any },
    };

    return { ...defaultEvent, ...overrides } as RequestEvent<Record<string, string>, '/orders'>;
  }

  it('should create order with valid form data', async () => {
    const mockUser = {
      id: 'user1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      venueId: 'venue1',
      roles: ['server'],
    };

    const formData = new FormData();
    formData.set('tableNumber', '5');
    formData.set('guestCount', '4');
    formData.set('orderType', 'dine_in');

    const mockRequest = new Request('http://localhost:5173/orders?/createOrder', {
      method: 'POST',
      body: formData,
    });

    const event = createMockRequestEvent({
      locals: { user: mockUser },
      request: mockRequest,
    });

    const { createOrder } = (await import('./+page.server.ts')).actions;
    const result = await createOrder(event);

    expect(result.success).toBe(true);
    expect(result.order).toBeDefined();
  });

  it('should reject invalid form data', async () => {
    const formData = new FormData();
    // Missing required fields

    const mockRequest = new Request('http://localhost:5173/orders?/createOrder', {
      method: 'POST',
      body: formData,
    });

    const event = createMockRequestEvent({ request: mockRequest });

    const { createOrder } = (await import('./+page.server.ts')).actions;
    const result = await createOrder(event);

    expect(result.status).toBe(400);
    expect(result.error).toBeDefined();
  });
});

// **Key Pattern**: Hardcode route ID in factory instead of using generics
// This avoids TypeScript type constraint errors with SvelteKit's route union types
// Each test file should have its own route-specific factory

// Testing SvelteKit Server Hooks
describe('Authentication Hooks', () => {
  let mockEvent: RequestEvent;
  let mockResolve: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockEvent = {
      cookies: {
        get: vi.fn((name: string) => cookies.get(name)),
        set: vi.fn((name: string, value: string, options: CookieSerializeOptions) => {
          cookies.set(name, value);
        }),
        delete: vi.fn((name: string, options: CookieSerializeOptions) => {
          cookies.delete(name);
        }),
      },
      locals: { user: null },
      url: new URL('http://localhost:5173/'),
    } as unknown as RequestEvent;

    mockResolve = vi.fn().mockResolvedValue(new Response('OK'));
  });

  it('should validate token and set user in locals', async () => {
    cookies.set('access_token', 'valid-token');

    vi.spyOn(AuthService.prototype, 'validateToken').mockResolvedValue({
      sub: 'user-123',
      email: 'test@example.com',
      // ... payload fields
    });

    await handleAuth({ event: mockEvent, resolve: mockResolve });

    expect(mockEvent.locals.user).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      // ... user fields
    });
  });
});
```

**Important**: SvelteKit hooks that use `sequence()` cannot be tested directly due to AsyncLocalStorage requirements. Export and test individual hook functions instead:

```typescript
// hooks.server.ts
export { handleAuth, handleAuthorization };  // For testing
export const handle = sequence(handleAuth, handleAuthorization);  // For SvelteKit
```
```

### Vitest Workspace Configuration

For SvelteKit apps, use **Vitest workspace** to separate client (browser) and server (node) test environments:

```typescript
// vitest.workspace.ts
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    // Client-side tests (Svelte components)
    extends: './vite.config.ts',
    test: {
      name: 'client',
      include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
      exclude: ['**/node_modules/**', '**/.svelte-kit/**'],
      // Browser mode for real Chromium testing
      browser: {
        enabled: true,
        name: 'chromium',
        provider: 'playwright',
        headless: true,
      },
      setupFiles: ['vitest-browser-svelte', './src/test/setup.ts'],
      globals: true,
    },
  },
  {
    // Server-side tests (hooks, load functions, actions)
    extends: './vite.config.ts',
    test: {
      name: 'server',
      environment: 'node',
      include: [
        'src/**/*.{test,spec}.{js,ts}',
        '!src/**/*.svelte.{test,spec}.{js,ts}',
      ],
      exclude: ['**/node_modules/**', '**/.svelte-kit/**'],
      setupFiles: ['./src/test/setup.ts'],
      globals: true,
    },
  },
]);
```

**File Naming Conventions**:
- `*.svelte.test.ts` → Client tests (browser mode, Playwright/Chromium)
- `*.test.ts` → Server tests (node environment, no browser APIs)

**Benefits**:
- Correct environment for each test type
- Prevents AsyncLocalStorage errors in server tests
- Real browser rendering for component tests
- Faster execution (parallel projects)

### API Testing
```typescript
describe('Menu API', () => {
  it('should return menu items for venue', async () => {
    const response = await request(app)
      .get('/api/menu/items')
      .set('X-Venue-Id', testVenueId);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          price: expect.any(Number)
        })
      ])
    );
  });
});
```

---

## Mocking Strategy

### API Mocking with MSW
```typescript
// test/mocks/handlers.ts
export const handlers = [
  rest.post('/api/payments/process', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 'payment-123',
        status: 'completed',
        amount: req.body.amount
      })
    );
  })
];

// test/setup.ts
const server = setupServer(...handlers);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Database Mocking
```typescript
// Use actual test database instead of mocks when possible
beforeEach(async () => {
  await db.transaction(async (tx) => {
    await tx.delete(orders);
    await tx.delete(orderItems);
  });
});
```

---

## Continuous Integration

### Pre-commit Hooks
```json
// .husky/pre-commit
{
  "scripts": {
    "pre-commit": "biome check --apply . && npm run test:affected"
  }
}
```

### CI Pipeline Stages
1. **Lint & Format**: Biome check
2. **Unit Tests**: Run all unit tests
3. **Integration Tests**: Run with test database
4. **Build**: Ensure project builds
5. **E2E Tests**: Run critical paths
6. **Coverage Report**: Generate and check thresholds

---

## Performance Testing

### Load Testing Scenarios
```typescript
// test/performance/order-load.test.ts
describe('Order Processing Load Test', () => {
  it('should handle 100 concurrent orders', async () => {
    const startTime = Date.now();

    const promises = Array.from({ length: 100 }, () =>
      createOrder(generateRandomOrder())
    );

    await Promise.all(promises);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // Under 5 seconds
  });
});
```

### Component Performance
```typescript
it('should render large menu without performance issues', async () => {
  const items = generateMenuItems(1000);

  const { component } = render(Menu, {
    props: { items }
  });

  // Measure re-render performance
  const start = performance.now();
  await component.$set({ filter: 'burger' });
  const duration = performance.now() - start;

  expect(duration).toBeLessThan(100); // Under 100ms
});
```

---

## Security Testing

### Authentication Tests
```typescript
describe('Authentication Security', () => {
  it('should reject expired tokens', async () => {
    const expiredToken = generateExpiredToken();

    const response = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
  });

  it('should prevent SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --";

    const response = await request(app)
      .post('/api/login')
      .send({ email: maliciousInput, password: 'test' });

    expect(response.status).toBe(422);
    // Verify database is intact
    const userCount = await db.select().from(users);
    expect(userCount.length).toBeGreaterThan(0);
  });
});
```

---

## Test Execution Strategy

### Local Development
```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run specific test suite
npm test -- order.test.ts

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Test Environments
- **Local**: SQLite in-memory database
- **CI**: Turso test instance
- **Staging**: Dedicated test database
- **Production**: No test execution

---

## Monitoring & Metrics

### Key Test Metrics
1. **Test Execution Time**: Target < 5 minutes for full suite
2. **Flaky Test Rate**: Target < 1%
3. **Coverage Trend**: Must increase or maintain
4. **Test Failure Rate**: Track and investigate patterns

### Test Health Dashboard
- Daily test run summary
- Coverage reports
- Performance regression alerts
- Flaky test tracking

---

## SvelteKit-Specific Testing Patterns

### Page Component Data Flow Testing

SvelteKit page components should receive data as props from load functions, NOT access global state via `$app/state`. This pattern simplifies testing and follows SvelteKit best practices.

#### ❌ WRONG: Using $app/state for Page Data

```svelte
<!-- +page.svelte -->
<script lang="ts">
import { page } from '$app/state';
</script>

{#if page?.data?.user}
  <p>Email: {page.data.user.email}</p>
{/if}
```

**Testing Problems:**
- Cannot mock `page` from `$app/state` (read-only getters)
- Circular import issues with SvelteKit internals
- Complex mocking setup required
- Breaks component isolation

**Attempted Test (Fails):**
```typescript
// ❌ This fails with "Cannot set property data"
import { page } from '$app/state';

beforeEach(() => {
  page.data = { user: mockUser };  // Error: read-only!
});
```

#### ✅ CORRECT: Using Props Pattern

```svelte
<!-- +page.svelte -->
<script lang="ts">
import type { PageData } from './$types';

// Receive data from parent layout or page load function
let { data }: { data: PageData } = $props();
</script>

{#if data?.user}
  <p>Email: {data.user.email}</p>
{/if}
```

**Testing Benefits:**
```typescript
// ✅ Clean, simple test - NO mocking needed
import { render } from 'vitest-browser-svelte';
import { expect, it } from 'vitest';
import { page } from '@vitest/browser/context';
import UnauthorizedPage from './+page.svelte';

it('should display user email when user data exists', async () => {
  render(UnauthorizedPage, {
    props: {
      data: {
        user: {
          email: 'test@example.com',
          roles: ['viewer'],
        },
      },
    },
  });

  const userEmail = page.getByText('Current user: test@example.com');
  await expect.element(userEmail).toBeInTheDocument();
});
```

### When to Use $app/state vs Props

| Scenario | Use Props | Use $app/state |
|----------|-----------|----------------|
| **User/session data from layout** | ✅ YES | ❌ NO |
| **Data from page load function** | ✅ YES | ❌ NO |
| **Form data, component state** | ✅ YES | ❌ NO |
| **Current URL (page.url)** | ❌ NO | ✅ YES |
| **Route parameters (page.params)** | ❌ NO | ✅ YES |
| **Navigation state** | ❌ NO | ✅ YES |

### Pattern Comparison Table

| Aspect | Props Pattern (✅ Recommended) | $app/state Pattern (❌ Avoid) |
|--------|-------------------------------|------------------------------|
| **Testing Complexity** | Simple - pass props | Complex - mock global state |
| **Mocking Required** | None | Heavy mocking required |
| **Test Setup** | 1 line | 10+ lines with vi.mock |
| **Component Isolation** | Fully isolated | Coupled to SvelteKit runtime |
| **Type Safety** | Full type inference | Partial type support |
| **Maintainability** | High | Low |
| **Best Practice** | Standard SvelteKit pattern | Framework internals only |

### Real-World Example

**Scenario**: Unauthorized page showing user info when access is denied.

**Wrong Approach (Endless Testing Problems)**:
```svelte
<!-- ❌ BAD: Using $app/state -->
<script lang="ts">
import { page } from '$app/state';
</script>

{#if $page?.data?.user}
  <div class="user-info">
    <p>Current user: {$page.data.user.email}</p>
    <p>Your roles: {$page.data.user.roles.join(', ')}</p>
  </div>
{/if}
```

**Test Attempts (All Failed)**:
1. Mock `page` as writable store → Reactivity doesn't work
2. Use `vi.mock('$app/state')` → "Cannot set property data" error
3. Mock with `importActual` → Circular dependency issues
4. Try to override getters → TypeScript/runtime errors

**Result**: Hours wasted, no passing tests.

**Right Approach (Zero Testing Issues)**:
```svelte
<!-- ✅ GOOD: Using props -->
<script lang="ts">
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
</script>

{#if data?.user}
  <div class="user-info">
    <p>Current user: {data.user.email}</p>
    <p>Your roles: {data.user.roles.join(', ')}</p>
  </div>
{/if}
```

**Test (Works Immediately)**:
```typescript
it('should display user info when user exists', async () => {
  render(UnauthorizedPage, {
    props: {
      data: {
        user: { email: 'test@example.com', roles: ['viewer'] }
      }
    }
  });

  const email = page.getByText('Current user: test@example.com');
  await expect.element(email).toBeInTheDocument();
});
```

**Result**: 9 comprehensive tests passing, zero mocking.

### Key Takeaway

**When testing becomes impossibly complex, the problem is often architectural, not technical.**

If you find yourself writing complex mocks for SvelteKit globals, step back and ask: "Should this component be using props instead?"

The `page` store from `$app/state` is for framework internals and edge cases, not standard component data flow. Page components should receive data as props from load functions - this is the SvelteKit way.

---

## Documentation Requirements

### Test Documentation
- Each test file must have a header comment explaining purpose
- Complex test scenarios need inline documentation
- Integration tests must document external dependencies
- E2E tests must reference user stories

### Example Test Documentation
```typescript
/**
 * @description Tests for order creation workflow
 * @dependencies Database, Authentication service
 * @userStory HOST-123: As a server, I want to create orders
 */
describe('Order Creation', () => {
  /**
   * Validates that orders are created with correct initial state
   * including proper timestamps and status
   */
  it('should create order with default values', () => {
    // Test implementation
  });
});
```

---

*Last Updated: September 29, 2025*
*Version: 0.1.0-alpha*
*Status: Active*