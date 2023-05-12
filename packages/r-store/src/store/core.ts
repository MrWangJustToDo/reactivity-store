import { proxyRefs } from "@vue/reactivity";

import { createHook, createLifeCycle, reactiveApi } from "../shared";

import type { ReactiveApi, LifeCycle } from "../shared";

export type Creator<T extends Record<string, unknown>> = (reactiveApi: ReactiveApi) => T;

export let globalStoreLifeCycle: LifeCycle | null = null;

export function internalCreateStore<T extends Record<string, unknown>>(creator: Creator<T>) {
  const lifeCycleInstance = createLifeCycle();

  globalStoreLifeCycle = lifeCycleInstance;

  const state = creator(reactiveApi);

  globalStoreLifeCycle = null;

  const getState = () => state;

  const reactiveState = proxyRefs(state);

  const useSelector = createHook(reactiveState, lifeCycleInstance);

  const updateStateWithoutReactiveUpdate = (cb: (state: T) => void) => {
    lifeCycleInstance.canUpdateComponent = false;
    cb(state);
    lifeCycleInstance.canUpdateComponent = true;
  };

  return { useSelector, lifeCycleInstance, updateStateWithoutReactiveUpdate, getState };
}
