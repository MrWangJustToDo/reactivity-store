// `createState` provider

import { proxyRefs, reactive } from "@vue/reactivity";

import { createHook, createLifeCycle } from "../shared";

import { getFinalActions, getFinalState, type MaybeStateWithMiddleware } from "./middleware";

import type { ShallowUnwrapRef } from "@vue/reactivity";

export type Setup<T extends Record<string, unknown>> = () => T;

export const createState = <T extends Record<string, unknown>>(setup: Setup<MaybeStateWithMiddleware<T>>) => {
  const creator = setup;

  const lifeCycle = createLifeCycle();

  const state = creator();

  // handle withActions middleware;
  const initialState = getFinalState(state);

  const actions = getFinalActions(state);

  const reactiveState = reactive(initialState);

  const finalState = proxyRefs(reactiveState);

  const useSelector = createHook<T>(finalState as ShallowUnwrapRef<T>, lifeCycle, actions);

  const updateStateWithoutReactiveUpdate = (cb: (state: T) => void) => {
    lifeCycle.canUpdateComponent = false;
    cb(initialState);
    lifeCycle.canUpdateComponent = true;
  };

  const typedUseSelector = useSelector as typeof useSelector & { updateStateWithoutReactiveUpdate: typeof updateStateWithoutReactiveUpdate };

  typedUseSelector.updateStateWithoutReactiveUpdate = updateStateWithoutReactiveUpdate;

  return typedUseSelector;
};
