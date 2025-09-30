# ADR-003: Material Design 3 with m3-svelte

## Status

**Status**: Accepted

**Date**: 2025-09-30

**Deciders**: Tech Lead, Frontend Team, UX Team

**Related ADRs**:
- [ADR-001: Svelte 5 Framework](ADR-001-svelte-5-framework.md) - Foundation for native Svelte components

---

## Context

### Background

We're building a modern POS system for bars and restaurants that requires a comprehensive design system to ensure consistency, accessibility, and professional appearance across all interfaces. The system will be used by servers, bartenders, and managers in high-pressure environments, requiring:

- Touch-optimized interfaces with proper touch target sizing (48px minimum)
- Accessible components meeting WCAG 2.1 AA standards
- Consistent visual language across all applications
- Dark mode support for low-light bar environments
- Material Design 3's dynamic color system for brand customization
- Professional appearance matching industry expectations

### Problem Statement

We need to choose a design system that provides:
1. Comprehensive component library for POS interfaces
2. Built-in accessibility compliance (WCAG 2.1 AA)
3. Touch-optimized design tokens
4. Native Svelte 5 integration (no wrapper overhead)
5. Small bundle size for fast loading
6. Active maintenance and modern design patterns

### Driving Forces

- **Accessibility First**: WCAG 2.1 AA compliance is mandatory for all components
- **Touch Optimization**: Components must have proper touch targets for tablet/mobile use
- **Performance**: Need minimal bundle overhead while maintaining comprehensive features
- **Developer Experience**: Components must integrate seamlessly with Svelte 5 runes
- **Design Quality**: Professional appearance matching modern POS systems
- **Customization**: Brand color integration with dynamic theming

### Constraints

- Must work natively with Svelte 5 (runes, snippets, event handlers)
- Must provide 30+ essential POS components (buttons, cards, dialogs, forms, lists)
- Must support SSR with SvelteKit
- Must have active maintenance and community
- Must support both light and dark themes
- Must provide design tokens compatible with Tailwind CSS 4

---

## Decision

We will **use Material Design 3 (MD3) via the m3-svelte library** as our primary design system for the HOST POS application.

### Reasoning

1. **Native Svelte Implementation**: m3-svelte is built specifically for Svelte 5, using runes and modern Svelte patterns without Web Components wrapper overhead

2. **Comprehensive Component Library**: Provides 50+ components including all essential POS needs:
   - Buttons (filled, outlined, text, FAB)
   - Forms (TextField, DateField, Select, Checkbox, Radio, Switch)
   - Navigation (AppBar, Drawer, Tabs, BottomNav)
   - Containers (Card, Dialog, Sheet, Menu)
   - Data Display (List, Table, DataTable, Chips)
   - Feedback (Snackbar, ProgressIndicator, Badge)

3. **Superior Bundle Size**: ~150KB vs ~450KB for @material/web (official Google implementation)
   - 3x smaller bundle reduces load times significantly
   - Critical for POS devices on restaurant Wi-Fi

4. **Built-in Accessibility**: All components implement:
   - WCAG 2.1 AA contrast ratios (4.5:1 for normal text)
   - Proper ARIA attributes and keyboard navigation
   - Screen reader support
   - Focus management

5. **Touch-Optimized Design Tokens**: MD3 specifications include:
   - 48px minimum touch targets (WCAG 2.1 AA)
   - 56px comfortable targets for primary actions
   - 80px critical targets for POS transaction buttons

6. **Dynamic Color System**: MD3's HCT (Hue, Chroma, Tone) color space generates:
   - Complete accessible color palettes from single brand color
   - Automatic light/dark theme generation
   - Guaranteed contrast compliance

7. **Active Maintenance**: m3-svelte is actively maintained with Svelte 5 support and regular updates

### Key Factors

