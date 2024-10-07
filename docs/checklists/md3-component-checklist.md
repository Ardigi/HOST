# Material Design 3 Component Wrapper Implementation Checklist

## Overview

This checklist provides a standardized process for creating POS-optimized component wrappers around m3-svelte Material Design 3 components. Following this checklist ensures all components meet HOST POS requirements for accessibility, touch targets, performance, and quality.

### Purpose

- Ensure WCAG 2.1 AA accessibility compliance
- Maintain consistent POS-optimized touch target sizing
- Standardize component API and documentation
- Guarantee quality through comprehensive testing
- Enable efficient code review process

### When to Use

Use this checklist when:
- Creating a new POS component wrapper around an m3-svelte component
- Modifying an existing POS component wrapper
- Reviewing a component pull request
- Auditing component quality

### How to Use

1. **Copy this checklist** into your PR description or feature branch
2. **Check off items** as you complete them
3. **Document deviations** if you cannot complete a requirement (explain why)
4. **Link to related issues/PRs** for context
5. **Request review** only when all items are checked or documented

---

## Pre-Development Checklist

### Research & Planning

- [ ] **Research m3-svelte component**
  - [ ] Review component API documentation: https://ktibow.github.io/m3-svelte
  - [ ] Test component in isolation (Storybook/REPL)
  - [ ] Identify all props, events, and slots
  - [ ] Document any limitations or quirks

- [ ] **Identify POS requirements**
  - [ ] Determine touch target size (48px minimum, 56px comfortable, 80px critical)
  - [ ] List POS-specific features needed
  - [ ] Identify usage contexts (order entry, payment, inventory, etc.)
  - [ ] Review similar POS systems for patterns

- [ ] **Define accessibility enhancements**
  - [ ] List ARIA attributes to add or verify
  - [ ] Plan keyboard shortcuts if applicable
  - [ ] Identify screen reader announcements needed
  - [ ] Document focus management requirements

- [ ] **Create component specification**
  - [ ] Write component description
  - [ ] Define props interface (TypeScript)
  - [ ] Document events interface
  - [ ] List usage examples
  - [ ] Create user stories if complex component

---

## Development Checklist

### Component Setup

- [ ] **File structure**
  - [ ] Create component file: `packages/ui/src/components/pos/[ComponentName].svelte`
  - [ ] Create test file: `packages/ui/src/components/pos/[ComponentName].test.ts`
  - [ ] Create story file: `packages/ui/src/components/pos/[ComponentName].stories.svelte` (optional)

- [ ] **Import dependencies**
  ```svelte
  <script lang="ts">
    import { [Component] } from 'm3-svelte';
    // Other imports
  </script>
  ```

- [ ] **Define TypeScript interfaces**
  ```typescript
  export interface [ComponentName]Props {
    // Props with JSDoc comments
  }

  export interface [ComponentName]Events {
    // Events with JSDoc comments
  }
  ```

- [ ] **Document component**
  - [ ] Add component-level JSDoc comment
  - [ ] Document all props with types and defaults
  - [ ] Document all events with payload types
  - [ ] Add usage examples in comments
  - [ ] Link to design-system.md section

### Touch Target Requirements

- [ ] **Apply proper sizing**
  - [ ] Minimum: 48px × 48px (WCAG 2.1 AA Level A requirement: 2.5.5 Target Size)
  - [ ] Comfortable: 56px × 56px for primary POS actions
  - [ ] Critical: 80px × 80px for transaction buttons (Send Order, Complete Payment)

  ```svelte
  <Component
    class="pos-component"
    style:min-width="{size === 'critical' ? '80px' : size === 'comfortable' ? '56px' : '48px'}"
    style:min-height="{size === 'critical' ? '80px' : size === 'comfortable' ? '56px' : '48px'}"
  />
  ```

- [ ] **Add tap area extension** (if needed)
  ```css
  .pos-component {
    position: relative;
  }

  /* Extend tap area without changing visual size */
  .pos-component::after {
    content: '';
    position: absolute;
    inset: -8px; /* Adds 16px to each dimension */
  }
  ```

- [ ] **Verify spacing**
  - [ ] Minimum 8px spacing between interactive elements
  - [ ] Comfortable 16px spacing for primary actions
  - [ ] No overlapping touch targets

- [ ] **Test on actual devices**
  - [ ] Test on iPad (primary POS device)
  - [ ] Test on Android tablet
  - [ ] Test on iPhone (for mobile server app)
  - [ ] Verify comfortable thumb reach
  - [ ] Test with large fingers/gloves

### Accessibility Requirements

#### WCAG 2.1 AA Compliance

- [ ] **Maintain m3-svelte ARIA attributes**
  - [ ] Do not remove or override built-in ARIA
  - [ ] Verify role attributes are correct
  - [ ] Check aria-label/aria-labelledby
  - [ ] Verify aria-describedby for hints/errors
  - [ ] Ensure aria-live regions for dynamic content

