# RStore

[![Deploy](https://github.com/MrWangJustToDo/r-store/actions/workflows/deploy.yml/badge.svg)](https://github.com/MrWangJustToDo/r-store/actions/workflows/deploy.yml)
[![npm](https://img.shields.io/npm/v/reactivity-store)](https://www.npmjs.com/package/reactivity-store)
[![Release](https://img.shields.io/github/v/release/MrWangJustToDo/r-store)](https://github.com/MrWangJustToDo/r-store)

## A React state-management, inspired by the `Vue` and `zustand`

a React state-management power by Reactive api, which mean you can use Vue Reactive api in React app, any change of the state will make then UI auto update!

## Install

```bash
# use pnpm
pnpm add reactivity-store

# or use npm/yarn
```

## Example

```tsx
import { createStore, ref } from "reactivity-store";

// simple reactive store
const useCount = createStore(() => {
  const refValue = ref(0);

  // this is the only valid way to define the change state function (in the `createStore` function)
  const changeRef = (v) => (refValue.value = v);

  return { refValue, changeRef };
});

const App = () => {
  const { ref, change } = useCount((state) => ({
    // the state is a readonly value, so we can't change state here
    // the `ref` value which return from `createStore` will be auto unwrap
    ref: state.refValue,
    change: state.changeRef,
  }));

  return (
    <div>
      <p>{ref}</p>
      <button onClick={() => change(ref + 1)}>add</button>
    </div>
  );
};
```

### `createState` support middleware

```tsx
import { createState, withPersist, withActions } from "reactivity-store";

// simple reactive state, but we can't change the state
const useCount = createState(() => {
  return { count: 0 };
});

// simple reactive state with middleware
// the `withPersist` middleware support auto cache the `state` to the `Storage` when the `state` change
const useCount = createState(withPersist(() => ({ count: 0 }), { key: "count" }));

// the `withActions` middleware support define the action for the state
const useCount = createState(withActions(() => ({ count: 0 }), { generateActions: (state) => ({ add: () => state.count++ }) }));
// then you can get the action from the `selector`
const { count, add } = useCount((state) => ({ count: state.count, add: state.add }));

// you can also compose this two middleware

// or you can use the `option` api with full type support, it is very simple to use
const useCount = createState(() => ({ count: 0 }), { withActions: (state) => ({ add: () => state.count++ }), withPersist: "count" });

// the createState have the same usage with createStore
const App = () => {
  const { count, add } = useCount();

  return (
    <div>
      <p>{count}</p>
      <button onClick={add}>add</button>
    </div>
  );
};
```

### `createStoreWithComponent` support lifeCycle

```tsx
import { createStoreWithComponent, onMounted, onUpdated, ref } from "reactivity-store";

// reactive store with component lifeCycle
const Count = createStoreWithComponent({
  setup: () => {
    const refValue = ref(0);

    const changeRef = (v) => (refValue.value = v);

    onUpdated(() => {
      console.log("component updated");
    });

    onMounted(() => {
      console.log("component mounted");
    });

    return { refValue, changeRef };
  },
});

const App = () => {
  return (
    <div>
      <Count>
        {({ refValue, changeRef }) => (
          <>
            <p>{refValue}</p>
            <button onClick={() => changeRef(refValue + 1)}>add</button>
          </>
        )}
      </Count>
    </div>
  );
};
```

# v0.1.9 Update

### Pure hook api for `reactive` state;

```tsx
import { useReactiveEffect, useReactiveState } from "reactivity-store";

const usePosition = () => {
  // the `state` object will be a reactive object;
  // so every change for this object will cause the component auto update
  // also support a function as the params
  const [state, setState] = useReactiveState({ x: 0, y: 0 });

  // the second value is a `setState` function, this function expect receive a callback function which has the reactiveState as params
  // so we can update the state in the callback function
  const [xPosition, setXPosition] = useReactiveState({ x: 0 });

  useReactiveEffect(() => {
    const listener = (e: MouseEvent) => {
      setState((state) => {
        state.x = e.clientX;
        state.y = e.clientY;
      })
    };

    window.addEventListener("mousemove", listener);

    // same behavior as `useEffect`
    return () => window.removeEventListener("mousemove", listener);
  });

  // when the component mount or the `state.x` has changed, the effect callback will be invoked
  // because of the `xPosition` is a `state` which create by `useReactiveState`, so the change will cause component auto update
  useReactiveEffect(() => {
    // update the state
    setXPosition((xPosition) => {
      xPosition.x = state.x;
    });
  });

  return { y: state.y, x: xPosition.x };
};
```

### Subscribe a state change

```tsx
import { createState } from "reactivity-store";

const useCount = createState(() => ({ count: 0 }), { withActions: (s) => ({ add: () => s.count++ }) });

// you can use subscribe anywhere
const unSubscribe = useCount.subscribe((s) => s.count, callback);
```

## License

MIT
