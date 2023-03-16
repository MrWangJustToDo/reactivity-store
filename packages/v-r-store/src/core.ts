import { proxyRefs, ReactiveEffect, ShallowUnwrapRef } from "@vue/reactivity";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { traverse } from "./tools";

const useSafeEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type LifeCycle = {
  onBeforeMount: Array<() => void>;

  onMounted: Array<() => void>;

  onBeforeUpdate: Array<() => void>;

  onUpdated: Array<() => void>;

  onBeforeUnmount: Array<() => void>;

  onUnmounted: Array<() => void>;

  hasHookInstall: boolean;
};

export let globalStoreLifeCycle: LifeCycle | null = null;

export function internalCreateStore<T extends {}>(creator: () => T) {
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

  const set = new Set<() => void>();

  const effect = new ReactiveEffect(
    () => traverse(reactiveState),
    () => set.forEach((f) => f())
  );

  effect.run();

  function useSelector(): ShallowUnwrapRef<T>;
  function useSelector<P extends any = any>(
    selector: (state: ShallowUnwrapRef<T>) => P,
    isEquals?: (prevState, nextState) => boolean
  ): P;
  function useSelector<P extends any = any>(
    selector?: (state: ShallowUnwrapRef<T>) => P,
    isEquals?: (prevState: P, nextState: P) => boolean
  ) {
    const [, forceUpdate] = useReducer((i) => i + 1, 0);

    const selectorRef = useRef(selector);

    const reRef = useRef<P | ShallowUnwrapRef<T>>(null);

    const prevReRef = useRef<P>(null);

    selectorRef.current = selector;

    prevReRef.current = reRef.current as P;

    // initial
    useMemo(() => {
      reRef.current = selectorRef.current
        ? selectorRef.current(reactiveState)
        : reactiveState;
    }, []);

    // beforeMount
    useMemo(() => {
      lifeCycleInstance.onBeforeMount.forEach((f) => f());
    }, []);

    // beforeUpdate
    const forceUpdateCallback = useCallback(() => {
      lifeCycleInstance.onBeforeUpdate.forEach((f) => f());
      forceUpdate();
    }, []);

    const subscribeCallback = useCallback(() => {
      reRef.current = selectorRef.current
        ? selectorRef.current(reactiveState)
        : reactiveState;
      if (reRef.current === reactiveState) {
        forceUpdateCallback();
        return;
      }
      const targetIsEquals = isEquals || Object.is;
      if (!targetIsEquals(prevReRef.current, reRef.current as P)) {
        forceUpdateCallback();
        return;
      }
    }, []);

    // mounted
    useEffect(() => {
      lifeCycleInstance.onMounted.forEach((f) => f());
    }, []);

    // updated
    // TODO
    useEffect(() => {
      lifeCycleInstance.onUpdated.forEach((f) => f());
    });

    // beforeUnmount & Unmounted
    useEffect(() => {
      return () => {
        lifeCycleInstance.onBeforeUnmount.forEach((f) => f());
        Promise.resolve().then(() => {
          lifeCycleInstance.onUnmounted.forEach((f) => f());
        });
      };
    }, []);

    useSafeEffect(() => {
      set.add(subscribeCallback);
    }, []);

    useEffect(() => () => (set.delete(subscribeCallback), void 0), []);

    return reRef.current;
  }

  return { set, effect, state, lifeCycleInstance, useSelector };
}