- [ ] **Keyboard navigation**
  - [ ] Tab order is logical (follows visual layout)
  - [ ] All interactive elements are keyboard accessible
  - [ ] Focus trap in modals/dialogs works correctly
  - [ ] Escape key closes modals/menus
  - [ ] Enter/Space activates buttons
  - [ ] Arrow keys navigate lists/menus

- [ ] **Focus indicators**
  - [ ] Visible focus outline (3px minimum)
  - [ ] 3:1 contrast ratio against background (WCAG 2.1 AA: 2.4.11)
  - [ ] Focus visible on all interactive states
  - [ ] Focus outline does not obscure content

  ```css
  *:focus-visible {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
    border-radius: 2px;
  }
  ```

- [ ] **Color contrast**
  - [ ] Text: 4.5:1 minimum (normal text)
  - [ ] Large text: 3:1 minimum (≥18pt or ≥14pt bold)
  - [ ] UI components: 3:1 minimum (WCAG 2.1 AA: 1.4.11)
  - [ ] Disabled states: Adequate visibility
  - [ ] Error states: 4.5:1 contrast
  - [ ] Test with contrast checker: https://webaim.org/resources/contrastchecker/

- [ ] **Screen reader support**
  - [ ] Test with NVDA (Windows)
  - [ ] Test with JAWS (Windows) if available
  - [ ] Test with VoiceOver (macOS/iOS)
  - [ ] Verify component announces correctly
  - [ ] Dynamic content updates are announced (aria-live)
  - [ ] Error messages are announced
  - [ ] Instructions are available to screen readers

- [ ] **Labels and descriptions**
  - [ ] All form inputs have labels
  - [ ] Labels are programmatically associated (for/id or aria-labelledby)
  - [ ] Placeholder text does not replace labels
  - [ ] Error messages are associated with inputs (aria-describedby)
  - [ ] Helper text is accessible

- [ ] **Motion and animation**
  - [ ] Respects `prefers-reduced-motion` media query
  - [ ] No essential content conveyed through motion alone
  - [ ] Animations can be paused/stopped if longer than 5 seconds

  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

### Styling & Theming

- [ ] **Apply POS-specific spacing**
  ```svelte
  <Component
    class="pos-component"
    style:padding="24px"  /* Enhanced from MD3 default 16px */
  />
  ```

- [ ] **Integrate design tokens**
  ```typescript
  import { colors, spacing, typography, touchTargets } from '@host/design-tokens';
  ```

- [ ] **Support light/dark themes**
  - [ ] Test component in light theme
  - [ ] Test component in dark theme
  - [ ] Verify contrast ratios in both themes
  - [ ] Use CSS custom properties for colors

  ```css
  .pos-component {
    background-color: var(--color-surface);
    color: var(--color-on-surface);
  }
  ```

- [ ] **Test responsive behavior**
  - [ ] Mobile (320px - 640px)
  - [ ] Tablet (640px - 1024px)
  - [ ] Desktop (1024px+)
  - [ ] Landscape and portrait orientations

- [ ] **Apply custom POS styling** (if needed)
  - [ ] Larger font sizes for readability (18px minimum)
  - [ ] Enhanced spacing for touch
  - [ ] Rounded corners for friendlier UI
  - [ ] Drop shadows for depth perception

### Code Quality

- [ ] **TypeScript types**
  - [ ] All props have explicit types
  - [ ] No `any` types (use `unknown` if needed)
  - [ ] Events have payload types
  - [ ] Generics used appropriately
  - [ ] Enums for fixed sets of values

- [ ] **Documentation**
  - [ ] JSDoc comment on component
  - [ ] JSDoc comment on all props
  - [ ] JSDoc comment on all events
  - [ ] Usage examples in comments
  - [ ] Link to Storybook/design-system.md

- [ ] **Naming conventions**
  - [ ] Component name: PascalCase, prefixed with `POS` (e.g., `POSButton`)
  - [ ] Props: camelCase
  - [ ] Events: on[Action] (e.g., onClick, onSubmit)
  - [ ] CSS classes: kebab-case, prefixed with `pos-`
  - [ ] Files: kebab-case matching component name

- [ ] **Error handling**
  - [ ] Invalid props throw clear errors
  - [ ] Edge cases handled gracefully
  - [ ] Loading states implemented
  - [ ] Error states implemented

- [ ] **Performance**
  - [ ] No unnecessary reactivity
  - [ ] Expensive computations memoized ($derived)
  - [ ] Event handlers not recreated on each render
  - [ ] Heavy components lazy-loaded if appropriate

- [ ] **Export from package**
  ```typescript
  // packages/ui/src/index.ts
  export { default as POSButton } from './components/pos/POSButton.svelte';
  ```

