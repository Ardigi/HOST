# @host/design-tokens

Centralized design tokens for the HOST POS system, implementing Material Design 3 specifications optimized for touch-based point-of-sale interfaces.

## Overview

Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes. They are used in place of hard-coded values to ensure a scalable and consistent visual system.

### Why Design Tokens?

- **Single Source of Truth**: All colors, spacing, typography defined in one place
- **Consistency**: Ensures visual consistency across all applications
- **Theming**: Easy theme switching (light/dark mode)
- **Maintainability**: Update design system from one location
- **Type Safety**: Full TypeScript support with autocomplete
- **Integration**: Works seamlessly with Tailwind CSS 4

---

## Installation

This package is part of the HOST monorepo and is automatically available to all workspace packages:

```typescript
// In any workspace package
import { colors, spacing, typography, touchTargets } from '@host/design-tokens';
```

---

## Package Structure

```
packages/design-tokens/
├── src/
│   ├── colors.ts         # Color system (HCT color space)
│   ├── typography.ts     # Type scale and font definitions
│   ├── spacing.ts        # Spacing scale (8px base unit)
│   ├── touch-targets.ts  # POS-optimized touch target sizes
│   ├── elevation.ts      # Shadows and depth
│   ├── motion.ts         # Animation durations and easings
│   ├── theme.ts          # Theme generation utilities
│   └── index.ts          # Exports all tokens
├── package.json
├── tsconfig.json
└── README.md
```

---

## Token Categories

### Color System (Material Design 3 HCT)

Material Design 3 uses the HCT (Hue, Chroma, Tone) color space, which provides more perceptually accurate color palettes with guaranteed accessibility.

#### Primary Colors

```typescript
import { colors } from '@host/design-tokens';

// HOST brand color
colors.primary           // #2563eb (Tailwind blue-600)

// Tonal palette (13 variants for light/dark themes)
colors.primary0          // Pure black
colors.primary10         // Very dark blue
colors.primary20
colors.primary30
colors.primary40
colors.primary50         // Medium blue
colors.primary60
colors.primary70
colors.primary80
colors.primary90
colors.primary95
colors.primary99
colors.primary100        // Pure white

// Container colors
colors.primaryContainer     // #dbeafe (light mode background)
colors.onPrimary           // #ffffff (text on primary)
colors.onPrimaryContainer  // #172554 (text on container)
```

#### Semantic Colors

```typescript
// Error states
colors.error             // #b91c1c (red-700)
colors.errorContainer    // #fee2e2
colors.onError           // #ffffff
colors.onErrorContainer  // #7f1d1d

// Warning states
colors.warning           // #ea580c (orange-600)
colors.warningContainer  // #ffedd5
colors.onWarning         // #ffffff
colors.onWarningContainer // #7c2d12

// Success states
colors.success           // #16a34a (green-600)
colors.successContainer  // #dcfce7
colors.onSuccess         // #ffffff
colors.onSuccessContainer // #14532d

// Info states
colors.info              // #0284c7 (sky-600)
colors.infoContainer     // #e0f2fe
colors.onInfo            // #ffffff
colors.onInfoContainer   // #0c4a6e
```

#### Surface Colors

```typescript
// Backgrounds and containers
colors.surface           // #ffffff (light) / #1a1a1a (dark)
colors.surfaceDim        // #f5f5f5 (light) / #121212 (dark)
colors.surfaceBright     // #ffffff (light) / #2a2a2a (dark)

// On-surface colors (text)
colors.onSurface         // #1a1a1a (light) / #f0f0f0 (dark)
colors.onSurfaceVariant  // #4a4a4a (light) / #b0b0b0 (dark)

// Outline colors (borders)
colors.outline           // #737373 (3:1 contrast)
colors.outlineVariant    // #d4d4d4 (lighter borders)
```

#### Usage Example

```svelte
<script lang="ts">
  import { colors } from '@host/design-tokens';
</script>

<button
  style:background-color={colors.primary}
  style:color={colors.onPrimary}
>
  Complete Order
</button>
```

### Typography Scale

Material Design 3 defines a type scale with 5 categories and 3 sizes each.

#### Type Scale

