# Svelte 5 Runes Guide
## Complete Reference for HOST POS Development

---

## Table of Contents

- [Introduction](#introduction)
- [What Are Runes?](#what-are-runes)
- [Core Runes](#core-runes)
  - [$state](#state)
  - [$derived](#derived)
  - [$effect](#effect)
  - [$props](#props)
  - [$bindable](#bindable)
- [Snippets & Children](#snippets--children)
- [Event Handling](#event-handling)
- [TypeScript Integration](#typescript-integration)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)

---

## Introduction

Svelte 5 introduces **runes**, a revolutionary reactivity system that makes state management explicit, predictable, and powerful. This guide provides comprehensive coverage of runes with real examples from our HOST POS codebase.

### Why Runes?

Runes solve key problems with Svelte 4's implicit reactivity:
- **Explicit Reactivity**: No more "magic" `$:` statements
- **Better Performance**: Fine-grained reactivity tracking
- **Clearer Mental Model**: State, derived values, and effects are distinct
- **TypeScript Friendly**: Better type inference and safety

### What Changed from Svelte 4?

| Svelte 4 | Svelte 5 | Purpose |
|----------|----------|---------|
| `let count = 0` | `let count = $state(0)` | Reactive state |
| `$: doubled = count * 2` | `let doubled = $derived(count * 2)` | Computed values |
| `$: { console.log(count) }` | `$effect(() => console.log(count))` | Side effects |
| `export let prop` | `let { prop } = $props()` | Component props |
| `on:click` | `onclick` | Event handlers |
| Slots | Snippets | Reusable markup |

---

## What Are Runes?

Runes are **compiler instructions** that look like function calls but are actually **keywords**:

```svelte
<script lang="ts">
let count = $state(0);  // ← This is a rune, not a function
</script>
```

### Key Characteristics

1. **No Import Required**: Runes are built into Svelte
2. **Cannot Be Assigned**: `const x = $state; x(0)` doesn't work
3. **Compiler Magic**: Transformed at compile-time, not runtime
4. **Type Safe**: Full TypeScript support

### Available Runes

- `$state` - Declares reactive state
- `$derived` - Creates computed values
- `$effect` - Runs side effects
- `$props` - Receives component props
- `$bindable` - Enables two-way binding
- `$inspect` - Debug state changes (development only)
- `$host` - Access component instance

---

## Core Runes

### $state

`$state` creates reactive state that automatically updates the UI when changed.

#### Basic Usage

```svelte
<script lang="ts">
let count = $state(0);
let name = $state('');
let items = $state<string[]>([]);
</script>

<button onclick={() => count++}>
  Clicked {count} times
</button>
```

**From our codebase** (`apps/pos/src/routes/+page.svelte`):
```svelte
<script lang="ts">
import { onMount } from 'svelte';

let currentTime = $state(new Date().toLocaleTimeString());

onMount(() => {
  const interval = setInterval(() => {
    currentTime = new Date().toLocaleTimeString();
  }, 1000);

  return () => clearInterval(interval);
});
</script>

<p>{currentTime}</p>
```

#### Deep Reactivity

Svelte 5 automatically makes objects and arrays deeply reactive:

```svelte
<script lang="ts">
let todos = $state([
  { id: 1, text: 'Learn Svelte 5', done: false },
  { id: 2, text: 'Build POS system', done: true }
]);

function toggleTodo(id: number) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.done = !todo.done;  // ✅ This triggers reactivity!
  }
}

function addTodo(text: string) {
  todos.push({ id: Date.now(), text, done: false });  // ✅ This works!
}
</script>
```

#### $state.raw()

For performance-critical scenarios with large objects that don't need deep reactivity:

```svelte
<script lang="ts">
// Large data structure that doesn't need deep tracking
let bigData = $state.raw({
  users: Array(10000).fill({ name: 'User', email: 'user@example.com' })
});

// Can only reassign, not mutate
bigData = { users: [...] };  // ✅ Works
bigData.users.push({ ... });  // ❌ No reactivity
</script>
```

**When to use `$state.raw()`**:
- Large data structures (>1000 items)
- Immutable data patterns
- Performance-critical scenarios
- Data from external sources

#### $state.snapshot()

Creates a static copy of proxied state for use with external libraries:

```svelte
<script lang="ts">
import { someExternalLibrary } from 'some-lib';

let state = $state({ count: 0, name: 'Test' });

function sendToLibrary() {
  // External libraries don't understand Svelte proxies
  const snapshot = $state.snapshot(state);
  someExternalLibrary.process(snapshot);  // ✅ Works
}
</script>
```

---

### $derived

`$derived` creates computed values that automatically update when their dependencies change.

#### Basic Usage

```svelte
<script lang="ts">
let count = $state(0);
let doubled = $derived(count * 2);
let quadrupled = $derived(doubled * 2);  // Can chain!
</script>

<p>Count: {count}</p>
<p>Doubled: {doubled}</p>
<p>Quadrupled: {quadrupled}</p>
```

#### Complex Derivations with $derived.by()

For computations that don't fit in a single expression:

```svelte
<script lang="ts">
let numbers = $state([1, 2, 3, 4, 5]);

let stats = $derived.by(() => {
  const sum = numbers.reduce((a, b) => a + b, 0);
  const avg = sum / numbers.length;
  const max = Math.max(...numbers);
  const min = Math.min(...numbers);

  return { sum, avg, max, min };
});
</script>

<p>Sum: {stats.sum}</p>
<p>Average: {stats.avg}</p>
<p>Max: {stats.max}, Min: {stats.min}</p>
```

**Example from POS system**:
```svelte
<script lang="ts">
let orderItems = $state<OrderItem[]>([]);

let orderTotal = $derived.by(() => {
  const subtotal = orderItems.reduce((sum, item) =>
    sum + (item.price * item.quantity), 0
  );
  const tax = subtotal * 0.0825;  // 8.25% tax
  const total = subtotal + tax;

  return { subtotal, tax, total };
});
</script>

<p>Subtotal: ${orderTotal.subtotal.toFixed(2)}</p>
<p>Tax: ${orderTotal.tax.toFixed(2)}</p>
<p>Total: ${orderTotal.total.toFixed(2)}</p>
```

#### Important: Derived Values Must Be Pure

```svelte
<script lang="ts">
let count = $state(0);

// ❌ BAD: Side effects in derived
let bad = $derived(() => {
  console.log('Count changed!');  // Side effect!
  return count * 2;
});

// ✅ GOOD: Pure computation
let good = $derived(count * 2);

// Use $effect for side effects
$effect(() => {
  console.log('Count changed!', count);
});
</script>
```

---

### $effect

`$effect` runs side effects when reactive dependencies change.

#### Basic Usage

```svelte
<script lang="ts">
let count = $state(0);

$effect(() => {
  console.log('Count is now:', count);
});
</script>
```

**From our codebase** (`apps/pos/src/routes/orders/+page.svelte`):
```svelte
<script lang="ts">
import { goto } from '$app/navigation';

// Effect using $effect
$effect(() => {
	console.log('Orders page loaded');
	// Could trigger analytics, load data, etc.
});
</script>
```

#### Cleanup Functions

Effects can return cleanup functions that run before the next effect or on unmount:

```svelte
<script lang="ts">
let count = $state(0);

$effect(() => {
  const interval = setInterval(() => {
    count++;
  }, 1000);

  // Cleanup function
  return () => {
    clearInterval(interval);
  };
});
</script>
```

#### When to Use $effect vs $derived

| Use $derived | Use $effect |
|-------------|------------|
| Computing new values | Making network requests |
| Transforming data | Updating DOM directly |
| Filtering/mapping arrays | Third-party library integration |
| Math calculations | Analytics/logging |
| Formatting strings | LocalStorage updates |

```svelte
<script lang="ts">
let searchQuery = $state('');

// ✅ GOOD: Use $derived for data transformation
let filteredItems = $derived(
  items.filter(item => item.name.includes(searchQuery))
);

// ✅ GOOD: Use $effect for API calls
$effect(() => {
  if (searchQuery.length > 2) {
    fetch(`/api/search?q=${searchQuery}`)
      .then(r => r.json())
      .then(results => {
        // Handle results
      });
  }
});
</script>
```

#### $effect.pre()

Runs **before** the DOM updates (useful for measuring DOM before changes):

```svelte
<script lang="ts">
let items = $state([1, 2, 3]);

$effect.pre(() => {
  const height = element.offsetHeight;
  console.log('Height before update:', height);
});

$effect(() => {
  const height = element.offsetHeight;
  console.log('Height after update:', height);
});
</script>
```

#### $effect.tracking()

Check if code is running inside a tracking context:

```svelte
<script lang="ts">
function someFunction() {
  if ($effect.tracking()) {
    console.log('Running inside $effect or $derived');
  }
}
</script>
```

---

### $props

`$props` receives props from parent components.

#### Basic Usage

```svelte
<script lang="ts">
// Receive all props
let props = $props();

// Or destructure
let { title, count } = $props();
</script>
```

#### With TypeScript

**From our codebase** (`apps/pos/src/lib/components/POSCard.svelte`):
```svelte
<script lang="ts">
import { Card } from 'm3-svelte';
import type { Snippet } from 'svelte';

interface Props {
  variant?: 'elevated' | 'filled' | 'outlined';
  children: Snippet;
  onclick?: () => void;
  class?: string;
}

let {
  variant = 'elevated',
  children,
  onclick,
  class: className = ''
}: Props = $props();
</script>

<Card {variant} {onclick} class="pos-card {className}">
  {@render children()}
</Card>
```

#### Default Values

```svelte
<script lang="ts">
let {
  size = 'medium',   // Default value
  disabled = false,  // Default value
  label              // Required (no default)
} = $props();
</script>
```

#### Renaming Props

```svelte
<script lang="ts">
let {
  class: className,      // Rename 'class' to 'className'
  for: htmlFor          // Rename 'for' to 'htmlFor'
} = $props();
</script>
```

#### Rest Props

```svelte
<script lang="ts">
let {
  title,
  description,
  ...restProps  // All other props
} = $props();
</script>

<div {...restProps}>
  <h1>{title}</h1>
  <p>{description}</p>
</div>
```

---

### $bindable

`$bindable` enables two-way binding for component props.

#### Basic Usage

**Parent component**:
```svelte
<script lang="ts">
let value = $state('');
</script>

<Input bind:value />
```

**Child component (Input.svelte)**:
```svelte
<script lang="ts">
let { value = $bindable('') } = $props();
</script>

<input bind:value />
```

#### With TypeScript

```svelte
<script lang="ts">
interface Props {
  value?: string;
}

let { value = $bindable('') }: Props = $props();
</script>
```

---

## Snippets & Children

Snippets are Svelte 5's replacement for slots, providing a more powerful way to pass reusable markup.

### Basic Snippet Declaration

```svelte
<script lang="ts">
let items = ['Apple', 'Banana', 'Cherry'];
</script>

{#snippet listItem(item, index)}
  <li class="item-{index}">
    {index + 1}. {item}
  </li>
{/snippet}

<ul>
  {#each items as item, i}
    {@render listItem(item, i)}
  {/each}
</ul>
```

### Children Snippet

**From our codebase** (`apps/pos/src/routes/+layout.svelte`):
```svelte
<script lang="ts">
import type { Snippet } from 'svelte';

interface Props {
  children: Snippet;
}

let { children }: Props = $props();
</script>

<div class="app">
  <header>
    <!-- Header content -->
  </header>

  <main>
    {@render children()}
  </main>

  <footer>
    <!-- Footer content -->
  </footer>
</div>
```

### Snippet with Parameters

```svelte
<!-- Parent.svelte -->
<script lang="ts">
import Card from './Card.svelte';
</script>

<Card>
  {#snippet header()}
    <h2>Card Title</h2>
  {/snippet}

  {#snippet body()}
    <p>Card content goes here</p>
  {/snippet}

  {#snippet footer(closeCard)}
    <button onclick={closeCard}>Close</button>
  {/snippet}
</Card>

<!-- Card.svelte -->
<script lang="ts">
import type { Snippet } from 'svelte';

interface Props {
  header?: Snippet;
  body?: Snippet;
  footer?: Snippet<[()] => void]>;  // Snippet that receives a function
}

let { header, body, footer }: Props = $props();

function handleClose() {
  console.log('Card closed');
}
</script>

<div class="card">
  {#if header}
    <div class="card-header">
      {@render header()}
    </div>
  {/if}

  <div class="card-body">
    {@render body()}
  </div>

  {#if footer}
    <div class="card-footer">
      {@render footer(handleClose)}
    </div>
  {/if}
</div>
```

### TypeScript Snippet Types

```typescript
import type { Snippet } from 'svelte';

// Snippet with no parameters
type SimpleSnippet = Snippet;

// Snippet with one parameter
type ItemSnippet<T> = Snippet<[T]>;

// Snippet with multiple parameters
type ComplexSnippet = Snippet<[string, number, boolean]>;

// Optional snippet
type OptionalSnippet = Snippet | undefined;
```

**Real example from POSCard**:
```svelte
<script lang="ts">
import type { Snippet } from 'svelte';

interface Props {
  children: Snippet;  // Required snippet
  actions?: Snippet;  // Optional snippet
}

let { children, actions }: Props = $props();
</script>

<div class="card">
  <div class="card-content">
    {@render children()}
  </div>

  {#if actions}
    <div class="card-actions">
      {@render actions()}
    </div>
  {/if}
</div>
```

---

## Event Handling

Svelte 5 changes how events work: **events are now properties**, not directives.

### Svelte 4 vs Svelte 5

| Svelte 4 | Svelte 5 |
|----------|----------|
| `on:click={handler}` | `onclick={handler}` |
| `on:input={handler}` | `oninput={handler}` |
| `on:submit={handler}` | `onsubmit={handler}` |
| `on:custom={handler}` | `oncustom={handler}` |

### Basic Event Handling

```svelte
<script lang="ts">
let count = $state(0);

function increment() {
  count++;
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    increment();
  }
}
</script>

<button onclick={increment}>
  Clicked {count} times
</button>

<input onkeydown={handleKeydown} />
```

### Inline Event Handlers

```svelte
<script lang="ts">
let count = $state(0);
</script>

<!-- Arrow function -->
<button onclick={() => count++}>
  Increment
</button>

<!-- With event parameter -->
<button onclick={(e) => {
  console.log('Event:', e);
  count++;
}}>
  Increment with Log
</button>
```

### Component Events (Callback Props)

**Parent component**:
```svelte
<script lang="ts">
function handleSave(data: OrderData) {
  console.log('Saving:', data);
}

function handleCancel() {
  console.log('Cancelled');
}
</script>

<OrderForm
  onsave={handleSave}
  oncancel={handleCancel}
/>
```

**Child component (OrderForm.svelte)**:
```svelte
<script lang="ts">
interface Props {
  onsave?: (data: OrderData) => void;
  oncancel?: () => void;
}

let { onsave, oncancel }: Props = $props();

function handleSubmit() {
  const data = { /* ... */ };
  onsave?.(data);
}
</script>

<form onsubmit={(e) => {
  e.preventDefault();
  handleSubmit();
}}>
  <!-- Form fields -->
  <button type="submit">Save</button>
  <button type="button" onclick={oncancel}>Cancel</button>
</form>
```

### Event Modifiers

Svelte 5 still supports event modifiers:

```svelte
<!-- Prevent default -->
<form onsubmit|preventDefault={handleSubmit}>

<!-- Stop propagation -->
<button onclick|stopPropagation={handleClick}>

<!-- Once (runs only once) -->
<button onclick|once={handleClick}>

<!-- Multiple modifiers -->
<button onclick|preventDefault|stopPropagation={handleClick}>
```

---

## TypeScript Integration

### Typing State

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

let user = $state<User | null>(null);
let users = $state<User[]>([]);
let count = $state<number>(0);  // Usually inferred
```

### Typing Props

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onclick?: (event: MouseEvent) => void;
  children: Snippet;
}

let {
  variant = 'primary',
  size = 'md',
  disabled = false,
  onclick,
  children
}: ButtonProps = $props();
```

### Typing Derived Values

```typescript
let users = $state<User[]>([]);

// Type is inferred as User[]
let activeUsers = $derived(
  users.filter(u => u.active)
);

// Explicit type
let activeUsers: User[] = $derived(
  users.filter(u => u.active)
);
```

### Typing Effects

```typescript
$effect(() => {
  // TypeScript infers types from context
  const cleanup: () => void = () => {
    console.log('Cleanup');
  };

  return cleanup;
});
```

---

## Best Practices

### 1. Prefer $derived over $effect for Transformations

```svelte
<!-- ❌ BAD -->
<script lang="ts">
let numbers = $state([1, 2, 3, 4, 5]);
let doubled = $state<number[]>([]);

$effect(() => {
  doubled = numbers.map(n => n * 2);
});
</script>

<!-- ✅ GOOD -->
<script lang="ts">
let numbers = $state([1, 2, 3, 4, 5]);
let doubled = $derived(numbers.map(n => n * 2));
</script>
```

### 2. Keep Effects Focused and Simple

```svelte
<!-- ❌ BAD: Multiple responsibilities -->
<script lang="ts">
$effect(() => {
  fetchUserData();
  updateAnalytics();
  logToConsole();
  syncToLocalStorage();
});
</script>

<!-- ✅ GOOD: Separate effects -->
<script lang="ts">
$effect(() => {
  fetchUserData();
});

$effect(() => {
  updateAnalytics();
});

$effect(() => {
  syncToLocalStorage();
});
</script>
```

### 3. Use $state.raw() for Large Immutable Data

```svelte
<script lang="ts">
// ❌ BAD: Deep reactivity for large static data
let bigData = $state({
  items: Array(10000).fill({ /* ... */ })
});

// ✅ GOOD: Use $state.raw() for immutable data
let bigData = $state.raw({
  items: Array(10000).fill({ /* ... */ })
});
</script>
```

### 4. Always Type Your Props

```svelte
<!-- ❌ BAD: No types -->
<script lang="ts">
let { title, count } = $props();
</script>

<!-- ✅ GOOD: Explicit types -->
<script lang="ts">
interface Props {
  title: string;
  count: number;
}

let { title, count }: Props = $props();
</script>
```

### 5. Use Snippets Over Repeated Markup

```svelte
<!-- ❌ BAD: Repeated markup -->
<div class="card">
  <h3>{item1.title}</h3>
  <p>{item1.description}</p>
</div>

<div class="card">
  <h3>{item2.title}</h3>
  <p>{item2.description}</p>
</div>

<!-- ✅ GOOD: Snippet for reusability -->
{#snippet itemCard(item)}
  <div class="card">
    <h3>{item.title}</h3>
    <p>{item.description}</p>
  </div>
{/snippet}

{@render itemCard(item1)}
{@render itemCard(item2)}
```

---

## Common Patterns

### Pattern 1: Form Handling

```svelte
<script lang="ts">
interface FormData {
  name: string;
  email: string;
  message: string;
}

let formData = $state<FormData>({
  name: '',
  email: '',
  message: ''
});

let errors = $state<Partial<Record<keyof FormData, string>>>({});

let isValid = $derived(
  formData.name.length > 0 &&
  formData.email.includes('@') &&
  formData.message.length > 10
);

function handleSubmit() {
  if (isValid) {
    // Submit form
    console.log('Submitting:', formData);
  }
}
</script>

<form onsubmit|preventDefault={handleSubmit}>
  <input
    type="text"
    bind:value={formData.name}
    placeholder="Name"
  />
  {#if errors.name}
    <span class="error">{errors.name}</span>
  {/if}

  <input
    type="email"
    bind:value={formData.email}
    placeholder="Email"
  />

  <textarea
    bind:value={formData.message}
    placeholder="Message"
  />

  <button type="submit" disabled={!isValid}>
    Submit
  </button>
</form>
```

### Pattern 2: Data Fetching

```svelte
<script lang="ts">
interface User {
  id: number;
  name: string;
  email: string;
}

let userId = $state(1);
let user = $state<User | null>(null);
let loading = $state(false);
let error = $state<string | null>(null);

$effect(() => {
  loading = true;
  error = null;

  fetch(`/api/users/${userId}`)
    .then(r => r.json())
    .then(data => {
      user = data;
      loading = false;
    })
    .catch(err => {
      error = err.message;
      loading = false;
    });
});
</script>

{#if loading}
  <p>Loading...</p>
{:else if error}
  <p class="error">{error}</p>
{:else if user}
  <div>
    <h2>{user.name}</h2>
    <p>{user.email}</p>
  </div>
{/if}
```

### Pattern 3: Toggle/Modal State

```svelte
<script lang="ts">
let isOpen = $state(false);

function open() {
  isOpen = true;
}

function close() {
  isOpen = false;
}

function toggle() {
  isOpen = !isOpen;
}

// Close on Escape key
$effect(() => {
  if (!isOpen) return;

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      close();
    }
  }

  window.addEventListener('keydown', handleKeydown);

  return () => {
    window.removeEventListener('keydown', handleKeydown);
  };
});
</script>

<button onclick={toggle}>Toggle Modal</button>

{#if isOpen}
  <div class="modal-backdrop" onclick={close}>
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <h2>Modal Title</h2>
      <p>Modal content</p>
      <button onclick={close}>Close</button>
    </div>
  </div>
{/if}
```

### Pattern 4: List Management (CRUD)

```svelte
<script lang="ts">
interface TodoItem {
  id: number;
  text: string;
  done: boolean;
}

let todos = $state<TodoItem[]>([]);
let newTodoText = $state('');

let activeTodos = $derived(todos.filter(t => !t.done));
let completedTodos = $derived(todos.filter(t => t.done));

function addTodo() {
  if (newTodoText.trim()) {
    todos.push({
      id: Date.now(),
      text: newTodoText,
      done: false
    });
    newTodoText = '';
  }
}

function toggleTodo(id: number) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.done = !todo.done;
  }
}

function deleteTodo(id: number) {
  todos = todos.filter(t => t.id !== id);
}
</script>

<form onsubmit|preventDefault={addTodo}>
  <input bind:value={newTodoText} placeholder="New todo" />
  <button type="submit">Add</button>
</form>

<h3>Active ({activeTodos.length})</h3>
<ul>
  {#each activeTodos as todo (todo.id)}
    <li>
      <input
        type="checkbox"
        checked={todo.done}
        onchange={() => toggleTodo(todo.id)}
      />
      {todo.text}
      <button onclick={() => deleteTodo(todo.id)}>Delete</button>
    </li>
  {/each}
</ul>

<h3>Completed ({completedTodos.length})</h3>
<ul>
  {#each completedTodos as todo (todo.id)}
    <li>
      <input
        type="checkbox"
        checked={todo.done}
        onchange={() => toggleTodo(todo.id)}
      />
      <s>{todo.text}</s>
      <button onclick={() => deleteTodo(todo.id)}>Delete</button>
    </li>
  {/each}
</ul>
```

---

## Troubleshooting

### Issue: "Cannot access X before initialization"

```svelte
<!-- ❌ BAD: Accessing derived before declaration -->
<script lang="ts">
console.log(doubled);  // Error!

let count = $state(0);
let doubled = $derived(count * 2);
</script>

<!-- ✅ GOOD: Declare first, use later -->
<script lang="ts">
let count = $state(0);
let doubled = $derived(count * 2);

console.log(doubled);  // Works!
</script>
```

### Issue: Destructured State Loses Reactivity

```svelte
<script lang="ts">
let user = $state({ name: 'Alice', age: 30 });

// ❌ BAD: Loses reactivity
let { name, age } = user;
name = 'Bob';  // Doesn't update user.name!

// ✅ GOOD: Access via user object
user.name = 'Bob';  // Updates reactively
</script>
```

### Issue: Effect Running Too Often

```svelte
<!-- ❌ BAD: Creates new object every time -->
<script lang="ts">
let count = $state(0);

$effect(() => {
  const config = { value: count };  // New object!
  doSomething(config);
});
</script>

<!-- ✅ GOOD: Only track primitive values -->
<script lang="ts">
let count = $state(0);

$effect(() => {
  doSomething(count);  // Only re-runs when count changes
});
</script>
```

### Issue: Props Not Updating

```svelte
<!-- Parent.svelte -->
<script lang="ts">
let value = $state('initial');
</script>

<Child {value} />

<!-- Child.svelte -->
<!-- ❌ BAD: Overwriting prop -->
<script lang="ts">
let { value } = $props();
value = 'new';  // Breaks parent binding!
</script>

<!-- ✅ GOOD: Use local state -->
<script lang="ts">
let { value: initialValue } = $props();
let value = $state(initialValue);
</script>
```

---

## Resources

### Official Documentation
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/what-are-runes)
- [Svelte 5 Migration Guide](https://svelte.dev/docs/svelte/v5-migration-guide)
- [Svelte 5 Tutorial](https://learn.svelte.dev/)

### HOST POS Documentation
- [ADR-001: Svelte 5 Framework](adr/ADR-001-svelte-5-framework.md)
- [m3-svelte Integration Guide](m3-svelte-integration.md)
- [Design System Guide](design-system.md)

### Community Resources
- [Svelte Discord](https://discord.gg/svelte)
- [Svelte GitHub](https://github.com/sveltejs/svelte)
- [Svelte Blog](https://svelte.dev/blog)

---

## SvelteKit Integration

### Page Component Data Access Pattern

SvelteKit page components should **receive data as props** from load functions, not access global state via `$app/state`. This is the standard SvelteKit pattern and makes components testable.

#### ❌ WRONG: Using $app/state for Page Data

```svelte
<!-- +page.svelte -->
<script lang="ts">
import { page } from '$app/state';
</script>

<h1>Welcome, {$page.data.user.name}</h1>
<p>Email: {$page.data.user.email}</p>
<p>Roles: {$page.data.user.roles.join(', ')}</p>
```

**Problems with this approach:**
- ❌ Component is coupled to SvelteKit global state
- ❌ Cannot test component in isolation
- ❌ Mocking `$app/state` is complex and fragile
- ❌ Breaks component reusability
- ❌ Not the standard SvelteKit pattern

#### ✅ CORRECT: Using Props from Load Function

```svelte
<!-- +page.svelte -->
<script lang="ts">
import type { PageData } from './$types';

// Receive data from parent layout or page load function
let { data }: { data: PageData } = $props();
</script>

<h1>Welcome, {data.user.name}</h1>
<p>Email: {data.user.email}</p>
<p>Roles: {data.user.roles.join(', ')}</p>
```

**Benefits of props pattern:**
- ✅ Standard SvelteKit pattern (recommended in docs)
- ✅ Fully testable without mocking
- ✅ Component is isolated and reusable
- ✅ Full TypeScript type inference
- ✅ Clear data flow: load function → props → component

### When to Use $app/state

The `page` store from `$app/state` should **only be used for URL/route metadata**, not page data:

#### ✅ GOOD: Using $app/state for URL/Route Info

```svelte
<script lang="ts">
import { page } from '$app/state';

// Get current URL
let currentUrl = $derived(page.url.pathname);

// Get route parameters
let postId = $derived(page.params.id);

// Check if on specific route
let isHomePage = $derived(page.url.pathname === '/');
</script>

<nav>
  <a href="/" aria-current={isHomePage ? 'page' : undefined}>
    Home
  </a>
  <p>Current path: {currentUrl}</p>
</nav>
```

#### ❌ AVOID: Using $app/state for Page Data

```svelte
<script lang="ts">
import { page } from '$app/state';

// ❌ BAD: Don't access page data this way
let user = $derived($page.data.user);
let posts = $derived($page.data.posts);
</script>

<!-- Use props instead! -->
```

### Decision Matrix: $app/state vs Props

| Data Type | Use Props | Use $app/state |
|-----------|-----------|----------------|
| **User info from layout** | ✅ YES | ❌ NO |
| **Data from load function** | ✅ YES | ❌ NO |
| **Session/auth data** | ✅ YES | ❌ NO |
| **Form state** | ✅ YES | ❌ NO |
| **Current URL (page.url)** | ❌ NO | ✅ YES |
| **Route params (page.params)** | ❌ NO | ✅ YES |
| **Route ID (page.route.id)** | ❌ NO | ✅ YES |

### Complete Example: User Profile Page

**Load Function** (`+page.ts`):
```typescript
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
  const { user } = await parent();  // Get user from layout

  return {
    user,
    currentPage: 'profile'
  };
};
```

**Page Component** (`+page.svelte`):
```svelte
<script lang="ts">
import { page } from '$app/state';
import type { PageData } from './$types';

// ✅ GOOD: Get data from props
let { data }: { data: PageData } = $props();

// ✅ GOOD: Use $app/state for URL info
let currentPath = $derived(page.url.pathname);
let userId = $derived(page.params.userId);

// Derived state from props
let fullName = $derived(`${data.user.firstName} ${data.user.lastName}`);
let isAdmin = $derived(data.user.roles.includes('admin'));
</script>

<div class="profile-page">
  <!-- Using data from props -->
  <h1>{fullName}</h1>
  <p>Email: {data.user.email}</p>
  <p>Roles: {data.user.roles.join(', ')}</p>

  {#if isAdmin}
    <div class="admin-badge">Admin</div>
  {/if}

  <!-- Using URL info from $app/state -->
  <nav>
    <p>Current path: {currentPath}</p>
    <a href="/users/{userId}/settings">Settings</a>
  </nav>
</div>
```

### Testing Page Components

**With Props Pattern** (✅ Simple, no mocking):
```typescript
import { render } from 'vitest-browser-svelte';
import { expect, it } from 'vitest';
import { page } from '@vitest/browser/context';
import ProfilePage from './+page.svelte';

it('should display user profile information', async () => {
  render(ProfilePage, {
    props: {
      data: {
        user: {
          firstName: 'Alice',
          lastName: 'Smith',
          email: 'alice@example.com',
          roles: ['admin', 'manager']
        },
        currentPage: 'profile'
      }
    }
  });

  const heading = page.getByRole('heading', { name: 'Alice Smith' });
  await expect.element(heading).toBeInTheDocument();

  const email = page.getByText('Email: alice@example.com');
  await expect.element(email).toBeInTheDocument();

  const adminBadge = page.getByText('Admin');
  await expect.element(adminBadge).toBeInTheDocument();
});
```

**With $app/state Pattern** (❌ Complex, requires mocking):
```typescript
// ❌ DON'T DO THIS - requires complex mocking setup
import { vi } from 'vitest';

vi.mock('$app/state', async () => {
  const original = await vi.importActual('$app/state');
  return {
    ...original,
    page: {
      data: { user: mockUser },  // Error: read-only getter!
      url: new URL('http://localhost'),
      params: {}
    }
  };
});

// This approach leads to endless mocking issues
```

### Key Principles

1. **Props for Data**: Page data should always come through props from load functions
2. **$app/state for Metadata**: Only use `page` store for URL, params, and route info
3. **Keep Components Testable**: Avoid coupling to SvelteKit globals when props work
4. **Follow SvelteKit Patterns**: The framework is designed for props-based data flow

### Migration Checklist

If you have components using `$app/state` for page data, refactor them:

- [ ] Identify components accessing `$page.data.*`
- [ ] Add `let { data } = $props()` to receive props
- [ ] Change `$page.data.user` to `data.user`
- [ ] Update tests to pass props instead of mocking
- [ ] Verify TypeScript types with `PageData` from `./$types`
- [ ] Remove `$app/state` import if only used for data

**Before** (❌ Using $app/state):
```svelte
<script lang="ts">
import { page } from '$app/state';
</script>

<p>{$page.data.user.email}</p>
```

**After** (✅ Using props):
```svelte
<script lang="ts">
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
</script>

<p>{data.user.email}</p>
```

---

*Last Updated: 2025-10-05*
*Version: 1.1.0*
*Maintained by: HOST Frontend Team*