---

## Testing Checklist

### Unit Tests

- [ ] **Component rendering**
  ```typescript
  import { render } from '@testing-library/svelte';
  import POSButton from './POSButton.svelte';

  test('renders button with text', () => {
    const { getByText } = render(POSButton, { props: { text: 'Click me' } });
    expect(getByText('Click me')).toBeInTheDocument();
  });
  ```

- [ ] **Prop variations**
  - [ ] Test all prop combinations
  - [ ] Test default prop values
  - [ ] Test prop validation/errors
  - [ ] Test conditional rendering based on props

- [ ] **Event handlers**
  ```typescript
  test('calls onClick handler', async () => {
    const onClick = vi.fn();
    const { getByRole } = render(POSButton, { props: { onClick } });

    await userEvent.click(getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  ```

- [ ] **Touch target dimensions**
  ```typescript
  test('has minimum 48px touch target', () => {
    const { getByRole } = render(POSButton);
    const button = getByRole('button');

    const { width, height } = button.getBoundingClientRect();
    expect(width).toBeGreaterThanOrEqual(48);
    expect(height).toBeGreaterThanOrEqual(48);
  });
  ```

- [ ] **State management**
  - [ ] Test state changes
  - [ ] Test state updates trigger re-renders
  - [ ] Test state cleanup on unmount

### Accessibility Tests

- [ ] **Automated testing (axe-core)**
  ```typescript
  import { axe } from 'vitest-axe';

  test('has no accessibility violations', async () => {
    const { container } = render(POSButton);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  ```

- [ ] **ARIA attributes**
  ```typescript
  test('has correct ARIA attributes', () => {
    const { getByRole } = render(POSButton, { props: { disabled: true } });
    const button = getByRole('button');

    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
  ```

- [ ] **Keyboard navigation**
  ```typescript
  test('supports keyboard interaction', async () => {
    const onClick = vi.fn();
    const { getByRole } = render(POSButton, { props: { onClick } });
    const button = getByRole('button');

    button.focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalled();
  });
  ```

- [ ] **Screen reader compatibility**
  - [ ] Component has accessible name (aria-label or text content)
  - [ ] Dynamic changes are announced (aria-live)
  - [ ] Form inputs have labels
  - [ ] Error messages are associated with inputs

### Visual Regression Tests

- [ ] **Screenshot light theme**
  ```typescript
  test('visual regression - light theme', async () => {
    const { container } = render(POSButton);
    await expect(container).toMatchImageSnapshot();
  });
  ```

- [ ] **Screenshot dark theme**
  ```typescript
  test('visual regression - dark theme', async () => {
    const { container } = render(POSButton, {
      context: new Map([['theme', 'dark']])
    });
    await expect(container).toMatchImageSnapshot();
  });
  ```

- [ ] **Test responsive breakpoints**
  - [ ] Mobile viewport (375px)
  - [ ] Tablet viewport (768px)
  - [ ] Desktop viewport (1280px)

- [ ] **Test component states**
  - [ ] Default state
  - [ ] Hover state
  - [ ] Focus state
  - [ ] Active/pressed state
  - [ ] Disabled state
  - [ ] Error state
  - [ ] Loading state

### Performance Tests

- [ ] **Bundle size impact**
  ```bash
  npm run build
  # Check dist/assets/*.js file sizes
  # Verify component adds < 5KB to bundle
  ```

- [ ] **Render performance**
  ```typescript
  test('renders within 16ms (60fps)', async () => {
    const startTime = performance.now();
    render(POSButton);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(16);
  });
  ```

- [ ] **Chrome DevTools profiling**
  - [ ] Open component in Storybook
  - [ ] Open Chrome DevTools Performance tab
  - [ ] Record interaction (click, type, etc.)
  - [ ] Verify no long tasks (> 50ms)
  - [ ] Verify no unnecessary re-renders

---

## Documentation Checklist

### Component Documentation

- [ ] **Add to design-system.md**
  ```markdown
  ### POSButton

  Enhanced Material Design 3 button optimized for POS touch interfaces.

  **Features**:
  - 80px × 80px critical size for transaction buttons
  - 56px × 56px comfortable size for primary actions
  - 48px × 48px minimum size (WCAG 2.1 AA compliant)

  **Usage**:
  \```svelte
  <POSButton size="critical" on:click={handlePayment}>
    Complete Payment
  </POSButton>
  \```
  ```

- [ ] **Document props**
  ```markdown
  **Props**:
  - `text` (string) - Button text
  - `size` ('minimum' | 'comfortable' | 'critical') - Touch target size
  - `variant` ('filled' | 'outlined' | 'text') - Visual style
  - `disabled` (boolean) - Whether button is disabled
  - `icon` (string) - Optional icon name
  ```

