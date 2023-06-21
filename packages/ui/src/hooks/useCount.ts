import { createState, withActions } from "reactivity-store";

export const useCount = createState(
  withActions(() => ({ count: 0 }), { generateActions: (state) => ({ add: () => state.count++, del: () => state.count-- }) })
);
