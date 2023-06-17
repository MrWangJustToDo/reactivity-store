# RStore

[![Deploy](https://github.com/MrWangJustToDo/r-store/actions/workflows/deploy.yml/badge.svg)](https://github.com/MrWangJustToDo/r-store/actions/workflows/deploy.yml)

## A React state-management, just like use Vue

a React state-management power by Reactive api, which mean you can use Vue Reactive api in React app, any change of the state will make then UI update automatic, you do not need add any `set` function !

```tsx
import { createStore } from "reactivity-store";

// simple reactive store
const useCount = createStore(({ ref }) => {
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
import { createStoreWithComponent, onMounted, onUpdated } from "reactivity-store";

// reactive store with component lifeCycle
const Count = createStoreWithComponent({
  setup: ({ ref }) => {
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
