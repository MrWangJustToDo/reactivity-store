# What is RStore?

**RStore** (Reactivity Store) is a modern React state management library that brings Vue's powerful reactivity system to React applications. It combines the best of both worlds: Vue's intuitive reactive APIs and zustand's minimalist design philosophy.

## Core Concepts

### 🎯 Automatic Reactivity

With RStore, you don't need to call `setState` or manage subscriptions manually. Just mutate your state and the UI updates automatically - exactly like Vue:

```tsx
import { createStore, ref } from "reactivity-store";

const useCounter = createStore(() => {
  const count = ref(0);

  // Direct mutation - no setState needed!
  const increment = () => count.value++;

  return { count, increment };
});
```

### 🔄 Vue Reactivity APIs

RStore leverages `@vue/reactivity` under the hood, giving you access to familiar Vue APIs:

- **`ref()`** - Create reactive primitive values
- **`reactive()`** - Create reactive objects
- **`computed()`** - Derived state with automatic dependency tracking
- **`watch()`** - Side effects that respond to state changes

### 🪝 Zustand-like Simplicity

The API design is inspired by zustand, making it simple and easy to use:

```tsx
// Create store with a setup function
const useStore = createStore(() => {
  // Define reactive state
  // Define actions
  // Return what you need
});

// Use in components with optional selector
const data = useStore(selector);
```

## Two Approaches for Different Developers

RStore provides **two distinct APIs** based on your background:

### 🟢 Vue Approach

**For**: Vue developers or those wanting fine-grained reactivity

**Use**: `createStore` / `createStoreWithComponent`

**Features**:
- Direct access to Vue APIs: `ref()`, `reactive()`, `computed()`
- Automatic dependency tracking with `computed()`
- Component lifecycle hooks: `onMounted`, `onUpdated`
- Just like writing Vue Composition API!

```tsx
const useStore = createStore(() => {
  const count = ref(0);
  const doubled = computed(() => count.value * 2);
  return { count, doubled };
});
```

### 🔵 React Approach

**For**: React developers who want simplicity

**Use**: `createState` with middleware

**Features**:
- Plain objects - no Vue APIs to learn
- Define actions for mutations
- Built-in middleware: persist, DevTools, etc.
- Familiar React patterns

```tsx
const useStore = createState(
  () => ({ count: 0 }),
  {
    withActions: (state) => ({
      increment: () => state.count++
    })
  }
);
```

---

## Who is RStore For?

| Your Background | Recommended Approach |
|----------------|---------------------|
| **Vue developer** moving to React | 🟢 Vue Approach |
| **React developer** wanting simpler state | 🔵 React Approach |
| **Full-stack team** with both Vue/React | Both approaches work! |
| **New to both** | 🔵 React Approach (less to learn) |

## Key Features

| Feature | Description |
|---------|-------------|
| ⚡ **Zero Boilerplate** | No reducers, no actions, no dispatch - just mutate and go |
| 🎯 **Automatic Updates** | UI updates automatically when state changes - no manual subscriptions |
| 📘 **TypeScript Native** | Full type inference and type safety throughout |
| 🔌 **Middleware System** | Built-in middleware for persistence, actions, DevTools, and more |
| 🪝 **Lifecycle Hooks** | Component lifecycle hooks like `onMounted`, `onUpdated` |
| 🚀 **Performance Optimized** | Fine-grained reactivity with optional deep/stable selectors |

## Quick Comparison

::: code-group

```tsx [RStore]
import { createStore, ref } from "reactivity-store";

const useCounter = createStore(() => {
  const count = ref(0);
  const increment = () => count.value++;
  return { count, increment };
});

// In component
const { count, increment } = useCounter();
```

```tsx [Traditional React]
import { useState } from "react";

function useCounter() {
  const [count, setCount] = useState(0);
  const increment = () => setCount(c => c + 1);
  return { count, increment };
}

// In component
const { count, increment } = useCounter();
```

:::

**The difference?** With RStore, you can mutate state directly and it just works. With traditional React, you must use `setState` for every update.

---

## What's Next?

- Learn [why you might need RStore](/why)
- See [installation guide](/install)
- Explore [usage examples](/createStore)
