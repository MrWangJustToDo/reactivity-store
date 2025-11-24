# createStore

::: tip 🟢 Vue Approach
This API is recommended for **Vue developers** or those familiar with Vue's reactivity system. If you're a React developer looking for simpler patterns, see [createState](/createState) instead.
:::

## Overview

`createStore` allows you to use Vue's reactivity APIs (`ref`, `reactive`, `computed`) directly in React. It feels just like writing Vue Composition API!

**Signature:**
```ts
function createStore<T>(setup: () => T): UseStore<T>
```

## Basic Usage

### Using `ref()`

The simplest way to create reactive state:

```tsx
import { createStore, ref } from "reactivity-store";

const useCounter = createStore(() => {
  const count = ref(0);

  // Direct mutation - no setState needed!
  const increment = () => count.value++;
  const decrement = () => count.value--;

  return { count, increment, decrement };
});

// In component - ref auto-unwraps
function Counter() {
  const { count, increment } = useCounter();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
}
```

::: info Auto Unwrapping
`ref` values are **automatically unwrapped** when returned from the store, so you can use `count` directly instead of `count.value` in components!
:::

### Using `reactive()`

For objects, use `reactive()`:

```tsx
import { createStore, reactive } from "reactivity-store";

const useUser = createStore(() => {
  const user = reactive({
    name: "",
    email: "",
    profile: {
      bio: "",
      avatar: ""
    }
  });

  // Mutate nested properties directly!
  const updateName = (name: string) => {
    user.name = name;
  };

  const updateBio = (bio: string) => {
    user.profile.bio = bio;
  };

  return { user, updateName, updateBio };
});
```

### Using `computed()`

Computed values automatically track dependencies:

```tsx
import { createStore, ref, computed } from "reactivity-store";

const useCart = createStore(() => {
  const items = ref([
    { id: 1, name: "Apple", price: 1.5, quantity: 2 },
    { id: 2, name: "Banana", price: 0.8, quantity: 3 }
  ]);

  // Automatically recalculates when items change
  const total = computed(() =>
    items.value.reduce((sum, item) =>
      sum + item.price * item.quantity, 0
    )
  );

  const addItem = (item) => {
    items.value.push(item);
  };

  return { items, total, addItem };
});
```

## ⚡ Using Selectors (performance)

Pick only the state you need for better performance:

```tsx
// Get everything
const { count, increment } = useCounter();

// Pick specific fields
const count = useCounter(state => state.count);

// Pick multiple fields
const { count, doubled } = useCounter(state => ({
  count: state.count,
  doubled: state.doubled
}));
```

## Comparison with Other Solutions

::: code-group

```tsx [RStore (createStore)]
import { createStore, ref } from "reactivity-store";

const useCount = createStore(() => {
  const count = ref(0);
  const increment = () => count.value++;

  return { count, increment };
});

// In component
const { count, increment } = useCount();
```

```tsx [createState]
import { createState } from "reactivity-store";

const useCount = createState(
  () => ({ count: 0 }),
  {
    withActions: (state) => ({
      increment: () => state.count++
    })
  }
);

// In component
const { count, increment } = useCount();
```

```tsx [Zustand]
import { create } from "zustand";

const useCount = create((set) => ({
  count: 0,
  increment: () => set((state) => ({
    count: state.count + 1
  }))
}));

// In component
const { count, increment } = useCount();
```

:::

**Key Differences:**
- **RStore createStore**: Direct mutation with Vue APIs (`ref`, `reactive`, `computed`)
- **RStore createState**: Actions-based with middleware support
- **Zustand**: Immutable updates with `set` function

## Available Vue APIs

All Vue reactivity APIs are available:

| API | Description | Example |
|-----|-------------|---------|
| `ref()` | Reactive primitive value | `const count = ref(0)` |
| `reactive()` | Reactive object | `const user = reactive({ name: '' })` |
| `computed()` | Derived state | `const doubled = computed(() => count.value * 2)` |
| `watch()` | Side effects | `watch(() => count.value, (val) => console.log(val))` |
| `watchEffect()` | Auto-tracking side effects | `watchEffect(() => console.log(count.value))` |

See [@vue/reactivity docs](https://vuejs.org/api/reactivity-core.html) for complete API reference.

## Important Rules

::: warning State is Read-Only in Components
State returned from the selector is **read-only**. You must define mutation functions inside `createStore`:

```tsx
// ❌ Wrong - mutating state in component
const { count } = useCount();
count.value++; // Won't work!

// ✅ Correct - use mutation functions
const { count, increment } = useCount();
increment(); // Works!
```
:::

::: tip Ref Auto-Unwrapping
When you return `ref()` values from the store, they are automatically unwrapped in components:

```tsx
const useStore = createStore(() => {
  const count = ref(0);
  return { count }; // count.value inside
});

// In component
const { count } = useStore();
console.log(count); // No .value needed!
```
:::
<!-- 
## Live Demo

<script setup>
  import Create from '@theme/components/createStore.vue'
</script>

<Create /> -->

## Next Steps

- Learn about [lifecycle hooks with createStoreWithComponent](/createStoreWithLifeCycle)
- Explore the [React approach with createState](/createState)
- See [more examples](/use-cases)
