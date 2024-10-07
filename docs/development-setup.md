# HOST Development Environment Setup Guide
## Complete Setup Instructions for Test-Driven Development

---

## Prerequisites

### Required Software
- **Node.js**: v24.x LTS
- **npm**: v10.0.0 or higher
- **Git**: v2.40.0 or higher
- **Docker**: v24.0.0 or higher (for local services)
- **VS Code**: Latest version (recommended IDE)

### Recommended System Requirements
- **OS**: Windows 11, macOS 13+, or Ubuntu 22.04+
- **RAM**: Minimum 8GB, recommended 16GB
- **Storage**: 10GB free space
- **CPU**: 4+ cores recommended

---

## Initial Project Setup

### 1. Clone Repository
```bash
# Clone the repository
git clone https://github.com/pour-people/host.git
cd host

# Verify you're on the main branch
git branch
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all

# Verify installation
npm run check:deps
```

#### patch-package Auto-Application

The project uses **patch-package** to apply persistent patches to node_modules dependencies. These patches are **automatically applied** after every `npm install` via a postinstall hook.

**What it patches:**
- **m3-svelte (v5.9.0+)**: Adds TypeScript type definitions to subpath exports
  - Enables direct component imports: `import Button from 'm3-svelte/package/buttons/Button.svelte'`
  - Adds `types` field to package.json exports for proper TypeScript resolution

**How it works:**
1. Patches are stored in `patches/` directory (e.g., `patches/m3-svelte+5.9.0.patch`)
2. `postinstall` script in root `package.json` runs `patch-package` after install
3. Patches are automatically re-applied if you delete/reinstall node_modules

**No manual action required** - patches apply automatically during normal development workflow.

**Creating new patches** (advanced):
```bash
# 1. Manually edit a file in node_modules/package-name
# 2. Generate the patch file
npx patch-package package-name

# 3. Commit the generated patch file in patches/ directory
git add patches/package-name+version.patch
git commit -m "patch: Add custom modifications to package-name"
```

### 3. Environment Configuration
```bash
# Copy environment templates
cp .env.example .env.local
cp apps/pos/.env.example apps/pos/.env.local
cp apps/kds/.env.example apps/kds/.env.local
cp apps/admin/.env.example apps/admin/.env.local

# Edit environment files with your values
# See "Environment Variables" section below for details
```

### 4. Database Setup

#### Database Development Workflow

**Choose Your Development Strategy:**

**Option 1: Local SQLite (Quickstart)**
```bash
# Best for: Offline development, testing, rapid prototyping
# Uses: Local file:./dev.db

# Set in apps/pos/.env.local
DATABASE_URL=file:./dev.db
# No auth token needed

# Run migrations
npm run db:migrate

# Seed development data
npm run db:seed
```

**Option 2: Turso Local (Docker)**
```bash
# Best for: Testing sync behavior, multi-tab testing
# Uses: libSQL server in Docker

# Start Turso local server
docker-compose up -d turso-local

# Set in apps/pos/.env.local
DATABASE_URL=libsql://127.0.0.1:8081
# No auth token for local

# Run migrations
npm run db:migrate

# Seed development data
npm run db:seed
```

**Option 3: Turso Cloud (Recommended for Team Development)**
```bash
# Best for: Team collaboration, testing production behavior
# Uses: Turso hosted database with edge replication

# 1. Sign up at https://turso.tech
turso auth signup

# 2. Create a database
turso db create host-dev

# 3. Get connection details
turso db show host-dev --url
turso db tokens create host-dev

# 4. Set in apps/pos/.env.local
DATABASE_URL=libsql://your-db.turso.io
DATABASE_AUTH_TOKEN=your-token-here

# Optional: Enable sync for offline testing
TURSO_SYNC_URL=libsql://your-db.turso.io  # Cloud database URL
TURSO_SYNC_INTERVAL=60  # Sync every 60 seconds

# Run migrations
npm run db:migrate

# Seed development data
npm run db:seed
```

#### Understanding TURSO_SYNC_URL

The `TURSO_SYNC_URL` enables **embedded replica** mode:

- **Local-First**: App uses local SQLite database
- **Background Sync**: Changes sync to cloud every `TURSO_SYNC_INTERVAL` seconds
- **Offline Support**: App works fully offline, syncs when reconnected
- **Conflict Resolution**: Last-write-wins by default

