import { createState, createStore, ref, withActions } from "reactivity-store";

export const useCount = createState(
  withActions(() => ({ count: 0 }), { generateActions: (state) => ({ add: () => state.count++, del: () => state.count-- }) }),
  { withActions: (s) => ({ add: () => s.count++ }) }
);

export const useCount_2 = createStore(() => {
  const count = ref(0);

  const d = { current: ref(0) };

  const add = () => d.current.value++;

  const del = () => d.current.value--;

  return { data: { d, add, del } };
});

export const useCount_3 = createStore(() => {
  const count = ref(0);

  const d = ref(0);

  const addC = () => count.value++;

  const add = () => d.value++;

  const del = () => d.value--;

  return { count, d, add, del, addC };
});
