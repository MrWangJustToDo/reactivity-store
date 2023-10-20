/* eslint-disable @typescript-eslint/ban-types */
import { readonly, toRaw } from "@vue/reactivity";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";

import { Controller } from "./controller";
import { delDevController, setDevController } from "./dev";
import { isReact18 } from "./env";
import { traverse } from "./tools";

import type { LifeCycle } from "./lifeCycle";
import type { DeepReadonly, UnwrapNestedRefs } from "@vue/reactivity";

/**
 * @internal
 */
export const useCallbackRef = <T extends Function>(callback: T) => {
  const callbackRef = useRef(callback);

  callbackRef.current = callback;

  const memoCallback = useCallback((...args: any) => {
    return callbackRef.current?.call(null, ...args);
  }, []) as unknown as T;

  return memoCallback;
};

/**
 * @internal
 */
export const useSubscribeCallbackRef = <T, K>(callback?: (arg?: T) => K, deepSelector?: boolean) => {
  const callbackRef = useRef<Function>();

  callbackRef.current = typeof callback === "function" ? callback : null;

  const memoCallback = useCallbackRef((arg: T) => {
    if (callbackRef.current) {
      const re = callbackRef.current(arg);
      if (deepSelector) traverse(re);
      return re;
    } else {
      traverse(arg);
      return arg;
    }
  });

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
  reactiveState: UnwrapNestedRefs<T>,
  initialState: T,
  lifeCycle: LifeCycle,
  deepSelector = true,
  namespace?: string,
  actions: C = undefined
) => {
  const readonlyState = __DEV__ ? readonly(initialState) : (reactiveState as DeepReadonly<UnwrapNestedRefs<T>>);

  namespace = namespace || "$$__ignore__$$";

  function useSelector(): DeepReadonly<UnwrapNestedRefs<T>> & C;
  function useSelector<P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P): P;
  function useSelector<P>(selector?: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P) {
    const ref = useRef<P | DeepReadonly<UnwrapNestedRefs<T>>>();

    // for now only support `useDeepSelector` in the `createState`
    const selectorRef = useSubscribeCallbackRef(selector, deepSelector);

    const getSelected = useCallbackRef(() => {
      // 0.1.9
      // make the returned value as a readonly value, so the only way to change the state is in the `actions` middleware
      if (selector) {
        ref.current = selector({ ...readonlyState, ...actions });
      } else {
        ref.current = { ...readonlyState, ...actions };
      }
    });

    const prevSelector = usePrevValue(selector);

    const ControllerInstance = useMemo(() => new Controller(() => selectorRef(reactiveState as any), lifeCycle, namespace, getSelected), []);

    useSyncExternalStore(ControllerInstance.subscribe, ControllerInstance.getState, ControllerInstance.getState);

    // initial
    useMemo(() => {
      ControllerInstance.run();
      getSelected();
    }, [ControllerInstance, getSelected]);

    // rerun when the 'selector' change
    useMemo(() => {
      if (prevSelector !== selector) {
        ControllerInstance.run();
        getSelected();
      }
    }, [ControllerInstance, prevSelector, selector]);

    if (__DEV__) {
      ControllerInstance._devSelector = selector;

      ControllerInstance._devActions = actions;

      ControllerInstance._devWithDeep = deepSelector;

      useEffect(() => {
        setDevController(ControllerInstance, initialState);
        return () => {
          delDevController(ControllerInstance, initialState);
        };
      }, []);
    }

    // clean effect
    // currently, the 18 version of `StrictMode` not work if the unmount logic run, so need disable it in the development mode
    if (needUnmountEffect) {
      useEffect(() => () => ControllerInstance.stop(), [ControllerInstance]);
    }

    return ref.current;
  }

  const typedUseSelector = useSelector as typeof useSelector & {
    /**
     * @deprecated
     * use `getReactiveState` / `getReadonlyState` in stead
     */
    getState: () => T;
    getActions: () => C;
    subscribe: <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, cb?: () => void) => () => void;
    getLifeCycle: () => LifeCycle;
    getReactiveState: () => UnwrapNestedRefs<T>;
    getReadonlyState: () => DeepReadonly<UnwrapNestedRefs<T>>;
    useDeepSelector: typeof useSelector;
    useShallowSelector: typeof useSelector;
  };

  typedUseSelector.getState = () => toRaw(initialState);

  typedUseSelector.getLifeCycle = () => lifeCycle;

  typedUseSelector.subscribe = (selector, cb) => {
    const subscribeSelector = () => traverse(selector(reactiveState as DeepReadonly<UnwrapNestedRefs<T>>));

    const controller = new Controller(subscribeSelector, lifeCycle, namespace, cb);

    controller.run();

    return () => controller.stop();
  };

  typedUseSelector.getActions = () => actions;

  typedUseSelector.getReactiveState = () => reactiveState;

  typedUseSelector.getReadonlyState = () => readonlyState;

  typedUseSelector.useDeepSelector = <P>(selector?: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P) => {
    const ref = useRef<P | DeepReadonly<UnwrapNestedRefs<T>>>();

    const selectorRef = useSubscribeCallbackRef(selector, true);

    const getSelected = useCallbackRef(() => {
      if (selector) {
        ref.current = selector({ ...readonlyState, ...actions });
      } else {
        ref.current = { ...readonlyState, ...actions };
      }
    });

    const prevSelector = usePrevValue(selector);

    const ControllerInstance = useMemo(() => new Controller(() => selectorRef(reactiveState as any), lifeCycle, namespace, getSelected), []);

    useSyncExternalStore(ControllerInstance.subscribe, ControllerInstance.getState, ControllerInstance.getState);

    useMemo(() => {
      ControllerInstance.run();
      getSelected();
    }, [ControllerInstance, getSelected]);

    useMemo(() => {
      if (prevSelector !== selector) {
        ControllerInstance.run();
        getSelected();
      }
    }, [ControllerInstance, prevSelector, selector]);

    if (__DEV__) {
      ControllerInstance._devSelector = selector;

      ControllerInstance._devActions = actions;

      ControllerInstance._devWithDeep = "useDeepSelector";

      useEffect(() => {
        setDevController(ControllerInstance, initialState);
        return () => {
          delDevController(ControllerInstance, initialState);
        };
      }, []);
    }

    if (needUnmountEffect) {
      useEffect(() => () => ControllerInstance.stop(), [ControllerInstance]);
    }

    return ref.current;
  };

  typedUseSelector.useShallowSelector = <P>(selector?: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P) => {
    const ref = useRef<P | DeepReadonly<UnwrapNestedRefs<T>>>();

    const selectorRef = useSubscribeCallbackRef(selector, false);

    const getSelected = useCallbackRef(() => {
      if (selector) {
        ref.current = selector({ ...readonlyState, ...actions });
      } else {
        ref.current = { ...readonlyState, ...actions };
      }
    });

    const prevSelector = usePrevValue(selector);

    const ControllerInstance = useMemo(() => new Controller(() => selectorRef(reactiveState as any), lifeCycle, namespace, getSelected), []);

    useSyncExternalStore(ControllerInstance.subscribe, ControllerInstance.getState, ControllerInstance.getState);

    useMemo(() => {
      ControllerInstance.run();
      getSelected();
    }, [ControllerInstance, getSelected]);

    useMemo(() => {
      if (prevSelector !== selector) {
        ControllerInstance.run();
        getSelected();
      }
    }, [ControllerInstance, prevSelector, selector]);

    if (__DEV__) {
      ControllerInstance._devSelector = selector;

      ControllerInstance._devActions = actions;

      ControllerInstance._devWithDeep = "useShallowSelector";

      useEffect(() => {
        setDevController(ControllerInstance, initialState);
        return () => {
          delDevController(ControllerInstance, initialState);
        };
      }, []);
    }

    if (needUnmountEffect) {
      useEffect(() => () => ControllerInstance.stop(), [ControllerInstance]);
    }

    return ref.current;
  };

  return typedUseSelector;
};
