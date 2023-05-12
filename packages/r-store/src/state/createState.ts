// `createState` provider

import { proxyRefs, reactive } from "@vue/reactivity";

import { createHook, createLifeCycle } from "../shared";

import type { ShallowUnwrapRef } from "@vue/reactivity";

export type Setup<T extends Record<string, unknown>> = () => T;

export const createState = <T extends Record<string, unknown>>(setup: Setup<T>) => {
  const creator = setup;

  const lifeCycle = createLifeCycle();

  const state = creator();

  const refState = reactive(state);

  const finalState = proxyRefs(refState);

  const useSelector = createHook<T>(finalState as ShallowUnwrapRef<T>, lifeCycle);

  const updateStateWithoutReactiveUpdate = (cb: (state: T) => void) => {
    lifeCycle.canUpdateComponent = false;
    cb(state);
    lifeCycle.canUpdateComponent = true;
  };

  const typedUseSelector = useSelector as typeof useSelector & { updateStateWithoutReactiveUpdate: typeof updateStateWithoutReactiveUpdate };

  typedUseSelector.updateStateWithoutReactiveUpdate = updateStateWithoutReactiveUpdate;

  return useSelector;
};
