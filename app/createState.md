# createState

::: tip 🔵 React Approach
This API is recommended for **React developers** who want simpler state management without learning Vue APIs. If you're familiar with Vue and want fine-grained reactivity, see [createStore](/createStore) instead.
:::

## Overview

`createState` provides a **React-friendly way** to manage state with:
- Plain JavaScript objects (no `ref()` or `reactive()`)
- Actions for mutations
- Built-in middleware (persist, DevTools, etc.)

**Signature:**
```ts
function createState<T>(
  setup: () => T,
  options?: StateOptions<T>
): UseState<T>
```

---

## Basic Usage

### Simple Counter

```tsx
import { createState } from "reactivity-store";

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

// In component
function Counter() {
  const { count, increment, decrement } = useCounter();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
    </div>
  );
}
```

---

## Built-in Middleware

### 💾 Persistent State (`withPersist`)

Automatically save state to localStorage:

```tsx
import { createState } from "reactivity-store";

const useSettings = createState(
  () => ({
    theme: "light",
    language: "en"
  }),
  {
    // Simple: just provide a key
    withPersist: "app-settings",

    withActions: (state) => ({
      setTheme: (theme: string) => state.theme = theme,
      setLanguage: (lang: string) => state.language = lang
    })
  }
);
```

**Advanced persist options:**

```tsx
const useSettings = createState(
  () => ({ theme: "light" }),
  {
    withPersist: {
      key: "settings",
      getStorage: () => sessionStorage,  // Use sessionStorage
      stringify: (state) => JSON.stringify(state),
      parse: (str) => JSON.parse(str),
      merge: (fromCreator, fromStorage) => ({ ...fromCreator, ...fromStorage })
    }
  }
);
```

### 🎬 Actions (`withActions`)

Define how to mutate state:

```tsx
const useTodos = createState(
  () => ({
    todos: [],
    filter: "all"
  }),
  {
    withActions: (state) => ({
      addTodo: (text: string) => {
        state.todos.push({
          id: Date.now(),
          text,
          done: false
        });
      },

      toggleTodo: (id: number) => {
        const todo = state.todos.find(t => t.id === id);
        if (todo) todo.done = !todo.done;
      },

      removeTodo: (id: number) => {
        state.todos = state.todos.filter(t => t.id !== id);
      },

      setFilter: (filter: string) => {
        state.filter = filter;
      }
    })
  }
);

// In component
const { todos, addTodo, toggleTodo } = useTodos();
```

### 🛠️ Redux DevTools (`withNamespace`)

Debug with Redux DevTools:

```tsx
const useCounter = createState(
  () => ({ count: 0 }),
  {
    withNamespace: "Counter",  // Shows up in DevTools

    withActions: (state) => ({
      increment: () => state.count++  // Tracked in DevTools
    })
  }
);
```

### ⚡ Performance Options

Control how deeply state changes are tracked:

```tsx
const useStore = createState(
  () => ({ nested: { count: 0 } }),
  {
    // Track nested property changes (default: true)
    withDeepSelector: true,

    // Stable selector for performance (default: false)
    withStableSelector: false,

    withActions: (state) => ({
      increment: () => state.nested.count++
    })
  }
);
```

**Deep Selector Explained:**

::: code-group

```tsx [withDeepSelector: true]
// Component updates when nested.count changes
const { nested } = useStore(state => ({
  nested: state.nested
}));

// nested.count++ triggers re-render ✅
```

```tsx [withDeepSelector: false]
// Component ONLY updates when nested object ref changes
const { nested } = useStore(state => ({
  nested: state.nested
}));

// nested.count++ does NOT trigger re-render ❌
// state.nested = {...} triggers re-render ✅
```

:::

---

## Combining Middleware

You can use multiple middleware together:

::: code-group