- **More Components Than Official Library**: 50+ components vs 16 in @material/web
- **Better Performance**: 3x smaller bundle, faster runtime, no Web Components overhead
- **Native Svelte**: Uses Svelte 5 runes, no SSR workarounds needed
- **Professional Design Language**: Material Design is industry-standard, familiar to users
- **Comprehensive Documentation**: Well-documented with examples and API references
- **Material 3 Expressive Support**: Latest MD3 evolution with enhanced expressiveness

---

## Consequences

### Positive

- **Comprehensive Component Library**: 50+ components cover all POS needs
- **Superior Performance**: 3x smaller bundle size, faster runtime
- **Built-in Accessibility**: WCAG 2.1 AA compliance out of the box
- **Touch-Optimized**: Proper touch target sizing for POS devices
- **Native Svelte**: Seamless integration with Svelte 5 runes and patterns
- **Professional Appearance**: Material Design is industry-standard
- **Dynamic Theming**: Brand color integration with automatic palette generation
- **Dark Mode Support**: Built-in dark theme for bar environments
- **Active Development**: Regular updates and community support
- **TypeScript Support**: Full type definitions for all components
- **No SSR Issues**: Native Svelte components work perfectly with SvelteKit

### Negative

- **Material Design Lock-in**: Committed to Material Design aesthetics
- **Smaller Ecosystem**: Less community content than Material-UI (React)
- **Customization Limits**: Material Design has opinionated design patterns
- **Learning Curve**: Team needs to learn MD3 design principles
- **Component Wrapping Needed**: Must create POS-optimized wrappers for larger touch targets

### Neutral

- **Design System Opinions**: Material Design enforces specific UX patterns (can be positive or negative)
- **Material 3 Evolution**: MD3 is newer than MD2, some patterns still evolving
- **Community Size**: Smaller than React ecosystem but active and growing

### Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|-----------|--------|-------------------|
| Library maintenance drops | Low | High | m3-svelte is actively maintained; we can fork if needed |
| Missing niche components | Medium | Low | Build custom components following MD3 patterns |
| Breaking changes in updates | Low | Medium | Pin versions, test thoroughly before upgrading |
| Performance issues at scale | Very Low | Medium | m3-svelte is optimized; monitor bundle size |
| Accessibility gaps | Very Low | High | MD3 has built-in WCAG 2.1 AA; verify each component |

---

## Alternatives Considered

### Alternative 1: @material/web (Official Google Web Components)

**Description**: Use official Google Material Design 3 Web Components via Svelte wrappers

**Pros**:
- Official Google implementation
- Direct from Material Design team
- Guaranteed spec compliance
- Long-term Google support

