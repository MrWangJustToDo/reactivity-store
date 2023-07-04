// `createState` provider

import { proxyRefs, reactive, toRaw } from "@vue/reactivity";

import { createHook } from "../shared/hook";
import { createLifeCycle } from "../shared/lifeCycle";
import { checkHasReactive } from "../shared/tools";

import { getFinalActions, getFinalMiddleware, getFinalState } from "./tools";

import type { MaybeStateWithMiddleware } from "./tools";
import type { ShallowUnwrapRef } from "@vue/reactivity";

export type Setup<T extends Record<string, unknown>> = () => T;

export const createState = <T extends Record<string, unknown>>(setup: Setup<MaybeStateWithMiddleware<T>>) => {
  const creator = setup;

  const lifeCycle = createLifeCycle();

  const state = creator();

  // handle withActions middleware;
  const initialState = getFinalState(state);

  const actions = getFinalActions(state);

  const middleware = getFinalMiddleware(state);

  if (__DEV__ && !middleware["withPersist"] && !middleware["withActions"] && checkHasReactive(initialState)) {
    console.error(`[reactivity-store] 'createState' expect receive a plain object but got a reactive object, this is a unexpected usage`);
  }

  const reactiveState = reactive(initialState);

  const finalState = proxyRefs(reactiveState);

  const useSelector = createHook<T>(finalState as ShallowUnwrapRef<T>, lifeCycle, actions);

  const updateStateWithoutReactiveUpdate = (cb: (state: T) => void) => {
    lifeCycle.canUpdateComponent = false;
    cb(initialState);
    lifeCycle.canUpdateComponent = true;
  };

  const typedUseSelector = useSelector as typeof useSelector & { updateStateWithoutReactiveUpdate: typeof updateStateWithoutReactiveUpdate; getState: () => T };

  typedUseSelector.updateStateWithoutReactiveUpdate = updateStateWithoutReactiveUpdate;

  typedUseSelector.getState = () => toRaw(initialState);

  return typedUseSelector;
};
