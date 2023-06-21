import { proxyRefs, reactive } from "@vue/reactivity";

import { createHook, createLifeCycle } from "../shared";

import type { LifeCycle} from "../shared";

export type Creator<T extends Record<string, unknown>> = () => T;

export const createStoreWithLifeCycle = <T extends Record<string, unknown>>(creator: Creator<T>, lifeCycle?: LifeCycle) => {
  const state = creator();

  const reactiveState = reactive(state);

  const finalState = proxyRefs(reactiveState);

  const lifeCycleInstance = lifeCycle || createLifeCycle();

  const useSelector = createHook(finalState, lifeCycleInstance);

  const updateStateWithoutReactiveUpdate = (cb: (state: T) => void) => {
    lifeCycleInstance.canUpdateComponent = false;
    cb(state);
    lifeCycleInstance.canUpdateComponent = true;
  };

  const typedUseSelector = useSelector as typeof useSelector & { updateStateWithoutReactiveUpdate: typeof updateStateWithoutReactiveUpdate };

  typedUseSelector.updateStateWithoutReactiveUpdate = updateStateWithoutReactiveUpdate;

  return typedUseSelector;
};

export const createStore = <T extends Record<string, unknown>>(creator: Creator<T>) => {
  return createStoreWithLifeCycle(creator);
}