```typescript
import { typography } from '@host/design-tokens';

// Display (Largest)
typography.displayLarge   // 57px / 64px line-height / weight 400
typography.displayMedium  // 45px / 52px line-height / weight 400
typography.displaySmall   // 36px / 44px line-height / weight 400

// Headline (Large headers)
typography.headlineLarge  // 32px / 40px line-height / weight 400
typography.headlineMedium // 28px / 36px line-height / weight 400
typography.headlineSmall  // 24px / 32px line-height / weight 400

// Title (Medium headers)
typography.titleLarge     // 22px / 28px line-height / weight 400
typography.titleMedium    // 16px / 24px line-height / weight 500
typography.titleSmall     // 14px / 20px line-height / weight 500

// Body (Content text)
typography.bodyLarge      // 16px / 24px line-height / weight 400
typography.bodyMedium     // 14px / 20px line-height / weight 400
typography.bodySmall      // 12px / 16px line-height / weight 400

// Label (Buttons and labels)
typography.labelLarge     // 14px / 20px line-height / weight 500
typography.labelMedium    // 12px / 16px line-height / weight 500
typography.labelSmall     // 11px / 16px line-height / weight 500
```

#### Font Families

```typescript
typography.fontFamily      // 'Roboto, system-ui, sans-serif'
typography.fontFamilyMono  // 'Roboto Mono, monospace'
```

#### Usage Example

```svelte
<script lang="ts">
  import { typography } from '@host/design-tokens';
</script>

<h1 style:font-size={typography.headlineLarge.size}
    style:line-height={typography.headlineLarge.lineHeight}
    style:font-weight={typography.headlineLarge.weight}>
  Order Summary
</h1>

<p style:font-size={typography.bodyLarge.size}
   style:line-height={typography.bodyLarge.lineHeight}>
  Your order is being prepared.
</p>
```

### Spacing Scale

Based on an 8px base unit for consistent rhythm.

#### Spacing Values

```typescript
import { spacing } from '@host/design-tokens';

spacing.xs    // 4px  (0.5 × base)
spacing.sm    // 8px  (1 × base)
spacing.md    // 16px (2 × base)
spacing.lg    // 24px (3 × base)
spacing.xl    // 32px (4 × base)
spacing.xxl   // 48px (6 × base)
spacing.xxxl  // 64px (8 × base)
```

#### Component Spacing

```typescript
// POS-optimized spacing
spacing.component = {
  cardPadding: '24px',        // Enhanced for touch
  listItemPadding: '16px',    // Comfortable spacing
  buttonPadding: '16px 24px', // Horizontal and vertical
  inputPadding: '16px',       // Form inputs
};
```

#### Layout Spacing

```typescript
// Page-level spacing
spacing.layout = {
  pageMargin: '24px',
  sectionGap: '48px',
  gridGap: '16px',
  containerMaxWidth: '1280px',
};
```

#### Usage Example

```svelte
<script lang="ts">
  import { spacing } from '@host/design-tokens';
</script>

<div style:padding={spacing.lg}
     style:gap={spacing.md}>
  <button style:padding="{spacing.component.buttonPadding}">
    Add Item
  </button>
</div>
```

### Touch Targets

POS-optimized touch target sizes for tablet and mobile devices.

#### Target Sizes

```typescript
import { touchTargets } from '@host/design-tokens';

// WCAG 2.1 AA minimum (Level A: 2.5.5)
touchTargets.minimum = {
  width: '48px',
  height: '48px',
  description: 'Minimum for WCAG 2.1 AA compliance'
};

// Comfortable for frequent actions
touchTargets.comfortable = {
  width: '56px',
  height: '56px',
  description: 'Recommended for primary POS actions'
};

// Critical for transaction buttons
touchTargets.critical = {
  width: '80px',
  height: '80px',
  description: 'Required for payment and send order buttons'
};
```

#### Usage Guidelines

- **Minimum (48px)**: Secondary actions, less frequently used buttons
- **Comfortable (56px)**: Primary actions, menu items, navigation
- **Critical (80px)**: Payment buttons, send order, void order

#### Usage Example

```svelte
<script lang="ts">
  import { touchTargets } from '@host/design-tokens';

  export let type: 'minimum' | 'comfortable' | 'critical' = 'comfortable';
</script>

<button
  style:min-width={touchTargets[type].width}
  style:min-height={touchTargets[type].height}
>
  <slot />
</button>
```

### Elevation (Shadows)

Material Design 3 elevation system for creating depth.

#### Elevation Levels

```typescript
import { elevation } from '@host/design-tokens';

elevation.level0  // No shadow (flat)
elevation.level1  // 0 1px 2px rgba(0,0,0,0.05)  - Cards
elevation.level2  // 0 2px 4px rgba(0,0,0,0.07)  - Raised buttons
elevation.level3  // 0 4px 8px rgba(0,0,0,0.10)  - Dialogs
elevation.level4  // 0 8px 16px rgba(0,0,0,0.12) - Navigation drawer
elevation.level5  // 0 16px 24px rgba(0,0,0,0.14) - Modal overlays
```

#### Usage Example

