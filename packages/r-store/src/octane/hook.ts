/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { toRaw, watch } from "@vue/reactivity";
import { isPromise } from "@vue/shared";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "octane";

import { Controller } from "../shared/controller";
import { InternalNameSpace, isServer } from "../shared/env";

import { createBareSlotRoot, splitSlot, subSlot } from "./internal";
import { traverse, traverseShallow } from "./traverse";

import type { LifeCycle } from "../shared/lifeCycle";
import type { DeepReadonly, EffectScope, UnwrapNestedRefs } from "@vue/reactivity";

const namespaceMap: Record<string, unknown> = Object.create(null);

type Selector<T, C, P> = (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P;

type OctaneSelector<T extends Record<string, unknown>, C extends Record<string, Function>> = {
  (): DeepReadonly<UnwrapNestedRefs<T>> & C;
  <P>(selector: Selector<T, C, P>, compare?: (prev: P, next: P) => boolean): P;
  getState: () => T;
  getActions: () => C;
  getIsActive: () => boolean;
  subscribe: <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, cb?: () => void, shallow?: boolean) => () => void;
  waitingValueTo: <K extends keyof UnwrapNestedRefs<T>>(params: {
    key: K;
    value: UnwrapNestedRefs<T>[K];
    single?: AbortSignal;
    compare?: (exist: UnwrapNestedRefs<T>[K], target: UnwrapNestedRefs<T>[K]) => boolean;
  }) => Promise<void>;
  getLifeCycle: () => LifeCycle;
  getReactiveState: () => UnwrapNestedRefs<T>;
  getReadonlyState: () => DeepReadonly<UnwrapNestedRefs<T>>;
  useLifeCycle: () => void;
  useDeepSelector: OctaneSelectorHook<T, C>;
  useDeepStableSelector: OctaneSelectorHook<T, C>;
  useShallowSelector: OctaneSelectorHook<T, C>;
  useShallowStableSelector: OctaneSelectorHook<T, C>;
  clear: () => void;
  scope?: EffectScope;
};

type OctaneSelectorHook<T extends Record<string, unknown>, C extends Record<string, Function>> = {
  (): DeepReadonly<UnwrapNestedRefs<T>> & C;
  <P>(selector: Selector<T, C, P>, compare?: (prev: P, next: P) => boolean): P;
};

/** @internal */
export const useCallbackRef = <T extends Function>(callback: T, slot: symbol) => {
  const callbackRef = useRef(callback, subSlot(slot, "callback-ref"));
  callbackRef.current = callback;

  return useCallback((...args: any[]) => callbackRef.current?.call(null, ...args), [], subSlot(slot, "callback")) as unknown as T;
};

const useSubscribeCallbackRef = <T, K>(callback: ((arg: T) => K) | undefined, deepSelector: boolean, slot: symbol) => {
  const callbackRef = useRef<Function | null>(null, subSlot(slot, "subscribe-ref"));
  callbackRef.current = typeof callback === "function" ? callback : null;

  return useCallbackRef(
    (arg: T) => {
      if (callbackRef.current) {
        const result = callbackRef.current(arg);
        if (deepSelector) traverse(result);
        else traverseShallow(result);
        return result;
      }

      if (deepSelector) traverse(arg);
      else traverseShallow(arg);
      return arg;
    },
    subSlot(slot, "subscribe-callback")
  );
};

const usePrevValue = <T>(value: T, slot: symbol) => {
  const valueRef = useRef(value, subSlot(slot, "previous-ref"));
  useEffect(
    () => {
      valueRef.current = value;
    },
    [value],
    subSlot(slot, "previous-effect")
  );
  return valueRef.current;
};

