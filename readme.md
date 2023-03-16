## v-r-store

this package provider a React store manage by Vue, that's mean we can use reactive api from Vue in the React component

```tsx
import { createStore, reactive, ref, watch } from "v-r-store";

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
import { createStoreWithLifeCycle, ref, onMounted, onUpdated } from "v-r-store";

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
