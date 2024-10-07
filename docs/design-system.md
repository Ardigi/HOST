# HOST Design System
## Material Design 3 Component Library for POS Interfaces

---

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Design Principles](#design-principles)
- [Component Library](#component-library)
  - [Buttons & Actions](#buttons--actions)
  - [Forms & Input](#forms--input)
  - [Navigation](#navigation)
  - [Containers](#containers)
  - [Data Display](#data-display)
  - [Feedback](#feedback)
  - [POS-Specific Components](#pos-specific-components)
- [Design Tokens](#design-tokens)
- [Theming](#theming)
- [Accessibility](#accessibility)
- [Best Practices](#best-practices)
- [Resources](#resources)

---

## Introduction

HOST uses **Material Design 3** (MD3) as its primary design system, implemented through the native Svelte library **m3-svelte**. This provides a comprehensive, accessible, and performant foundation for building touch-optimized point-of-sale interfaces.

### What is Material Design 3?

Material Design 3 is Google's open-source design system that provides:

- **Adaptive Design**: Responds to user preferences and device capabilities
- **Dynamic Color**: Generate accessible color schemes from a single brand color
- **Enhanced Accessibility**: WCAG 2.1 AA compliance built-in
- **Modern Aesthetics**: Clean, expressive visual language
- **Proven Patterns**: Battle-tested UX patterns from Google products

### Why m3-svelte?

We chose m3-svelte over other implementations because:

- **Native Svelte 5**: Built specifically for Svelte with runes, snippets, and modern patterns
- **50+ Components**: More components than the official @material/web (16 components)
- **Better Performance**: ~150KB bundle vs ~450KB for @material/web (3x smaller)
- **Built-in Accessibility**: WCAG 2.1 AA compliant out of the box
- **Touch-Optimized**: Material Design 3 includes proper touch target specifications
- **No SSR Issues**: Native Svelte components work perfectly with SvelteKit

See [ADR-003: Material Design 3](adr/ADR-003-material-design-3.md) for the complete decision rationale.

### Design System Goals

1. **Consistency**: Uniform visual language across all HOST applications
2. **Accessibility**: WCAG 2.1 AA compliance for all users
3. **Performance**: Fast, responsive interfaces meeting the Doherty Threshold (<400ms)
4. **Touch-Friendly**: Optimized for tablet and mobile POS devices
5. **Maintainability**: Centralized components with clear documentation
6. **Developer Experience**: Type-safe, well-documented, easy to use

---

## Getting Started

### Installation

Install m3-svelte in your workspace package:

```bash
cd packages/ui
npm install m3-svelte@^5.2.2
```

### Basic Usage

```svelte
<script lang="ts">
  import { Button } from 'm3-svelte';

  function handleClick() {
    console.log('Button clicked!');
  }
</script>

<Button on:click={handleClick}>
  Click Me
</Button>
```

### Creating POS-Optimized Wrappers

All m3-svelte components should be wrapped with POS-specific enhancements:

```svelte
<!-- packages/ui/src/components/pos/POSButton.svelte -->
<script lang="ts">
  import { Button } from 'm3-svelte';

  export let size: 'minimum' | 'comfortable' | 'critical' = 'comfortable';
  export let variant: 'filled' | 'outlined' | 'text' = 'filled';
</script>

<Button
  {variant}
  class="pos-button pos-button-{size}"
  style:min-height="{size === 'critical' ? '80px' : size === 'comfortable' ? '56px' : '48px'}"
  style:min-width="{size === 'critical' ? '200px' : size === 'comfortable' ? '120px' : '48px'}"
  on:click
>
  <slot />
</Button>

<style>
  .pos-button {
    font-size: 18px; /* Larger for readability */
    padding: 0 24px;
  }
</style>
```

### Component Checklist

Use the standardized checklist for all component wrappers:
- [MD3 Component Implementation Checklist](checklists/md3-component-checklist.md)

---

## Design Principles

### Touch-First Design

HOST POS is designed for touch interfaces (iPads, Android tablets). All components follow these principles:

1. **Large Touch Targets**
   - Minimum: 48px × 48px (WCAG 2.1 AA)
   - Comfortable: 56px × 56px (primary actions)
   - Critical: 80px × 80px (transaction buttons)

2. **Adequate Spacing**
   - Minimum 8px between interactive elements
   - 16px for comfortable separation
   - 24px for visual grouping

3. **Clear Visual Feedback**
   - Immediate response to touch (<100ms)
   - Visual state changes (hover, active, disabled)
   - Haptic feedback for critical actions

### Accessibility First

Every component must meet WCAG 2.1 Level AA requirements:

1. **Color Contrast**
   - 4.5:1 for normal text
   - 3:1 for large text and UI components
   - 3:1 for focus indicators

2. **Keyboard Navigation**
   - All functionality keyboard accessible
   - Logical tab order
   - Visible focus indicators
   - Modal focus trapping

3. **Screen Reader Support**
   - Proper ARIA attributes
   - Semantic HTML
   - Descriptive labels
   - Dynamic content announcements

4. **Motion Preferences**
   - Respect `prefers-reduced-motion`
   - No essential content conveyed through motion alone

### Performance Standards

All components must meet these performance targets:

- **Render Time**: < 16ms (60fps)
- **Bundle Size**: < 5KB per component
- **Touch Response**: < 100ms
- **Animation Duration**: 150ms - 300ms (fast but noticeable)

---

## Component Library

### Buttons & Actions

#### Button

**Purpose**: Primary interactive element for triggering actions.

**Variants**:
- `filled` - High emphasis (primary actions)
- `outlined` - Medium emphasis (secondary actions)
- `text` - Low emphasis (tertiary actions)
- `elevated` - Floating appearance
- `tonal` - Filled with tonal color

**Props**:
```typescript
interface ButtonProps {
  variant?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  href?: string;  // Renders as link
  icon?: string;  // Icon name
  iconPosition?: 'leading' | 'trailing';
}
```

**Events**:
- `click`: Fired when button is clicked

**Usage**:
```svelte
<script>
  import { Button } from 'm3-svelte';
</script>

<!-- Primary action -->
<Button variant="filled" on:click={handleSubmit}>
  Complete Order
</Button>

<!-- Secondary action -->
<Button variant="outlined" on:click={handleCancel}>
  Cancel
</Button>

<!-- With icon -->
<Button variant="filled" icon="check">
  Confirm
</Button>
```

**POS Wrapper** (POSButton):
```svelte
<script>
  import { POSButton } from '@host/ui';
</script>

<!-- Critical transaction button -->
<POSButton size="critical" on:click={completePayment}>
  Complete Payment
</POSButton>

<!-- Comfortable primary action -->
<POSButton size="comfortable" on:click={sendOrder}>
  Send to Kitchen
</POSButton>

<!-- Minimum secondary action -->
<POSButton size="minimum" variant="outlined" on:click={addNote}>
  Add Note
</POSButton>
```

**Accessibility**:
- ✅ 48px minimum touch target
- ✅ Keyboard accessible (Enter, Space)
- ✅ High contrast (3:1 minimum)
- ✅ Screen reader compatible
- ✅ Disabled state properly conveyed

---

#### FAB (Floating Action Button)

**Purpose**: Prominent button for primary screen action.

**Variants**:
- `surface` - Standard FAB
- `primary` - Primary color FAB
- `secondary` - Secondary color FAB
- `tertiary` - Tertiary color FAB

**Sizes**:
- `small` - 40px (icon only)
- `medium` - 56px (icon only, default)
- `large` - 96px (icon + label)

**Props**:
```typescript
interface FABProps {
  variant?: 'surface' | 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  icon: string;
  label?: string;  // For large size
  extended?: boolean;  // Extended with text
}
```

**Usage**:
```svelte
<FAB
  variant="primary"
  size="large"
  icon="add"
  label="New Order"
  on:click={createOrder}
/>
```

**POS Usage**: Use for primary screen action (Create Order, Complete Payment).

---

#### Icon Button

**Purpose**: Compact button with only an icon.

**Props**:
```typescript
interface IconButtonProps {
  icon: string;
  toggle?: boolean;  // Toggleable state
  selected?: boolean;  // For toggle buttons
  disabled?: boolean;
}
```

**Usage**:
```svelte
<IconButton icon="more_vert" on:click={openMenu} />

<!-- Toggle button -->
<IconButton
  icon="favorite"
  toggle
  selected={isFavorite}
  on:click={() => isFavorite = !isFavorite}
/>
```

**Accessibility**: Must have `aria-label` or `aria-labelledby` for screen readers.

---

### Forms & Input

#### TextField

**Purpose**: Single-line or multi-line text input.

**Variants**:
- `filled` - Filled container (default)
- `outlined` - Outlined border

**Props**:
```typescript
interface TextFieldProps {
  variant?: 'filled' | 'outlined';
  label: string;
  value: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  maxlength?: number;
  leadingIcon?: string;
  trailingIcon?: string;
  multiline?: boolean;
  rows?: number;
}
```

**Events**:
- `input`: Fires on every input change
- `change`: Fires when input loses focus
- `focus`: Fires when input gains focus
- `blur`: Fires when input loses focus

**Usage**:
```svelte
<script>
  let customerName = '';
  let email = '';
  let notes = '';
</script>

<!-- Basic text field -->
<TextField
  label="Customer Name"
  bind:value={customerName}
  placeholder="Enter customer name"
/>

<!-- With validation -->
<TextField
  label="Email"
  type="email"
  bind:value={email}
  helperText="We'll send the receipt here"
  errorText={emailError}
  required
/>

<!-- Multiline -->
<TextField
  label="Order Notes"
  bind:value={notes}
  multiline
  rows={3}
/>
```

**POS Wrapper** (POSTextField):
```svelte
<POSTextField
  label="Customer Name"
  bind:value={customerName}
  style:min-height="56px"
  style:font-size="18px"
/>
```

**Accessibility**:
- ✅ Label programmatically associated
- ✅ Error messages announced to screen readers
- ✅ Helper text available but not required
- ✅ Required state conveyed

---

#### Select

**Purpose**: Dropdown selection from a list of options.

**Props**:
```typescript
interface SelectProps {
  label: string;
  value: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  errorText?: string;
}
```

**Usage**:
```svelte
<script>
  let tableNumber = '';
  const tables = [
    { value: '1', label: 'Table 1' },
    { value: '2', label: 'Table 2' },
    { value: '3', label: 'Table 3' },
  ];
</script>

<Select
  label="Table Number"
  bind:value={tableNumber}
  options={tables}
  required
/>
```

**Accessibility**:
- ✅ Keyboard navigable (Arrow keys, Enter, Escape)
- ✅ Screen reader announces options
- ✅ Selected option properly identified

---

#### Checkbox

**Purpose**: Binary selection (checked/unchecked).

**Props**:
```typescript
interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  required?: boolean;
  label?: string;
}
```

**Usage**:
```svelte
<script>
  let acceptTerms = false;
  let addGratuity = true;
</script>

<Checkbox
  bind:checked={acceptTerms}
  label="I accept the terms and conditions"
  required
/>

<Checkbox
  bind:checked={addGratuity}
  label="Add 18% gratuity"
/>
```

**Accessibility**:
- ✅ 48px minimum touch target
- ✅ Keyboard accessible (Space to toggle)
- ✅ Screen reader announces state

---

#### Radio

**Purpose**: Single selection from multiple options.

**Props**:
```typescript
interface RadioProps {
  name: string;
  value: string;
  checked: boolean;
  disabled?: boolean;
  label?: string;
}
```

**Usage**:
```svelte
<script>
  let orderType = 'dine_in';
</script>

<fieldset>
  <legend>Order Type</legend>

  <Radio
    name="orderType"
    value="dine_in"
    bind:group={orderType}
    label="Dine In"
  />

  <Radio
    name="orderType"
    value="takeout"
    bind:group={orderType}
    label="Takeout"
  />

  <Radio
    name="orderType"
    value="delivery"
    bind:group={orderType}
    label="Delivery"
  />
</fieldset>
```

**Accessibility**:
- ✅ Grouped with fieldset/legend
- ✅ Arrow keys navigate within group
- ✅ Space selects option

---

#### Switch

**Purpose**: Toggle between on/off states.

**Props**:
```typescript
interface SwitchProps {
  checked: boolean;
  disabled?: boolean;
  label?: string;
}
```

**Usage**:
```svelte
<script>
  let darkMode = false;
  let notifications = true;
</script>

<Switch
  bind:checked={darkMode}
  label="Dark Mode"
/>

<Switch
  bind:checked={notifications}
  label="Enable Notifications"
/>
```

**POS Usage**: Settings toggles, feature enablement.

---

#### DateField / TimeField

**Purpose**: Date and time selection with native pickers.

**Props**:
```typescript
interface DateFieldProps {
  label: string;
  value: string;  // ISO date string
  min?: string;
  max?: string;
  disabled?: boolean;
  required?: boolean;
}
```

**Usage**:
```svelte
<script>
  let reservationDate = '';
  let reservationTime = '';
</script>

<DateField
  label="Reservation Date"
  bind:value={reservationDate}
  min={new Date().toISOString().split('T')[0]}
  required
/>

<TimeField
  label="Reservation Time"
  bind:value={reservationTime}
  required
/>
```

**Accessibility**:
- ✅ Native date/time picker accessible
- ✅ Keyboard navigable
- ✅ Screen reader compatible

---

### Navigation

#### AppBar (Top App Bar)

**Purpose**: Primary navigation and branding at top of screen.

**Variants**:
- `center-aligned` - Title centered
- `small` - Default small height
- `medium` - Medium height with scrolling behavior
- `large` - Large height with scrolling behavior

**Props**:
```typescript
interface AppBarProps {
  variant?: 'center-aligned' | 'small' | 'medium' | 'large';
  title: string;
  leadingIcon?: string;
  trailingActions?: Array<{ icon: string; onClick: () => void }>;
}
```

**Usage**:
```svelte
<script>
  const actions = [
    { icon: 'search', onClick: () => console.log('Search') },
    { icon: 'more_vert', onClick: () => console.log('More') },
  ];
</script>

<AppBar
  title="Orders"
  leadingIcon="menu"
  trailingActions={actions}
  on:leadingClick={openDrawer}
/>
```

**POS Wrapper** (POSAppBar):
```svelte
<POSAppBar
  title="Order #1234"
  :trailingActions={[
    { icon: 'save', onClick: saveOrder },
    { icon: 'print', onClick: printReceipt },
  ]}
/>
```

---

#### Navigation Drawer

**Purpose**: Side panel for navigation and settings.

**Variants**:
- `standard` - Persistent on desktop
- `modal` - Overlays content

**Props**:
```typescript
interface DrawerProps {
  variant?: 'standard' | 'modal';
  open: boolean;
  title?: string;
}
```

**Usage**:
```svelte
<script>
  let drawerOpen = false;
</script>

<Drawer
  variant="modal"
  bind:open={drawerOpen}
  title="Menu"
>
  <nav>
    <a href="/orders">Orders</a>
    <a href="/menu">Menu</a>
    <a href="/inventory">Inventory</a>
    <a href="/reports">Reports</a>
    <a href="/settings">Settings</a>
  </nav>
</Drawer>
```

**Accessibility**:
- ✅ Focus trapped when open
- ✅ Escape closes drawer
- ✅ Focus returns to trigger element

---

#### Tabs

**Purpose**: Navigate between related content sections.

**Props**:
```typescript
interface TabsProps {
  value: string;
  tabs: Array<{ value: string; label: string; icon?: string; disabled?: boolean }>;
}
```

**Usage**:
```svelte
<script>
  let activeTab = 'orders';
  const tabs = [
    { value: 'orders', label: 'Orders', icon: 'receipt' },
    { value: 'menu', label: 'Menu', icon: 'restaurant_menu' },
    { value: 'payments', label: 'Payments', icon: 'payment' },
  ];
</script>

<Tabs
  bind:value={activeTab}
  {tabs}
/>

{#if activeTab === 'orders'}
  <OrdersView />
{:else if activeTab === 'menu'}
  <MenuView />
{:else if activeTab === 'payments'}
  <PaymentsView />
{/if}
```

**Accessibility**:
- ✅ Arrow keys navigate tabs
- ✅ Home/End keys jump to first/last
- ✅ Screen reader announces selection

---

#### Bottom Navigation

**Purpose**: Primary navigation on mobile devices.

**Props**:
```typescript
interface BottomNavProps {
  value: string;
  items: Array<{ value: string; label: string; icon: string; badge?: number }>;
}
```

**Usage**:
```svelte
<script>
  let activeNav = 'orders';
  const navItems = [
    { value: 'orders', label: 'Orders', icon: 'receipt', badge: 3 },
    { value: 'menu', label: 'Menu', icon: 'restaurant_menu' },
    { value: 'tables', label: 'Tables', icon: 'table_restaurant' },
    { value: 'more', label: 'More', icon: 'more_horiz' },
  ];
</script>

<BottomNav
  bind:value={activeNav}
  items={navItems}
/>
```

**POS Usage**: Primary navigation on iPad/tablet POS.

---

### Containers

#### Card

**Purpose**: Container for related content and actions.

**Variants**:
- `elevated` - Floating with shadow (default)
- `filled` - Filled background
- `outlined` - Border outline

**Props**:
```typescript
interface CardProps {
  variant?: 'elevated' | 'filled' | 'outlined';
  clickable?: boolean;
}
```

**Usage**:
```svelte
<Card variant="elevated">
  <div class="card-header">
    <h3>Order #1234</h3>
    <span class="badge">Preparing</span>
  </div>

  <div class="card-content">
    <p>Table 5 • 3 items</p>
    <p class="total">$42.50</p>
  </div>

  <div class="card-actions">
    <Button variant="text">View</Button>
    <Button variant="filled">Complete</Button>
  </div>
</Card>
```

**POS Wrapper** (POSCard):
```svelte
<POSCard>
  <!-- Enhanced spacing for touch -->
  <div style:padding="24px">
    <h3>Order #1234</h3>
    <p>$42.50</p>
  </div>
</POSCard>
```

---

#### Dialog

**Purpose**: Modal window for focused tasks or confirmations.

**Variants**:
- `basic` - Standard dialog
- `fullscreen` - Full screen on mobile

**Props**:
```typescript
interface DialogProps {
  open: boolean;
  title?: string;
  variant?: 'basic' | 'fullscreen';
}
```

**Usage**:
```svelte
<script>
  let confirmOpen = false;

  function confirmDelete() {
    // Perform deletion
    confirmOpen = false;
  }
</script>

<Dialog
  bind:open={confirmOpen}
  title="Confirm Deletion"
>
  <div slot="content">
    <p>Are you sure you want to delete this order?</p>
    <p>This action cannot be undone.</p>
  </div>

  <div slot="actions">
    <Button variant="text" on:click={() => confirmOpen = false}>
      Cancel
    </Button>
    <Button variant="filled" on:click={confirmDelete}>
      Delete
    </Button>
  </div>
</Dialog>
```

**Accessibility**:
- ✅ Focus trapped in dialog
- ✅ Escape closes dialog
- ✅ Focus returns to trigger
- ✅ Backdrop click closes dialog

---

#### Menu

**Purpose**: Contextual options popup.

**Props**:
```typescript
interface MenuProps {
  open: boolean;
  anchor?: HTMLElement;
  items: Array<{
    label: string;
    icon?: string;
    disabled?: boolean;
    divider?: boolean;
    onClick: () => void;
  }>;
}
```

**Usage**:
```svelte
<script>
  let menuOpen = false;
  let anchorEl: HTMLElement;

  const menuItems = [
    { label: 'Edit', icon: 'edit', onClick: () => console.log('Edit') },
    { label: 'Duplicate', icon: 'content_copy', onClick: () => console.log('Duplicate') },
    { label: 'Delete', icon: 'delete', onClick: () => console.log('Delete') },
  ];
</script>

<IconButton
  icon="more_vert"
  bind:ref={anchorEl}
  on:click={() => menuOpen = true}
/>

<Menu
  bind:open={menuOpen}
  anchor={anchorEl}
  items={menuItems}
/>
```

**Accessibility**:
- ✅ Keyboard navigable (Arrow keys)
- ✅ Escape closes menu
- ✅ Enter/Space activates item

---

### Data Display

#### List

**Purpose**: Display collection of items.

**Props**:
```typescript
interface ListProps {
  items: Array<{
    title: string;
    subtitle?: string;
    leadingIcon?: string;
    trailingIcon?: string;
    onClick?: () => void;
  }>;
}
```

**Usage**:
```svelte
<script>
  const orders = [
    {
      title: 'Order #1234',
      subtitle: 'Table 5 • $42.50',
      leadingIcon: 'receipt',
      onClick: () => viewOrder('1234')
    },
    {
      title: 'Order #1235',
      subtitle: 'Table 3 • $28.75',
      leadingIcon: 'receipt',
      onClick: () => viewOrder('1235')
    },
  ];
</script>

<List items={orders} />
```

**POS Wrapper**: Enhanced with 56px row height for comfortable touch.

---

#### DataTable

**Purpose**: Tabular data display with sorting and pagination.

**Props**:
```typescript
interface DataTableProps {
  columns: Array<{ key: string; label: string; sortable?: boolean }>;
  rows: Array<Record<string, any>>;
  selectable?: boolean;
  onRowClick?: (row: any) => void;
}
```

**Usage**:
```svelte
<script>
  const columns = [
    { key: 'id', label: 'Order #', sortable: true },
    { key: 'table', label: 'Table', sortable: true },
    { key: 'items', label: 'Items' },
    { key: 'total', label: 'Total', sortable: true },
    { key: 'status', label: 'Status' },
  ];

  const rows = [
    { id: '1234', table: '5', items: '3', total: '$42.50', status: 'Preparing' },
    { id: '1235', table: '3', items: '2', total: '$28.75', status: 'Completed' },
  ];
</script>

<DataTable
  {columns}
  {rows}
  selectable
  onRowClick={(row) => viewOrder(row.id)}
/>
```

---

#### Chips

**Purpose**: Compact elements representing inputs, attributes, or actions.

**Types**:
- `assist` - Suggest actions
- `filter` - Filter content
- `input` - Represent user input
- `suggestion` - Suggest information

**Props**:
```typescript
interface ChipProps {
  type: 'assist' | 'filter' | 'input' | 'suggestion';
  label: string;
  icon?: string;
  selected?: boolean;
  removable?: boolean;
  disabled?: boolean;
}
```

**Usage**:
```svelte
<!-- Filter chips -->
<Chip type="filter" label="Appetizers" selected={true} />
<Chip type="filter" label="Entrees" selected={false} />
<Chip type="filter" label="Desserts" selected={false} />

<!-- Input chips (removable) -->
<Chip type="input" label="Gluten Free" removable on:remove={() => {}} />
<Chip type="input" label="No Onions" removable on:remove={() => {}} />
```

---

#### Badge

**Purpose**: Small status descriptor or count indicator.

**Props**:
```typescript
interface BadgeProps {
  value: number | string;
  variant?: 'default' | 'dot';
  color?: 'primary' | 'error' | 'warning' | 'success';
}
```

**Usage**:
```svelte
<div style="position: relative">
  <IconButton icon="notifications" />
  <Badge value={5} color="error" />
</div>

<!-- Dot variant -->
<div style="position: relative">
  <Button>Messages</Button>
  <Badge variant="dot" color="primary" />
</div>
```

---

### Feedback

#### Snackbar

**Purpose**: Brief messages about app processes.

**Props**:
```typescript
interface SnackbarProps {
  open: boolean;
  message: string;
  action?: { label: string; onClick: () => void };
  duration?: number;  // Auto-dismiss duration (ms)
}
```

**Usage**:
```svelte
<script>
  let snackbarOpen = false;
  let snackbarMessage = '';

  function showSuccess(message: string) {
    snackbarMessage = message;
    snackbarOpen = true;
  }
</script>

<Snackbar
  bind:open={snackbarOpen}
  message={snackbarMessage}
  action={{ label: 'Undo', onClick: () => console.log('Undo') }}
  duration={5000}
/>
```

**POS Usage**: Order confirmations, error messages, success notifications.

---

#### Progress Indicator

**Purpose**: Indicate loading or processing state.

**Variants**:
- `circular` - Spinning circle
- `linear` - Horizontal bar

**Props**:
```typescript
interface ProgressProps {
  variant: 'circular' | 'linear';
  value?: number;  // 0-100, omit for indeterminate
  size?: 'small' | 'medium' | 'large';
}
```

**Usage**:
```svelte
<!-- Indeterminate (unknown duration) -->
<ProgressIndicator variant="circular" />

<!-- Determinate (known progress) -->
<ProgressIndicator variant="linear" value={progress} />
```

---

### POS-Specific Components

#### POSNumberPad

**Purpose**: Large numeric keypad for payment entry.

**Props**:
```typescript
interface NumberPadProps {
  value: string;
  onInput: (value: string) => void;
  onSubmit: () => void;
  maxLength?: number;
  currency?: boolean;
}
```

**Usage**:
```svelte
<script>
  let paymentAmount = '';
</script>

<POSNumberPad
  bind:value={paymentAmount}
  currency
  onSubmit={processPayment}
/>
```

**Features**:
- 80px × 80px buttons (critical size)
- Currency formatting
- Backspace key
- Clear key
- Decimal point

---

## Design Tokens

Design tokens are centralized in the `@host/design-tokens` package. See [packages/design-tokens/README.md](../packages/design-tokens/README.md) for complete documentation.

### Quick Reference

```typescript
import {
  colors,        // Color system
  typography,    // Type scale
  spacing,       // Spacing scale
  touchTargets,  // Touch sizes
  elevation,     // Shadows
  motion,        // Animations
} from '@host/design-tokens';
```

---

## Theming

### Light and Dark Themes

HOST POS supports both light and dark themes, generated from the brand color.

```typescript
import { applyTheme, themes } from '@host/design-tokens/theme';

// Switch to dark theme
applyTheme(themes.dark);

// Detect system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
applyTheme(prefersDark.matches ? themes.dark : themes.light);
```

### Custom Theme

Generate a custom theme from any color:

```typescript
import { generateTheme } from '@host/design-tokens/theme';

const customTheme = generateTheme('#ff0000', {
  isDark: false,
  contrastLevel: 0,
});

applyTheme(customTheme);
```

---

## Accessibility

All components meet WCAG 2.1 Level AA requirements. See [accessibility-requirements.md](accessibility-requirements.md) for complete guidelines.

### Quick Checklist

- ✅ **Color Contrast**: 4.5:1 for text, 3:1 for UI
- ✅ **Touch Targets**: 48px × 48px minimum
- ✅ **Keyboard**: All functionality keyboard accessible
- ✅ **Screen Reader**: Proper ARIA and semantic HTML
- ✅ **Focus**: Visible focus indicators (3:1 contrast)
- ✅ **Motion**: Respects `prefers-reduced-motion`

---

## Best Practices

### Component Usage

1. **Use POS wrappers** for all user-facing components
2. **Follow touch target guidelines** (48px/56px/80px)
3. **Test on actual devices** (iPad, Android tablet)
4. **Verify accessibility** with axe-core and screen readers
5. **Measure performance** (<16ms render, <5KB bundle)

### Code Quality

1. **Type everything** (no `any` types)
2. **Document props** with JSDoc comments
3. **Write tests** (unit, accessibility, visual regression)
4. **Follow checklist** ([md3-component-checklist.md](checklists/md3-component-checklist.md))
5. **Review with team** before merging

---

## Resources

### Official Documentation

- **Material Design 3**: https://m3.material.io/
- **m3-svelte**: https://ktibow.github.io/m3-svelte
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/

### HOST Documentation

- **ADR-003**: [Material Design 3 Decision](adr/ADR-003-material-design-3.md)
- **Design Tokens**: [packages/design-tokens/README.md](../packages/design-tokens/README.md)
- **Component Checklist**: [checklists/md3-component-checklist.md](checklists/md3-component-checklist.md)
- **Accessibility**: [accessibility-requirements.md](accessibility-requirements.md)

---

*Last Updated: 2025-09-30*
*Version: 1.0.0*
*Maintained by: HOST Frontend Team*