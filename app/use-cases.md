# Use Cases & Examples

RStore provides two approaches based on your background:

::: tip Two Approaches
- **🟢 Vue Approach**: Use `createStore` / `createStoreWithComponent` with Vue APIs (`ref`, `reactive`, `computed`)
- **🔵 React Approach**: Use `createState` with middleware - no need to learn Vue APIs
:::

---

## 🟢 Vue Approach

### Best for: Developers familiar with Vue, or who want fine-grained reactivity control

### 📊 Counter with Computed Value

::: code-group

```tsx [Store]
import { createStore, ref, computed } from "reactivity-store";

export const useCounter = createStore(() => {
  const count = ref(0);

  // Computed values auto-update
  const doubled = computed(() => count.value * 2);

  const increment = () => count.value++;
  const decrement = () => count.value--;

  return { count, doubled, increment, decrement };
});
```

```tsx [Component]
function Counter() {
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

:::

### 🛒 Shopping Cart

::: code-group

```tsx [Store]
import { createStore, ref, computed } from "reactivity-store";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export const useCart = createStore(() => {
  const items = ref<CartItem[]>([]);

  // Auto-calculated total
  const total = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  const addItem = (product: Omit<CartItem, "quantity">) => {
    const existing = items.value.find(i => i.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      items.value.push({ ...product, quantity: 1 });
    }
  };

  const removeItem = (id: number) => {
    items.value = items.value.filter(item => item.id !== id);
  };

  return { items, total, addItem, removeItem };
});
```

```tsx [Component]
function ShoppingCart() {
  const { items, total, removeItem } = useCart();

  return (
    <div>
      <h2>Cart</h2>
      {items.map(item => (
        <div key={item.id}>
          {item.name} - ${item.price} x {item.quantity}
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}
      <p>Total: ${total.toFixed(2)}</p>
    </div>
  );
}
```

:::

### 📝 Nested Form State

::: code-group

```tsx [Store]
import { createStore, reactive } from "reactivity-store";

export const useUserForm = createStore(() => {
  const form = reactive({
    personal: {
      name: "",
      email: ""
    },
    address: {
      street: "",
      city: ""
    }
  });

  // Direct mutation - no setState needed!
  const updateName = (name: string) => {
    form.personal.name = name;
  };

  const updateCity = (city: string) => {
    form.address.city = city;
  };

  const reset = () => {
    form.personal.name = "";
    form.personal.email = "";
    form.address.street = "";
    form.address.city = "";
  };

  return { form, updateName, updateCity, reset };
});
```

```tsx [Component]
function UserForm() {
  const { form, updateName, updateCity } = useUserForm();

  return (
    <form>
      <input
        value={form.personal.name}
        onChange={e => updateName(e.target.value)}
        placeholder="Name"
      />
      <input
        value={form.address.city}
        onChange={e => updateCity(e.target.value)}
        placeholder="City"
      />
    </form>
  );
}
```

:::

### ⚡ Component with Lifecycle

::: code-group

```tsx [Component Store]
import { createStoreWithComponent, ref, onMounted, onUpdated } from "reactivity-store";

const Timer = createStoreWithComponent({
  setup: () => {
    const seconds = ref(0);
    let timer: any;

    onMounted(() => {
      console.log("Timer started");
      timer = setInterval(() => seconds.value++, 1000);
    });

    onUpdated(() => {
      console.log("Timer updated:", seconds.value);
    });

    return () => clearInterval(timer);
  }
});
```

```tsx [Usage]
function App() {
  return (
    <Timer>
      {({ seconds }) => (
        <div>Time elapsed: {seconds}s</div>
      )}
    </Timer>
  );
}
```

:::

---

## 🔵 React Approach

### Best for: React developers who want simpler state management without learning Vue APIs

### 📊 Counter with Actions

::: code-group

```tsx [Store]
import { createState } from "reactivity-store";

export const useCounter = createState(
  () => ({ count: 0, doubled: 0 }),
  {
    withActions: (state) => ({
      increment: () => {
        state.count++;
        state.doubled = state.count * 2;
      },
      decrement: () => {
        state.count--;
        state.doubled = state.count * 2;
      }
    })
  }
);
```

```tsx [Component]
function Counter() {
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

:::

### 🛒 Shopping Cart with Actions

::: code-group

```tsx [Store]
import { createState } from "reactivity-store";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export const useCart = createState(
  () => ({
    items: [] as CartItem[],
    total: 0
  }),
  {
    withActions: (state) => ({
      addItem: (product: Omit<CartItem, "quantity">) => {
        const existing = state.items.find(i => i.id === product.id);
        if (existing) {
          existing.quantity++;
        } else {
          state.items.push({ ...product, quantity: 1 });
        }
        // Update total
        state.total = state.items.reduce((sum, item) =>
          sum + item.price * item.quantity, 0
        );
      },

      removeItem: (id: number) => {
        state.items = state.items.filter(item => item.id !== id);
        state.total = state.items.reduce((sum, item) =>
          sum + item.price * item.quantity, 0
        );
      }
    })
  }
);
```

```tsx [Component]
function ShoppingCart() {
  const { items, total, removeItem } = useCart();

  return (
    <div>
      <h2>Cart</h2>
      {items.map(item => (
        <div key={item.id}>
          {item.name} - ${item.price} x {item.quantity}
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}
      <p>Total: ${total.toFixed(2)}</p>
    </div>
  );
}
```

:::

### 🎨 Theme with Persistence

::: code-group

```tsx [Store]
import { createState } from "reactivity-store";

export const useTheme = createState(
  () => ({
    mode: "light" as "light" | "dark",
    primaryColor: "#007bff"
  }),
  {
    // Auto-save to localStorage
    withPersist: "app-theme",

    withActions: (state) => ({
      toggleTheme: () => {
        state.mode = state.mode === "light" ? "dark" : "light";
      },
      setColor: (color: string) => {
        state.primaryColor = color;
      }
    })
  }
);
```

```tsx [Component]
function ThemeSettings() {
  const { mode, primaryColor, toggleTheme, setColor } = useTheme();

  return (
    <div>
      <p>Current theme: {mode}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <input
        type="color"
        value={primaryColor}
        onChange={e => setColor(e.target.value)}
      />
    </div>
  );
}
```

:::

**🔑 Key Feature**: State automatically persists to localStorage!

### 📝 Form with Actions

::: code-group

```tsx [Store]
import { createState } from "reactivity-store";

export const useUserForm = createState(
  () => ({
    personal: {
      name: "",
      email: ""
    },
    address: {
      street: "",
      city: ""
    }
  }),
  {
    withActions: (state) => ({
      updateName: (name: string) => {
        state.personal.name = name;
      },
      updateEmail: (email: string) => {
        state.personal.email = email;
      },
      updateCity: (city: string) => {
        state.address.city = city;
      },
      reset: () => {
        state.personal = { name: "", email: "" };
        state.address = { street: "", city: "" };
      }
    })
  }
);
```

```tsx [Component]
function UserForm() {
  const { personal, address, updateName, updateCity } = useUserForm();

  return (
    <form>
      <input
        value={personal.name}
        onChange={e => updateName(e.target.value)}
        placeholder="Name"
      />
      <input
        value={address.city}
        onChange={e => updateCity(e.target.value)}
        placeholder="City"
      />
    </form>
  );
}
```

:::

### 🔍 Data Fetching with Loading State

::: code-group

```tsx [Store]
import { createState } from "reactivity-store";

interface User {
  id: number;
  name: string;
}

export const useUsers = createState(
  () => ({
    users: [] as User[],
    loading: false,
    error: null as string | null
  }),
  {
    withActions: (state) => ({
      fetchUsers: async () => {
        state.loading = true;
        state.error = null;

        try {
          const response = await fetch("/api/users");
          state.users = await response.json();
        } catch (err) {
          state.error = "Failed to fetch users";
        } finally {
          state.loading = false;
        }
      }
    })
  }
);
```

```tsx [Component]
function UserList() {
  const { users, loading, error, fetchUsers } = useUsers();

  React.useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

:::

---

## Comparison

| Feature | Vue Approach | React Approach |
|---------|-------------|----------------|
| **APIs** | `ref()`, `reactive()`, `computed()` | Plain objects + actions |
| **Learning Curve** | Need to know Vue APIs | Familiar React patterns |
| **Auto-computed** | ✅ `computed()` auto-tracks | ❌ Manual in actions |
| **Lifecycle Hooks** | ✅ `onMounted`, `onUpdated` | ❌ Use React hooks |
| **Middleware** | ❌ Not available | ✅ Persist, DevTools, etc |
| **Best For** | Vue devs, fine control | React devs, simplicity |

---

## More Examples

- [TodoList Example](/todoList) - Complete TodoMVC implementation
- [Reactive Hooks](/reactiveHook) - Component-local reactive state
- [API Reference](/api-reference) - Complete API documentation