```tsx [Options API (Recommended)]
const useSettings = createState(
  () => ({ theme: "light", fontSize: 16 }),
  {
    withPersist: "settings",
    withNamespace: "Settings",
    withActions: (state) => ({
      setTheme: (theme) => state.theme = theme,
      increaseFontSize: () => state.fontSize++
    })
  }
);
```

```tsx [Composition API]
import { withActions, withPersist, withNamespace } from "reactivity-store";

const useSettings = createState(
  withActions(
    withPersist(
      () => ({ theme: "light", fontSize: 16 }),
      { key: "settings" }
    ),
    {
      generateActions: (state) => ({
        setTheme: (theme) => state.theme = theme,
        increaseFontSize: () => state.fontSize++
      })
    }
  ),
  { withNamespace: "Settings" }
);
```

:::

**Recommendation:** Use the Options API for better readability!

---

## Comparison with Other Solutions

::: code-group

```tsx [RStore (createState)]
import { createState } from "reactivity-store";

const useCounter = createState(
  () => ({ count: 0 }),
  {
    withActions: (state) => ({
      increment: () => state.count++
    })
  }
);

// In component
const { count, increment } = useCounter();
```

```tsx [createStore]
import { createStore, ref } from "reactivity-store";

const useCounter = createStore(() => {
  const count = ref(0);
  const increment = () => count.value++;
  return { count, increment };
});

// In component
const { count, increment } = useCounter();
```

```tsx [Zustand]
import { create } from "zustand";

const useCounter = create((set) => ({
  count: 0,
  increment: () => set(state => ({
    count: state.count + 1
  }))
}));

// In component
const { count, increment } = useCounter();
```

:::

**Key Differences:**
- **RStore createState**: Direct mutation in actions, built-in middleware
- **RStore createStore**: Vue APIs (`ref`, `reactive`, `computed`)
- **Zustand**: Immutable updates with `set` function

---

## Using Selectors

Pick only the state you need:

```tsx
// Get everything
const { count, increment } = useCounter();

// Pick specific fields
const count = useCounter(state => state.count);

// Pick multiple fields
const { count, increment } = useCounter(state => ({
  count: state.count,
  increment: state.increment
}));
```

---

## Available Middleware Options

| Option | Type | Description |
|--------|------|-------------|
| `withActions` | `(state) => Actions` | Define state mutations |
| `withPersist` | `string \| PersistOptions` | Auto-save to localStorage |
| `withNamespace` | `string` | Redux DevTools integration |
| `withDeepSelector` | `boolean` | Track nested changes (default: `true`) |
| `withStableSelector` | `boolean` | Stable selector for performance |

---

## Important Notes

::: warning State is Read-Only in Components
State is **read-only** outside of actions. Mutations must happen inside `withActions`:

```tsx
// ❌ Wrong - mutating state in component
const { count } = useCounter();
count++; // Won't work!

// ✅ Correct - use actions
const { count, increment } = useCounter();
increment(); // Works!
```
:::

::: tip Escape Hatch
For advanced cases, you can access the reactive state directly:

```tsx
useCounter.getReactiveState().count++; // Use sparingly!
```

But this bypasses type safety and DevTools tracking. Prefer using actions!
:::

---

## Live Demos

<script setup>
  import Create from '@theme/components/createState.vue'
  import CreateStorageMiddleware from '@theme/components/createStateWithStorageMiddleware.vue'
  import CreateActionsMiddleware from '@theme/components/createStateWithActionsMiddleware.vue'
  import CreateAllMiddleware from '@theme/components/createStateWithAllMiddleware.vue'
</script>

### Basic Example
<Create />

### With localStorage
<CreateStorageMiddleware />

### With Actions
<CreateActionsMiddleware />

### All Middleware Combined
<CreateAllMiddleware />

---

## Next Steps

- Learn about [subscriptions](/subscribe) for listening to state changes
- Explore [useReactiveState](/reactiveHook) for component-local state
- See [more examples](/use-cases#react-approach)
- Try the [Vue approach with createStore](/createStore)
