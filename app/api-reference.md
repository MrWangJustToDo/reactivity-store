# API Reference

Complete API documentation for RStore.

## Core APIs

### createStore

Create a reactive store with Vue's reactivity APIs.

```tsx
function createStore<T>(setup: () => T): UseStore<T>
```

**Parameters:**
- `setup`: Function that returns the store's reactive state and methods

**Returns:**
- A hook function that can be called with an optional selector

**Example:**

```tsx
import { createStore, ref, computed } from "reactivity-store";

const useCounter = createStore(() => {
  const count = ref(0);
  const doubled = computed(() => count.value * 2);

  const increment = () => count.value++;
  const decrement = () => count.value--;

  return { count, doubled, increment, decrement };
});

// In component
function App() {
  // Get all state
  const { count, doubled, increment } = useCounter();

  // Or use selector
  const count = useCounter(state => state.count);

  return <button onClick={increment}>{count}</button>;
}
```

---

### createState

Create a state with middleware support for persistence, actions, and more.

```tsx
function createState<T>(
  setup: () => T,
  options?: StateOptions<T>
): UseState<T>
```

**Parameters:**
- `setup`: Function that returns a plain object (not reactive)
- `options`: Configuration object for middleware

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `withPersist` | `string \| PersistOptions` | Auto-persist to localStorage |
| `withActions` | `(state: T) => Actions` | Define state mutations |
| `withNamespace` | `string` | Redux DevTools namespace |
| `withDeepSelector` | `boolean` | Track nested changes (default: `true`) |
| `withStableSelector` | `boolean` | Stable selectors for performance |

**Example:**

```tsx
import { createState } from "reactivity-store";

const useSettings = createState(
  () => ({
    theme: "light",
    language: "en"
  }),
  {
    withPersist: "app-settings",
    withActions: (state) => ({
      toggleTheme: () => state.theme = state.theme === "light" ? "dark" : "light",
      setLanguage: (lang: string) => state.language = lang
    }),
    withNamespace: "Settings"
  }
);

// In component
const { theme, toggleTheme } = useSettings();
```

---

### createStoreWithComponent

Create a component-scoped store with lifecycle hooks.

```tsx
function createStoreWithComponent<T>(config: {
  setup: () => T
}): Component<T>
```

**Parameters:**
- `config.setup`: Setup function with access to lifecycle hooks

**Example:**

```tsx
import { createStoreWithComponent, ref, onMounted, onUpdated } from "reactivity-store";

const Counter = createStoreWithComponent({
  setup: () => {
    const count = ref(0);

    onMounted(() => {
      console.log("Counter mounted");
    });

    onUpdated(() => {
      console.log("Counter updated, count:", count.value);
    });

    const increment = () => count.value++;

    return { count, increment };
  }
});

// Usage
function App() {
  return (
    <Counter>
      {({ count, increment }) => (
        <button onClick={increment}>Count: {count}</button>
      )}
    </Counter>
  );
}
```

## Reactivity APIs

All Vue reactivity APIs are re-exported from `@vue/reactivity`:

### ref

Create a reactive reference for primitive values.

```tsx
import { ref } from "reactivity-store";

const count = ref(0);
count.value++; // Access via .value

// In createStore, refs are auto-unwrapped
const { count } = useCounter(); // No .value needed
```

### reactive

Create a reactive object.

```tsx
import { reactive } from "reactivity-store";

const state = reactive({
  count: 0,
  nested: { value: 10 }
});

state.count++; // Direct mutation
state.nested.value = 20; // Deeply reactive
```

### computed

Create computed values with automatic dependency tracking.

```tsx
import { computed, ref } from "reactivity-store";

const count = ref(0);
const doubled = computed(() => count.value * 2);

console.log(doubled.value); // 0
count.value = 5;
console.log(doubled.value); // 10
```

### watch

Watch reactive values and run side effects.

```tsx
import { watch, ref } from "reactivity-store";

const count = ref(0);

watch(
  () => count.value,
  (newValue, oldValue) => {
    console.log(`Count changed from ${oldValue} to ${newValue}`);
  }
);
```

### watchEffect

Automatically track dependencies and run effects.

```tsx
import { watchEffect, ref } from "reactivity-store";

const count = ref(0);

watchEffect(() => {
  console.log("Count is:", count.value);
});
```

## React Hooks

### useReactiveState

Create component-local reactive state.

```tsx
function useReactiveState<T>(
  initial: T | (() => T)
): [state: T, setState: (updater: T | ((state: T) => void)) => void]
```

**Example:**

```tsx
import { useReactiveState } from "reactivity-store";

function Counter() {
  const [state, setState] = useReactiveState({ count: 0 });

  return (
    <button onClick={() => setState(s => { s.count++ })}>
      Count: {state.count}
    </button>
  );
}
```

### useReactiveEffect

Run effects with automatic dependency tracking (no deps array needed).

```tsx
function useReactiveEffect(effect: () => void | (() => void)): void
```

**Example:**

```tsx
import { useReactiveEffect, useReactiveState } from "reactivity-store";

function MouseTracker() {
  const [position, setPosition] = useReactiveState({ x: 0, y: 0 });

  useReactiveEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  });

  return <div>Mouse: ({position.x}, {position.y})</div>;
}
```

## Middleware

### withPersist

Auto-persist state to localStorage/sessionStorage.

```tsx
function withPersist<T>(
  setup: () => T,
  options: {
    key: string;
    getStorage?: () => Storage;
    stringify?: (state: T) => string;
    parse?: (str: string) => T;
    merge?: (fromCreator: T, fromStorage: Partial<T>) => T;
  }
): () => T
```

