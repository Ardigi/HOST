# Test Data Factories

This directory contains factory functions for generating test data consistently across all tests.

## Purpose

Test factories provide:
- **Consistency**: Same data structure across all tests
- **Flexibility**: Override specific fields as needed
- **Maintainability**: Single source of truth for test data
- **Readability**: Clear, descriptive test data generation

## Usage

```typescript
import { userFactory, orderFactory, menuItemFactory } from '@host/test/factories';

// Generate single item with defaults
const user = userFactory.build();

// Generate with overrides
const admin = userFactory.build({ role: 'admin' });

// Generate multiple items
const users = userFactory.buildList(5);

// Generate with relationships
const order = orderFactory.build({
  items: menuItemFactory.buildList(3)
});
```

## Factory Conventions

### Structure
Each factory should export an object with these methods:
- `build(overrides?)` - Generate single item
- `buildList(count, overrides?)` - Generate multiple items
- `buildNew(overrides?)` - Generate item ready for creation (no ID)
- `buildExisting(overrides?)` - Generate item as if from database

### Example Factory

```typescript
import { faker } from '@faker-js/faker';
import type { User } from '@host/types';

export const userFactory = {
  build: (overrides?: Partial<User>): User => ({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    role: 'server',
    venueId: faker.string.uuid(),
    active: true,
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  buildList: (count: number, overrides?: Partial<User>): User[] =>
    Array.from({ length: count }, () => userFactory.build(overrides)),

  buildNew: (overrides?: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Omit<User, 'id' | 'createdAt' | 'updatedAt'> => {
    const user = userFactory.build(overrides);
    const { id, createdAt, updatedAt, ...newUser } = user;
    return newUser;
  },

  buildExisting: (overrides?: Partial<User>): User =>
    userFactory.build({
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    }),
};
```

## Available Factories

- `user.factory.ts` - User/staff data
- `order.factory.ts` - Order data
- `menu-item.factory.ts` - Menu items
- `payment.factory.ts` - Payment data
- `venue.factory.ts` - Venue data
- `table.factory.ts` - Table data

## Best Practices

### 1. Use Faker for Realistic Data
```typescript
// ✅ GOOD
email: faker.internet.email(),
name: faker.person.fullName(),

// ❌ BAD
email: 'test@example.com',
name: 'Test User',
```

### 2. Provide Meaningful Defaults
```typescript
// ✅ GOOD - Realistic defaults
status: 'open',
subtotal: faker.number.float({ min: 10, max: 500, precision: 0.01 }),

// ❌ BAD - Arbitrary values
status: 'foo',
subtotal: 123.45,
```

### 3. Keep Factories Type-Safe
```typescript
// ✅ GOOD - TypeScript types
build: (overrides?: Partial<Order>): Order => ({ ... })

// ❌ BAD - No types
build: (overrides?: any): any => ({ ... })
```

### 4. Support Relationships
```typescript
// ✅ GOOD - Easy relationship setup
const order = orderFactory.build({
  items: menuItemFactory.buildList(3),
  user: userFactory.build({ role: 'server' }),
});
```

### 5. Avoid Database Calls in Factories
```typescript
// ✅ GOOD - Pure data generation
build: (overrides?) => ({ ...defaultData, ...overrides })

// ❌ BAD - Database dependency
build: async (overrides?) => {
  const user = await db.users.findFirst();
  return { ...defaultData, userId: user.id, ...overrides };
}
```

## Testing with Factories

### Unit Tests
```typescript
import { orderFactory } from '@host/test/factories';

describe('calculateTotal', () => {
  it('should calculate order total correctly', () => {
    const order = orderFactory.build({
      subtotal: 100,
      tax: 8.25,
      tip: 20,
    });

    const total = calculateTotal(order);

    expect(total).toBe(128.25);
  });
});
```

### Integration Tests
```typescript
import { orderFactory, userFactory } from '@host/test/factories';

describe('POST /api/orders', () => {
  it('should create order with valid data', async () => {
    const user = await createTestUser(userFactory.buildNew());
    const orderData = orderFactory.buildNew({ userId: user.id });

    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${user.token}`)
      .send(orderData);

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });
});
```

### E2E Tests
```typescript
import { orderFactory } from '@host/test/factories';

test('complete order flow', async ({ page }) => {
  // Use factory data for consistent E2E tests
  const orderData = orderFactory.build();

  await page.goto('/orders/new');
  await page.fill('[name="tableNumber"]', String(orderData.tableNumber));
  await page.click('[data-testid="submit"]');

  await expect(page.locator('.success-message')).toBeVisible();
});
```

## Extending Factories

### Adding New Factories
1. Create new file: `test/factories/[entity].factory.ts`
2. Follow the factory structure convention
3. Export factory from `test/factories/index.ts`
4. Document usage in this README

### Customizing Existing Factories
1. Add new build methods as needed
2. Ensure backward compatibility
3. Update tests that use the factory
4. Document changes

## Troubleshooting

### Issue: Factory generates invalid data
**Solution**: Add validation or constraints in factory

```typescript
// ✅ Add validation
build: (overrides?) => {
  const data = { ...defaults, ...overrides };

  // Ensure email is valid
  if (data.email && !data.email.includes('@')) {
    throw new Error('Invalid email in factory');
  }

  return data;
}
```

### Issue: Factories are slow
**Solution**: Avoid expensive operations in factories

```typescript
// ✅ FAST - Simple data generation
const user = userFactory.build();

// ❌ SLOW - Expensive operations
const user = userFactory.build({
  avatar: generateComplexImage(), // Avoid this
});
```

### Issue: Test data conflicts
**Solution**: Use unique values from Faker

```typescript
// ✅ GOOD - Unique values
email: faker.internet.email(),
username: faker.internet.userName(),

// ❌ BAD - Hardcoded values cause conflicts
email: 'test@example.com', // Duplicate in multiple tests
```

## Related Documentation

- [Test Strategy](../docs/test-strategy.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Definition of Done](../docs/DEFINITION_OF_DONE.md)