/** @internal */
export const createHook = <T extends Record<string, unknown>, C extends Record<string, Function>>(
  reactiveState: UnwrapNestedRefs<T>,
  readonlyState: DeepReadonly<UnwrapNestedRefs<T>>,
  initialState: T,
  lifeCycle: LifeCycle,
  deepSelector = true,
  stableSelector = false,
  stableCompare = true,
  namespace?: string,
  actions: C = undefined as C
) => {
  const controllers = new Set<Controller>();
  if (__DEV__ && !isServer && namespace) namespaceMap[namespace] = initialState;

  let active = true;
  namespace = namespace || InternalNameSpace.$$__ignore__$$;
  let name = namespace !== InternalNameSpace.$$__ignore__$$ ? namespace : "RStoreAnonymous";
  name = name.startsWith("use") ? name : `use${name.charAt(0).toUpperCase()}${name.slice(1)}`;

  const bareSlotRoot = createBareSlotRoot(name);

  // Two slotless call sites of one store in the same component scope resolve
  // identical fallback slots and would silently share hook state. Call sites
  // cannot be told apart without compiler slots, so production keeps the
  // shared fallback while development fails as loudly as octane's own
  // missing-slot error when the fallback is claimed twice in one render.
  // # Reason: the claim counter is reset through a microtask (covers renders
  // that abort with an error) and a layout effect (covers back-to-back
  // synchronous renders, e.g. two flushSync calls in one event handler).
  const useBareSlotClaimGuard = (tag: string) => {
    const claimsRef = useRef({ count: 0, pending: false }, subSlot(bareSlotRoot, `${tag}:bare-claims`));
    const claims = claimsRef.current;
    claims.count++;
    if (claims.count > 1) {
      claims.count = 0;
      throw new Error(
        `[reactivity-store/octane] '${name}' was called multiple times without a hook slot in a single component render, these calls would share the same internal state. Name the store binding with a 'use' prefix so the Octane compiler assigns each call site a slot, or pass an explicit slot symbol as the last argument`
      );
    }
    if (!claims.pending) {
      claims.pending = true;
      queueMicrotask(() => {
        claims.pending = false;
        claims.count = 0;
      });
    }
    if (!isServer) {
      useLayoutEffect(
        () => {
          claims.count = 0;
        },
        null,
        subSlot(bareSlotRoot, `${tag}:bare-claims-reset`)
      );
    }
  };

  const generateUseHook = (type: "default" | "deep" | "deep-stable" | "shallow" | "shallow-stable") => {
    const currentIsDeep = type === "default" ? deepSelector : type === "deep" || type === "deep-stable";
    const currentIsStable = type === "default" ? stableSelector : type === "deep-stable" || type === "shallow-stable";

    function useReactiveHookWithSelector<P>(...rest: [selector?: Selector<T, C, P>, compare?: (prev: P, next: P) => boolean, slot?: symbol]) {
      const [userArgs, callerSlot] = splitSlot(rest);
      if (__DEV__ && callerSlot === undefined) useBareSlotClaimGuard(type);
      const slot = callerSlot ?? bareSlotRoot;
      const selector = userArgs[0] as Selector<T, C, P> | undefined;
      const compare = userArgs[1] as ((prev: P, next: P) => boolean) | undefined;
      const selectedRef = useRef<P | DeepReadonly<UnwrapNestedRefs<T>> | undefined>(undefined, subSlot(slot, `${type}:selected`));
      const selectorRef = useSubscribeCallbackRef(selector, currentIsDeep, subSlot(slot, `${type}:selector`));

      const getSelected = useCallbackRef(
        () => {
          selectedRef.current = selector ? selector({ ...readonlyState, ...actions }) : { ...readonlyState, ...actions };
        },
        subSlot(slot, `${type}:get-selected`)
      );
      const memoCompare = useCallbackRef(
        (previous: P, next: P) => (typeof compare === "function" ? compare(previous, next) : false),
        subSlot(slot, `${type}:compare`)
      );
      const previousSelector = currentIsStable ? selector : usePrevValue(selector, subSlot(slot, `${type}:previous-selector`));
      const previousCompare = stableCompare ? compare : usePrevValue(compare, subSlot(slot, `${type}:previous-compare`));

      const controller = useMemo(
        () => new Controller(() => selectorRef(reactiveState as any), memoCompare, lifeCycle, namespace, getSelected),
        [],
        subSlot(slot, `${type}:controller`)
      );
      useSyncExternalStore(controller.subscribe, controller.getState, controller.getState, subSlot(slot, `${type}:external-store`));

      useMemo(
        () => {
          controller.run();
          getSelected();
        },
        [controller, getSelected],
        subSlot(slot, `${type}:initial-selection`)
      );
      useMemo(
        () => {
          if (previousSelector !== selector) {
            controller.run();
            getSelected();
          }
        },
        [controller, previousSelector, selector],
        subSlot(slot, `${type}:selector-change`)
      );
      useMemo(
        () => {
          if (previousCompare !== compare) {
            controller.run();
            getSelected();
          }
        },
        [controller, previousCompare, compare],
        subSlot(slot, `${type}:compare-change`)
      );

      if (__DEV__) {
        controller._devSelector = selector;
        controller._devCompare = compare;
        controller._devActions = actions;
        controller._devWithDeep = currentIsDeep;
        controller._devWithStable = currentIsStable;
        controller._devType = type;
        controller._devState = initialState;
        controller._devResult = selectedRef.current;
      }

      useEffect(
        () => {
          controller.setActive(true);
          controllers.add(controller);
          return () => {
            if (__DEV__) controller.setActive(false);
            else controller.stop();
            controllers.delete(controller);
          };
        },
        [controller],
        subSlot(slot, `${type}:lifecycle`)
      );

      return selectedRef.current;
    }

    return useReactiveHookWithSelector;
  };

  const useLifeCycle = (...rest: [slot?: symbol]) => {
    const [, callerSlot] = splitSlot(rest);
    if (__DEV__ && callerSlot === undefined) useBareSlotClaimGuard("lifecycle");
    const slot = callerSlot ?? bareSlotRoot;
    const [isMount, setIsMount] = useState(false, subSlot(slot, "lifecycle:state"));

    useEffect(
      () => {
        if (!lifeCycle.hasHookInstall) return;
        if (!isMount) {
          lifeCycle.onBeforeMount.forEach((callback) => callback());
          lifeCycle.onMounted.forEach((callback) => callback());
          setIsMount(true);
          return;
        }

        const lastSync = lifeCycle.syncUpdateComponent;
        lifeCycle.syncUpdateComponent = true;
        lifeCycle.canUpdateComponent = false;
        lifeCycle.onBeforeUpdate.forEach((callback) => callback());
        lifeCycle.canUpdateComponent = true;
        lifeCycle.syncUpdateComponent = lastSync;
        lifeCycle.onUpdated.forEach((callback) => callback());
      },
      null,
      subSlot(slot, "lifecycle:update")
    );
    useEffect(
      () => () => {
        if (lifeCycle.hasHookInstall) {
          lifeCycle.onBeforeUnmount.forEach((callback) => callback());
          lifeCycle.onUnmounted.forEach((callback) => callback());
        }
      },
      [lifeCycle],
      subSlot(slot, "lifecycle:unmount")
    );
  };

  const waitingValueTo = <K extends keyof UnwrapNestedRefs<T>>({
    key,
    value,
    single,
    compare = Object.is,
  }: {
    key: K;
    value: UnwrapNestedRefs<T>[K];
    single?: AbortSignal;
    compare?: (exist: UnwrapNestedRefs<T>[K], target: UnwrapNestedRefs<T>[K]) => boolean;
  }) =>
    new Promise<void>((resolve, reject) => {
      if (single?.aborted) {
        reject(single.reason);
        return;
      }

      const checkValue = (onMatch?: () => void) => {
        if (!compare(toRaw(reactiveState[key]), toRaw(value))) return false;
        onMatch?.();
        resolve();
        return true;
      };

      if (!checkValue()) {
        const handler = watch(
          () => reactiveState[key],
          () => checkValue(() => handler.stop())
        );
        single?.addEventListener(
          "abort",
          () => {
            handler.stop();
            reject(single.reason);
          },
          { once: true }
        );
      }
    });

  const defaultHook = generateUseHook("default");
  const deepHook = generateUseHook("deep");
  const deepStableHook = generateUseHook("deep-stable");
  const shallowHook = generateUseHook("shallow");
  const shallowStableHook = generateUseHook("shallow-stable");

  function useSelector<P>(...rest: [selector?: Selector<T, C, P>, compare?: (prev: P, next: P) => boolean, slot?: symbol]) {
    const [userArgs, slot] = splitSlot(rest);
    return defaultHook(userArgs[0] as Selector<T, C, P> | undefined, userArgs[1] as ((prev: P, next: P) => boolean) | undefined, slot);
  }

  const typedUseSelector = useSelector as OctaneSelector<T, C>;
  typedUseSelector.getState = () => {
    if (__DEV__) console.warn("[reactivity-store] `getState` is deprecated, use `getReactiveState` or `getReadonlyState` instead");
    return toRaw(initialState);
  };
  typedUseSelector.getLifeCycle = () => lifeCycle;
  typedUseSelector.getActions = () => actions;
  typedUseSelector.getReactiveState = () => reactiveState;
  typedUseSelector.getReadonlyState = () => readonlyState;
  typedUseSelector.waitingValueTo = waitingValueTo;
  typedUseSelector.useLifeCycle = useLifeCycle;
  typedUseSelector.useDeepSelector = deepHook as OctaneSelectorHook<T, C>;
  typedUseSelector.useDeepStableSelector = deepStableHook as OctaneSelectorHook<T, C>;
  typedUseSelector.useShallowSelector = shallowHook as OctaneSelectorHook<T, C>;
  typedUseSelector.useShallowStableSelector = shallowStableHook as OctaneSelectorHook<T, C>;
  typedUseSelector.subscribe = (selector, callback, shallow) => {
    const controller = new Controller(
      () => {
        const result = selector(reactiveState as DeepReadonly<UnwrapNestedRefs<T>>);
        if (__DEV__ && isPromise(result)) console.error(`[reactivity-store/subscribe] selector should return a plain object, but current is a promise`);
        if (shallow) traverseShallow(result);
        else traverse(result);
        return result;
      },
      Object.is,
      lifeCycle,
      InternalNameSpace.$$__subscribe__$$,
      () => callback?.()
    );
    controller.run();
    controllers.add(controller);
    return () => {
      controllers.delete(controller);
      controller.stop();
    };
  };
  typedUseSelector.getIsActive = () => active;
  typedUseSelector.clear = () => {
    controllers.forEach((controller) => controller.stop());
    if (__DEV__ && !isServer && namespace) delete namespaceMap[namespace];
    active = false;
  };

  if (!__DEV__) return typedUseSelector;

  const wrapper = {
    [name]: function (...args: unknown[]) {
      return (useSelector as (...input: unknown[]) => unknown)(...args);
    },
  }[name] as OctaneSelector<T, C>;
  Object.assign(wrapper, typedUseSelector);
  return wrapper;
};