**Example:**

```tsx
import { createState, withPersist } from "reactivity-store";

// Middleware style
const useSettings = createState(
  withPersist(
    () => ({ theme: "light" }),
    { key: "settings" }
  )
);

// Options style
const useSettings = createState(
  () => ({ theme: "light" }),
  { withPersist: "settings" }
);
```

### withActions

Define actions for state mutations.

```tsx
function withActions<T, A>(
  setup: () => T,
  options: {
    generateActions: (state: T) => A
  }
): () => T & A
```

**Example:**

```tsx
import { createState, withActions } from "reactivity-store";

const useCounter = createState(
  () => ({ count: 0 }),
  {
    withActions: (state) => ({
      increment: () => state.count++,
      decrement: () => state.count--,
      reset: () => state.count = 0
    })
  }
);
```

### withNamespace

Enable Redux DevTools integration.

```tsx
function withNamespace<T>(
  setup: () => T,
  options: {
    namespace: string;
    reduxDevTool?: boolean;
  }
): () => T
```

**Example:**

```tsx
import { createState } from "reactivity-store";

const useStore = createState(
  () => ({ count: 0 }),
  {
    withNamespace: "Counter",
    withActions: (state) => ({
      increment: () => state.count++
    })
  }
);
```

### withSelectorOptions

Configure selector behavior for performance optimization.

```tsx
function withSelectorOptions<T>(
  setup: () => T,
  options: {
    deepSelector?: boolean;
    stableSelector?: boolean;
  }
): () => T
```

**Options:**
- `deepSelector` (default: `true`) - Track nested property changes
- `stableSelector` (default: `false`) - Use stable selectors for performance

**Example:**

```tsx
import { createState } from "reactivity-store";

const useStore = createState(
  () => ({ nested: { count: 0 } }),
  {
    withDeepSelector: true, // Track nested.count changes
    withStableSelector: false
  }
);
```

## Lifecycle Hooks

Available inside `createStoreWithComponent`:

### onMounted

Called when the component mounts.

```tsx
import { onMounted } from "reactivity-store";

onMounted(() => {
  console.log("Component mounted");
});
```

### onUpdated

Called after component updates.

```tsx
import { onUpdated } from "reactivity-store";

onUpdated(() => {
  console.log("Component updated");
});
```

### onUnmounted

Called before component unmounts.

```tsx
import { onUnmounted } from "reactivity-store";

onUnmounted(() => {
  console.log("Component will unmount");
});
```

## Store Methods

### subscribe

Subscribe to state changes outside of React components.

```tsx
store.subscribe<K extends keyof T>(
  selector: (state: T) => K,
  callback: (value: K) => void
): () => void
```

**Example:**

```tsx
const useCounter = createState(
  () => ({ count: 0 }),
  { withActions: (s) => ({ increment: () => s.count++ }) }
);

// Subscribe anywhere
const unsubscribe = useCounter.subscribe(
  (state) => state.count,
  (count) => {
    console.log("Count changed to:", count);
  }
);

// Later, unsubscribe
unsubscribe();
```

### getReactiveState

Get the raw reactive state (escape hatch).

```tsx
store.getReactiveState(): T
```

**Example:**

```tsx
const useCounter = createState(() => ({ count: 0 }));

// Direct access (use sparingly)
useCounter.getReactiveState().count++;
```

## TypeScript Support

RStore has excellent TypeScript support with full type inference:

```tsx
import { createStore, ref } from "reactivity-store";

// Types are automatically inferred
const useCounter = createStore(() => {
  const count = ref(0);
  const increment = () => count.value++;
  return { count, increment };
});

// count: number, increment: () => void
const { count, increment } = useCounter();

// Type-safe selector
const doubled = useCounter(state => state.count * 2); // number
```

### Generic Type Parameters

```tsx
interface User {
  id: number;
  name: string;
}

const useUsers = createStore(() => {
  const users = ref<User[]>([]);
  const addUser = (user: User) => users.value.push(user);
  return { users, addUser };
});
```

## Best Practices

### ✅ Do

- Use `ref()` for primitive values, `reactive()` for objects
- Define all mutations inside the store setup function
- Use selectors to pick only the state you need
- Leverage `computed()` for derived state
- Use middleware for cross-cutting concerns

### ❌ Don't

- Don't mutate state outside the store (read-only in components)
- Don't forget `.value` when accessing refs in setup functions
- Don't use `getReactiveState()` unless absolutely necessary
- Don't create too many small stores (prefer composition)

## Common Patterns

### Global Store

```tsx
// stores/counter.ts
export const useCounter = createStore(() => {
  const count = ref(0);
  const increment = () => count.value++;
  return { count, increment };
});

// components/Counter.tsx
import { useCounter } from "@/stores/counter";
```

### Composed Stores

```tsx
const useAuth = createStore(() => {
  const user = ref<User | null>(null);
  const isAuthenticated = computed(() => user.value !== null);
  return { user, isAuthenticated };
});

const useProfile = createStore(() => {
  const { user } = useAuth();
  const profile = computed(() => {
    // Compose with other stores
    return user ? fetchProfile(user.id) : null;
  });
  return { profile };
});
```

### Async Actions

```tsx
const useUsers = createStore(() => {
  const users = ref<User[]>([]);
  const loading = ref(false);

  const fetchUsers = async () => {
    loading.value = true;
    try {
      users.value = await api.getUsers();
    } finally {
      loading.value = false;
    }
  };

  return { users, loading, fetchUsers };
});
```
