# Database Migrations Guide

This guide explains how to manage database migrations for the HOST POS system using Drizzle Kit.

## Overview

We use Drizzle ORM with Turso (LibSQL) for database management. Migrations are generated automatically from TypeScript schema files and pushed to the production database.

## Prerequisites

- Node.js installed
- Turso database credentials (URL and auth token)
- Environment variables configured

## Environment Setup

Create a `.env` file in `packages/database/`:

```env
DATABASE_URL=libsql://host-ardigi.aws-us-east-1.turso.io
DATABASE_AUTH_TOKEN=your_auth_token_here
```

**⚠️ Security**: Never commit the `.env` file to git. It's already in `.gitignore`.

## Available Commands

```bash
# Generate migration files from schema changes
npm run db:generate

# Push schema changes to Turso database
npm run db:push

# Push with auto-approval (use with caution)
npm run db:push -- --force

# Open Drizzle Studio to view/edit database
npm run db:studio
```

## Workflow

### 1. Making Schema Changes

Edit schema files in `src/schema/`:
- `venues.ts` - Venue/location information
- `users.ts` - User accounts and authentication
- `orders.ts` - Orders and order items
- `menu.ts` - Menu items, categories, modifiers
- `inventory.ts` - Inventory management (5 tables)
- `payments.ts` - Payment processing

### 2. Generate Migration

After modifying schemas:

```bash
cd packages/database
npm run db:generate
```

This creates a new migration file in `drizzle/` folder with SQL statements.

### 3. Review Migration

Always review the generated SQL in `drizzle/XXXX_migration_name.sql` before applying:
- Check for data loss statements
- Verify foreign key constraints
- Ensure indexes are correct

### 4. Apply Migration

Push to production database:

```bash
npm run db:push
```

You'll be prompted to confirm. Review the changes carefully.

For CI/CD pipelines, use:

```bash
npm run db:push -- --force
```

## Current Schema (v0.1.0)

**16 tables deployed:**

### Core Tables
- `venues` - Restaurant/bar locations
- `users` - Staff and admin accounts

### Order Management
- `orders` - Customer orders
- `order_items` - Line items
- `order_item_modifiers` - Item customizations

### Menu System
- `menu_categories` - Menu sections
- `menu_items` - Food/drink items
- `menu_modifier_groups` - Modifier categories (size, toppings, etc.)
- `menu_modifiers` - Individual modifiers
- `menu_item_modifier_groups` - Junction table

### Inventory Management
- `inventory_items` - Stock items
- `inventory_transactions` - Stock movements (pours, waste, etc.)
- `inventory_suppliers` - Vendor information
- `inventory_purchase_orders` - Purchase orders
- `inventory_purchase_order_items` - PO line items

### Payments
- `payments` - Payment transactions (split checks, tips, refunds, comps)

## Bar-Specific Features

Our schema is optimized for bar/restaurant operations:

**Inventory:**
- Categories: liquor, beer, wine, food, supplies
- Units: bottle, keg, case, pound, gallon, liter
- Transaction types: purchase, usage (pours), waste (spillage), adjustment, transfer
- Par levels and reorder points

**Payments:**
- Split check support (multiple payments per order)
- Tip tracking separate from payment amount
- Comp/house payments with reason tracking
- Full and partial refund support
- Payment methods: card, cash, check, gift_card, comp

**Menu:**
- Modifier groups for customization
- Dietary flags (vegetarian, vegan, gluten-free)
- Availability tracking
- Preparation time estimates

## Troubleshooting

### Error: Cannot find module

If you see module resolution errors:
- Ensure all schema files use relative imports without `.js` extension
- Check that `drizzle.config.ts` excludes test files: `schema: './src/schema/!(*.test).ts'`

### Connection Error

If push fails with connection error:
- Verify `DATABASE_URL` is correct
- Check `DATABASE_AUTH_TOKEN` is valid (tokens expire after ~30 days)
- Ensure you have network access to Turso

### Foreign Key Constraints

If foreign key errors occur:
- Tables must be created in dependency order (venues → users → orders → payments)
- Drizzle handles this automatically in generated migrations

## Best Practices

1. **Always test locally first** - Use test database with in-memory SQLite
2. **Review generated SQL** - Never blindly push migrations
3. **Backup before major changes** - Turso has point-in-time recovery
4. **Use transactions** - All migrations run in a transaction (automatic)
5. **Document breaking changes** - Update this file when schema changes significantly

## Migration History

### v0.1.0 (Initial Deploy)
- Created all 16 base tables
- Established foreign key relationships
- Added unique constraints and indexes
- Bar-optimized schema design

Migration file: `drizzle/0000_friendly_husk.sql`
