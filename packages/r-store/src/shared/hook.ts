import { ReactiveEffect } from "@vue/reactivity";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { isServer } from "./env";
import { traverse } from "./tools";

import type { LifeCycle } from "./lifeCycle";
import type { ShallowUnwrapRef } from "@vue/reactivity";

export const useSubscribeCallbackRef = <T, K>(callback?: (arg?: T) => K) => {
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

export const useForceUpdate = () => {
  const [, setState] = useState(0);

  const forceUpdate = useCallback(() => setState((i) => i + 1), []);

  return forceUpdate;
};

export const createHook = <T extends Record<string, unknown>>(state: ShallowUnwrapRef<T>, lifeCycle: LifeCycle, actions: Record<string, unknown> = {}) => {
  function useSelector(): ShallowUnwrapRef<T>;
  function useSelector<P>(selector: (state: ShallowUnwrapRef<T>) => P): P;
  function useSelector<P>(selector?: (state: ShallowUnwrapRef<T>) => P) {
    const forceUpdate = useForceUpdate();

    const selectorRef = useSubscribeCallbackRef(selector);

    const reRef = useRef(null);

    const forceUpdateCallback = useCallback(() => {
      if (__DEV__ && isServer) {
        console.warn(`[reactivity-store] unexpected update for reactivity-store, should not update a state on the server!`);
      }
      if (lifeCycle.canUpdateComponent) {
        lifeCycle.shouldRunSelector = true;
        forceUpdate();
      }
    }, []);

    const memoEffectInstance = useMemo(() => new ReactiveEffect(() => selectorRef(state), forceUpdateCallback), []);

    if (lifeCycle.shouldRunSelector) {
      lifeCycle.shouldRunSelector = false;
      memoEffectInstance.run();
      reRef.current = selectorRef({ ...state, ...actions });
    }

    // clean effect
    useEffect(() => () => memoEffectInstance.stop(), []);

    return reRef.current;
  }

  return useSelector;
};
