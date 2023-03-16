import { ShallowUnwrapRef } from "@vue/reactivity";
import { internalCreateStore } from "./core";

export const createStore = <T extends {} = any>(creator: () => T) => {
  const { lifeCycleInstance, useSelector } = internalCreateStore(creator);

  const useSelectorWithDev = <P extends any = any>(
    selector?: (state: ShallowUnwrapRef<T>) => P,
    isEquals?: (prevState: P, nextState: P) => boolean
  ): ReturnType<typeof useSelector> => {
    const re = useSelector(selector, isEquals);

    if (lifeCycleInstance.hasHookInstall) {
      console.warn(
        "'createStore' should not contain any 'hook' function, if you want to use 'hook', please use 'createStoreWithLifeCycle'"
      );
    }

    return re;
  };

  return __DEV__ ? useSelectorWithDev : useSelector;
};

export const createStoreWithLifeCycle = <T extends {} = any>(
  creator: () => T
) => {
  const { set, useSelector } = internalCreateStore(creator);

  const useSelectorWithDev = <P extends any = any>(
    selector?: (state: ShallowUnwrapRef<T>) => P,
    isEquals?: (prevState: P, nextState: P) => boolean
  ): ReturnType<typeof useSelector> => {
    const re = useSelector(selector, isEquals);

    if (set.size > 1) {
      console.warn(
        "'createStoreWithLifeCycle' should only used in one component"
      );
    }

    return re;
  };

  return __DEV__ ? useSelectorWithDev : useSelector;
};
