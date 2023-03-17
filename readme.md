# RStore

[![Deploy](https://github.com/MrWangJustToDo/r-store/actions/workflows/deploy.yml/badge.svg)](https://github.com/MrWangJustToDo/r-store/actions/workflows/deploy.yml)

## A React state-management, just like use Vue

a React state-management power by Reactive api, which mean you can use Vue Reactive api in React app, any change of the state will cause then UI update, you do not need add any `set` function !

```tsx
import { createStore, reactive, ref, watch } from "r-store";

// multipleStore
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

```tsx
import { createStoreWithLifeCycle, ref, onMounted, onUpdated } from "r-store";

// singleStore  TODO
const useCount = createStoreWithLifeCycle(() => {
  const refValue = ref(0);

  const changeRef = (v) => (refValue.value = v);

  onUpdated(() => {
    console.log("component updated");
  });

  onMounted(() => {
    console.log("component mounted");
  });

  return { refValue, changeRef };
});

const App = () => {
  const { refValue, changeRef } = useCount();

  return (
    <div>
      <p>{refValue}</p>
      <button onClick={() => changeRef(refValue + 1)}>add</button>
    </div>
  );
};
```

still in progress ...
