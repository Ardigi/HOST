# m3-svelte Integration Guide
## Material Design 3 with Svelte 5 for HOST POS

---

## Table of Contents

- [Introduction](#introduction)
- [Understanding m3-svelte](#understanding-m3-svelte)
- [TypeScript "Too Complex" Errors](#typescript-too-complex-errors)
- [Component Patterns](#component-patterns)
- [Creating POS Wrappers](#creating-pos-wrappers)
- [Event Handling](#event-handling)
- [Snippets & Children](#snippets--children)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)

---

## Introduction

m3-svelte is our Material Design 3 component library for Svelte 5. This guide explains how to properly integrate m3-svelte components with Svelte 5 runes, handle TypeScript limitations, and create POS-optimized wrapper components.

### Why m3-svelte?

From [ADR-003](adr/ADR-003-material-design-3.md), we chose m3-svelte because:
- **50+ components** (vs 16 in official @material/web)
- **Native Svelte 5** implementation (no Web Components overhead)
- **3x smaller bundle** (~150KB vs ~450KB)
- **Built-in accessibility** (WCAG 2.1 AA compliant)
- **Touch-optimized** (Material Design 3 specifications)

### Package Info

```json
{
  "dependencies": {
    "m3-svelte": "^5.9.0"
  }
}
```

---

## Understanding m3-svelte

### Component Architecture

m3-svelte components use Svelte 5 runes and modern patterns:

```svelte
<!-- From m3-svelte/Button.svelte -->
<script lang="ts">
  type Props = {
    variant?: "elevated" | "filled" | "tonal" | "outlined" | "text";
    square?: boolean;
    iconType?: "none" | "left" | "full";
    children: Snippet;
  } & ActionProps;

  let props: Props = $props();
</script>
```

### Key Features

1. **Polymorphic Components**: Button can be `<button>`, `<a>`, `<label>`, or `<summary>` depending on props
2. **Snippet-based Children**: Uses Svelte 5 snippets instead of slots
3. **Event Properties**: Uses `onclick` instead of `on:click`
4. **TypeScript Types**: Full type definitions (with some complexity issues)

---

## TypeScript "Too Complex" Errors

### The Problem

When using m3-svelte components, you may see TypeScript errors like:

```
Error: Expression produces a union type that is too complex to represent.
  declare const Button: import("svelte").Component<Props, {}, "">;
```

### Why This Happens

m3-svelte components use **complex union types** to support polymorphism:

```typescript
// Button can be ANY of these element types
type ActionProps = LabelAttrs | AnchorAttrs | SummaryAttrs | HTMLButtonAttributes;

// Props is the intersection of component props and element attributes
type Props = {
  variant?: "elevated" | "filled" | "tonal" | "outlined" | "text";
  children: Snippet;
} & ActionProps;  // ← This union is too complex for TypeScript
```

### This is NOT a Runtime Error

**IMPORTANT**: These are **library-level type definition errors**, not runtime errors. The components work perfectly at runtime!

```svelte
<script lang="ts">
import { Button } from 'm3-svelte';

// ❌ TypeScript shows "too complex" error in library definition
// ✅ But the component works perfectly!
</script>

<Button variant="filled" onclick={() => console.log('Clicked')}>
  Click Me
</Button>
```

### The Solution: Wrapper Components

Create wrapper components with **simpler, explicit type signatures**:

```svelte
<!-- POSButton.svelte -->
<script lang="ts">
import { Button } from 'm3-svelte';
import type { Snippet } from 'svelte';

// ✅ Simple, explicit interface
interface Props {
  variant?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';
  disabled?: boolean;
  size?: 'minimum' | 'comfortable' | 'critical';
  onclick?: (event: MouseEvent) => void;
  children: Snippet;
}

let {
  variant = 'filled',
  disabled = false,
  size = 'comfortable',
  onclick,
  children
}: Props = $props();
</script>

<Button
  {variant}
  {disabled}
  {onclick}
  style:min-height="{size === 'critical' ? '80px' : size === 'comfortable' ? '56px' : '48px'}"
>
  {@render children()}
</Button>
```

Now the wrapper has clean types, and m3-svelte's complexity is hidden!

---

## Component Patterns

### Button Component

**Basic Usage**:
```svelte
<script lang="ts">
import { Button } from 'm3-svelte';

function handleClick() {
  console.log('Button clicked!');
}
</script>

<Button variant="filled" onclick={handleClick}>
  Click Me
</Button>

<Button variant="outlined">
  Outlined Button
</Button>

<Button variant="text">
  Text Button
</Button>
```

**Variants**:
- `filled` - High emphasis (primary actions)
- `outlined` - Medium emphasis (secondary actions)
- `text` - Low emphasis (tertiary actions)
- `elevated` - Floating appearance
- `tonal` - Filled with tonal color

### Card Component

**Basic Usage**:
```svelte
<script lang="ts">
import { Card } from 'm3-svelte';
</script>

<Card variant="elevated">
  <div style="padding: 1.5rem;">
    <h3>Card Title</h3>
    <p>Card content goes here</p>
  </div>
</Card>
```

**Variants**:
- `elevated` - Floating with shadow
- `filled` - Filled background
- `outlined` - Border outline

**Important**: `variant` prop is **required** for Card!

```svelte
<!-- ❌ ERROR: variant is required -->
<Card>
  Content
</Card>

<!-- ✅ CORRECT -->
<Card variant="filled">
  Content
</Card>
```

---

## Creating POS Wrappers

All m3-svelte components should be wrapped with POS-specific enhancements following [md3-component-checklist.md](checklists/md3-component-checklist.md).

### POSCard Example (Reference Implementation)

**From our codebase** (`apps/pos/src/lib/components/POSCard.svelte`):

```svelte
<script lang="ts">
/**
 * POS-optimized Card component
 * Wraps m3-svelte Card with enhanced touch targets and spacing
 *
 * @component
 */
import { Card } from 'm3-svelte';
import type { Snippet } from 'svelte';

interface Props {
	/**
	 * Card visual variant
	 * - elevated: Floating with shadow (default)
	 * - filled: Filled background
	 * - outlined: Border outline
	 */
	variant?: 'elevated' | 'filled' | 'outlined';

	/**
	 * Card content (Svelte 5 snippet)
	 */
	children: Snippet;

	/**
	 * Optional click handler
	 */
	onclick?: () => void;

	/**
	 * Additional CSS classes
	 */
	class?: string;
}

// biome-ignore lint/correctness/noUnusedVariables: All props are forwarded to Card component
let { variant = 'elevated', children, onclick, class: className = '' }: Props = $props();
</script>

<Card {variant} {onclick} class="pos-card {className}">
	{@render children()}
</Card>

<style>
	/* POS-optimized spacing */
	:global(.pos-card) {
		padding: 1.5rem; /* 24px - Enhanced from MD3 default 16px */
		min-height: var(--host-touch-target-comfortable); /* 56px minimum for comfortable touch */
		border-radius: var(--md-sys-shape-corner-medium);
		transition: all var(--host-transition-fast);
	}

	/* Ensure adequate spacing for touch */
	:global(.pos-card > *) {
		margin-bottom: 0.75rem;
	}

	:global(.pos-card > *:last-child) {
		margin-bottom: 0;
	}
</style>
```

### Wrapper Component Checklist

✅ **Simple, Explicit Props Interface**
```typescript
interface Props {
  variant?: 'elevated' | 'filled' | 'outlined';  // Explicit enum
  children: Snippet;  // Required
  onclick?: () => void;  // Optional with simple signature
  class?: string;  // Optional CSS classes
}
```

✅ **POS-Optimized Touch Targets**
```css
:global(.pos-card) {
  min-height: var(--host-touch-target-comfortable); /* 56px */
  padding: 1.5rem; /* Enhanced from 16px to 24px */
}
```

✅ **Forward All Props to m3-svelte Component**
```svelte
<Card {variant} {onclick} class="pos-card {className}">
  {@render children()}
</Card>
```

✅ **JSDoc Documentation**
```typescript
/**
 * POS-optimized Card component
 * Wraps m3-svelte Card with enhanced touch targets and spacing
 *
 * @component
 */
```

✅ **Biome Ignore for Forwarded Props**
```typescript
// biome-ignore lint/correctness/noUnusedVariables: All props are forwarded to Card component
let { variant, children, onclick, class: className }: Props = $props();
```

---

## Event Handling

### Svelte 5 Event Pattern

m3-svelte uses Svelte 5's event properties (not directives):

```svelte
<script lang="ts">
import { Button } from 'm3-svelte';

function handleClick(event: MouseEvent) {
  console.log('Clicked:', event.target);
}
</script>

<!-- ✅ Svelte 5: Property (onclick) -->
<Button variant="filled" onclick={handleClick}>
  Click Me
</Button>

<!-- ❌ Svelte 4: Directive (on:click) - DON'T USE -->
<Button variant="filled" on:click={handleClick}>
  Click Me
</Button>
```

### Inline Handlers

```svelte
<Button variant="filled" onclick={() => count++}>
  Increment
</Button>

<Button variant="filled" onclick={(e) => {
  console.log('Event:', e);
  handleClick();
}}>
  With Event
</Button>
```

### Component Callbacks

**Parent component**:
```svelte
<script lang="ts">
function handleSave(data: OrderData) {
  console.log('Saving:', data);
}
</script>

<OrderForm onsave={handleSave} />
```

**Child component wrapper**:
```svelte
<script lang="ts">
interface Props {
  onsave?: (data: OrderData) => void;
}

let { onsave }: Props = $props();

function handleSubmit() {
  const data = getFormData();
  onsave?.(data);  // Call callback if provided
}
</script>

<Button variant="filled" onclick={handleSubmit}>
  Save
</Button>
```

---

## Snippets & Children

### Children Snippet Pattern

All m3-svelte components that accept content use the `children` snippet:

```svelte
<script lang="ts">
import { Card } from 'm3-svelte';
import type { Snippet } from 'svelte';

interface Props {
  children: Snippet;  // ← Required for components with content
}

let { children }: Props = $props();
</script>

<Card variant="filled">
  {@render children()}
</Card>
```

### Using in Parent Components

**Dashboard using POSCard**:
```svelte
<script lang="ts">
import POSCard from '$lib/components/POSCard.svelte';
</script>

<!-- Content between tags becomes the children snippet -->
<POSCard variant="elevated">
  <div class="action-content">
    <div class="action-icon">📋</div>
    <h3>Orders</h3>
    <p>Manage customer orders</p>
  </div>
</POSCard>
```

### Nested Snippets

```svelte
<script lang="ts">
import POSCard from '$lib/components/POSCard.svelte';
</script>

<POSCard variant="filled">
  {#snippet header()}
    <h2>Order #1234</h2>
  {/snippet}

  {#snippet body()}
    <p>3 items • $42.50</p>
  {/snippet}

  {#snippet actions()}
    <Button variant="text">View</Button>
    <Button variant="filled">Complete</Button>
  {/snippet}
</POSCard>
```

---

## Best Practices

### 1. Always Create Wrapper Components

```svelte
<!-- ❌ BAD: Using m3-svelte directly -->
<script lang="ts">
import { Button } from 'm3-svelte';
</script>

<Button variant="filled">Click Me</Button>

<!-- ✅ GOOD: Using POS wrapper -->
<script lang="ts">
import { POSButton } from '@host/ui';
</script>

<POSButton size="comfortable">Click Me</POSButton>
```

**Why**: Wrappers provide:
- Clean TypeScript types
- POS-specific touch target sizing
- Consistent spacing and styling
- Centralized component updates

### 2. Use Semantic HTML with Card Variants

```svelte
<!-- ✅ GOOD: Semantic variant usage -->
<POSCard variant="elevated">    <!-- Floating cards for actions -->
<POSCard variant="filled">      <!-- Status indicators -->
<POSCard variant="outlined">    <!-- Secondary information -->
```

### 3. Always Type Snippet Props

```typescript
// ❌ BAD: Untyped children
let { children } = $props();

// ✅ GOOD: Typed children
interface Props {
  children: Snippet;
}
let { children }: Props = $props();
```

### 4. Forward onclick, Not on:click

```svelte
<!-- ❌ BAD: Svelte 4 syntax -->
<Card variant="filled" on:click={handleClick}>

<!-- ✅ GOOD: Svelte 5 syntax -->
<Card variant="filled" onclick={handleClick}>
```

### 5. Document Complex TypeScript Ignores

```typescript
// ✅ GOOD: Explain why ignoring
// biome-ignore lint/correctness/noUnusedVariables: All props are forwarded to Card component
let { variant, children, onclick }: Props = $props();
```

---

## Troubleshooting

### Issue: "variant is required"

```
Error: Type '{ children: () => any; }' is not assignable to type '$$ComponentProps'.
  Property 'variant' is missing
```

**Solution**: Always provide `variant` prop for Card:

```svelte
<!-- ❌ ERROR -->
<Card>
  Content
</Card>

<!-- ✅ FIX -->
<Card variant="filled">
  Content
</Card>
```

### Issue: "onclick does not exist on type Props"

```
Error: Property 'onclick' does not exist on type 'Props'.
```

**Solution**: Add `onclick` to your wrapper's Props interface:

```typescript
interface Props {
  variant?: 'elevated' | 'filled' | 'outlined';
  children: Snippet;
  onclick?: (event: MouseEvent) => void;  // ← Add this
}
```

### Issue: Children not rendering

```svelte
<!-- ❌ BAD: Forgot {@render} -->
<Card variant="filled">
  {children()}
</Card>

<!-- ✅ GOOD: Use {@render} directive -->
<Card variant="filled">
  {@render children()}
</Card>
```

### Issue: TypeScript "too complex" errors persisting

**These are normal!** The errors are in m3-svelte's library definitions, not your code:

```
c:\...\node_modules\m3-svelte\package\buttons\Button.svelte.d.ts:14:23
Error: Expression produces a union type that is too complex to represent.
```

✅ **Ignore these errors** - they don't affect runtime
✅ **Wrapper components hide the complexity** from your code
✅ **Components work perfectly** despite the type errors

### Issue: SSR Errors ("window is not defined", "location is not defined")

**Error:**
```
ReferenceError: window is not defined
ReferenceError: location is not defined
Error when evaluating SSR module
```

**Root Cause**: Incorrect Vite SSR configuration forcing browser-only code to load during server-side rendering.

**Solution**: Remove incorrect `resolve.conditions` from `vite.config.ts`:

```typescript
// ❌ WRONG: Forces browser code during SSR
export default defineConfig({
  plugins: [sveltekit()],
  ssr: {
    noExternal: ['m3-svelte'],
    resolve: {
      conditions: ['svelte', 'browser', 'import'], // ← REMOVE THIS
    },
  },
});

// ✅ CORRECT: Let Vite use default SSR conditions
export default defineConfig({
  plugins: [sveltekit()],
  ssr: {
    noExternal: ['m3-svelte'], // Required for Svelte component compilation
  },
});
```

**Why This Works:**
- `ssr.noExternal: ['m3-svelte']` is **required** - Svelte libraries need compilation during SSR
- Vite's **default SSR conditions** are `['module', 'node', 'development|production']`
- Using `'browser'` condition during SSR loads client-only code (window, location, etc.)
- Removing the override lets Vite properly separate browser and server code

**Additional Notes:**
- Direct component imports (e.g., `import Button from 'm3-svelte/package/buttons/Button.svelte'`) require patch-package to add subpath exports to m3-svelte's package.json
- See `patches/m3-svelte+5.9.0.patch` for the applied patch
- The patch is automatically applied via `postinstall` script

---

## Component Reference

### Available m3-svelte Components

**Buttons & Actions**:
- Button (variants: filled, outlined, text, elevated, tonal)
- FAB (Floating Action Button)
- Icon Button
- Toggle Button

**Containers**:
- Card (variants: elevated, filled, outlined) ✅ **POSCard wrapper implemented**
- Dialog
- Menu
- Sheet

**Forms**:
- TextField
- Select
- Checkbox
- Radio
- Switch
- Slider
- DateField
- TimeField

**Navigation**:
- AppBar
- Drawer
- Tabs
- BottomNav

**Data Display**:
- List
- ListItem
- DataTable
- Chip
- Badge

**Feedback**:
- Snackbar
- ProgressIndicator
- Tooltip

### Creating New Wrappers

Follow the [MD3 Component Checklist](checklists/md3-component-checklist.md):

1. **Research m3-svelte component**
   - Check component API at https://ktibow.github.io/m3-svelte
   - Identify all props, events, and variants

2. **Create wrapper component**
   - Simple Props interface
   - POS-specific enhancements (touch targets, spacing)
   - Forward all props to m3-svelte component

3. **Add to @host/ui package**
   ```typescript
   // packages/ui/src/index.ts
   export { default as POSCard } from './components/pos/POSCard.svelte';
   export { default as POSButton } from './components/pos/POSButton.svelte';
   ```

4. **Document in design-system.md**
   - Usage examples
   - Props documentation
   - Accessibility notes

---

## Resources

### Official Documentation
- [m3-svelte GitHub](https://github.com/KTibow/m3-svelte)
- [m3-svelte Component Docs](https://ktibow.github.io/m3-svelte)
- [Material Design 3 Guidelines](https://m3.material.io/)

### HOST Documentation
- [ADR-003: Material Design 3](adr/ADR-003-material-design-3.md)
- [Design System Guide](design-system.md)
- [Svelte 5 Runes Guide](svelte-5-runes-guide.md)
- [MD3 Component Checklist](checklists/md3-component-checklist.md)

### Related Files
- `apps/pos/src/lib/components/POSCard.svelte` - Reference implementation
- `apps/pos/src/lib/theme.css` - Material Design 3 design tokens
- `apps/pos/src/routes/+page.svelte` - Dashboard using POSCard

---

*Last Updated: 2025-10-06*
*Version: 1.1.0*
*Maintained by: HOST Frontend Team*
