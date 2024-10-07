# HOST Accessibility Requirements
## WCAG 2.1 AA Compliance Guidelines & Testing Requirements

---

## Overview

HOST POS system must be accessible to all users, including those with disabilities. This document outlines accessibility requirements following WCAG 2.1 Level AA standards, ensuring the system is usable by people with various disabilities including visual, auditory, motor, and cognitive impairments.

---

## Material Design 3 Built-in Accessibility

HOST POS uses **Material Design 3 (MD3) via m3-svelte** as the primary design system, which provides comprehensive accessibility features out of the box (see [ADR-003](adr/ADR-003-material-design-3.md) and [design-system.md](design-system.md)).

### MD3 WCAG 2.1 AA Compliance

Material Design 3 components include built-in accessibility features that meet or exceed WCAG 2.1 Level AA requirements:

**Color & Contrast**:
- **4.5:1 contrast ratio** for normal text against backgrounds (WCAG 2.1 AA requirement)
- **3:1 contrast ratio** for large text (≥18pt or ≥14pt bold)
- **3:1 contrast ratio** for UI components and graphical objects
- **HCT color system** (Hue, Chroma, Tone) automatically generates accessible color palettes
- **Dynamic color themes** maintain contrast requirements in both light and dark modes

**Touch Targets**:
- **48px × 48px minimum** touch target size (WCAG 2.1 AA Level A requirement: 2.5.5 Target Size)
- **56px** comfortable touch targets for primary POS actions
- **80px** critical touch targets for transaction buttons
- Proper spacing between interactive elements to prevent accidental activation

**Keyboard Navigation**:
- Full keyboard support for all interactive components
- Logical tab order following visual layout
- Focus trapping in modal dialogs and sheets
- Visible focus indicators with **3:1 contrast minimum** (WCAG 2.1 AA)
- Keyboard shortcuts follow platform conventions

**Screen Reader Support**:
- Proper ARIA attributes on all components
- Semantic HTML elements (buttons, links, headings, lists)
- Dynamic content announcements via ARIA live regions
- Descriptive labels and accessible names
- Role descriptions for custom components

**Motion & Animation**:
- Respects `prefers-reduced-motion` media query
- Essential motion only (non-decorative)
- Animation duration and easing adjustable

**Additional Features**:
- High contrast mode support
- Text size/zoom support up to 200%
- Works with system accessibility settings
- Compatible with screen readers (NVDA, JAWS, VoiceOver)
- Focus management in complex components

### Implementation Notes

While MD3 provides WCAG 2.1 AA compliance by default, all POS-optimized component wrappers must:

1. **Maintain MD3 Accessibility**: Do not override or remove built-in accessibility features
2. **Test Each Wrapper**: Run automated (axe-core) and manual accessibility tests
3. **Verify Touch Targets**: Ensure custom sizing meets 48px × 48px minimum
4. **Test with Assistive Tech**: Verify with actual screen readers and keyboard navigation
5. **Document Deviations**: If accessibility features must be modified, document why and ensure alternative compliance

See [checklists/md3-component-checklist.md](checklists/md3-component-checklist.md) for complete accessibility testing requirements.

---

## WCAG 2.1 Principles

### 1. Perceivable
Information and UI components must be presentable in ways users can perceive.

### 2. Operable
UI components and navigation must be operable by all users.

### 3. Understandable
Information and UI operation must be understandable.

### 4. Robust
Content must be robust enough to work with various assistive technologies.

---

## Visual Accessibility

### Color Requirements

#### Contrast Ratios
```css
/* Minimum contrast ratios */
:root {
  /* Normal text (< 18pt or < 14pt bold) */
  --min-contrast-normal: 4.5:1;

  /* Large text (≥ 18pt or ≥ 14pt bold) */
  --min-contrast-large: 3:1;

  /* Non-text elements (icons, buttons) */
  --min-contrast-ui: 3:1;
}

/* Color palette with tested contrast ratios */
.theme-light {
  --color-text: #1a1a1a;        /* Contrast 15.3:1 on white */
  --color-text-secondary: #4a4a4a; /* Contrast 8.6:1 on white */
  --color-background: #ffffff;
  --color-primary: #0066cc;      /* Contrast 4.5:1 on white */
  --color-error: #d32f2f;        /* Contrast 4.5:1 on white */
  --color-success: #2e7d32;      /* Contrast 4.6:1 on white */
}

.theme-dark {
  --color-text: #f0f0f0;        /* Contrast 14.1:1 on black */
  --color-text-secondary: #b0b0b0; /* Contrast 7.2:1 on black */
  --color-background: #121212;
  --color-primary: #4da6ff;      /* Contrast 4.7:1 on black */
  --color-error: #ff6b6b;        /* Contrast 4.5:1 on black */
  --color-success: #6bcf7f;      /* Contrast 4.6:1 on black */
}
```

