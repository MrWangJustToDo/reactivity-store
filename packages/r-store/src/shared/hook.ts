import { useCallback, useEffect, useMemo, useRef, useState, version } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";

import { Controller } from "./controller";
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

// eslint-disable-next-line @typescript-eslint/ban-types
export const useCallbackRef = <T extends Function>(callback: T) => {
  const callbackRef = useRef(callback);

  callbackRef.current = callback;

  const memoCallback = useCallback(() => {
    return callbackRef.current();
  }, []) as unknown as T;

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

// eslint-disable-next-line no-extra-boolean-cast
const needUnmountEffect = version?.startsWith("18") ? !Boolean(__DEV__) : true;

export const createHook = <T extends Record<string, unknown>>(state: ShallowUnwrapRef<T>, lifeCycle: LifeCycle, actions: Record<string, unknown> = {}) => {
  function useSelector(): ShallowUnwrapRef<T>;
  function useSelector<P>(selector: (state: ShallowUnwrapRef<T>) => P): P;
  function useSelector<P>(selector?: (state: ShallowUnwrapRef<T>) => P) {
    const ref = useRef<P | ShallowUnwrapRef<T>>();

    const selectorRef = useSubscribeCallbackRef(selector);

    const getSelected = useCallbackRef(() => {
      if (selector) {
        ref.current = selector({ ...state, ...actions });
      } else {
        ref.current = { ...state, ...actions };
      }
    });

    const prevSelector = usePrevValue(selector);

    const ControllerInstance = useMemo(() => new Controller(() => selectorRef(state), lifeCycle, getSelected), []);

    useSyncExternalStore(ControllerInstance.subscribe, ControllerInstance.getState, ControllerInstance.getState);

    // initial
    useMemo(() => {
      ControllerInstance.getEffect().run();
      getSelected();
    }, [ControllerInstance, getSelected]);

    // rerun when the selector change
    useMemo(() => {
      if (prevSelector !== selector) {
        ControllerInstance.getEffect().run();
        getSelected();
      }
    }, [ControllerInstance, prevSelector, selector]);

    // clean effect
    // currently, the 18 version of `StrictMode` not work if the unmount logic run, so need disable it in the development mode
    if (needUnmountEffect) {
      useEffect(() => () => ControllerInstance.getEffect().stop(), [ControllerInstance]);
    }

    return ref.current;
  }

  return useSelector;
};