**Cons**:
- **Only 16 components** (vs 50+ in m3-svelte)
- **3x larger bundle** (~450KB vs ~150KB)
- **Slower runtime** (Web Components overhead)
- **SSR complications** (Web Components don't SSR well)
- **Maintenance mode** (moved to maintenance, not actively adding features)
- **Wrapper overhead** (need to wrap in Svelte components)
- **Missing essential POS components** (DataTable, DateField, TimePicker, BottomSheet)

**Why Rejected**: Significantly fewer components, 3x larger bundle, performance overhead, SSR issues, and maintenance mode status make it unsuitable for POS needs. m3-svelte provides better performance and more components while maintaining MD3 compliance.

### Alternative 2: SMUI (Svelte Material UI)

**Description**: Use Svelte Material UI library for Svelte components

**Pros**:
- Mature Svelte library
- Good documentation
- Large component set
- Active community

**Cons**:
- **Only supports Material Design 2** (not MD3)
- **Outdated design patterns** (MD2 is from 2018)
- **No MD3 dynamic color** (missing HCT color system)
- **No MD3 accessibility improvements** (MD3 enhanced WCAG compliance)
- **Svelte 4 focused** (Svelte 5 support unclear)

**Why Rejected**: Material Design 2 is outdated (replaced by MD3 in 2021). MD3 provides significant improvements in accessibility, theming, and modern design patterns. Using MD2 would mean rebuilding when migrating to MD3 later.

### Alternative 3: Custom Design System (Headless UI)

**Description**: Build custom design system using headless UI libraries (Melt UI, Bits UI)

**Pros**:
- Complete customization control
- No design system lock-in
- Tailwind CSS 4 integration
- Build exactly what we need
- Can evolve independently

**Cons**:
- **6-12 months development time** (30+ components)
- **Significant ongoing maintenance** (updates, bug fixes, accessibility)
- **Accessibility burden** (must implement WCAG 2.1 AA for each component)
- **Design consistency risk** (requires strong design system governance)
- **No professional reference** (must create all design patterns from scratch)
- **Delayed MVP** (can't build features while building components)
- **Team distraction** (core team builds UI instead of POS features)

**Why Rejected**: Building a custom design system would delay MVP by 6-12 months and require ongoing maintenance resources. Material Design 3 provides a battle-tested, accessible design system that meets all POS needs without distracting the team from core features.

### Alternative 4: Shadcn-svelte (Port of shadcn/ui)

**Description**: Use shadcn-svelte component library built on Tailwind CSS

**Pros**:
- Tailwind CSS integration
- Copy-paste components (own your code)
- Growing Svelte community
- Modern design

**Cons**:
- **Incomplete component set** (20-25 components vs 50+ needed)
- **No design system** (aesthetic decisions left to developer)
- **No accessibility guarantees** (must verify each component)
- **Inconsistent patterns** (components evolved independently)
- **No touch optimization** (not designed for POS/touch interfaces)
- **No dark mode standards** (must implement per component)

**Why Rejected**: While copy-paste flexibility is appealing, shadcn-svelte lacks the comprehensive component library, design system consistency, and touch optimization needed for POS. Material Design 3 provides a complete, accessible, touch-optimized design system out of the box.

---

## Implementation Notes

### Required Changes

**Week 2: Design System Foundation**

1. **Install m3-svelte** in `packages/ui`:
   ```bash
   npm install m3-svelte@^5.2.2
   ```

2. **Create design tokens package** (`packages/design-tokens`):
   - HOST brand color: `#2563eb` (Tailwind blue-600)
   - Generate Material Theme using MD3 dynamic color
   - Export CSS custom properties
   - Integrate with Tailwind CSS 4

3. **Setup Material Theme**:
   ```typescript
   // packages/design-tokens/src/theme.ts
   import { materialDynamicColors } from 'm3-svelte/theme';

   export const hostTheme = materialDynamicColors('#2563eb', {
     isDark: false,
     contrastLevel: 0 // Standard contrast
   });
   ```

4. **Create POS-optimized component wrappers**:
   - `POSButton` - 80px height for critical actions
   - `POSTextField` - 56px height for comfortable input
   - `POSCard` - Enhanced spacing for touch
   - `POSDialog` - Full-screen on mobile
   - `POSList` - 56px row height with clear touch targets

5. **Update existing components**:
   - Migrate order page to MD3 components
   - Update navigation to use MD3 AppBar/Drawer
   - Convert forms to MD3 TextField/Select

### Migration Plan

**Phase 1: Foundation (Week 2, Days 1-2)**
- Install m3-svelte and dependencies
- Create design tokens package
- Generate HOST brand theme
- Setup Tailwind CSS 4 integration

**Phase 2: Core Components (Week 2, Days 3-4)**
- Create POS-optimized component wrappers
- Build POSButton, POSCard, POSDialog
- Document touch target specifications
- Write component tests (touch targets, accessibility)

**Phase 3: Feature Migration (Week 2, Days 5-7)**
- Migrate order page to MD3 components
- Update navigation components
- Convert form inputs
- Add dark mode toggle

**Phase 4: Testing & Refinement (Weeks 3-4)**
- Touch target testing on tablets
- Accessibility audit (screen readers, keyboard nav)
- Performance testing (bundle size, runtime)
- User testing with servers/bartenders

### Component Wrapper Standards

All POS-optimized components must meet these specifications:

**Touch Targets**:
- Minimum: 48px (WCAG 2.1 AA)
- Comfortable: 56px (primary actions)
- Critical: 80px (transaction buttons)

**Spacing**:
- Card padding: 24px (vs 16px MD3 default)
- List item height: 56px (vs 48px default)
- Button padding: 16px horizontal (vs 12px default)

**Accessibility**:
- Contrast: 4.5:1 for text (WCAG 2.1 AA)
- Focus indicators: 3:1 contrast (WCAG 2.1 AA)
- Keyboard navigation: Full support
- Screen readers: Proper ARIA labels

### Testing Requirements

Every MD3 component wrapper must have:

1. **Touch Target Tests**:
   - Verify minimum 48px × 48px
   - Test on actual tablets/mobile devices

2. **Accessibility Tests**:
   - Automated testing with axe-core
   - Manual screen reader testing (NVDA, VoiceOver)
   - Keyboard navigation verification

3. **Visual Regression Tests**:
   - Screenshot tests for light/dark themes
   - Responsive layout testing

4. **Performance Tests**:
   - Bundle size impact < 5KB per component
   - Render time < 16ms (60fps)

### Timeline

- **Week 2, Day 1**: Install m3-svelte, create design tokens
- **Week 2, Day 2**: Generate HOST theme, Tailwind integration
- **Week 2, Days 3-4**: Build POS-optimized component wrappers
- **Week 2, Days 5-7**: Migrate order page and navigation
- **Weeks 3-4**: Testing, refinement, and documentation
- **Ongoing**: Add new components as features require

---

## Success Criteria

### Performance Metrics

- Bundle size increase < 200KB (total app < 400KB)
- First Contentful Paint < 1.0s
- Touch response time < 100ms
- Component render time < 16ms (60fps)
- Lighthouse Performance score > 90

### Accessibility Metrics

- WCAG 2.1 AA compliance: 100%
- axe-core violations: 0
- Touch target compliance: 100%
- Keyboard navigation: Full support
- Screen reader compatibility: NVDA, JAWS, VoiceOver

### Development Metrics

- Component test coverage > 80%
- Documentation completeness: 100%
- Developer satisfaction > 8/10
- Time to create new feature < 2 days

### User Experience Metrics

- Task completion rate > 95%
- Error rate < 2%
- User satisfaction > 4/5
- Touch accuracy > 98%

---

## References

### Material Design 3 Official

- [Material Design 3 Guidelines](https://m3.material.io/)
- [Material 3 Expressive (2025)](https://m3.material.io/blog/material-3-expressive)
- [MD3 Color System (HCT)](https://m3.material.io/styles/color/the-color-system/color-roles)
- [MD3 Accessibility](https://m3.material.io/foundations/accessibility)
- [MD3 Touch Targets](https://m3.material.io/foundations/interaction/states/applying-states#touch-target)

### m3-svelte Library

- [m3-svelte GitHub](https://github.com/KTibow/m3-svelte)
- [m3-svelte Documentation](https://ktibow.github.io/m3-svelte)
- [m3-svelte Component API](https://ktibow.github.io/m3-svelte/components)
- [m3-svelte NPM Package](https://www.npmjs.com/package/m3-svelte)

### Alternative Libraries

- [@material/web (Official)](https://github.com/material-components/material-web)
- [SMUI (Material Design 2)](https://sveltematerialui.com/)
- [Melt UI (Headless)](https://melt-ui.com/)

### Performance Comparisons

- [Bundle Size Comparison](https://bundlephobia.com/package/m3-svelte)
- [Component Count Analysis](https://github.com/KTibow/m3-svelte/tree/main/src/lib)
- [Performance Benchmarks](https://krausest.github.io/js-framework-benchmark/)

### Accessibility Standards

- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Touch Target Size Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Color Contrast Requirements](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

## Updates

| Date | Author | Change Description |
|------|--------|-------------------|
| 2025-09-30 | Tech Lead | Initial decision - Material Design 3 with m3-svelte |

---

*ADR Version: 1.0.0*