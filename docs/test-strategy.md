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

// Testing Form Actions
describe('Order Form Actions', () => {
  it('should handle form submission', async () => {
    const actions = (await import('./+page.server.ts')).actions;

    const formData = new FormData();
    formData.set('tableId', '5');

    const result = await actions.createOrder({
      request: { formData: async () => formData },
      locals: { user: mockUser }
    });

    expect(result.success).toBe(true);
    expect(result.order).toBeDefined();
  });
});
```

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