#### Color Independence
```typescript
// Never rely solely on color to convey information
interface StatusIndicator {
  color: string;
  icon: string;    // Always include icon
  label: string;   // Always include text
  pattern?: string; // Optional pattern for colorblind users
}

const orderStatus: Record<string, StatusIndicator> = {
  open: {
    color: 'blue',
    icon: 'circle-dot',
    label: 'Open',
  },
  preparing: {
    color: 'orange',
    icon: 'clock',
    label: 'Preparing',
  },
  ready: {
    color: 'green',
    icon: 'check-circle',
    label: 'Ready',
  },
  closed: {
    color: 'gray',
    icon: 'check-double',
    label: 'Closed',
  },
};
```

### Focus Indicators
```css
/* Visible focus indicators for keyboard navigation */
*:focus {
  outline: none; /* Remove default */
}

*:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
  border-radius: 2px;
}

/* High contrast focus for better visibility */
@media (prefers-contrast: high) {
  *:focus-visible {
    outline-width: 4px;
    outline-color: currentColor;
  }
}

/* Focus styles for interactive elements */
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  box-shadow: 0 0 0 3px var(--color-focus-ring);
  z-index: 1;
}
```

### Text Requirements
```css
/* Minimum font sizes */
body {
  font-size: 16px; /* Minimum base size */
  line-height: 1.5; /* Minimum line height */
}

/* Scalable text */
html {
  font-size: 100%; /* Respect user preferences */
}

/* Support for text spacing adjustments */
* {
  /* Allow 200% letter spacing */
  letter-spacing: inherit;

  /* Allow 200% word spacing */
  word-spacing: inherit;

  /* Allow 200% line height */
  line-height: inherit;

  /* Allow 200% paragraph spacing */
  margin-block: inherit;
}

/* No text in images */
.text-as-image {
  /* Prohibited except for logos */
  display: none;
}
```

---

## Keyboard Accessibility

### Navigation Requirements
```typescript
// All interactive elements must be keyboard accessible
interface KeyboardNavigable {
  tabIndex: number;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  role?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

// Keyboard shortcuts with accessibility
const keyboardShortcuts: Record<string, KeyboardShortcut> = {
  newOrder: {
    keys: ['Alt', 'N'],
    action: 'Create new order',
    customizable: true,
    announceAction: true,
  },
  searchMenu: {
    keys: ['Ctrl', 'K'],
    action: 'Search menu items',
    customizable: true,
    announceAction: true,
  },
  help: {
    keys: ['F1'],
    action: 'Open help',
    customizable: false,
    announceAction: true,
  },
};

```svelte
<!-- SkipLinks.svelte -->
<div class="skip-links">
  <a href="#main-content" class="skip-link">
    Skip to main content
  </a>
  <a href="#navigation" class="skip-link">
    Skip to navigation
  </a>
  <a href="#search" class="skip-link">
    Skip to search
  </a>
</div>
```
```

### Focus Management
```typescript
// Focus trap for modals - Svelte action
export function focusTrap(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  function handleTabKey(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  element.addEventListener('keydown', handleTabKey);
  firstElement?.focus();

  return {
    destroy() {
      element.removeEventListener('keydown', handleTabKey);
    }
  };
}
```

### Keyboard Patterns
```typescript
// Menu navigation with arrow keys - Svelte store
import { writable } from 'svelte/store';

export function createMenuKeyboardNav(items: MenuItem[]) {
  const selectedIndex = writable(0);

  function handleKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex.update((prev) =>
          prev < items.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        selectedIndex.update((prev) =>
          prev > 0 ? prev - 1 : items.length - 1
        );
        break;

      case 'Home':
        e.preventDefault();
        setSelectedIndex(0);
        break;

      case 'End':
        e.preventDefault();
        setSelectedIndex(items.length - 1);
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        items[selectedIndex]?.onClick?.();
        break;

      case 'Escape':
        e.preventDefault();
        // Close menu
        break;
    }
  };

  return { selectedIndex, handleKeyDown };
}
```

