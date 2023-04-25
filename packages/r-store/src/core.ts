import { proxyRefs, ReactiveEffect } from "@vue/reactivity";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

import { isServer } from "./env";
import { traverse } from "./tools";

import type { ShallowUnwrapRef } from "@vue/reactivity";

export type LifeCycle = {
  onBeforeMount: Array<() => void>;

  onMounted: Array<() => void>;

  onBeforeUpdate: Array<() => void>;

  onUpdated: Array<() => void>;

  onBeforeUnmount: Array<() => void>;

  onUnmounted: Array<() => void>;

  hasHookInstall: boolean;

  canUpdateComponent: boolean;
};

export const useCallbackRef = <T, K>(callback?: (arg?: T) => K) => {
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

export const usePrevValue = <T>(v: T) => {
  const vRef = useRef(v);

  useEffect(() => {
    vRef.current = v;
  }, [v]);

  return vRef.current;
};

export const ueForceUpdate = () => {
  const [, setState] = useState(0);

  const forceUpdate = useCallback(() => setState((i) => i + 1), []);

  return forceUpdate;
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
    canUpdateComponent: true,
  };

  globalStoreLifeCycle = lifeCycleInstance;

  const state = creator();

  globalStoreLifeCycle = null;

  const reactiveState = proxyRefs(state);

  function useSelector(): ShallowUnwrapRef<T>;
  function useSelector<P>(selector: (state: ShallowUnwrapRef<T>) => P): P;
  function useSelector<P>(selector?: (state: ShallowUnwrapRef<T>) => P) {
    const [, forceUpdate] = useReducer((i) => i + 1, 0);

    const selectorRef = useCallbackRef(selector);

    const prevSelect = usePrevValue(selector);

    const reRef = useRef(null);

    const forceUpdateCallback = useCallback(() => {
      if (__DEV__ && isServer) {
        console.warn(`[r-store] unexpected update for r-store, should not update a r-store on the server!`);
      }
      if (lifeCycleInstance.canUpdateComponent) {
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

  function updateStateWithoutReactiveUpdate(cb: (state: T) => void) {
    lifeCycleInstance.canUpdateComponent = false;
    cb(state);
    lifeCycleInstance.canUpdateComponent = true;
  }

  function getState() {
    return state;
  }

  return { useSelector, lifeCycleInstance, updateStateWithoutReactiveUpdate, getState };
}
