import { proxyRefs, ReactiveEffect } from "@vue/reactivity";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

import { traverse } from "./tools";

import type { ShallowUnwrapRef } from "@vue/reactivity";

type LifeCycle = {
  onBeforeMount: Array<() => void>;

  onMounted: Array<() => void>;

  onBeforeUpdate: Array<() => void>;

  onUpdated: Array<() => void>;

  onBeforeUnmount: Array<() => void>;

  onUnmounted: Array<() => void>;

  hasHookInstall: boolean;
};

const useCallbackRef = <T, K>(callback?: (arg: T) => K) => {
  const callbackRef = useRef(callback);

  callbackRef.current = callback;

  const memoCallback = useCallback((arg: T) => {
    if (callbackRef.current) {
      const re = callbackRef.current(arg);
      traverse(re);
      return re;
    } else {
      traverse(arg);
      return arg;
    }
  }, []);

  return memoCallback;
};

const usePrevValue = <T>(v: T) => {
  const vRef = useRef(v);

  useEffect(() => {
    vRef.current = v;
  }, [v]);

  return vRef.current;
};

export let globalStoreLifeCycle: LifeCycle | null = null;

export function internalCreateStore<T extends Record<string, unknown>>(creator: () => T) {
  const lifeCycleInstance: LifeCycle = {
    onBeforeMount: [],
    onBeforeUpdate: [],
    onBeforeUnmount: [],
    onMounted: [],
    onUpdated: [],
    onUnmounted: [],

    hasHookInstall: false,
  };

  globalStoreLifeCycle = lifeCycleInstance;

  const state = creator();

  globalStoreLifeCycle = null;

  const reactiveState = proxyRefs(state);

  const canUpdateComponent = { flag: true };

  function useSelector(): ShallowUnwrapRef<T>;
  function useSelector<P>(selector: (state: ShallowUnwrapRef<T>) => P): P;
  function useSelector<P>(selector?: (state: ShallowUnwrapRef<T>) => P) {
    const [, forceUpdate] = useReducer((i) => i + 1, 0);

    const selectorRef = useCallbackRef(selector);

    const prevSelect = usePrevValue(selector);

    const reRef = useRef(null);

    const forceUpdateCallback = useCallback(() => {
      if (canUpdateComponent.flag) {
        forceUpdate();
      }
    }, []);

    const memoEffectInstance = useMemo(() => new ReactiveEffect(() => selectorRef(reactiveState), forceUpdateCallback), []);

    // initial
    useMemo(() => {
      reRef.current = memoEffectInstance.run();
    }, []);

    // if selector function change, rerun
    useMemo(() => {
      if (prevSelect !== selector) {
        reRef.current = memoEffectInstance.run();
      }
    }, [prevSelect, selector]);

    // clean effect
    useEffect(() => () => memoEffectInstance.stop(), []);

    return reRef.current;
  }

  return { useSelector, lifeCycleInstance, canUpdateComponent };
}