---

## Screen Reader Support

### ARIA Labels and Descriptions
```svelte
<!-- AccessibleButton.svelte -->
<script lang="ts">
  export let label: string;
  export let description: string = '';
  export let pressed: boolean | undefined = undefined;
  export let expanded: boolean | undefined = undefined;
  export let controls: string | undefined = undefined;

  const descId = description ? `desc-${Math.random().toString(36).substr(2, 9)}` : undefined;
</script>

<button
  aria-label={label}
  aria-describedby={descId}
  aria-pressed={pressed}
  aria-expanded={expanded}
  aria-controls={controls}
  on:click
  {...$$restProps}
>
  <slot />
  {#if description}
    <span id={descId} class="sr-only">
      {description}
    </span>
  {/if}
</button>
```

### Live Regions
```svelte
<!-- LiveRegion.svelte -->
<script lang="ts">
  export let message: string;
  export let priority: 'polite' | 'assertive' = 'polite';
</script>

<div
  role="status"
  aria-live={priority}
  aria-atomic="true"
  class="sr-only"
>
  {message}
</div>
```

```svelte
<!-- OrderStatus.svelte -->
<script lang="ts">
  import LiveRegion from './LiveRegion.svelte';

  interface Props {
    order: Order;
  }

  let { order }: Props = $props();
  let announcement = $state('');

  function setAnnouncement(msg: string) {
    announcement = msg;
  }

  $effect(() => {
    setAnnouncement(`Order ${order.number} status changed to ${order.status}`);
  });
</script>

<div class="order-status">
  Status: {order.status}
</div>
<LiveRegion message={announcement} priority="polite" />
```

### Semantic HTML
```svelte
<!-- OrderList.svelte -->
<script lang="ts">
  interface Props {
    orders: Order[];
  }

  let { orders }: Props = $props();
</script>

<main id="main-content">
  <header>
    <h1>Active Orders</h1>
    <p id="order-count">Showing {orders.length} orders</p>
  </header>

  <nav aria-label="Order filters">
    <ul role="list">
      <li><button>All Orders</button></li>
      <li><button>Open</button></li>
      <li><button>In Progress</button></li>
    </ul>
  </nav>

  <section aria-labelledby="order-list-heading" aria-describedby="order-count">
    <h2 id="order-list-heading" class="sr-only">
      Order List
    </h2>

    <ul role="list" aria-label="Orders">
      {#each orders as order (order.id)}
        <li>
          <article aria-labelledby="order-{order.id}">
            <h3 id="order-{order.id}">
              Order #{order.number}
            </h3>
            <!-- Order content -->
          </article>
        </li>
      {/each}
    </ul>
  </section>
</main>
```

### Form Accessibility
```svelte
<!-- AccessibleInput.svelte -->
<script lang="ts">
  interface Props {
    label: string;
    error?: string;
    required?: boolean;
    helpText?: string;
    value?: string;
  }

  let { label, error, required, helpText, value = $bindable(''), ...restProps }: Props = $props();

  const inputId = $derived(`input-${label.toLowerCase().replace(/\s/g, '-')}`);
  const errorId = $derived(`${inputId}-error`);
  const helpId = $derived(`${inputId}-help`);

  const describedBy = $derived(
    [helpText && helpId, error && errorId].filter(Boolean).join(' ')
  );
</script>

<div class="form-field">
  <label for={inputId}>
    {label}
    {#if required}
      <span aria-label="required">*</span>
    {/if}
  </label>

  {#if helpText}
    <p id={helpId} class="help-text">
      {helpText}
    </p>
  {/if}

  <input
    id={inputId}
    bind:value
    aria-required={required}
    aria-invalid={!!error}
    aria-describedby={describedBy || undefined}
    {...restProps}
  />

  {#if error}
    <p id={errorId} role="alert" class="error-message">
      <span class="sr-only">Error:</span> {error}
    </p>
  {/if}
</div>
```

---

## Motor Accessibility

