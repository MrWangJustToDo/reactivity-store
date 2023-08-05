# RStore

[![Deploy](https://github.com/MrWangJustToDo/r-store/actions/workflows/deploy.yml/badge.svg)](https://github.com/MrWangJustToDo/r-store/actions/workflows/deploy.yml)
[![npm](https://img.shields.io/npm/v/reactivity-store)](https://www.npmjs.com/package/reactivity-store)
[![Release](https://img.shields.io/github/v/release/MrWangJustToDo/r-store)](https://github.com/MrWangJustToDo/r-store)

## A React state-management, inspired by the `Vue` and `zustand`

a React state-management power by Reactive api, which mean you can use Vue Reactive api in React app, any change of the state will make then UI update automatic, you do not need add any `set` function !

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

  const changeRef = (v) => (refValue.value = v);

  return { refValue, changeRef };
});

const App = () => {
  const { ref, change } = useCount((state) => ({
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

// simple reactive state
const useCount = createState(() => {
  return { data: { count: 0 } };
});

// simple reactive state with middleware
// the `withPersist` middleware support auto cache the `state` to the `Storage` when the `state` change
const useCount = createState(withPersist(() => ({ data: { count: 0 } }), { key: "count" }));

// the `withActions` middleware support define the action for the state
const useCount = createState(withActions(() => ({ count: 0 }), { generateActions: (state) => ({ add: () => state.count++ }) }));
// then you can get the action from the `selector`
const { count, add } = useCount((state) => ({ count: state.count, add: state.add }));

// you can also compose this two middleware

// or you can use the `option` api with full type support, it is very simple to use
const useCount = createState(() => ({ count: 0 }), { withActions: (state) => ({ add: () => state.count++ }), withPersist: "count" });

// the createState have the same usage with createStore
const App = () => {
  const count = useCount((state) => state.data);

  return (
    <div>
      <p>{count.count}</p>
      <button onClick={() => count.count++}>add</button>
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

### Pure hook api for `reactive` state;

```tsx
import { useReactiveEffect, useReactiveState } from "reactivity-store";

const usePosition = () => {
  // the `state` object will be a reactive object;
  // so every change for this object will cause the component update automatic
  // also support a function as the params
  const state = useReactiveState({ x: 0, y: 0 });

  const xPosition = useReactiveState({ x: 0 });

  useReactiveEffect(() => {
    const listener = (e: MouseEvent) => {
      state.x = e.clientX;
      state.y = e.clientY;
    };

    window.addEventListener("mousemove", listener);

    // same behavior as `useEffect` 
    return () => window.removeEventListener("mousemove", listener);
  });

  // when the component mount or the `state.x` has changed, the effect callback will be invoked
  // because of the `xPosition` is a `state` which create by `useReactiveState`, so the change will cause component update automatic
  useReactiveEffect(() => {
    xPosition.x = state.x;
  });

  return { y: state.y, x: xPosition.x };
};
```

## License

MIT
