/* eslint-disable @typescript-eslint/ban-types */
import { toRaw } from "@vue/reactivity";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";

import { Controller } from "./controller";
import { isReact18 } from "./env";
import { traverse } from "./tools";

import type { LifeCycle } from "./lifeCycle";
import type { ShallowUnwrapRef } from "@vue/reactivity";

/**
 * @internal
 */
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

/**
 * @internal
 */
export const useCallbackRef = <T extends Function>(callback: T) => {
  const callbackRef = useRef(callback);

  callbackRef.current = callback;

  const memoCallback = useCallback(() => {
    return callbackRef.current();
  }, []) as unknown as T;

  return memoCallback;
};

/**
 * @internal
 */
export const usePrevValue = <T>(v: T) => {
  const vRef = useRef(v);

  useEffect(() => {
    vRef.current = v;
  }, [v]);

  return vRef.current;
};

// eslint-disable-next-line no-extra-boolean-cast
const needUnmountEffect = isReact18 ? !Boolean(__DEV__) : true;

export const createHook = <T extends Record<string, unknown>, C extends Record<string, Function>>(
  finalState: ShallowUnwrapRef<T>,
  initialState: T,
  lifeCycle: LifeCycle,
  actions: C = undefined
) => {
  function useSelector(): ShallowUnwrapRef<T> & C;
  function useSelector<P>(selector: (state: ShallowUnwrapRef<T> & C) => P): P;
  function useSelector<P>(selector?: (state: ShallowUnwrapRef<T> & C) => P) {
    const ref = useRef<P | ShallowUnwrapRef<T>>();

    const selectorRef = useSubscribeCallbackRef(selector);

    const getSelected = useCallbackRef(() => {
      if (selector) {
        ref.current = selector({ ...finalState, ...actions });
      } else {
        ref.current = { ...finalState, ...actions };
      }
    });

    const prevSelector = usePrevValue(selector);

    const ControllerInstance = useMemo(() => new Controller(() => selectorRef(finalState as any), lifeCycle, getSelected), []);

    useSyncExternalStore(ControllerInstance.subscribe, ControllerInstance.getState, ControllerInstance.getState);

    // initial
    useMemo(() => {
      ControllerInstance.run();
      getSelected();
    }, [ControllerInstance, getSelected]);

    // rerun when the selector change
    useMemo(() => {
      if (prevSelector !== selector) {
        ControllerInstance.run();
        getSelected();
      }
    }, [ControllerInstance, prevSelector, selector]);

    // clean effect
    // currently, the 18 version of `StrictMode` not work if the unmount logic run, so need disable it in the development mode
    if (needUnmountEffect) {
      useEffect(() => () => ControllerInstance.stop(), [ControllerInstance]);
    }

    return ref.current;
  }

  const typedUseSelector = useSelector as typeof useSelector & {
    getState: () => T;
    getLifeCycle: () => LifeCycle;
    getFinalState: () => ShallowUnwrapRef<T>;
  };

  typedUseSelector.getState = () => toRaw(initialState);

  typedUseSelector.getLifeCycle = () => lifeCycle;

  typedUseSelector.getFinalState = () => finalState;

  return typedUseSelector;
};