### Touch Target Sizes
```css
/* Minimum touch target sizes */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: 8px;
}

/* Spacing between targets */
.touch-target + .touch-target {
  margin-left: 8px; /* Minimum 8px spacing */
}

/* Larger targets for primary actions */
.primary-action {
  min-width: 48px;
  min-height: 48px;
  font-size: 16px;
  font-weight: 600;
}
```

### Gesture Alternatives
```typescript
// Provide alternatives to complex gestures
interface AccessibleSwipeableProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  children: React.ReactNode;
}

export const AccessibleSwipeable: React.FC<AccessibleSwipeableProps> = ({
  onSwipeLeft,
  onSwipeRight,
  children,
}) => (
  <div className="swipeable-container">
    {/* Gesture-based interaction */}
    <Swipeable
      onSwipedLeft={onSwipeLeft}
      onSwipedRight={onSwipeRight}
    >
      {children}
    </Swipeable>

    {/* Button alternatives */}
    <div className="swipe-alternatives" role="group" aria-label="Actions">
      {onSwipeLeft && (
        <button onClick={onSwipeLeft} aria-label="Previous">
          <ChevronLeft />
        </button>
      )}
      {onSwipeRight && (
        <button onClick={onSwipeRight} aria-label="Next">
          <ChevronRight />
        </button>
      )}
    </div>
  </div>
);
```

### Timing Adjustments
```typescript
// Allow users to adjust timing
interface TimingSettings {
  autoLogoutMinutes: number;
  toastDurationMs: number;
  animationSpeed: number;
}

const defaultTimings: TimingSettings = {
  autoLogoutMinutes: 30,
  toastDurationMs: 5000,
  animationSpeed: 1,
};

export function useAccessibleTiming(): TimingSettings {
  const userPreferences = useUserPreferences();

  // Allow 10x timing adjustments
  return {
    autoLogoutMinutes: defaultTimings.autoLogoutMinutes *
      (userPreferences.extendedTiming ? 10 : 1),
    toastDurationMs: defaultTimings.toastDurationMs *
      (userPreferences.extendedTiming ? 10 : 1),
    animationSpeed: userPreferences.reduceMotion ? 0 :
      defaultTimings.animationSpeed,
  };
}
```

---

## Cognitive Accessibility

### Clear Language
```typescript
// Use clear, simple language
const errorMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address (example@domain.com)',
  password: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number',
  cardNumber: 'Please enter a valid card number (16 digits)',

  // Avoid jargon
  networkError: 'Connection problem. Please check your internet and try again.',
  // NOT: 'Network socket timeout exception'

  serverError: 'Something went wrong. Please try again or contact support.',
  // NOT: '500 Internal Server Error'
};
```

### Consistent Layout
```tsx
// Consistent navigation and layout patterns
export const ConsistentLayout: React.FC = ({ children }) => (
  <div className="app-layout">
    {/* Navigation always in same position */}
    <nav className="main-nav" aria-label="Main navigation">
      <ul>
        <li><Link to="/orders">Orders</Link></li>
        <li><Link to="/menu">Menu</Link></li>
        <li><Link to="/inventory">Inventory</Link></li>
        <li><Link to="/reports">Reports</Link></li>
      </ul>
    </nav>

    {/* Consistent header */}
    <header className="app-header">
      <h1>HOST POS</h1>
      <div className="user-info">{/* User info always here */}</div>
    </header>

    {/* Main content area */}
    <main className="app-content">
      {/* Breadcrumbs for context */}
      <Breadcrumbs />
      {children}
    </main>

    {/* Consistent footer */}
    <footer className="app-footer">
      <button>Help</button>
      <button>Support</button>
    </footer>
  </div>
);
```

### Error Prevention
```typescript
// Prevent and clearly explain errors
export const SafeDeleteButton: React.FC<{
  onDelete: () => void;
  itemName: string;
}> = ({ onDelete, itemName }) => {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        aria-label={`Delete ${itemName}`}
      >
        Delete
      </button>
    );
  }

  return (
    <div role="alertdialog" aria-labelledby="confirm-title">
      <h3 id="confirm-title">Confirm Deletion</h3>
      <p>
        Are you sure you want to delete "{itemName}"?
        This action cannot be undone.
      </p>
      <button onClick={onDelete} className="danger">
        Yes, Delete
      </button>
      <button onClick={() => setConfirming(false)}>
        Cancel
      </button>
    </div>
  );
};
```

