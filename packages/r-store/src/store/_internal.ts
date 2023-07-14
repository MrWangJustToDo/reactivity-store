import { proxyRefs } from "@vue/reactivity";

import { createHook } from "../shared/hook";
import { createLifeCycle } from "../shared/lifeCycle";
import { checkHasMiddleware, checkHasReactive } from "../shared/tools";

import type { LifeCycle } from "../shared/lifeCycle";

export type Creator<T extends Record<string, unknown>> = () => T;

/**
 * @internal
 */
export const internalCreateStore = <T extends Record<string, unknown>>(creator: Creator<T>, name = "createStore", lifeCycle?: LifeCycle) => {
  const state = creator();

  if (__DEV__ && checkHasMiddleware(state)) {
    console.error(`[reactivity-store] '${name}' not support middleware usage, please change to use 'createState'`);
  }

  if (__DEV__ && !checkHasReactive(state)) {
    console.error(`[reactivity-store] '${name}' expect receive a reactive object but got a plain object, this is a unexpected usage`);
  }

  const finalState = proxyRefs(state);

  const lifeCycleInstance = lifeCycle || createLifeCycle();

  const useSelector = createHook(finalState, state, lifeCycleInstance);

  return useSelector;
};

/**
 * @internal
 */
export let globalStoreLifeCycle: LifeCycle | null = null;

/**
 * @internal
 */
export const setGlobalStoreLifeCycle = (instance: LifeCycle | null) => {
  globalStoreLifeCycle = instance;
};
