import { effectScope, reactive, readonly, toRaw } from "@vue/reactivity";
import { isObject, isPromise } from "@vue/shared";

import { createLifeCycle } from "../shared/lifeCycle";

import { createHook } from "./hook";
import { checkHasReactive } from "./traverse";

import type { LifeCycle } from "../shared/lifeCycle";
import type { DeepReadonly, UnwrapNestedRefs } from "@vue/reactivity";

export type { LifeCycle } from "../shared/lifeCycle";

/** @public */
export type Creator<T extends Record<string, unknown>> = () => T;

/** @public */
export type UseSelectorWithStore<T> = {
  (): DeepReadonly<UnwrapNestedRefs<T>>;
  <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, compare?: (prev: P, next: P) => boolean): P;
  getState: () => T;
  getLifeCycle: () => LifeCycle;
  getReactiveState: () => UnwrapNestedRefs<T>;
  getReadonlyState: () => DeepReadonly<UnwrapNestedRefs<T>>;
  subscribe: <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, cb?: () => void, shallow?: boolean) => () => void;
  waitingValueTo: <K extends keyof UnwrapNestedRefs<T>>(params: {
    key: K;
    value: UnwrapNestedRefs<T>[K];
    single?: AbortSignal;
    compare?: (exist: UnwrapNestedRefs<T>[K], target: UnwrapNestedRefs<T>[K]) => boolean;
  }) => Promise<void>;
  useShallowSelector: UseSelectorHook<T>;
  useShallowStableSelector: UseSelectorHook<T>;
  useDeepSelector: UseSelectorHook<T>;
  useDeepStableSelector: UseSelectorHook<T>;
  clear: () => void;
};

/** @public */
export type UseSelectorHook<T> = {
  (): DeepReadonly<UnwrapNestedRefs<T>>;
  <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, compare?: (prev: P, next: P) => boolean): P;
};

const hasMiddleware = (value: unknown) => Boolean(value && (value as any)["$$__state__$$"] && (value as any)["$$__middleware__$$"]);

const getFinalState = <T extends Record<string, unknown>>(state: T) => {
  return ((state as any)["$$__state__$$"] || state) as T;
};

/** @internal */
const internalCreateStore = <T extends Record<string, unknown>>(creator: Creator<T>) => {
  const scope = effectScope();
  const useSelector = scope.run(() => {
    const state = creator();

    if (__DEV__ && isPromise(state)) {
      console.error(
        `[reactivity-store] 'createStore' expect receive a reactive object but got a promise %o, this is a unexpected usage. should not return a promise in this 'creator' function`,
        state
      );
    }
    if (__DEV__ && !isObject(state)) {
      console.error(
        `[reactivity-store] 'createStore' expect receive a reactive object but got a ${state}, this is a unexpected usage. should return a reactive object in this 'creator' function`
      );
    }
    if (__DEV__ && hasMiddleware(state)) {
      console.error(`[reactivity-store] 'createStore' not support middleware usage, please change to use 'createState'`);
    }
    if (__DEV__ && !checkHasReactive(state)) {
      console.error(
        `[reactivity-store] 'createStore' expect receive a reactive object but got a plain object %o, this is a unexpected usage. should return a reactive object in this 'creator' function`,
        state
      );
    }

    const finalState = getFinalState(state);
    const rawState = toRaw(finalState);
    const reactiveState = reactive(finalState);
    const readonlyState = readonly(finalState);
    return createHook<T, NonNullable<unknown>>(reactiveState, readonlyState, rawState, createLifeCycle());
  })!;

  useSelector.scope = scope;
  return useSelector;
};

/**
 * Creates a Vue-reactivity-backed store whose selector hook runs on Octane.
 * The returned store API matches the React entry point.
 *
 * @public
 */
export const createStore = <T extends Record<string, unknown>>(creator: Creator<T>): UseSelectorWithStore<T> => {
  return internalCreateStore(creator) as UseSelectorWithStore<T>;
};
