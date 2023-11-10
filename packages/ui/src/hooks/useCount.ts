import { ref, createState, createStore, withActions, withNamespace } from "reactivity-store";

export const useCount = createState(
  withNamespace(
    withActions(() => ({ count: 0 }), { generateActions: (state) => ({ add: () => state.count++, del: () => state.count-- }) }),
    { namespace: "foo", reduxDevTool: true }
  ),
  { withActions: (s) => ({ add: () => s.count++ }) }
  // { withNamespace: "useCount", withActions: (s: { count: number; }) => ({ add: () => s.count++ })}
);

export const useVVV = createState(() => ({
  f: () => {
    void 0;
  },
  gg: ref(0),
}));

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
