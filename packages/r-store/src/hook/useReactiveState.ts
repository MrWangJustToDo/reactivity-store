import { useMemo, useState } from "react";

import { internalCreateState } from "../state/_internal";

import type { DeepReadonly, UnwrapNestedRefs } from "@vue/reactivity";

/**
 * @public
 */
export const useReactiveState = <T extends Record<string, unknown>>(initialState: T | (() => T)) => {
  const [useSelector] = useState(() => {
    const setup = typeof initialState === "function" ? initialState : () => initialState;
    return internalCreateState(setup, "useReactiveState");
  });

  // subscribe reactive store update
  useSelector();

  const setState = useMemo(
    () => (payload: UnwrapNestedRefs<T> | ((t: UnwrapNestedRefs<T>) => void)) => {
      if (typeof payload === "function") {
        payload(useSelector.getReactiveState());
      } else {
        const reactiveObj = useSelector.getReactiveState();
        Object.keys(payload).forEach((key) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          reactiveObj[key] = payload[key];
        });
      }
    },
    [useSelector]
  );

  // make the state can be used in the `useReactiveEffect` hook
  // use getReactiveState to make effect can track deps
  return [useSelector.getReactiveState(), setState] as [DeepReadonly<UnwrapNestedRefs<T>>, typeof setState];
};
