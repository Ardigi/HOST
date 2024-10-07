# HOST POS System

**Modern Point-of-Sale System for Bars & Restaurants**

![Tests](https://img.shields.io/badge/tests-701_passing-success)
![Coverage](https://img.shields.io/badge/coverage-99.93%25-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)
![License](https://img.shields.io/badge/license-Proprietary-red)

---

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/Ardigi/HOST.git
cd host

# Quick setup (Windows PowerShell)
.\scripts\dev-setup.ps1

# Or manual setup
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```

**Quick Links:**
- 📚 [Full Documentation](./docs/README.md)
- 🏗️ [Architecture](./docs/architecture.md)
- 🧪 [Test Strategy](./docs/test-strategy.md)
- 🗺️ [Roadmap](./docs/02-technical-roadmap.md)
- 📊 [Progress Tracker](./docs/PROGRESS.md)

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [Support](#support)

---

## 🎯 About

HOST is a modern, fast, and user-friendly Point-of-Sale system designed specifically for bars and restaurants. Built with cutting-edge technologies and a focus on performance, accessibility, and developer experience.

## 📸 Screenshots

*Coming soon - UI screenshots will be added as components are completed*

<!-- Screenshots will showcase:
- POS Order Entry Interface
- Kitchen Display System
- Admin Dashboard
- Payment Processing Flow
-->

### Key Highlights

- ⚡ **Blazing Fast**: Sub-400ms response times, sub-10ms database reads
- 🎨 **Beautiful UI**: WCAG 2.1 AA compliant, optimized for touch
- 🌐 **Edge-Powered**: Global deployment with Turso edge database
- 🧪 **Test-Driven**: 85%+ test coverage, comprehensive TDD approach
- 🔒 **Secure**: PCI-compliant payment processing, enterprise-grade auth
- 📱 **Offline-First**: Progressive Web App with offline capabilities

---

## ✨ Features

### Core Features
- 🧾 **Order Management**: Create, modify, split checks, and track orders
- 💳 **Payment Processing**: Card, cash, multiple payment methods (Stripe)
- 📋 **Menu Management**: Dynamic menus with categories, modifiers, pricing
- 👥 **Staff Management**: Role-based access control, shift tracking
- 📊 **Inventory Tracking**: Real-time stock levels, cost calculator
- 📈 **Reporting**: Sales, labor, inventory reports and analytics
- 🍳 **Kitchen Display**: Real-time order updates for kitchen staff
- 👔 **Admin Dashboard**: Comprehensive business management tools

### Advanced Features (Planned)
- 🔄 Multi-venue support
- 📱 Mobile ordering
- 🎫 Reservations & waitlist
- 💰 Loyalty programs
- 📧 Email receipts
- 🔔 Push notifications

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [Svelte 5](https://svelte.dev/) with runes for fine-grained reactivity
- **Meta-Framework**: [SvelteKit 2](https://svelte.dev/docs/kit) for SSR and routing
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with CSS-first configuration
- **Build Tool**: [Vite 6](https://vite.dev/) for fast development and optimized builds

### Backend
- **Runtime**: Node.js 24 LTS
- **API**: [tRPC v11](https://trpc.io/) for type-safe APIs
- **Authentication**: [Keycloak 26.3](https://www.keycloak.org/) (OpenID Connect)
- **Validation**: [Zod](https://zod.dev/) for schema validation

### Database & Infrastructure
- **Database**: [Turso](https://turso.tech/) (LibSQL) with edge replication
- **ORM**: [Drizzle ORM 0.36.4+](https://orm.drizzle.team/)
- **Payments**: [Stripe Connect](https://stripe.com/connect)
- **Cache**: Redis / Upstash
- **Deployment**: Vercel Edge Functions + Cloudflare Workers

### Development Tools
- **Monorepo**: [Turborepo 2.3.3+](https://turborepo.com/)
- **Linting/Formatting**: [Biome 1.9.4+](https://biomejs.dev/)
- **Testing**: [Vitest 2.1.8+](https://vitest.dev/) + [Playwright 1.49.1+](https://playwright.dev/) - **701 tests passing**
- **Type Safety**: [TypeScript 5.7.2+](https://www.typescriptlang.org/)

📖 Full tech stack details: [TECH_STACK_2025.md](./docs/TECH_STACK_2025.md)

---

## 🏃 Getting Started

### Prerequisites

- **Node.js**: >= 24.0.0 (LTS)
- **npm**: >= 10.0.0
- **Git**: >= 2.40.0
- **Docker**: >= 24.0.0 (optional, for local services)

### Installation

#### Automated Setup (Recommended)

**Windows (PowerShell):**
```powershell
.\scripts\dev-setup.ps1
```

**macOS/Linux:**
```bash
# Coming soon: ./scripts/dev-setup.sh
```

#### Manual Setup

```bash
# 1. Clone repository
git clone https://github.com/Ardigi/HOST.git
cd host

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
cp apps/pos/.env.example apps/pos/.env.local
cp packages/database/.env.example packages/database/.env.local

# Edit .env.local files with your configuration

# 4. Setup database
npm run db:migrate
npm run db:seed

# 5. Start development server
npm run dev:pos
```

📖 Detailed setup guide: [development-setup.md](./docs/development-setup.md)

---

## 📚 Documentation

### Essential Docs (Start Here)
- 📖 [Documentation Index](./docs/README.md) - Complete documentation suite
- 🏗️ [Architecture](./docs/architecture.md) - System design and patterns
- 🧪 [Test Strategy](./docs/test-strategy.md) - TDD guidelines and framework
- 🎯 [User Stories](./docs/user-stories.md) - 17 detailed stories with acceptance criteria
- ✅ [Definition of Done](./docs/DEFINITION_OF_DONE.md) - Completion criteria
- 🔗 [Dependencies](./docs/DEPENDENCIES.md) - Technical dependency tracker
- 📊 [Progress Tracker](./docs/PROGRESS.md) - Current implementation status

### Planning & Strategy
- 🎯 [Vision](./docs/00-vision.md) - Product vision and competitive positioning
- 📋 [MVP Definition](./docs/01-mvp-definition.md) - MVP scope and features
- 🗺️ [Technical Roadmap](./docs/02-technical-roadmap.md) - 12-week development plan
- 💼 [Business Requirements](./docs/05-business-requirements.md) - Business planning and KPIs

### Technical Documentation
- 🗄️ [Database Schema](./docs/03-database-schema.md) - Complete database design
- 🔌 [API Specification](./docs/04-api-specification.yaml) - OpenAPI 3.0 spec
- 🔒 [Security & Auth](./docs/security-authentication.md) - Auth flows and PCI compliance
- ♿ [Accessibility](./docs/accessibility-requirements.md) - WCAG 2.1 AA guidelines
- 📦 [Tech Stack 2025](./docs/TECH_STACK_2025.md) - Official versions and migration notes

### Development Resources
- 🤝 [Contributing](./CONTRIBUTING.md) - TDD workflow and contribution guidelines
- ✅ [Feature Checklist](./docs/checklists/feature-checklist-template.md) - Implementation checklist
- 🏛️ [ADR Index](./docs/adr/README.md) - Architecture Decision Records
- 🧪 [Test Factories](./test/factories/README.md) - Test data factories

---

## 💻 Development

### Project Structure

```
host/
├── apps/                    # Applications
│   ├── pos/                # Main POS SvelteKit app
│   ├── kds/                # Kitchen Display System
│   └── admin/              # Admin dashboard
├── packages/               # Shared packages
│   ├── shared/            # Business logic
│   ├── auth/              # Keycloak integration
│   ├── database/          # Drizzle schema & migrations
│   ├── ui/                # Svelte components
│   └── types/             # TypeScript types
├── test/                   # Test utilities
│   ├── factories/         # Test data factories
│   └── fixtures/          # Test fixtures
├── docs/                   # Documentation
├── scripts/                # Build & dev scripts
└── e2e/                    # E2E tests
```

### Common Commands

```bash
# Development
npm run dev              # Start all apps
npm run dev:pos          # Start POS only
npm run dev:kds          # Start KDS only
npm run dev:admin        # Start admin only

# Testing
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:e2e         # Playwright E2E tests

# Database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed data
npm run db:studio        # Drizzle Studio GUI
npm run db:reset         # Reset database

# Code Quality
npm run lint             # Check code
npm run lint:fix         # Fix issues
npm run typecheck        # Type check
npm run format           # Format code
npm run check:all        # Lint + typecheck + test

# Build
npm run build            # Build all apps
npm run build:fresh      # Clean build
npm run clean            # Clean all
```

### Development Workflow

1. **Create Branch**: `feature/POS-###-description`
2. **Write Tests First**: Follow TDD (Red-Green-Refactor)
3. **Implement Feature**: Meet acceptance criteria
4. **Verify DoD**: Check Definition of Done checklist
5. **Create PR**: Use PR template
6. **Code Review**: Get approval
7. **Merge**: Squash and merge

📖 Full workflow: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 🧪 Testing

### Test Strategy

We follow a rigorous **Test-Driven Development** approach with the testing pyramid:

```
       /\
      /  \    E2E Tests (5%)
     /____\   - Critical user journeys
    /      \
   /        \  Integration Tests (25%)
  /__________\ - API endpoints, DB operations
 /            \
/______________\ Unit Tests (70%)
                 - Business logic, components
```

### Coverage Requirements

| Component | Minimum | Target |
|-----------|---------|--------|
| Auth/Payments/Orders | 85% | 95% |
| Database/API | 85% | 90% |
| Business Logic | 80% | 85% |
| UI Components | 80% | 85% |

### Running Tests

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

📖 Full testing guide: [test-strategy.md](./docs/test-strategy.md)

---

## 🤝 Contributing

We welcome contributions! Please follow our TDD workflow and coding standards.

### Quick Start

1. **Read**:
   - [Contributing Guide](./CONTRIBUTING.md)
   - [Test Strategy](./docs/test-strategy.md)
   - [Definition of Done](./docs/DEFINITION_OF_DONE.md)

2. **Setup**: Run `.\scripts\dev-setup.ps1`

3. **Pick an Issue**: Check [GitHub Issues](https://github.com/Ardigi/HOST/issues)

4. **Write Tests First**: TDD approach required

5. **Submit PR**: Use the PR template

### Pull Request Process

- ✅ All tests passing (80%+ coverage)
- ✅ TypeScript compiles (no errors)
- ✅ Biome linting passes
- ✅ Code reviewed and approved
- ✅ Documentation updated
- ✅ Definition of Done met

---

## 📊 Current Status

**Status**: 🟢 Active Development
**Health**: 🟢 Healthy
**Test Coverage**: 701 passing tests (99.93% statements)

**Implemented Features:**
- ✅ Complete database layer with Drizzle ORM + Turso (241 tests)
- ✅ Business logic layer with Zod validation (126 tests)
- ✅ tRPC API with type-safe endpoints (95 tests)
- ✅ Material Design 3 design system (106 tokens)
- ✅ Authentication infrastructure with Keycloak integration
- ✅ Payment processing service (28 tests, PCI-ready)
- ✅ Order management service (82 tests)
- ✅ Menu management service (18 tests)
- ✅ Staff shift tracking service (22 tests)
- ✅ E2E testing infrastructure with Playwright (6 tests)
- ✅ CI/CD pipeline with GitHub Actions

📊 Detailed progress: [PROGRESS.md](./docs/PROGRESS.md)

---

## 🆘 Support

### Get Help

- 📚 **Documentation**: Check [docs/README.md](./docs/README.md)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Ardigi/HOST/issues)
- 💡 **Feature Requests**: [GitHub Issues](https://github.com/Ardigi/HOST/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Ardigi/HOST/discussions)

### Reporting Issues

Use our issue templates:
- 🐛 [Bug Report](./.github/ISSUE_TEMPLATE/bug_report.md)
- ✨ [Feature Request](./.github/ISSUE_TEMPLATE/feature_request.md)
- ⚙️ [Technical Debt](./.github/ISSUE_TEMPLATE/tech_debt.md)

---

## 📜 License

**Proprietary Software**

Copyright © 2025 Digi. All rights reserved.

---

## 🙏 Acknowledgments

Built with modern technologies:
- [Svelte](https://svelte.dev/) - Cybernetically enhanced web apps
- [SvelteKit](https://svelte.dev/docs/kit) - The fastest way to build Svelte apps
- [Turso](https://turso.tech/) - SQLite for Production
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [tRPC](https://trpc.io/) - End-to-end typesafe APIs
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Vitest](https://vitest.dev/) - Blazing fast unit testing
- [Playwright](https://playwright.dev/) - Reliable end-to-end testing

---

## 🚀 Development Roadmap

### ✅ Completed
- **Infrastructure**: Turborepo monorepo, CI/CD pipeline, TDD workflow
- **Database Layer**: 9 schemas, 3 services (Menu, Order, Payment), Turso integration
- **Business Logic**: Zod validation, service layer with 99.93% coverage
- **API Layer**: tRPC v11 with type-safe endpoints
- **Design System**: Complete Material Design 3 token system
- **Authentication**: Keycloak integration with OIDC/PKCE
- **Testing**: Comprehensive test suite (701 passing tests)

### 🚧 In Progress
- **UI Components**: POS-optimized Material Design 3 wrappers
- **Order Flow**: Complete order lifecycle implementation
- **E2E Testing**: Expanding Playwright test coverage

### 📋 Planned
- **Payment Integration**: Stripe Connect implementation
- **Kitchen Display**: Real-time order updates for kitchen staff
- **Reporting & Analytics**: Sales, labor, and inventory insights
- **Multi-venue Support**: Tenant isolation and cross-venue management

🗺️ Detailed roadmap: [02-technical-roadmap.md](./docs/02-technical-roadmap.md)

---

*Building the future of hospitality technology*