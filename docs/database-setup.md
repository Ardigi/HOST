# Database Setup Guide

## Quick Start (Local Development)

For immediate local development without cloud setup:

```bash
# In packages/database directory
cd packages/database

# Use local SQLite (already configured in .env.local)
npm run db:push

# Verify tables created
npm run db:studio
```

This creates a `dev.db` file locally - perfect for development.

---

## Turso Cloud Setup (Recommended)

### Step 1: Install Turso CLI

**Windows (PowerShell):**
```powershell
irm https://tur.so/install.ps1 | iex
```

**macOS/Linux:**
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

### Step 2: Create Turso Account

```bash
# Sign up (opens browser)
turso auth signup

# Verify login
turso auth whoami
```

### Step 3: Create Database

```bash
# Create database
turso db create host-pos-dev

# Get database URL
turso db show host-pos-dev --url
# Output: libsql://host-pos-dev-[your-org].turso.io

# Create auth token
turso db tokens create host-pos-dev
# Output: eyJ... (copy this token)
```

### Step 4: Configure Environment

Edit `packages/database/.env.local`:

```bash
# Replace with your values from Step 3
DATABASE_URL=libsql://host-pos-dev-[your-org].turso.io
DATABASE_AUTH_TOKEN=eyJ...your-token-here
```

### Step 5: Push Schema

```bash
cd packages/database

# Push schema to Turso
npm run db:push

# Verify with Drizzle Studio
npm run db:studio
```

---

## Turso Embedded Replicas (Production-like)

For offline-first development with cloud sync:

```bash
# In packages/database/.env.local
DATABASE_URL=file:./local.db
TURSO_SYNC_URL=libsql://host-pos-dev-[your-org].turso.io
DATABASE_AUTH_TOKEN=your-token-here
```

This creates a local database that syncs to Turso cloud.

---

## Database Commands

```bash
# Generate migration files
npm run db:generate

# Push schema without migrations
npm run db:push

# Apply migrations
npm run db:migrate

# Open Drizzle Studio GUI
npm run db:studio

# Create seed data
npm run db:seed
```

---

## Troubleshooting

### "DATABASE_URL not found"
- Ensure `.env.local` exists in `packages/database/`
- Check file has `DATABASE_URL=...` line
- Restart terminal after creating file

### "Authentication failed"
- Re-generate token: `turso db tokens create host-pos-dev`
- Update `DATABASE_AUTH_TOKEN` in `.env.local`

### "Database not found"
- List databases: `turso db list`
- Create if missing: `turso db create host-pos-dev`

### Permission errors
- Check Turso organization: `turso org list`
- Switch org if needed: `turso org switch [org-name]`

---

## Multi-Environment Setup

### Development
```bash
# Local SQLite
DATABASE_URL=file:./dev.db
```

### Staging
```bash
# Turso staging database
DATABASE_URL=libsql://host-pos-staging-[org].turso.io
DATABASE_AUTH_TOKEN=staging-token
```

### Production
```bash
# Turso production with replicas
DATABASE_URL=libsql://host-pos-prod-[org].turso.io
DATABASE_AUTH_TOKEN=production-token
```

---

## Next Steps

After database setup:
1. Run seed script: `npm run db:seed`
2. Verify in Studio: `npm run db:studio`
3. Run tests: `npm test`
4. Continue to API layer setup