```svelte
<script lang="ts">
  import { elevation } from '@host/design-tokens';
</script>

<div style:box-shadow={elevation.level2}>
  Order Card
</div>
```

### Motion & Animation

Consistent animation durations and easing functions.

#### Durations

```typescript
import { motion } from '@host/design-tokens';

motion.duration = {
  instant: '0ms',      // Immediate (no animation)
  fast: '100ms',       // Quick transitions
  normal: '200ms',     // Standard transitions
  slow: '300ms',       // Deliberate transitions
  slower: '500ms',     // Emphasis transitions
};
```

#### Easing Functions

```typescript
motion.easing = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',      // Deceleration
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',     // Acceleration
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)', // Standard
  emphasized: 'cubic-bezier(0.2, 0, 0, 1)',  // Material Design 3
};
```

#### Usage Example

```css
.button {
  transition: background-color var(--motion-duration-normal) var(--motion-easing-emphasized);
}
```

---

## Tailwind CSS 4 Integration

Design tokens integrate seamlessly with Tailwind CSS 4's new CSS-first configuration.

### Configuration

```css
/* apps/pos/src/app.css */
@import "tailwindcss";

@theme {
  /* Colors */
  --color-primary: #2563eb;
  --color-primary-container: #dbeafe;
  --color-on-primary: #ffffff;
  --color-on-primary-container: #172554;

  --color-error: #b91c1c;
  --color-success: #16a34a;
  --color-warning: #ea580c;

  /* Typography */
  --font-size-display-large: 57px;
  --font-size-headline-large: 32px;
  --font-size-title-large: 22px;
  --font-size-body-large: 16px;
  --font-size-label-large: 14px;

  --line-height-display: 1.12;
  --line-height-headline: 1.25;
  --line-height-body: 1.5;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 48px;

  /* Touch Targets */
  --spacing-touch-min: 48px;
  --spacing-touch-comfortable: 56px;
  --spacing-touch-critical: 80px;

  /* Elevation */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 2px 4px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 4px 8px rgba(0, 0, 0, 0.10);
  --shadow-xl: 0 8px 16px rgba(0, 0, 0, 0.12);

  /* Motion */
  --motion-duration-fast: 100ms;
  --motion-duration-normal: 200ms;
  --motion-duration-slow: 300ms;

  --motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);
}
```

### Usage in Components

```svelte
<div class="bg-primary text-on-primary p-lg rounded-lg shadow-md">
  <h2 class="text-headline-large">Order Summary</h2>
  <p class="text-body-large mt-md">3 items</p>
</div>
```

---

## Theme Generation

Generate light and dark themes from a single brand color using Material Design 3's dynamic color system.

### Using the Theme Generator

```typescript
import { generateTheme } from '@host/design-tokens/theme';

// Generate theme from HOST brand color
const lightTheme = generateTheme('#2563eb', {
  isDark: false,
  contrastLevel: 0, // Standard contrast (0), medium (+0.5), high (+1)
});

const darkTheme = generateTheme('#2563eb', {
  isDark: true,
  contrastLevel: 0,
});

// Apply theme to document
document.documentElement.style.setProperty('--color-primary', lightTheme.primary);
document.documentElement.style.setProperty('--color-surface', lightTheme.surface);
// ... set other colors
```

### Theme Switching

```typescript
// Switch between light and dark themes
import { applyTheme, themes } from '@host/design-tokens/theme';

// Apply dark theme
applyTheme(themes.dark);

// Apply light theme
applyTheme(themes.light);

// Listen to system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
applyTheme(prefersDark.matches ? themes.dark : themes.light);

prefersDark.addEventListener('change', (e) => {
  applyTheme(e.matches ? themes.dark : themes.light);
});
```

---

## Testing

This package has comprehensive test coverage with **106 tests** across all token categories.

### Test Coverage by File

| File | Tests | Coverage |
|------|-------|----------|
| **colors.test.ts** | 11 | HCT color generation, theme variants, contrast ratios |
| **elevation.test.ts** | 15 | Shadow tokens, component elevations, MD3 compliance |
| **typography.test.ts** | 22 | Type scale, font families, WCAG accessibility |
| **spacing.test.ts** | 14 | 8px base unit scale, component spacing, grid systems |
| **motion.test.ts** | 24 | Duration tokens, easing curves, animation patterns |
| **touch-targets.test.ts** | 20 | WCAG 2.1 AA compliance, POS-optimized sizing |

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode for TDD
npm run test:watch