**When to use sync:**
- ✅ Testing offline mode functionality
- ✅ Developing multi-device features
- ✅ Simulating production edge behavior
- ❌ Simple CRUD development (use local SQLite)
- ❌ Schema migrations (use direct connection)

#### Migration Path

**Development Flow:**
1. **Start**: Local SQLite (`file:./dev.db`)
2. **Team Sync**: Upgrade to Turso Cloud for collaboration
3. **Offline Testing**: Enable `TURSO_SYNC_URL` for embedded replicas
4. **Production**: Use Turso Cloud with global replication

### 5. Install Biome for Linting
```bash
# Install Biome globally (optional)
npm install -g @biomejs/biome

# Or use it through npm scripts (recommended)
npm run lint
npm run format
```

---

## Environment Variables

### Root `.env.local`
```env
# Node Environment
NODE_ENV=development

# Workspace Configuration
TURBO_TEAM=your-team
TURBO_TOKEN=your-turbo-token

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=debug
```

### Application `.env.local` (`apps/pos/.env.local`)
```env
# Application
PUBLIC_APP_NAME="HOST POS"
PUBLIC_APP_VERSION=0.1.0
PUBLIC_APP_ENV=development

# API Configuration
PUBLIC_API_URL=http://localhost:3000
PUBLIC_WS_URL=ws://localhost:3000

# Keycloak Configuration
PUBLIC_KEYCLOAK_URL=http://localhost:8080
PUBLIC_KEYCLOAK_REALM=host-pos
PUBLIC_KEYCLOAK_CLIENT_ID=host-pos-web

# Feature Flags
PUBLIC_ENABLE_OFFLINE_MODE=true
PUBLIC_ENABLE_DEBUG_MODE=true
PUBLIC_ENABLE_ANALYTICS=false

# Public Keys
PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...

# Private Keys (Server-side only)
PRIVATE_API_KEY=your-api-key
```

### API Service `.env.local` (`services/api/.env.local`)
```env
# Server Configuration
PORT=3000
HOST=localhost

# Database - Turso
DATABASE_URL=libsql://your-db.turso.io
DATABASE_AUTH_TOKEN=your-auth-token

# Alternative: Local SQLite for development
# DATABASE_URL=file:./local.db

# Redis Cache
REDIS_URL=redis://localhost:6379
# Or use Upstash for cloud Redis
# REDIS_URL=redis://default:password@endpoint.upstash.io:6379

# Keycloak Authentication
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=host-pos
KEYCLOAK_CLIENT_ID=host-pos-api
KEYCLOAK_CLIENT_SECRET=your-client-secret
SESSION_SECRET=your-session-secret-min-32-chars
ENCRYPTION_KEY=your-64-char-hex-encryption-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Service (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@host-pos.com

# File Storage (S3 or R2)
S3_BUCKET=host-uploads
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key

# External APIs
OPENAI_API_KEY=sk-... # For AI features
TWILIO_ACCOUNT_SID=AC... # For SMS
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## Docker Development Environment

### Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  # Keycloak Identity Server
  keycloak:
    image: quay.io/keycloak/keycloak:25.0
    command: start-dev
    environment:
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=admin
      - KC_DB=postgres
      - KC_DB_URL=jdbc:postgresql://postgres:5432/keycloak
      - KC_DB_USERNAME=keycloak
      - KC_DB_PASSWORD=keycloak
      - KC_HOSTNAME=localhost
      - KC_HOSTNAME_PORT=8080
      - KC_HOSTNAME_STRICT=false
      - KC_HOSTNAME_STRICT_HTTPS=false
      - KC_HTTP_ENABLED=true
      - KC_HTTP_PORT=8080
      - KC_HEALTH_ENABLED=true
      - KC_METRICS_ENABLED=true
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health/ready"]
      interval: 30s
      timeout: 3s
      retries: 3

  # PostgreSQL for Keycloak
  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=keycloak
      - POSTGRES_USER=keycloak
      - POSTGRES_PASSWORD=keycloak
    ports:
      - "5432:5432"
    volumes:
      - ./data/postgres:/var/lib/postgresql/data

  # Local Turso/SQLite (Production-ready edge database)
  turso-local:
    image: ghcr.io/tursodatabase/libsql-server:latest
    ports:
      - "8081:8080"
    volumes:
      - ./data/turso:/var/lib/sqld
    environment:
      - SQLD_NODE=primary

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - ./data/redis:/data

  # LocalStack for S3 simulation
  localstack:
    image: localstack/localstack:latest
    ports:
      - "4566:4566"
    environment:
      - SERVICES=s3
      - DEBUG=1
    volumes:
      - ./data/localstack:/var/lib/localstack

  # Mailhog for email testing
  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025" # SMTP
      - "8025:8025" # Web UI
```

