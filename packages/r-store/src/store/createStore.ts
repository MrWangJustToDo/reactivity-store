import { proxyRefs } from "@vue/reactivity";

import { createHook, createLifeCycle, reactiveApi } from "../shared";

import type { ReactiveApi} from "../shared";

export type Creator<T extends Record<string, unknown>> = (reactiveApi: ReactiveApi) => T;

export const createStore = <T extends Record<string, unknown>>(creator: Creator<T>) => {
  const state = creator(reactiveApi);

  const reactiveState = proxyRefs(state);

  const lifeCycleInstance = createLifeCycle();

  const useSelector = createHook(reactiveState, lifeCycleInstance);

  const updateStateWithoutReactiveUpdate = (cb: (state: T) => void) => {
    lifeCycleInstance.canUpdateComponent = false;
    cb(state);
    lifeCycleInstance.canUpdateComponent = true;
  };

  const typedUseSelector = useSelector as typeof useSelector & { updateStateWithoutReactiveUpdate: typeof updateStateWithoutReactiveUpdate };

  typedUseSelector.updateStateWithoutReactiveUpdate = updateStateWithoutReactiveUpdate;

  return typedUseSelector;
};
