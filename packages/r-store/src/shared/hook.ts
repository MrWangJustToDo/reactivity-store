/* eslint-disable @typescript-eslint/ban-types */
import { readonly, toRaw } from "@vue/reactivity";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";

import { Controller } from "./controller";
import { delDevController, setDevController, setNamespaceMap } from "./dev";
import { InternalNameSpace, isReact18, isServer } from "./env";
import { traverse, traverseShallow } from "./tools";

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
      if (deepSelector) {
        traverse(re);
      } else {
        // fix useState(s => s) not subscribe reactive state update
        traverseShallow(re);
      }
      return re;
    } else {
      // !BREAKING CHANGE, will change the default behavior when the deepSelector is true
      if (deepSelector) {
        traverse(arg);
      } else {
        traverseShallow(arg);
      }
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
  const controllerList = new Set<Controller>();

  // TODO
  __DEV__ && !isServer && namespace && setNamespaceMap(namespace, initialState);

  let active = true;

  const readonlyState = __DEV__ ? readonly(initialState) : (reactiveState as DeepReadonly<UnwrapNestedRefs<T>>);

  namespace = namespace || InternalNameSpace.$$__ignore__$$;

  // tool function to generate `useSelector` hook
  const generateUseHook = <P>(type: "default" | "deep" | "shallow") => {
    return (selector?: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P) => {
      const ref = useRef<P | DeepReadonly<UnwrapNestedRefs<T>>>();

      const selectorRef = useSubscribeCallbackRef(selector, type === "default" ? deepSelector : type === "deep" ? true : false);

      const getSelected = useCallbackRef((i?: Controller) => {
        i?.run?.();
        // 0.1.9
        // make the returned value as a readonly value, so the only way to change the state is in the `actions` middleware
        if (selector) {
          ref.current = selector({ ...readonlyState, ...actions });
        } else {
          ref.current = { ...readonlyState, ...actions };
        }

        if (__DEV__ && i) {
          i._devResult = ref.current;
        }
      });

      const prevSelector = usePrevValue(selector);

      const ControllerInstance = useMemo(() => new Controller(() => selectorRef(reactiveState as any), lifeCycle, controllerList, namespace, getSelected), []);

      useSyncExternalStore(ControllerInstance.subscribe, ControllerInstance.getState, ControllerInstance.getState);

      // initial
      useMemo(() => {
        if (!active) return;
        getSelected(ControllerInstance);
      }, [ControllerInstance, getSelected]);

      // !TODO try to improve the performance
      // rerun when the 'selector' change
      useMemo(() => {
        if (active && prevSelector !== selector) {
          getSelected(ControllerInstance);
        }
      }, [ControllerInstance, prevSelector, selector]);

      if (__DEV__) {
        ControllerInstance._devSelector = selector;

        ControllerInstance._devActions = actions;

        ControllerInstance._devWithDeep = type === "default" ? deepSelector : type === "deep" ? "useDeepSelector" : "useShallowSelector";

        ControllerInstance._devState = initialState;

        if (!active) {
          console.error("current `useSelector` have been inactivated, check your code first");
        }

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
    };
  };

  const defaultHook = generateUseHook("default");

  const deepHook = generateUseHook("deep");

  const shallowHook = generateUseHook("shallow");

  function useSelector(): DeepReadonly<UnwrapNestedRefs<T>> & C;
  function useSelector<P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P): P;
  function useSelector<P>(selector?: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P) {
    return defaultHook(selector);
  }

  const typedUseSelector = useSelector as typeof useSelector & {
    /**
     * @deprecated
     * use `getReactiveState` / `getReadonlyState` in stead
     */
    getState: () => T;
    getActions: () => C;
    getIsActive: () => boolean;
    subscribe: <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, cb?: () => void) => () => void;
    getLifeCycle: () => LifeCycle;
    getReactiveState: () => UnwrapNestedRefs<T>;
    getReadonlyState: () => DeepReadonly<UnwrapNestedRefs<T>>;
    useDeepSelector: typeof useSelector;
    useShallowSelector: typeof useSelector;
    cleanReactiveHooks: () => void;
  };

  typedUseSelector.getState = () => toRaw(initialState);

  typedUseSelector.getLifeCycle = () => lifeCycle;

  typedUseSelector.getActions = () => actions;

  typedUseSelector.getReactiveState = () => reactiveState;

  typedUseSelector.getReadonlyState = () => readonlyState;

  typedUseSelector.useDeepSelector = deepHook as typeof useSelector;

  typedUseSelector.useShallowSelector = shallowHook as typeof useSelector;

  typedUseSelector.subscribe = (selector, cb) => {
    const subscribeSelector = () => traverse(selector(reactiveState as DeepReadonly<UnwrapNestedRefs<T>>));

    const controller = new Controller(subscribeSelector, lifeCycle, controllerList, InternalNameSpace.$$__subscribe__$$, (i) => {
      i?.run?.();
      cb();
    });

    if (active) {
      controller.run();
    }

    if (__DEV__) {
      if (!active) {
        console.error("can not subscribe an inactivated hook, check your code first");
      }
    }

    return () => controller.stop();
  };

  typedUseSelector.cleanReactiveHooks = () => {
    controllerList.forEach((i) => i.stop());

    active = false;
  };

  typedUseSelector.getIsActive = () => active;

  return typedUseSelector;
};