### Start Docker Services
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d redis

# View logs
docker-compose logs -f turso-local

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## Keycloak Initial Setup

### 1. Start Keycloak
```bash
# Start Keycloak and PostgreSQL
docker-compose up -d keycloak postgres

# Wait for Keycloak to be ready (about 30-60 seconds)
docker-compose logs -f keycloak

# Access Keycloak Admin Console
# URL: http://localhost:8080/admin
# Username: admin
# Password: admin
```

### 2. Configure Keycloak Realm
```bash
# Import the pre-configured realm (if provided)
docker exec -it keycloak /opt/keycloak/bin/kc.sh import --file /tmp/host-pos-realm.json

# Or manually configure:
# 1. Login to Admin Console
# 2. Create new realm "host-pos"
# 3. Configure realm settings (see docs/security-authentication.md)
```

### 3. Create Clients
```bash
# Frontend Client (host-pos-web)
# - Client ID: host-pos-web
# - Client Protocol: openid-connect
# - Access Type: public
# - Valid Redirect URIs: http://localhost:5173/*
# - Web Origins: http://localhost:5173

# API Client (host-pos-api)
# - Client ID: host-pos-api
# - Client Protocol: openid-connect
# - Access Type: confidential
# - Service Accounts Enabled: true
```

### 4. Create Test Users
```bash
# Create users through Admin Console:
# 1. Admin User
#    - Username: admin@host-pos.com
#    - Email: admin@host-pos.com
#    - Roles: admin

# 2. Manager User
#    - Username: manager@host-pos.com
#    - Email: manager@host-pos.com
#    - Roles: manager

# 3. Server User
#    - Username: server@host-pos.com
#    - Email: server@host-pos.com
#    - Roles: server
#    - Custom Attribute: venue_pin_venue1 = [hashed PIN]
```

### 5. Configure PIN Authentication
```bash
# Deploy custom PIN authenticator (if using)
# See keycloak/authenticators/README.md for deployment instructions

# Configure authentication flow:
# 1. Go to Authentication > Flows
# 2. Copy "Direct Grant" flow
# 3. Add "PIN Authenticator" execution
# 4. Set as Required
```

---

## Development Workflow

### 1. Start Development Servers
```bash
# Start all services in development mode
npm run dev

# Or start specific workspaces
npm run dev:pos    # POS application
npm run dev:kds    # Kitchen Display System
npm run dev:admin  # Admin dashboard

# Start with debugging
npm run dev:debug
```

### 2. Run Tests (TDD Workflow)
```bash
# Run all tests in watch mode
npm run test:watch

# Run specific test suites
npm run test:unit       # Unit tests only
npm run test:integration # Integration tests
npm run test:e2e        # E2E tests (requires running app)

# Run tests with coverage
npm run test:coverage

# Run tests for specific workspace
npm run test --workspace=@host/web
```

### 3. Code Quality Checks
```bash
# Run Biome linting
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run typecheck

# Run all checks (pre-commit)
npm run check:all
```

### 4. Database Management
```bash
# Create new migration
npm run db:migrate:create add_user_preferences

# Run migrations
npm run db:migrate

# Rollback last migration
npm run db:migrate:rollback

# Reset database
npm run db:reset

# Open database studio
npm run db:studio
```

---

## VS Code Configuration

### Recommended Extensions
```json
// .vscode/extensions.json
{
  "recommendations": [
    "biomejs.biome",
    "bradlc.vscode-tailwindcss",
    "svelte.svelte-vscode",
    "formulahendry.auto-rename-tag",
    "github.copilot",
    "gruntfuggly.todo-tree",
    "ms-playwright.playwright",
    "prisma.prisma",
    "usernamehw.errorlens",
    "vitest.explorer",
    "yoavbls.pretty-ts-errors"
  ]
}
```

