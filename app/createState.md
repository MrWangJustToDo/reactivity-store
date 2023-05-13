# How to create a State

## Description

`RStore` also provide a `createState` function, this function have some difference for `createStore`

1. `createStore` need a `creator` function as params, and the `creator` function also have `ref`、`reactive`、`computed`... reactive api as params. `createState` also need a `setup` function as params, the different is `setup` function not have reactive params, only need return a plain object

2. `createState` support middleware

## Simple count Code Example

```tsx
import { createState } from "r-store";

const useCount = createState(() => {
  const data = { count: 0 };

  return { data };
});

const App = () => {
  const data = useCount((state) => state.data);

  return (
    <div>
      <p>React Reactive Count</p>
      <p>{data.count}</p>
      <button onClick={() => data.count++}>Add</button>
    </div>
  );
};
```

## Online Example

<script setup>
  import Create from '@theme/components/createState.vue'
  import CreateMiddleware from '@theme/components/createStateWithMiddleware.vue'
</script>

<Create />

## Code Example with middleware

```tsx
import { createState, withPersist } from "r-store";

const useCount = createState(
  withPersist(
    () => {
      const data = { count: 0 };

      return { data };
    },
    { key: "count" }
  )
);

const App = () => {
  const data = useCount((state) => state.data);

  return (
    <div>
      <p>React Reactive Count</p>
      <p>{data.count}</p>
      <button onClick={() => data.count++}>Add</button>
    </div>
  );
};
```

## Online Example

<CreateMiddleware />