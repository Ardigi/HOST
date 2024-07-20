# Contributing to HOST POS

Thank you for your interest in contributing to HOST! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Getting Started

### Prerequisites

- Node.js v24.0.0 or higher
- npm v10.0.0 or higher
- Docker v24.0.0 or higher (for local services)
- Git v2.40.0 or higher

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pour-people/host.git
   cd host
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   cp apps/pos/.env.example apps/pos/.env.local
   cp packages/database/.env.example packages/database/.env.local
   ```

4. **Start Docker services:**
   ```bash
   npm run docker:up
   ```

5. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

6. **Start development server:**
   ```bash
   npm run dev
   ```

## Development Workflow

### Test-Driven Development (TDD)

We follow a strict TDD approach. **Always write tests before implementation.**

#### Red-Green-Refactor Cycle

1. **RED**: Write a failing test
   ```typescript
   it('should create order for table', () => {
     const order = createOrder({ tableId: 5 });
     expect(order.status).toBe('open'); // FAILS
   });
   ```

2. **GREEN**: Write minimal code to make it pass
   ```typescript
   function createOrder({ tableId }) {
     return { status: 'open', tableId };
   }
   ```

3. **REFACTOR**: Improve code quality
   ```typescript
   function createOrder({ tableId, serverId }) {
     return orderRepository.create({
       status: OrderStatus.OPEN,
       tableId,
       serverId,
       createdAt: new Date()
     });
   }
   ```

### Branch Naming

Use the following prefixes:

- `feature/POS-123-description` - New features
- `fix/POS-456-description` - Bug fixes
- `refactor/POS-789-description` - Code refactoring
- `docs/POS-101-description` - Documentation updates
- `test/POS-202-description` - Test additions/updates

### Local Development

```bash
# Run specific app
npm run dev:pos    # POS application
npm run dev:kds    # Kitchen Display System
npm run dev:admin  # Admin dashboard

# Run tests
npm run test           # Run all tests once
npm run test:watch     # Run tests in watch mode
npm run test:unit      # Unit tests only
npm run test:integration  # Integration tests only
npm run test:e2e       # End-to-end tests

# Code quality
npm run lint           # Check linting
npm run lint:fix       # Fix linting issues
npm run typecheck      # Type checking
npm run format         # Format code
```

## Code Standards

### TypeScript

- Use TypeScript strict mode
- Define types for all function parameters and return values
- Avoid `any` types
- Use meaningful variable and function names

**Good:**
```typescript
function calculateOrderTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
```

**Bad:**
```typescript
function calc(x: any): any {
  return x.reduce((a, b) => a + b.price * b.qty, 0);
}
```

### Svelte 5

- Use runes (`$state`, `$derived`, `$effect`) for reactivity
- Use snippets instead of slots where appropriate
- Keep components focused and single-purpose
- Use TypeScript for props

**Example:**
```svelte
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);

  $effect(() => {
    console.log('Count changed:', count);
  });
</script>
```

### Code Organization

- Follow the established monorepo structure
- Keep files focused and under 300 lines
- Use barrel exports (`index.ts`) for clean imports
- Co-locate tests with source files

## Testing Requirements

### Coverage Targets

- **Minimum**: 80% overall coverage
- **Critical paths**: 90% coverage (auth, payments, orders)
- **Target**: 85% coverage for production

### Test Types

#### Unit Tests (`*.test.ts`)
- Test pure functions and business logic
- Use test factories for data generation
- Mock external dependencies

```typescript
import { describe, it, expect } from 'vitest';
import { orderFactory } from '../test/factories';

describe('calculateTax', () => {
  it('should calculate 8.25% tax correctly', () => {
    const subtotal = 100;
    const tax = calculateTax(subtotal);
    expect(tax).toBe(8.25);
  });
});
```

#### Integration Tests (`*.integration.test.ts`)
- Test API endpoints
- Use test database
- Test service layer interactions

```typescript
describe('POST /api/orders', () => {
  it('should create order with valid data', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(orderFactory.buildNew());

    expect(response.status).toBe(201);
  });
});
```

#### E2E Tests (`e2e/*.spec.ts`)
- Test complete user workflows
- Use Playwright
- Focus on critical paths

```typescript
test('should complete order flow', async ({ page }) => {
  await page.goto('/orders');
  await page.click('[data-testid="new-order"]');
  await page.fill('[name="tableNumber"]', '5');
  await page.click('[data-testid="submit"]');
  await expect(page.locator('.success-message')).toBeVisible();
});
```

### Running Tests

```bash
# Before committing
npm run test:unit
npm run test:coverage

# Before creating PR
npm run test
npm run test:e2e
```

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(orders): add split check functionality

Implement split check feature allowing orders to be divided
among multiple guests with individual payment methods.

Closes #123
```

```bash
fix(auth): resolve session timeout issue

Fix issue where sessions were expiring too quickly due to
incorrect token refresh logic.

Fixes #456
```

### Pre-commit Hooks

Pre-commit hooks automatically run:
- Biome linting and formatting
- TypeScript type checking
- Affected unit tests

If hooks fail, fix issues before committing.

## Pull Request Process

### Before Creating a PR

1. ✅ All tests passing
2. ✅ Code coverage meets thresholds
3. ✅ No linting errors
4. ✅ TypeScript compiles without errors
5. ✅ Documentation updated (if needed)
6. ✅ CHANGELOG updated (for features)

### Creating a Pull Request

1. **Push your branch:**
   ```bash
   git push origin feature/POS-123-description
   ```

2. **Create PR on GitHub:**
   - Use the PR template
   - Link related issues
   - Add appropriate labels
   - Request reviews

3. **PR Title Format:**
   ```
   [POS-123] Add split check functionality
   ```

4. **PR Description:**
   - Summarize changes
   - List testing performed
   - Include screenshots/videos if UI changes
   - Note breaking changes

### Review Process

1. Automated CI checks must pass
2. At least one approval required
3. No unresolved conversations
4. Up to date with main branch

### Merging

- Use "Squash and merge" for feature branches
- Use "Rebase and merge" for hotfixes
- Delete branch after merging

## Code Review Guidelines

### As a Reviewer

- Be constructive and respectful
- Focus on code quality, not style (Biome handles that)
- Check for test coverage
- Verify TDD approach was followed
- Test locally if needed

### As an Author

- Respond to all comments
- Make requested changes
- Re-request review after updates
- Be open to feedback

## Additional Resources

- [Architecture Documentation](./docs/architecture.md)
- [Test Strategy](./docs/test-strategy.md)
- [User Stories](./docs/user-stories.md)
- [Development Setup](./docs/development-setup.md)

## Getting Help

- **Discord**: https://discord.gg/host-pos
- **GitHub Issues**: https://github.com/pour-people/host/issues
- **Documentation**: https://docs.host-pos.com

## License

By contributing, you agree that your contributions will be licensed under the project's license.

---

Thank you for contributing to HOST! 🎉