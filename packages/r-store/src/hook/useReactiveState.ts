import { useMemo, useState } from "react";

import { internalCreateState } from "../state/_internal";

import type { DeepReadonly, UnwrapNestedRefs } from "@vue/reactivity";

export const useReactiveState = <T extends Record<string, unknown>>(initialState: T | (() => T)) => {
  const [useSelector] = useState(() => {
    const setup = typeof initialState === "function" ? initialState : () => initialState;
    return internalCreateState(setup, "useReactiveState");
  });

  // subscribe reactive store update
  useSelector();

  const setState = useMemo(
    () => (cb: (t: UnwrapNestedRefs<T>) => void) => {
      cb(useSelector.getReactiveState());
    },
    [useSelector]
  );

  // make the state can be used in the `useReactiveEffect` hook
  return [useSelector.getReactiveState(), setState] as [DeepReadonly<UnwrapNestedRefs<T>>, typeof setState];
};
