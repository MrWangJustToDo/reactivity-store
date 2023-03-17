import { ShallowUnwrapRef } from "@vue/reactivity";
import { internalCreateStore } from "./core";

export const createStore = <T extends {} = any>(creator: () => T) => {
  const { lifeCycleInstance, useSelector } = internalCreateStore(creator);

  function useSelectorWithDev(): ShallowUnwrapRef<T>;
  function useSelectorWithDev<P extends any = any>(
    selector?: (state: ShallowUnwrapRef<T>) => P
  ): P;
  function useSelectorWithDev<P extends any = any>(
    selector?: (state: ShallowUnwrapRef<T>) => P
  ) {
    const re = useSelector<P>(selector);

    if (lifeCycleInstance.hasHookInstall) {
      console.warn(
        "'createStore' should not contain any 'hook' function, if you want to use 'hook', please use 'createStoreWithLifeCycle'"
      );
    }

    return re;
  }

  return __DEV__ ? useSelectorWithDev : useSelector;
};

export const createStoreWithLifeCycle = <T extends {} = any>(
  creator: () => T
) => {
  const { count, useSelector } = internalCreateStore(creator);

  function useSelectorWithDev(): ShallowUnwrapRef<T>;
  function useSelectorWithDev<P extends any = any>(
    selector?: (state: ShallowUnwrapRef<T>) => P
  ): P;
  function useSelectorWithDev<P extends any = any>(
    selector?: (state: ShallowUnwrapRef<T>) => P
  ) {
    const re = useSelector<P>(selector);

    if (count > 1) {
      console.warn(
        "'createStoreWithLifeCycle' should only used in one component"
      );
    }

    return re;
  }

  return __DEV__ ? useSelectorWithDev : useSelector;
};