---

## Testing Requirements

### Automated Testing
```typescript
// Jest + Testing Library accessibility tests
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<OrderList />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should be keyboard navigable', () => {
    const { getAllByRole } = render(<Menu />);
    const buttons = getAllByRole('button');

    buttons.forEach(button => {
      expect(button).toHaveAttribute('tabIndex');
      expect(parseInt(button.tabIndex)).toBeGreaterThanOrEqual(0);
    });
  });

  it('should have proper ARIA labels', () => {
    const { getByLabelText } = render(<OrderForm />);

    expect(getByLabelText('Customer Name')).toBeInTheDocument();
    expect(getByLabelText('Table Number')).toBeInTheDocument();
    expect(getByLabelText('Add Item to Order')).toBeInTheDocument();
  });

  it('should announce live updates', async () => {
    const { getByRole } = render(<OrderStatus order={mockOrder} />);
    const status = getByRole('status');

    // Update order status
    mockOrder.status = 'ready';

    await waitFor(() => {
      expect(status).toHaveTextContent('Order 123 status changed to ready');
    });
  });
});
```

### Manual Testing Checklist
```markdown
## Keyboard Navigation
- [ ] Can navigate entire app using only keyboard
- [ ] Tab order is logical and follows visual flow
- [ ] Focus indicators are visible
- [ ] No keyboard traps
- [ ] Shortcuts don't conflict with screen reader

## Screen Reader Testing
- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] Test with VoiceOver (macOS/iOS)
- [ ] Test with TalkBack (Android)
- [ ] All content is announced correctly
- [ ] Form errors are announced
- [ ] Dynamic updates are announced

## Visual Testing
- [ ] Zoom to 200% without horizontal scrolling
- [ ] Works with Windows High Contrast mode
- [ ] Works with dark mode
- [ ] Color contrast passes WCAG AA
- [ ] No information conveyed by color alone

## Motor Testing
- [ ] All targets minimum 44x44px
- [ ] Adequate spacing between targets
- [ ] No time limits or adjustable
- [ ] Alternatives to gestures provided

## Cognitive Testing
- [ ] Clear error messages
- [ ] Consistent navigation
- [ ] Simple language used
- [ ] Help readily available
- [ ] Confirmation for destructive actions
```

### Browser & Assistive Technology Support
```yaml
# Minimum supported versions
browsers:
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+

screen_readers:
  - NVDA 2021.1+
  - JAWS 2021+
  - VoiceOver (latest)
  - TalkBack (latest)

additional_at:
  - Dragon NaturallySpeaking 15+
  - ZoomText 2021+
  - Windows Magnifier
  - Switch Control (iOS/macOS)
```

---

## Implementation Guidelines

### Component Accessibility Checklist
```typescript
// Every component must follow this checklist
interface ComponentAccessibilityRequirements {
  // Visual
  colorContrast: 'WCAG AA compliant';
  focusIndicator: 'visible and clear';

  // Keyboard
  keyboardAccessible: true;
  tabIndex: 'properly managed';
  shortcuts?: 'documented and customizable';

  // Screen Reader
  semanticHTML: true;
  ariaLabels: 'comprehensive';
  liveRegions?: 'for dynamic content';

  // Motor
  targetSize: 'minimum 44x44px';
  gestures?: 'alternatives provided';

  // Testing
  automatedTests: true;
  manualTesting: true;
  userTesting?: 'with disabled users';
}
```

### Development Workflow
1. **Design Phase**: Review designs for accessibility
2. **Implementation**: Follow accessibility patterns
3. **Testing**: Run automated tests
4. **Manual Review**: Test with keyboard and screen reader
5. **User Testing**: Test with actual users with disabilities
6. **Documentation**: Document accessibility features

---

## Resources

### Tools
- **axe DevTools**: Browser extension for accessibility testing
- **WAVE**: Web accessibility evaluation tool
- **Contrast Ratio Checker**: Ensure color compliance
- **Screen Readers**: NVDA (free), JAWS, VoiceOver
- **Pa11y**: Command line accessibility testing

### References
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)

---

*Last Updated: September 29, 2025*
*Version: 0.1.0-alpha*
*Compliance Level: WCAG 2.1 AA*