# Run specific test file
npm test -- elevation.test.ts
```

### Test Quality Standards

All tests follow these principles:
- **Test actual behavior**, not hardcoded constants
- **100% coverage** for all design token files
- **WCAG compliance** verification (touch targets, typography)
- **Material Design 3** specification validation

---

## Development

### Adding New Tokens

1. **Define the token** in the appropriate category file:
   ```typescript
   // src/spacing.ts
   export const spacing = {
     xs: '4px',
     sm: '8px',
     // ... add new token
     custom: '20px',
   };
   ```

2. **Export from index.ts**:
   ```typescript
   // src/index.ts
   export { spacing } from './spacing';
   ```

3. **Add to Tailwind config** (if applicable):
   ```css
   @theme {
     --spacing-custom: 20px;
   }
   ```

4. **Document the token** in this README

5. **Write tests** (if complex logic):
   ```typescript
   // src/spacing.test.ts
   import { spacing } from './spacing';

   test('spacing custom is 20px', () => {
     expect(spacing.custom).toBe('20px');
   });
   ```

### Building the Package

```bash
cd packages/design-tokens
npm run build
```

### Type Generation

TypeScript types are automatically generated from the token definitions. Use autocomplete in your IDE:

```typescript
import { colors, spacing } from '@host/design-tokens';

// Autocomplete suggests all color tokens
colors.p
//      ^ Autocomplete: primary, primaryContainer, etc.

// Type-safe access
const buttonColor: string = colors.primary; // ✅
const invalidColor: string = colors.invalid; // ❌ TypeScript error
```

---

## Best Practices

### DO ✅

- **Use tokens instead of hard-coded values**
  ```svelte
  <!-- Good -->
  <div style:padding={spacing.lg}>

  <!-- Bad -->
  <div style:padding="24px">
  ```

- **Use semantic color names**
  ```svelte
  <!-- Good -->
  <button style:background-color={colors.error}>Delete</button>

  <!-- Bad -->
  <button style:background-color="#b91c1c">Delete</button>
  ```

- **Follow touch target guidelines**
  ```svelte
  <!-- Good -->
  <button style:min-width={touchTargets.critical.width}>
    Complete Payment
  </button>
  ```

- **Respect motion preferences**
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: var(--motion-duration-instant) !important;
    }
  }
  ```

### DON'T ❌

- **Don't override MD3 token values directly**
  ```typescript
  // Bad - modifies source tokens
  colors.primary = '#000000'; // ❌

  // Good - create theme variant
  const customTheme = { ...themes.light, primary: '#000000' }; // ✅
  ```

- **Don't create ad-hoc spacing values**
  ```svelte
  <!-- Bad -->
  <div style:padding="13px">

  <!-- Good - use defined scale -->
  <div style:padding={spacing.md}>
  ```

- **Don't hardcode color values**
  ```svelte
  <!-- Bad -->
  <div style:background-color="#ffffff">

  <!-- Good -->
  <div style:background-color={colors.surface}>
  ```

- **Don't skip touch target requirements**
  ```svelte
  <!-- Bad - too small for POS -->
  <button style:min-height="32px">

  <!-- Good - meets minimum -->
  <button style:min-height={touchTargets.minimum.height}>
  ```

---

## Contributing

### Proposing New Tokens

1. **Check if token already exists** - Review existing tokens first
2. **Create RFC** - Open GitHub issue with "RFC: New Design Token" title
3. **Discuss with team** - Get feedback on necessity and naming
4. **Submit PR** - Include token definition, documentation, and tests
5. **Update documentation** - Add to this README and design-system.md

### Token Naming Conventions

- **Colors**: Descriptive and semantic (e.g., `primary`, `error`, `surface`)
- **Spacing**: Size-based (e.g., `xs`, `sm`, `md`, `lg`)
- **Typography**: Role-based (e.g., `headlineLarge`, `bodyMedium`)
- **Touch Targets**: Purpose-based (e.g., `minimum`, `comfortable`, `critical`)

---

## Resources

- **Material Design 3 Color**: https://m3.material.io/styles/color
- **Material Design 3 Typography**: https://m3.material.io/styles/typography
- **Material Design 3 Elevation**: https://m3.material.io/styles/elevation
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Tailwind CSS 4**: https://tailwindcss.com/blog/tailwindcss-v4
- **HCT Color Space**: https://material.io/blog/science-of-color-design

---

## Support

For questions or issues with design tokens:

- **GitHub Issues**: [github.com/pour-people/host/issues](https://github.com/pour-people/host/issues)
- **Team Chat**: #design-system channel
- **Documentation**: [design-system.md](../../docs/design-system.md)
- **ADR**: [ADR-003-material-design-3.md](../../docs/adr/ADR-003-material-design-3.md)

---

*Package Version: 0.1.0*
*Last Updated: 2025-09-30*
*Maintained by: HOST Frontend Team*