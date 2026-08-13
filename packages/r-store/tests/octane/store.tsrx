import { createStore, ref } from "reactivity-store/octane";

type CounterState = {
  count: import("@vue/reactivity").Ref<number>;
  other: import("@vue/reactivity").Ref<number>;
  increment: () => void;
  incrementOther: () => void;
};

const count = ref(0);
const other = ref(10);

export const useCounter = createStore(
  () => ({
    count,
    other,
    increment: () => count.value++,
    incrementOther: () => other.value++,
  }) satisfies CounterState
);

export function resetCounter(nextCount = 0, nextOther = 10) {
  count.value = nextCount;
  other.value = nextOther;
}

export function StoreView() @{
  const selectedCount = useCounter((state) => state.count);
  const selectedOther = useCounter.useShallowSelector((state) => state.other);
  const increment = useCounter((state) => state.increment);
  const incrementOther = useCounter.useShallowStableSelector((state) => state.incrementOther);

  <div>
    <span id="count">{`${selectedCount}`}</span>
    <span id="other">{`${selectedOther}`}</span>
    <button id="increment" onClick={increment}>increment</button>
    <button id="increment-other" onClick={incrementOther}>increment other</button>
  </div>
}
