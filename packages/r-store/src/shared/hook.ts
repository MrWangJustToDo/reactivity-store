/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { toRaw } from "@vue/reactivity";
import { isPromise } from "@vue/shared";
import { useCallback, useEffect, useMemo, useRef } from "react";
// SEE https://github.com/facebook/react/pull/25231
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";

import { Controller } from "./controller";
import { delNamespace, setNamespaceMap } from "./dev";
import { InternalNameSpace, isServer } from "./env";
import { traverse, traverseShallow } from "./tools";

import type { LifeCycle } from "./lifeCycle";
import type { DeepReadonly, EffectScope, UnwrapNestedRefs } from "@vue/reactivity";

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

export const createHook = <T extends Record<string, unknown>, C extends Record<string, Function>>(
  reactiveState: UnwrapNestedRefs<T>,
  readonlyState: DeepReadonly<UnwrapNestedRefs<T>>,
  initialState: T,
  lifeCycle: LifeCycle,
  deepSelector = true,
  stableSelector = false,
  stableCompare = true,
  namespace?: string,
  actions: C = undefined
) => {
  const controllerList = new Set<Controller>();

  // TODO
  if (__DEV__ && !isServer && namespace) {
    setNamespaceMap(namespace, initialState);
  }

  let active = true;

  namespace = namespace || InternalNameSpace.$$__ignore__$$;

  let name = namespace !== InternalNameSpace.$$__ignore__$$ ? namespace : "RStoreAnonymous";

  name = name.startsWith("use") ? name : `use${name.charAt(0).toUpperCase()}${name.slice(1)}`;

  // tool function to generate `useSelector` hook
  const generateUseHook = <P>(type: "default" | "deep" | "deep-stable" | "shallow" | "shallow-stable") => {
    const currentIsDeep = type === "default" ? deepSelector : type === "deep" || type === "deep-stable";

    const currentIsStable = type === "default" ? stableSelector : type === "deep-stable" || type === "shallow-stable";

    function useReactiveHookWithSelector(selector?: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P, compare?: (prev: P, next: P) => boolean) {
      const ref = useRef<P | DeepReadonly<UnwrapNestedRefs<T>>>();

      const selectorRef = useSubscribeCallbackRef(selector, currentIsDeep);

      const getSelected = useCallbackRef(() => {
        // 0.1.9
        // make the returned value as a readonly value, so the only way to change the state is in the `actions` middleware
        if (selector) {
          ref.current = selector({ ...readonlyState, ...actions });
        } else {
          ref.current = { ...readonlyState, ...actions };
        }
      });

      const memoCompare = useCallbackRef((p, n) => {
        if (compare && typeof compare === "function") {
          return compare(p, n);
        }
        return false;
      });

      // may not work will with hmr
      const prevSelector = currentIsStable ? selector : usePrevValue(selector);

      const prevCompare = stableCompare ? compare : usePrevValue(compare);

      const ControllerInstance = useMemo(() => new Controller(() => selectorRef(reactiveState as any), memoCompare, lifeCycle, namespace, getSelected), []);

      useSyncExternalStore(ControllerInstance.subscribe, ControllerInstance.getState, ControllerInstance.getState);

      // initial
      useMemo(() => {
        ControllerInstance.run();
        getSelected();
      }, [ControllerInstance, getSelected]);

      // !TODO try to improve the performance
      // rerun when the 'selector' change
      useMemo(() => {
        if (prevSelector !== selector) {
          ControllerInstance.run();
          getSelected();
        }
      }, [ControllerInstance, prevSelector, selector]);

      useMemo(() => {
        if (prevCompare !== compare) {
          ControllerInstance.run();
          getSelected();
        }
      }, [ControllerInstance, prevCompare, compare]);

      if (__DEV__) {
        ControllerInstance._devSelector = selector;

        ControllerInstance._devCompare = compare;

        ControllerInstance._devActions = actions;

        ControllerInstance._devWithDeep = currentIsDeep;

        ControllerInstance._devWithStable = currentIsStable;

        ControllerInstance._devType = type;

        ControllerInstance._devState = initialState;

        ControllerInstance._devResult = ref.current;
      }

      useEffect(() => {
        ControllerInstance.setActive(true);
        controllerList.add(ControllerInstance);
        return () => {
          // fix React strictMode issue
          if (__DEV__) {
            ControllerInstance.setActive(false);
          } else {
            ControllerInstance.stop();
          }
          controllerList.delete(ControllerInstance);
        };
      }, [ControllerInstance]);

      return ref.current;
    }

    return useReactiveHookWithSelector;
  };

  const defaultHook = generateUseHook("default");

  const deepHook = generateUseHook("deep");

  const deepStableHook = generateUseHook("deep-stable");

  const shallowHook = generateUseHook("shallow");

  const shallowStableHook = generateUseHook("shallow-stable");

  function useSelector(): DeepReadonly<UnwrapNestedRefs<T>> & C;
  function useSelector<P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P, compare?: <Q extends P = P>(prev: Q, next: Q) => boolean): P;
  function useSelector<P>(selector?: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P, compare?: <Q extends P = P>(prev: Q, next: Q) => boolean) {
    return defaultHook(selector, compare);
  }

  const obj = {
    [name]: function (...args) {
      return useSelector.call(this, ...args);
    },
  };

  const typedUseSelector = useSelector as typeof useSelector & {
    /**
     * @deprecated
     * use `getReactiveState` / `getReadonlyState` instead
     */
    getState: () => T;
    getActions: () => C;
    getIsActive: () => boolean;
    subscribe: <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, cb?: () => void) => () => void;
    getLifeCycle: () => LifeCycle;
    getReactiveState: () => UnwrapNestedRefs<T>;
    getReadonlyState: () => DeepReadonly<UnwrapNestedRefs<T>>;
    useStableSelector: typeof useSelector;
    useDeepSelector: typeof useSelector;
    useDeepStableSelector: typeof useSelector;
    useShallowSelector: typeof useSelector;
    useShallowStableSelector: typeof useSelector;
    clear: () => void;
    scope?: EffectScope;
  };

  typedUseSelector.getState = () => {
    if (__DEV__) {
      console.warn("[reactivity-store] `getState` is deprecated, use `getReactiveState` or `getReadonlyState` instead");
    }
    return toRaw(initialState);
  };

  typedUseSelector.getLifeCycle = () => lifeCycle;

  typedUseSelector.getActions = () => actions;

  typedUseSelector.getReactiveState = () => reactiveState;

  typedUseSelector.getReadonlyState = () => readonlyState;

  typedUseSelector.useDeepSelector = deepHook as typeof useSelector;

  typedUseSelector.useDeepStableSelector = deepStableHook as typeof useSelector;

  typedUseSelector.useShallowSelector = shallowHook as typeof useSelector;

  typedUseSelector.useShallowStableSelector = shallowStableHook as typeof useSelector;

  typedUseSelector.subscribe = (selector, cb, shallow?: boolean) => {
    const subscribeSelector = () => {
      const re = selector(reactiveState as DeepReadonly<UnwrapNestedRefs<T>>);
      if (__DEV__ && isPromise(re)) {
        console.error(`[reactivity-store/subscribe] selector should return a plain object, but current is a promise`);
      }
      if (shallow) {
        traverseShallow(re);
      } else {
        traverse(re);
      }

      return re;
    };

    const controller = new Controller(subscribeSelector, Object.is, lifeCycle, InternalNameSpace.$$__subscribe__$$, () => cb());

    controller.run();

    controllerList.add(controller);

    return () => {
      controllerList.delete(controller);
      controller.stop();
    };
  };

  typedUseSelector.getIsActive = () => active;

  typedUseSelector.clear = () => {
    controllerList.forEach((i) => i.stop());

    if (__DEV__ && !isServer && namespace) {
      delNamespace(namespace);
    }

    active = false;
  };

  // make happy for react dev tool
  return obj[name] as typeof typedUseSelector;
};
