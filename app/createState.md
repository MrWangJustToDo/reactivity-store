# How to create a State

## Description

`RStore` also provide a `createState` function, this function have some difference for `createStore`

1. `createStore` need a `creator` function as params, you can use `reactiveApi` in the `creator` function what export from `RStore`. `createState` also need a `setup` function as params, the different is `setup` function only need return a plain object not a reactive, and we can define the change function in the middleware.

2. `createState` support middleware, currently `createState` support two middleware: 1. `withPersist` middleware support automatic sync state to the `localStorage` or `getStorage` provider in the `withPersist` options params. 2. `withActions` middleware support you define action for current `state`, and also can be get the action from `selector`.

## v0.1.9 Update

the state which in the `selector` function is a readonly state, so the only way to change state is in the `action` middleware function.

## v0.2.4 update

new middleware `withDeepSelector` for `createState` support config the selector behavior

## v0.2.6 update

new middleware `withNamespace` for `createState` support `reduxDevTools`

## v0.3.5 update

middleware `withDeepSelector` change to `withSelectorOptions`, also add `stableSelector` config for this middleware

## All build in middleware for `createState`

1. `withPersist(setup, options)` make the state auto sync to storage when some data change
2. `withActions(setup, options)` add actions for current state, then you can get the action in the `selector` function
3. `withNamespace(setup, options)` make the state and change action tracked by `reduxDevTools`, you need install `redux-devtools-extension` on your browser first
4. `withDeepSelector(setup, options)` make the selector support deep selector, when the deep state change, the selector will also be trigger, the default value for the `withDeepSelector` is `true`
5. `withComputed(setup, options)` TODO (maybe won't)

## Simple Code Example

```tsx twoslash
import * as React from "react";
import { createState } from "reactivity-store";

// a simple `createState` store, there are not any change function, so the state will never change
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
      {/* there are also have a escape hatch to change the state  */}
      <button onClick={() => useCount.getReactiveState().data.count++}>Add</button>
    </div>
  );
};
```

## Online Example

<script setup>
  import Create from '@theme/components/createState.vue'
  import CreateStorageMiddleware from '@theme/components/createStateWithStorageMiddleware.vue'
  import CreateActionsMiddleware from '@theme/components/createStateWithActionsMiddleware.vue'
  import DeepSelectorMiddleware from '@theme/components/createStateWithDeepSelectorMiddleware.vue'
  import CreateAllMiddleware from '@theme/components/createStateWithAllMiddleware.vue'
</script>

<Create />

## Code Example with localStorage middleware

```tsx twoslash
import * as React from "react";
import { createState, withPersist } from "reactivity-store";

const _useCount = createState(
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
    { key: "count", getStorage: undefined, stringify: undefined, parse: undefined, merge: undefined, shallow: undefined }
  )
);

// or you can use the `option` api

const useCount = createState(
  () => {
    const data = { count: 0 };

    return { data };
  },
  { withPersist: "count" }
);

const App = () => {
  const data = useCount((state) => state.data);

  return (
    <div>
      <p>React Reactive Count</p>
      <p>{data.count}</p>
      {/* also use escape hatch or you can define change function in the action middleware */}
      <button onClick={() => useCount.getReactiveState().data.count++}>Add</button>
    </div>
  );
};
```

## Online Example

<CreateStorageMiddleware />

## Code Example with action middleware

```tsx twoslash
import * as React from "react";
import { createState, withActions } from "reactivity-store";

const _useCount = createState(
  withActions(
    () => {
      const data = { count: 0 };

      return data;
    },
    { generateActions: (state) => ({ add: () => state.count++, del: () => state.count-- }) }
  )
);

// or you can use the `option` api

const useCount = createState(
  () => {
    const data = { count: 0 };

    return data;
  },
  { withActions: (state) => ({ add: () => state.count++, del: () => state.count-- }) }
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

::: details Click to show zustand code with same logic

```tsx twoslash
// r-store
import { createState } from "reactivity-store";
const useCount_1 = createState(() => ({ count: 0 }), { withActions: (state) => ({ add: () => state.count++, del: () => state.count-- }) });

// zustand
import { create } from "zustand";
const useCount_2 = create<{ data: { count: number } }>((set, get) => ({
  data: { count: 0 },
  add: () => set((state) => ({ data: { count: state.data.count + 1 } })),
  del: () => set((state) => ({ data: { count: state.data.count - 1 } })),
}));
```

:::

## Online Example

<CreateActionsMiddleware />

## Code Example with all the middleware

```tsx twoslash
import * as React from "react";
import { createState, withActions, withPersist, withSelectorOptions, withNamespace } from "reactivity-store";

const _useCount = createState(
  withSelectorOptions(
    withNamespace(
      withActions(
        withPersist(
          () => {
            const data = { count: 0 };

            return data;
          },
          { key: "foo" }
        ),
        { generateActions: (state) => ({ add: () => state.count++, del: () => state.count-- }) }
      ),
      { namespace: "_useCount", reduxDevTool: true, shallow: true }
    ),
    { stableSelector: true, deepSelector: false }
  )
);

// or you can use the `option` api

const useCount = createState(
  () => {
    const data = { count: 0 };

    return data;
  },
  {
    withActions: (state) => ({ add: () => state.count++, del: () => state.count-- }),
    withPersist: "foo",
    withDeepSelector: false,
    withStableSelector: true,
    withNamespace: "useCount",
  }
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

## Code Example with deepSelector

```tsx twoslash
import * as React from "react";
import { createState, withActions, withPersist } from "reactivity-store";

const useCount = createState(
  withActions(
    () => {
      const data = { re: { count: 0 } };

      return data;
    },
    { generateActions: (state) => ({ add: () => state.re.count++, del: () => state.re.count-- }) }
  ),
  {
    // make the selector support deep selector
    /**
     * state is `{a: {b: '1'}}`
     * select is `const re = (state) => state.a;`
     * if `withDeepSelector` is true, when the `re.b` state change, the selector will also be trigger
     * if `withDeepSelector` is false, when the `re.b` state change, the selector will not be trigger
     *
     * the default value for the `withDeepSelector` is true
     */
    withDeepSelector: true,
  }
);

const Foo = () => {
  // the `withDeepSelector` option is true, the selector will be trigger when the `re.count` state change, so the component will update normally
  const { re, add } = useCount((state) => ({ re: state.re, add: state.add }));

  return (
    <div>
      <p>React Reactive Count</p>
      <p>{re.count}</p>
      <button onClick={add}>Add</button>
    </div>
  );
};

const useCount_2 = createState(
  withActions(
    () => {
      const data = { re: { count: 0 } };

      return data;
    },
    { generateActions: (state) => ({ add: () => state.re.count++, del: () => state.re.count-- }) }
  ),
  {
    withDeepSelector: false,
  }
);

const Bar = () => {
  //the `withDeepSelector` option is false, the selector will not be trigger when the `re.count` state change, so the component will not update
  const { re, add } = useCount_2((state) => ({ re: state.re, add: state.add }));

  return (
    <div>
      <p>React Reactive Count</p>
      <p>{re.count}</p>
      <button onClick={add}>Add</button>
    </div>
  );
};
```

## Online Example

<DeepSelectorMiddleware />
