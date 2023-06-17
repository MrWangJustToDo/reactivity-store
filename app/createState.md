# How to create a State

## Description

`RStore` also provide a `createState` function, this function have some difference for `createStore`

1. `createStore` need a `creator` function as params, and the `creator` function also have `ref`、`reactive`、`computed`... reactive api as params. `createState` also need a `setup` function as params, the different is `setup` function not have reactive params, only need return a plain object

2. `createState` support middleware, currently `createState` support two middleware: 1. `withPersist` middleware support automatic sync state to the `localStorage` or `getStorage` provider in the `withPersist` options params. 2. `withActions` middleware support you define action for current `state`, and also can be get the action from `useSelector`.

## Simple Code Example

```tsx
import { createState } from "reactivity-store";

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
  import CreateStorageMiddleware from '@theme/components/createStateWithStorageMiddleware.vue'
  import CreateActionsMiddleware from '@theme/components/createStateWithActionsMiddleware.vue'
  import CreateAllMiddleware from '@theme/components/createStateWithAllMiddleware.vue'
</script>

<Create />

## Code Example with localStorage middleware

```tsx
import { createState, withPersist } from "reactivity-store";

const useCount = createState(
  withPersist(
    () => {
      const data = { count: 0 };

      return { data };
    },
    /**
     * key: string;  // the unique key what can be used for cache current state
     * getStorage?: () => Storage; // customer Storage support, only happen in the client side
     * stringify?: (state: T) => string; // when state change, how to cache the state
     * parse?: (s: string) => T; // how to parse the string state to object
     * merge?: (fromCreator: T, fromStorage: Partial<T>) => T; // merge two part of state to the final state
     */
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

<CreateStorageMiddleware />

## Code Example with action middleware

```tsx
import { createState, withActions } from "reactivity-store";

const useCount = createState(
  withActions(
    () => {
      const data = { count: 0 };

      return data;
    },
    { generateActions: (state) => ({ add: () => state.count++, del: () => state.count-- }) }
  )
);

const App = () => {
  const { count, add } = useCount((state) => ({ count: state.count, add: state.add }));

  return (
    <div>
      <p>React Reactive Count</p>
      <p>{count}</p>
      <button onClick={add}>Add</button>
    </div>
  );
};
```

## Online Example

<CreateActionsMiddleware />

## Code Example with all the middleware

```tsx
import { createState, withActions, withPersist } from "reactivity-store";

const useCount = createState(
  withPersist(
    withActions(
      () => {
        const data = { count: 0 };

        return data;
      },
      { generateActions: (state) => ({ add: () => state.count++, del: () => state.count-- }) }
    ),
    { key: "foo" }
  )
);

const App = () => {
  const { count, add } = useCount((state) => ({ count: state.count, add: state.add }));

  return (
    <div>
      <p>React Reactive Count</p>
      <p>{count}</p>
      <button onClick={add}>Add</button>
    </div>
  );
};
```
## Online Example

<CreateAllMiddleware />