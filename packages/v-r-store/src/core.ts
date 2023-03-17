import { proxyRefs, ReactiveEffect, ShallowUnwrapRef } from "@vue/reactivity";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { traverse } from "./tools";

type LifeCycle = {
  onBeforeMount: Array<() => void>;

  onMounted: Array<() => void>;

  onBeforeUpdate: Array<() => void>;

  onUpdated: Array<() => void>;

  onBeforeUnmount: Array<() => void>;

  onUnmounted: Array<() => void>;

  hasHookInstall: boolean;
};

const useCallbackRef = <T extends any, K extends any>(
  callback?: (arg: T) => K
) => {
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

const usePrevValue = <T extends any>(v: T) => {
  const vRef = useRef(v);

  useEffect(() => {
    vRef.current = v;
  }, [v]);

  return vRef.current;
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

  let count = 0;

  function useSelector(): ShallowUnwrapRef<T>;
  function useSelector<P extends any = any>(
    selector: (state: ShallowUnwrapRef<T>) => P
  ): P;
  function useSelector<P extends any = any>(
    selector?: (state: ShallowUnwrapRef<T>) => P
  ) {
    const [, forceUpdate] = useReducer((i) => i + 1, 0);

    const selectorRef = useCallbackRef(selector);

    const prevSelect = usePrevValue(selector);

    const reRef = useRef(null);

    // beforeMount
    useMemo(() => {
      lifeCycleInstance.onBeforeMount.forEach((f) => f());
    }, []);

    // beforeUpdate
    const forceUpdateCallback = useCallback(() => {
      lifeCycleInstance.onBeforeUpdate.forEach((f) => f());
      forceUpdate();
    }, []);

    const memoEffectInstance = useMemo(
      () =>
        new ReactiveEffect(
          () => selectorRef(reactiveState),
          () => forceUpdateCallback()
        ),
      []
    );

    // initial
    useMemo(() => {
      reRef.current = memoEffectInstance.run();
    }, []);

    useMemo(() => {
      if (prevSelect !== selector) {
        reRef.current = memoEffectInstance.run();
      }
    }, [prevSelect, selector]);

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

    // clean effect
    useEffect(() => () => memoEffectInstance.stop(), []);

    useEffect(() => {
      count++;
      return () => {
        count--;
      };
    }, []);

    return reRef.current;
  }

  return { count, state, lifeCycleInstance, useSelector };
}