- [ ] **Document events**
  ```markdown
  **Events**:
  - `click` - Fired when button is clicked
    - Payload: `MouseEvent`
  ```

- [ ] **Include usage examples**
  - [ ] Basic usage
  - [ ] All prop variations
  - [ ] Common patterns
  - [ ] Integration examples

- [ ] **Add accessibility notes**
  ```markdown
  **Accessibility**:
  - WCAG 2.1 AA compliant
  - Keyboard accessible (Enter, Space)
  - Screen reader compatible
  - High contrast support
  - Touch target minimum 48px × 48px
  ```

- [ ] **Screenshot component variants**
  - [ ] Take screenshots of all variants
  - [ ] Include light and dark theme
  - [ ] Show different sizes
  - [ ] Show different states

### Code Documentation

- [ ] **Add inline comments**
  - [ ] Complex logic explained
  - [ ] Accessibility rationale documented
  - [ ] Browser quirks/workarounds noted
  - [ ] Performance optimizations explained

- [ ] **Update CHANGELOG** (if applicable)
  ```markdown
  ## [0.2.0] - 2025-09-30
  ### Added
  - POSButton component with critical/comfortable/minimum sizes
  ```

---

## Review & Approval Checklist

### Code Review

- [ ] **Request peer review**
  - [ ] Assign reviewer with MD3/accessibility expertise
  - [ ] Link to this checklist in PR description
  - [ ] Mark checklist items completed

- [ ] **Address review feedback**
  - [ ] Resolve all comments
  - [ ] Update code based on suggestions
  - [ ] Re-request review if major changes

### Accessibility Review

- [ ] **Run automated accessibility audit**
  ```bash
  npm run test:a11y
  ```

- [ ] **Manual accessibility testing**
  - [ ] Keyboard-only navigation
  - [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
  - [ ] Zoom to 200% (text should remain readable)
  - [ ] High contrast mode
  - [ ] Color blindness simulation

- [ ] **Document accessibility testing results**
  - [ ] List screen readers tested
  - [ ] Note any issues found and resolved
  - [ ] Confirm WCAG 2.1 AA compliance

### Design Review

- [ ] **Verify design alignment**
  - [ ] Matches Material Design 3 specifications
  - [ ] Follows HOST brand guidelines
  - [ ] Consistent with other POS components

- [ ] **Test visual quality**
  - [ ] Pixel-perfect rendering
  - [ ] Smooth animations
  - [ ] No visual glitches
  - [ ] Consistent spacing

### QA Testing

- [ ] **Functional testing**
  - [ ] All features work as expected
  - [ ] Edge cases handled
  - [ ] Error states display correctly
  - [ ] Performance is acceptable

- [ ] **Device testing**
  - [ ] iPad (primary device)
  - [ ] Android tablet
  - [ ] iPhone (mobile server app)
  - [ ] Desktop browser

- [ ] **Browser testing**
  - [ ] Chrome (latest)
  - [ ] Safari (latest)
  - [ ] Firefox (latest)
  - [ ] Edge (latest)

### Final Approval

- [ ] **All checklist items complete or documented**
- [ ] **Tests passing** (npm run test)
- [ ] **Typecheck passing** (npm run typecheck)
- [ ] **Lint passing** (npm run lint)
- [ ] **Build passing** (npm run build)
- [ ] **Approved by tech lead**
- [ ] **Approved by accessibility reviewer**
- [ ] **Approved by designer**
- [ ] **Ready to merge**

---

## Post-Merge Tasks

- [ ] **Update PROGRESS.md**
  - [ ] Mark component as completed in tracking table
  - [ ] Update component completion percentage

- [ ] **Announce component**
  - [ ] Post in team channel
  - [ ] Update component library Storybook
  - [ ] Add to Week 2 accomplishments

- [ ] **Monitor for issues**
  - [ ] Watch for bug reports
  - [ ] Respond to questions
  - [ ] Address issues promptly

---

## Notes & Deviations

Use this section to document any deviations from the checklist or special considerations:

```
Example:
- Skipped VoiceOver testing: No macOS device available. Tested with NVDA and JAWS instead.
- Touch target size: Used 60px instead of 56px for better thumb reach on iPad Pro.
- Bundle size: Component adds 6KB due to date picker dependency (acceptable for critical feature).
```

---

## Resources

- **Material Design 3 Specs**: https://m3.material.io/
- **m3-svelte Documentation**: https://ktibow.github.io/m3-svelte
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Touch Target Size**: https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
- **Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **axe DevTools**: https://www.deque.com/axe/devtools/
- **HOST Design System**: [design-system.md](../design-system.md)
- **HOST ADR-003**: [ADR-003-material-design-3.md](../adr/ADR-003-material-design-3.md)

---

*Checklist Version: 1.0.0*
*Last Updated: 2025-09-30*
*Maintained by: HOST Frontend Team*