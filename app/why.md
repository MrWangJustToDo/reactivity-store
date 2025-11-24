# Why RStore?

Yes, there are many state management solutions for React - Redux, Zustand, MobX, Jotai, and more. So why another one? Let's explore what makes RStore unique and when you might want to use it.

## The Problem with Traditional React State

React's built-in state management works well for simple cases, but as applications grow, you face challenges:

### 🔄 Manual State Updates

```tsx
// Traditional React - verbose and error-prone
const [user, setUser] = useState({ name: "", age: 0, address: { city: "" } });

// Need to carefully spread objects to avoid mutation
setUser(prev => ({
  ...prev,
  address: {
    ...prev.address,
    city: "New York"
  }
}));
```

### 🔗 Manual Subscriptions & Selectors

```tsx
// Need to carefully manage selectors and subscriptions
const count = useStore(state => state.count);
const increment = useStore(state => state.increment);
```

### ⚡ Performance Concerns

Optimizing React re-renders requires careful use of `useMemo`, `useCallback`, and selector functions.

## The RStore Solution

RStore addresses these pain points by bringing Vue's reactivity system to React:

### ✨ Direct State Mutation

```tsx
import { createStore, reactive } from "reactivity-store";

const useUser = createStore(() => {
  const user = reactive({ name: "", age: 0, address: { city: "" } });

  // Just mutate directly - it works!
  const updateCity = (city: string) => {
    user.address.city = city; // That's it!
  };

  return { user, updateCity };
});
```

### 🎯 Automatic Dependency Tracking

No need to manually specify dependencies - RStore tracks them automatically:

```tsx
import { computed, watch } from "reactivity-store";

const useCart = createStore(() => {
  const items = ref([]);
  const discount = ref(0);

  // Automatically tracks items and discount
  const total = computed(() => {
    const sum = items.value.reduce((acc, item) => acc + item.price, 0);
    return sum * (1 - discount.value);
  });

  // Automatically runs when total changes
  watch(() => total.value, (newTotal) => {
    console.log("New total:", newTotal);
  });

  return { items, discount, total };
});
```

### 🔌 Powerful Built-in Middleware

RStore comes with useful middleware out of the box:

```tsx
import { createState, withPersist, withActions } from "reactivity-store";

// Persist state to localStorage automatically
const useSettings = createState(
  () => ({ theme: "light", language: "en" }),
  {
    withPersist: "app-settings", // Auto-saves to localStorage
    withActions: (state) => ({
      toggleTheme: () => state.theme = state.theme === "light" ? "dark" : "light"
    })
  }
);
```

## When to Use RStore

### ✅ Choose RStore When:

- **Coming from Vue** - You love Vue's reactivity and want it in React
- **Nested state** - You frequently work with deeply nested objects
- **Computed values** - You need derived state with automatic dependency tracking
- **Less boilerplate** - You want to write less code to do more
- **TypeScript** - You want excellent type inference out of the box

### ⚠️ Consider Alternatives When:

- **Learning React** - Stick with `useState` and `useReducer` first
- **Simple state** - For basic counters and toggles, built-in hooks are fine
- **Team preference** - Your team is already proficient with Redux/Zustand
- **Bundle size critical** - RStore includes `@vue/reactivity` (~20KB gzipped)

## Comparison with Other Solutions

### vs. Redux

| Feature | RStore | Redux |
|---------|--------|-------|
| Boilerplate | Minimal | High |
| State mutations | Direct | Immutable updates |
| Middleware | Built-in | Extensive ecosystem |
| Learning curve | Low | High |
| TypeScript | Excellent | Good |

### vs. Zustand

| Feature | RStore | Zustand |
|---------|--------|---------|
| API style | Vue-like reactive | Functional |
| Computed values | Built-in | Manual |
| Nested updates | Direct mutation | Immutable updates |
| Middleware | Built-in | Community |
| Reactivity | Fine-grained | Selector-based |

### vs. MobX

| Feature | RStore | MobX |
|---------|--------|------|
| Reactivity system | Vue | MobX |
| Bundle size | ~20KB | ~15KB |
| Decorators | No | Optional |
| Ecosystem | Growing | Mature |
| Learning curve | Low (if you know Vue) | Medium |

## Real-World Use Cases

### 📋 Form Management with Nested Objects

```tsx
const useUserForm = createStore(() => {
  const form = reactive({
    personal: { name: "", email: "" },
    address: { street: "", city: "", zip: "" },
    preferences: { newsletter: false, notifications: true }
  });

  // No need for complex setState logic!
  const updateField = (path: string, value: any) => {
    const keys = path.split('.');
    let target = form;
    for (let i = 0; i < keys.length - 1; i++) {
      target = target[keys[i]];
    }
    target[keys[keys.length - 1]] = value;
  };

  return { form, updateField };
});
```

### 🛒 Shopping Cart with Auto-Calculated Totals

```tsx
const useCart = createStore(() => {
  const items = ref([]);
  const taxRate = ref(0.08);

  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  const tax = computed(() => subtotal.value * taxRate.value);
  const total = computed(() => subtotal.value + tax.value);

  return { items, subtotal, tax, total };
});
```

### 🎨 Theme System with Persistence

```tsx
const useTheme = createState(
  () => ({
    mode: "light",
    primaryColor: "#007bff",
    fontSize: 16
  }),
  {
    withPersist: "app-theme",
    withActions: (state) => ({
      toggleMode: () => state.mode = state.mode === "light" ? "dark" : "light",
      setPrimaryColor: (color: string) => state.primaryColor = color,
      increaseFontSize: () => state.fontSize++,
      decreaseFontSize: () => state.fontSize--
    })
  }
);
```

## Bridge Between Vue and React

RStore's unique value proposition is bridging the Vue and React ecosystems. If you've worked with both frameworks, you know:

- **Vue developers** often miss the reactivity system when using React
- **React developers** are curious about Vue's simpler state mutations
- **Full-stack teams** benefit from consistent mental models

RStore brings the best of both worlds together.

## Ready to Try RStore?

If any of these use cases resonate with you, give RStore a try:

- [Installation Guide](/install) - Get started in 2 minutes
- [API Documentation](/createStore) - Learn the APIs
- [Examples](/todoList) - See real-world examples