### Workspace Settings
```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[svelte]": {
    "editor.defaultFormatter": "svelte.svelte-vscode"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "files.exclude": {
    "**/.turbo": true,
    "**/dist": true,
    "**/node_modules": true
  },
  "search.exclude": {
    "**/.turbo": true,
    "**/dist": true,
    "**/node_modules": true,
    "package-lock.json": true
  }
}
```

### Debug Configuration
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug API",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev:api:debug"],
      "skipFiles": ["<node_internals>/**"],
      "sourceMaps": true,
      "envFile": "${workspaceFolder}/services/api/.env.local",
      "console": "integratedTerminal"
    },
    {
      "name": "Debug POS App",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/apps/pos",
      "sourceMaps": true
    },
    {
      "name": "Debug SvelteKit Server",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev:pos"],
      "skipFiles": ["<node_internals>/**"],
      "sourceMaps": true,
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "test:debug"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

---

## Git Workflow

### Branch Naming Convention
```bash
# Feature branches
feature/POS-123-order-management

# Bug fixes
fix/POS-456-payment-calculation

# Hotfixes
hotfix/POS-789-critical-auth-bug

# Release branches
release/v0.1.0
```

### Commit Message Format
```bash
# Format: <type>(<scope>): <subject>

# Examples:
feat(orders): add split check functionality
fix(auth): resolve session timeout issue
test(payments): add integration tests for Stripe
docs(api): update endpoint documentation
refactor(inventory): improve depletion calculation
chore(deps): update dependencies
```

### Pre-commit Hooks (Husky)
```bash
# Install Husky
npm run prepare

# Pre-commit hook runs:
# 1. Biome linting
# 2. Type checking
# 3. Unit tests for changed files
# 4. Commit message validation
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check Turso connection
curl https://your-db.turso.io/v2/pipeline

# Test local SQLite
npm run db:test-connection

# Reset database
npm run db:reset
```

#### 2. Port Conflicts
```bash
# Check if ports are in use
netstat -tulnp | grep 3000  # Linux/Mac
netstat -an | findstr :3000 # Windows

# Change ports in .env files
# API: PORT=3001
# POS: PORT=5174
# KDS: PORT=5175
# Admin: PORT=5176
```

#### 3. Dependency Issues
```bash
# Clear all node_modules
npm run clean

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install

# Check for peer dependency issues
npm ls
```

#### 4. Build Issues
```bash
# Clear build cache
npm run clean:build

# Clear Turbo cache
npm run clean:turbo

# Rebuild everything
npm run build:fresh
```

#### 5. Test Failures
```bash
# Run tests with verbose output
npm run test:verbose

# Debug specific test
npm run test -- --grep="should create order"

# Update snapshots
npm run test:update-snapshots
```

---

## Performance Monitoring

### Local Performance Testing
```bash
# Run performance tests
npm run test:perf

# Generate lighthouse report
npm run lighthouse

# Bundle analysis
npm run analyze:bundle
```

### Development Metrics Dashboard
Access development metrics at:
- **API Metrics**: http://localhost:3000/metrics
- **Bundle Analyzer**: http://localhost:8888
- **Database Studio**: http://localhost:5555

---

## Deployment Preparation

### Build for Production
```bash
# Run production build
npm run build

# Test production build locally
npm run preview

# Run production tests
npm run test:prod

# Generate build report
npm run build:report
```

### Environment Validation
```bash
# Validate all environment variables
npm run env:validate

# Check for security issues
npm run security:check

# Audit dependencies
npm audit
```

---

## Additional Resources

### Documentation
- **API Documentation**: http://localhost:3000/docs
- **Storybook**: http://localhost:6006
- **Test Coverage**: http://localhost:8080/coverage

### Useful Scripts
```bash
# Generate new component
npm run generate:component Button

# Generate new API endpoint
npm run generate:api users

# Generate migration
npm run generate:migration add_column

# Update dependencies
npm run deps:update

# Check outdated packages
npm run deps:check
```

### Support Channels
- **GitHub Issues**: https://github.com/pour-people/host/issues
- **Discord**: https://discord.gg/host-pos
- **Documentation**: https://docs.host-pos.com

---

*Last Updated: September 29, 2025*
*Version: 0.1.0-alpha*
*Maintained by: HOST Development Team*