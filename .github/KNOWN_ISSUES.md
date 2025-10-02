# Known Issues

This document tracks known technical issues and their workarounds.

## TypeScript Type Errors in m3-svelte (Svelte 5)

**Issue:** TypeScript reports "Expression produces a union type that is too complex to represent" errors for m3-svelte components.

**Affected Files:**
- `node_modules/m3-svelte/package/buttons/Button.svelte.d.ts`
- `node_modules/m3-svelte/package/containers/Card.svelte.d.ts`
- `node_modules/m3-svelte/package/containers/ListItem.svelte.d.ts`
- `node_modules/m3-svelte/package/forms/Chip.svelte.d.ts`
- `node_modules/m3-svelte/package/nav/NavCMLXItem.svelte.d.ts`

**Root Cause:** m3-svelte's use of complex `ActionProps` unions exceeds TypeScript's complexity limits in Svelte 5's type system.

**Status:** Upstream issue - waiting for m3-svelte or TypeScript improvements

**Workarounds:**
1. **Development:** TypeScript errors don't affect runtime - app works correctly
2. **CI/CD:** Use `skipLibCheck: true` in tsconfig.json for builds
3. **Type Safety:** Our code is still type-safe; only library type definitions are affected

**Tracking:**
- m3-svelte issue: [Link to issue when filed]
- TypeScript issue: https://github.com/microsoft/TypeScript/issues/[number]

**Mitigation:**
```json
// apps/pos/tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": true  // Skip type checking of declaration files
  }
}
```

---

## @vitest/browser ExpectPollOptions

**Issue:** `Cannot find name 'ExpectPollOptions'` in @vitest/browser matchers

**Status:** Minor type definition issue in @vitest/browser package

**Workaround:** Does not affect test execution - only type checking

---

*Last Updated: 2025-10-02*
