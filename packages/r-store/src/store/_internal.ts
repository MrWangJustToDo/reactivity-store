import { reactive, toRaw } from "@vue/reactivity";
import { isPromise } from "@vue/shared";

import { createHook } from "../shared/hook";
import { createLifeCycle } from "../shared/lifeCycle";
import { checkHasMiddleware, checkHasReactive } from "../shared/tools";
import { getFinalState } from "../state/tools";

import type { LifeCycle } from "../shared/lifeCycle";

/**
 * @public
 */
export type Creator<T extends Record<string, unknown>> = () => T;

/**
 * @internal
 */
export const internalCreateStore = <T extends Record<string, unknown>>(creator: Creator<T>, name = "createStore", lifeCycle?: LifeCycle) => {
  const state = creator();

  if (__DEV__ && isPromise(state)) {
    console.error(
      `[reactivity-store] '${name}' expect receive a reactive object but got a promise %o, this is a unexpected usage. should not return a promise in this 'creator' function`,
      state
    );
  }

  if (__DEV__ && checkHasMiddleware(state)) {
    console.error(`[reactivity-store] '${name}' not support middleware usage, please change to use 'createState'`);
  }

  if (__DEV__ && !checkHasReactive(state)) {
    console.error(
      `[reactivity-store] '${name}' expect receive a reactive object but got a plain object %o, this is a unexpected usage. should return a reactive object in this 'creator' function`,
      state
    );
  }

  const _state = getFinalState(state);

  const rawState = toRaw(_state);

  const reactiveState = reactive(_state);

  const lifeCycleInstance = lifeCycle || createLifeCycle();

  const useSelector = createHook<T, NonNullable<unknown>>(reactiveState, rawState, lifeCycleInstance);

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
