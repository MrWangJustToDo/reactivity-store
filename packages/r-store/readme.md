<div align="center">

# 🚀 RStore

**Vue-inspired Reactive State Management for React**

[![Deploy](https://github.com/MrWangJustToDo/r-store/actions/workflows/deploy.yml/badge.svg)](https://github.com/MrWangJustToDo/r-store/actions/workflows/deploy.yml)
[![npm](https://img.shields.io/npm/v/reactivity-store)](https://www.npmjs.com/package/reactivity-store)
![downloads](https://img.shields.io/npm/dm/reactivity-store)

Bring Vue's reactivity system to React with zustand-like simplicity.
**Direct mutation, automatic UI updates - no manual subscriptions needed!**

[Documentation](https://mrwangjusttodo.github.io/r-store/) · [Getting Started](#installation) · [Examples](#quick-start)

</div>

---

## Why RStore?

- 🎯 **Direct Mutation** - No `setState`, just mutate and UI updates automatically
- ⚡ **Vue Reactivity** - Use `ref()`, `reactive()`, `computed()` from @vue/reactivity
- 🪝 **Zustand-like API** - Clean, minimal API design
- 🔌 **Built-in Middleware** - Persist, actions, Redux DevTools out of the box
- 📘 **TypeScript First** - Full type safety and excellent IntelliSense
- 🚀 **Zero Boilerplate** - No reducers, no dispatch, no manual subscriptions

## Installation

```bash
npm install reactivity-store
# or
pnpm add reactivity-store
```

### Octane

Octane applications use the framework-specific entry point. It exposes the
same `createStore` selector API and Vue reactivity primitives without loading
React or `use-sync-external-store`.

```tsrx
import { createStore, ref } from "reactivity-store/octane";

const useCounter = createStore(() => {
  const count = ref(0);
  return { count, increment: () => count.value++ };
});

function Counter() @{
  const { count, increment } = useCounter();
  <button onClick={increment}>{`Count: ${count}`}</button>
}
```

The Octane entry currently supports `createStore`; React-only component and
middleware APIs remain available from the default `reactivity-store` entry.

## Quick Start

### 🟢 Vue Approach

For **Vue developers** or those wanting fine-grained reactivity:

```tsx
import { createStore, ref, computed } from "reactivity-store";

const useCounter = createStore(() => {
  const count = ref(0);
  const doubled = computed(() => count.value * 2);

  const increment = () => count.value++; // Direct mutation!

  return { count, doubled, increment };
});

function App() {
  const { count, doubled, increment } = useCounter();
  return (
    <div>
      <p>Count: {count}</p>
      <p>Doubled: {doubled}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
}
```

### 🔵 React Approach

For **React developers** who want simplicity without learning Vue APIs:

```tsx
import { createState } from "reactivity-store";

const useCounter = createState(
  () => ({ count: 0 }),
  {
    withActions: (state) => ({
      increment: () => state.count++,
      decrement: () => state.count--
    })
  }
);

function App() {
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

## Two Approaches, One Library

| | 🟢 Vue Approach | 🔵 React Approach |
|---|---------------|------------------|
| **Best for** | Vue developers | React developers |
| **APIs** | `ref`, `reactive`, `computed` | Plain objects + actions |
| **Features** | Auto-computed, lifecycle hooks | Middleware: persist, DevTools |
| **Use** | `createStore` | `createState` |

## Built-in Middleware

### 💾 Persistent State

```tsx
const useSettings = createState(
  () => ({ theme: "light", language: "en" }),
  {
    withPersist: "app-settings", // Auto-saves to localStorage
    withActions: (state) => ({
      setTheme: (theme) => state.theme = theme
    })
  }
);
```

### 🛠️ Redux DevTools

```tsx
const useCounter = createState(
  () => ({ count: 0 }),
  {
    withNamespace: "Counter", // Shows up in Redux DevTools
    withActions: (state) => ({
      increment: () => state.count++
    })
  }
);
```

### ⚡ Performance Options

```tsx
const useStore = createState(
  () => ({ nested: { count: 0 } }),
  {
    withDeepSelector: true,      // Track nested changes (default: true)
    withStableSelector: false,   // Stable selector for performance
    withActions: (state) => ({
      increment: () => state.nested.count++
    })
  }
);
```

## Advanced Features

### Lifecycle Hooks

```tsx
import { createStoreWithComponent, ref, onMounted, onUnmounted } from "reactivity-store";

const Timer = createStoreWithComponent({
  setup: () => {
    const seconds = ref(0);
    let timer;

    onMounted(() => {
      timer = setInterval(() => seconds.value++, 1000);
    });

    onUnmounted(() => {
      clearInterval(timer);
    });

    return { seconds };
  }
});

function App() {
  return <Timer>{({ seconds }) => <div>{seconds}s</div>}</Timer>;
}
```

### Component-local Reactive State

```tsx
import { useReactiveState } from "reactivity-store";

function TodoList() {
  const [state, setState] = useReactiveState({
    todos: [],
    filter: "all"
  });

  const addTodo = (text) => {
    setState((s) => {
      s.todos.push({ id: Date.now(), text, done: false });
    });
  };

  return <div>{/* ... */}</div>;
}
```

### State Subscriptions

```tsx
const useCounter = createState(
  () => ({ count: 0 }),
  { withActions: (s) => ({ increment: () => s.count++ }) }
);

// Subscribe anywhere in your app
useCounter.subscribe(
  (state) => state.count,
  () => console.log("Count changed:", useCounter.getReadonlyState().count)
);
```

## Comparison

<table>
<tr>
<td width="33%">

**Traditional React**
```tsx
const [count, setCount] =
  useState(0);

setCount(prev => prev + 1);
```

</td>
<td width="33%">

**RStore (Vue Approach)**
```tsx
const count = ref(0);

count.value++;
```

</td>
<td width="33%">

**RStore (React Approach)**
```tsx
const useCount = createState(
  () => ({ count: 0 }),
  { withActions: (s) => ({
    increment: () => s.count++
  })}
);
```

</td>
</tr>
</table>

## API Overview

| API | Purpose |
|-----|---------|
| `createStore` | Vue-style reactive stores with `ref()`, `reactive()`, `computed()` |
| `createState` | React-style state with actions and middleware |
| `createStoreWithComponent` | Component-scoped stores with lifecycle hooks |
| `useReactiveState` | Component-local reactive state (like `useState` but reactive) |
| `useReactiveEffect` | Side effects with automatic dependency tracking |

## Documentation

Visit [https://mrwangjusttodo.github.io/r-store/](https://mrwangjusttodo.github.io/r-store/) for complete documentation:

- [What is RStore?](https://mrwangjusttodo.github.io/r-store/what)
- [Why RStore?](https://mrwangjusttodo.github.io/r-store/why)
- [Vue Approach - createStore](https://mrwangjusttodo.github.io/r-store/createStore)
- [React Approach - createState](https://mrwangjusttodo.github.io/r-store/createState)
- [Lifecycle Hooks](https://mrwangjusttodo.github.io/r-store/createStoreWithLifeCycle)
- [Use Cases](https://mrwangjusttodo.github.io/r-store/use-cases)

## License

MIT © [MrWangJustToDo](https://github.com/MrWangJustToDo)
