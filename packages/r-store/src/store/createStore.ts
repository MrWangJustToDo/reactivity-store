import { proxyRefs, reactive } from "@vue/reactivity";

import { createHook, createLifeCycle } from "../shared";

export type Creator<T extends Record<string, unknown>> = () => T;

export const createStore = <T extends Record<string, unknown>>(creator: Creator<T>) => {
  const state = creator();

  const reactiveState = reactive(state);

  const finalState = proxyRefs(reactiveState);

  const lifeCycleInstance = createLifeCycle();

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
