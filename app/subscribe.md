# Subscribe the hook

## Subscribe store hook
```tsx twoslash
import { createStore, ref } from "reactivity-store";
// store.ts
export const useCounter = createStore(() => {
  const count = ref(0);

  const increment = () => {
    count.value += 1;
  };

  const decrement = () => {
    count.value -= 1;
  };

  return { count, increment, decrement };
});

// component.tsx
// import { useCounter } from "./store";
useCounter.subscribe((s) => s.count, () => {
  // if the count changes, this callback will be called
  const newCount = useCounter.getReadonlyState().count;
  console.log("Count changed:", newCount);
});
```

## Subscribe state hook
```tsx twoslash
import { createState } from "reactivity-store";
// store.ts
export const useCounter = createState(() => ({count: 0}), {
  withActions: (s) => ({
    increment: () => {
      s.count += 1;
    },
    decrement: () => {
      s.count -= 1;
    },
  }),
});
// component.tsx
// import { useCounter } from "./store";
useCounter.subscribe((s) => s.count, () => {
  // if the count changes, this callback will be called
  const newCount = useCounter.getReadonlyState().count;
  console.log("Count changed:", newCount);
});
```