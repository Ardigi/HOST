# HOST Technology Stack - 2025 Versions

This document lists the official versions and documentation sources for all technologies used in the HOST POS system.

## Frontend Stack

### Svelte 5
- **Version**: 5.16.0+
- **Official Docs**: https://svelte.dev/docs/svelte
- **Key Features**: Runes (`$state`, `$derived`, `$effect`), fine-grained reactivity
- **Migration Guide**: https://svelte.dev/docs/svelte/v5-migration-guide

### SvelteKit 2.x
- **Version**: 2.15.2+
- **Official Docs**: https://svelte.dev/docs/kit
- **Key Features**: File-based routing, server-side rendering, form actions
- **Latest Updates**: Vite 7 support, `$app/state` based on runes API

### Tailwind CSS 4.0
- **Version**: 4.0.0+
- **Official Docs**: https://tailwindcss.com/blog/tailwindcss-v4
- **Breaking Change**: CSS-first configuration using `@theme` directive
- **Migration**: No `tailwind.config.js` needed - configure in CSS
- **Browser Support**: Safari 16.4+, Chrome 111+, Firefox 128+

## Backend Stack

### Node.js
- **Version**: 24.x LTS
- **Required**: >=24.0.0
- **Official Docs**: https://nodejs.org/

### TypeScript
- **Version**: 5.7.2+
- **Required**: >=5.7.2 (for tRPC v11)
- **Official Docs**: https://www.typescriptlang.org/
- **Configuration**: Strict mode enabled

### tRPC
- **Version**: v11 (Released March 2025)
- **Official Docs**: https://trpc.io/docs/
- **Breaking Changes**: Non-JSON content types, FormData support, SSE subscriptions
- **Migration Guide**: https://trpc.io/docs/migrate-from-v10-to-v11

## Database Stack

### Turso (LibSQL)
- **Official Docs**: https://docs.turso.tech/
- **Type**: SQLite-compatible edge database
- **Features**: Global replication, embedded replicas, sub-10ms reads

### Drizzle ORM
- **Version**: 0.36.4+
- **Official Docs**: https://orm.drizzle.team/
- **Turso Integration**: https://orm.drizzle.team/docs/connect-turso
- **Important**: Use `dialect: 'turso'` (not `driver` - deprecated)
- **Configuration**: Use `defineConfig` from drizzle-kit

## Authentication

### Keycloak
- **Version**: 26.3 (Latest stable as of 2025)
- **Note**: No LTS version exists (25.0 was NOT LTS)
- **Official Docs**: https://www.keycloak.org/documentation
- **Commercial Support**: Red Hat build of Keycloak for LTS
- **Features**: OpenID Connect, OAuth 2.0, SSO

## Testing Stack

### Vitest
- **Version**: 2.1.8+
- **Official Docs**: https://vitest.dev/
- **Latest**: Version 3.2 released (latest stable)
- **Configuration**: https://vitest.dev/config/

### Playwright
- **Version**: 1.49.1+
- **Official Docs**: https://playwright.dev/docs/test-configuration
- **Features**: Cross-browser testing, trace viewer, parallel execution

### Testing Library
- **Svelte Testing Library**: 5.2.7+
- **Official Docs**: https://testing-library.com/docs/svelte-testing-library/intro

## Build Tools

### Vite
- **Version**: 6.0.7+
- **Official Docs**: https://vite.dev/
- **Features**: Fast HMR, optimized builds, native ESM

### Turborepo
- **Version**: 2.3.3+ (Latest: 2.5)
- **Official Docs**: https://turborepo.com/
- **New Features (2.5)**:
  - Sidecar tasks with `with`
  - `--continue` flag
  - `turbo.jsonc` support for comments
  - `$TURBO_ROOT$` variable

## Code Quality

### Biome
- **Version**: 1.9.4+
- **Latest**: 2.0 released (with type-aware linting)
- **Official Docs**: https://biomejs.dev/
- **Configuration**: https://biomejs.dev/guides/configure-biome/

## Infrastructure

### Docker
- **Required**: 24.0.0+
- **Services**: Keycloak 26.3, PostgreSQL 16, Redis 7, LibSQL

### Redis
- **Version**: 7-alpine
- **Use Case**: Session storage, caching

### PostgreSQL
- **Version**: 16-alpine
- **Use Case**: Keycloak database

## Version Compatibility Matrix

| Technology | Minimum | Recommended | Breaking Changes |
|-----------|---------|-------------|-----------------|
| Node.js | 24.0.0 | 24.x LTS | N/A |
| TypeScript | 5.7.2 | 5.7.2+ | Required for tRPC v11 |
| Svelte | 5.16.0 | 5.16.0+ | Runes are optional |
| SvelteKit | 2.15.2 | 2.15.2+ | Compatible with Vite 7 |
| Tailwind CSS | 4.0.0 | 4.0.0+ | CSS-first config |
| tRPC | v11 | v11+ | See migration guide |
| Drizzle | 0.36.4 | 0.36.4+ | Use dialect, not driver |
| Keycloak | 26.0 | 26.3+ | No LTS available |

## Migration Notes

### From Documentation to Reality

**Keycloak 25.0 "LTS"**
- ❌ Documentation claimed 25.0 LTS
- ✅ Reality: No LTS version, using 26.3 latest stable

**Tailwind CSS Configuration**
- ❌ Traditional `tailwind.config.js`
- ✅ CSS-first with `@theme` directive in `app.css`

**Drizzle Configuration**
- ❌ `driver: 'turso'` (deprecated)
- ✅ `dialect: 'turso'` with `defineConfig`

**tRPC**
- ❌ v10 patterns
- ✅ v11 with FormData, SSE, TypeScript 5.7.2+

## Official Documentation Links

### Primary Resources
- **Svelte**: https://svelte.dev/
- **SvelteKit**: https://svelte.dev/docs/kit
- **Tailwind CSS**: https://tailwindcss.com/
- **tRPC**: https://trpc.io/
- **Drizzle ORM**: https://orm.drizzle.team/
- **Turso**: https://docs.turso.tech/
- **Keycloak**: https://www.keycloak.org/
- **Vitest**: https://vitest.dev/
- **Playwright**: https://playwright.dev/
- **Turborepo**: https://turborepo.com/
- **Biome**: https://biomejs.dev/

---

*Last Verified: 2025-09-29*
*All versions and documentation links confirmed as of this date.*