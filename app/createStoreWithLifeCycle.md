# createStoreWithComponent

::: tip 🟢 Vue Approach - Advanced
This is an **advanced feature** of the Vue approach. Make sure you understand [createStore](/createStore) first!

For React developers, this API may feel unusual. Consider using [createState](/createState) with React's built-in hooks instead.
:::

## Overview

`createStoreWithComponent` extends `createStore` with **Vue-like lifecycle hooks**. It creates a component that manages its own reactive state with lifecycle methods like `onMounted`, `onUpdated`, etc.

**When to use:**
- You want component-scoped state (not global)
- You need Vue's lifecycle hooks in React
- You're building reusable components with internal state

**Signature:**
```ts
function createStoreWithComponent<T>(config: {
  setup: () => T
}): Component<T>
```

## Quick Example

```tsx
import { createStoreWithComponent, ref, onMounted, onUnmounted } from "reactivity-store";

const Timer = createStoreWithComponent({
  setup: () => {
    const seconds = ref(0);
    let timer: any;

    // Runs when component mounts
    onMounted(() => {
      console.log("Timer started");
      timer = setInterval(() => seconds.value++, 1000);
    });

    // Runs before component unmounts
    onUnmounted(() => {
      console.log("Timer stopped");
      clearInterval(timer);
    });

    return { seconds };
  }
});

// Use as a component with render props
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

## Available Lifecycle Hooks

All Vue lifecycle hooks are supported:

| Hook | When it runs | Use case |
|------|-------------|----------|
| `onBeforeMount` | Before component mounts | Setup before DOM |
| `onMounted` | After component mounts | Start timers, fetch data |
| `onBeforeUpdate` | Before component updates | Track update count |
| `onUpdated` | After component updates | React to state changes |
| `onBeforeUnmount` | Before component unmounts | Save data |
| `onUnmounted` | After component unmounts | Cleanup timers, listeners |

## Complete Example

Real-world timer with lifecycle hooks:

```tsx
import {
  createStoreWithComponent,
  ref,
  onMounted,
  onBeforeUpdate,
  onUnmounted
} from "reactivity-store";

const Clock = createStoreWithComponent({
  setup: () => {
    const time = ref(new Date().toLocaleTimeString());
    const updateCount = ref(0);
    let timerId: any;

    onMounted(() => {
      console.log("Clock started");
      timerId = setInterval(() => {
        time.value = new Date().toLocaleTimeString();
      }, 1000);
    });

    onBeforeUpdate(() => {
      updateCount.value++;
    });

    onUnmounted(() => {
      console.log("Clock stopped");
      clearInterval(timerId);
    });

    return { time, updateCount };
  }
});

// Usage
function App() {
  const [show, setShow] = React.useState(true);

  return (
    <div>
      <button onClick={() => setShow(!show)}>
        {show ? "Hide" : "Show"} Clock
      </button>

      {show && (
        <Clock>
          {({ time, updateCount }) => (
            <div>
              <p>Current time: {time}</p>
              <p>Updates: {updateCount}</p>
            </div>
          )}
        </Clock>
      )}
    </div>
  );
}
```

## Comparison with createStore

::: code-group

```tsx [createStoreWithComponent]
// Component-scoped state with lifecycle
const Timer = createStoreWithComponent({
  setup: () => {
    const seconds = ref(0);

    onMounted(() => {
      // Lifecycle hook!
      const timer = setInterval(() => seconds.value++, 1000);
      return () => clearInterval(timer);
    });

    return { seconds };
  }
});

// Used as component
<Timer>
  {({ seconds }) => <div>{seconds}s</div>}
</Timer>
```

```tsx [createStore]
// Global store, no lifecycle
const useTimer = createStore(() => {
  const seconds = ref(0);

  const start = () => {
    const timer = setInterval(() => seconds.value++, 1000);
    return () => clearInterval(timer);
  };

  return { seconds, start };
});

// Used as hook
function App() {
  const { seconds, start } = useTimer();

  React.useEffect(() => {
    const cleanup = start();
    return cleanup;
  }, []);

  return <div>{seconds}s</div>;
}
```

:::

**Key Differences:**
- **createStoreWithComponent**: Component-scoped, render props, Vue lifecycle
- **createStore**: Global store, hook-based, use React's useEffect

## Important Notes

::: warning Render Props Pattern
`createStoreWithComponent` uses **render props** pattern, which may feel unusual in React:

```tsx
<MyComponent>
  {(state) => <div>{state.value}</div>}
</MyComponent>
```

If you prefer hooks, use [createStore](/createStore) instead.
:::

::: info State Management
Each instance of the component has **its own state**. If you need global state, use [createStore](/createStore).

```tsx
// Two independent timers
<Timer>{({ seconds }) => <div>Timer 1: {seconds}</div>}</Timer>
<Timer>{({ seconds }) => <div>Timer 2: {seconds}</div>}</Timer>
```
:::

## When to Use This API

### ✅ Use `createStoreWithComponent` when:
- Building reusable components with internal state
- You need Vue's lifecycle hooks
- State should be scoped to each component instance
- You're familiar with Vue Composition API

### ❌ Use `createStore` instead when:
- You need global/shared state
- You prefer React hooks over render props
- State should persist across component unmount/remount
- You want simpler API

## Live Demo

<script setup>
  import CreateWithComponent from '@theme/components/createStoreWithComponent.vue'
</script>

<CreateWithComponent />

## Related APIs

- [createStore](/createStore) - Global stores with Vue APIs
- [createState](/createState) - React approach with actions
- [Reactive Hooks](/reactiveHook) - Component-local reactive state

## For React Developers

If the render props pattern feels awkward, consider using **React's built-in hooks** with `createState`:

```tsx
import { createState } from "reactivity-store";
import { useEffect } from "react";

const useTimer = createState(
  () => ({ seconds: 0 }),
  {
    withActions: (state) => ({
      tick: () => state.seconds++
    })
  }
);

function Timer() {
  const { seconds, tick } = useTimer();

  useEffect(() => {
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  return <div>{seconds}s</div>;
}
```

This feels more natural in React! See [createState](/createState) for more.
