import { createState, createStore, ref, withActions } from "reactivity-store";

export const useCount = createState(
  withActions(() => ({ count: 0 }), { generateActions: (state) => ({ add: () => state.count++, del: () => state.count-- }) })
);

export const useCount_2 = createStore(() => {
  const count = ref(0);

  const d = { current: ref(0) };

  const add = () => d.current.value++;

  const del = () => d.current.value--;

  return { data: { d, add, del } };
});
