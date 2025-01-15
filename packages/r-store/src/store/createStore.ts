import { internalCreateStore } from "./_internal";

import type { Creator } from "./_internal";
import type { LifeCycle } from "../shared/lifeCycle";
import type { DeepReadonly, UnwrapNestedRefs } from "@vue/reactivity";

export type { Creator } from "./_internal";

/**
 * @public
 */
export type UseSelectorWithStore<T> = {
  (): DeepReadonly<UnwrapNestedRefs<T>>;
  /**
   * @param selector - a method to select the state
   * @param compare - a method to compare the previous state and the next state, if the result is `true`, the component will not be updated
   * @returns the selected state
   */
  <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, compare?: <Q extends P = P>(prev: Q, next: Q) => boolean): P;
  /**
   * @deprecated
   * use `getReactiveState` / `getReadonlyState` instead
   */
  getState: () => T;
  /**
   * internal lifeCycle object, if you do not know what it is, you can ignore it
   * @returns the lifeCycle object
   */
  getLifeCycle: () => LifeCycle;
  /**
   * get the reactive state, change the state will trigger the component update
   * @returns the reactive state
   */
  getReactiveState: () => UnwrapNestedRefs<T>;
  /**
   * get a readonly state, you can not change the state, it is a safe way to get the state and can be used in anywhere
   * @returns the readonly state
   */
  getReadonlyState: () => DeepReadonly<UnwrapNestedRefs<T>>;
  /**
   *
   * @param selector - a method to select the state, when the state change, the `cb` will be called
   * @param cb - a callback function
   * @returns a unsubscribe function
   */
  subscribe: <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, cb?: () => void, shallow?: boolean) => () => void;
  useShallowSelector: {
    (): DeepReadonly<UnwrapNestedRefs<T>>;
    <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, compare?: <Q extends P = P>(prev: Q, next: Q) => boolean): P;
  };
  useShallowStableSelector: {
    (): DeepReadonly<UnwrapNestedRefs<T>>;
    <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, compare?: <Q extends P = P>(prev: Q, next: Q) => boolean): P;
  };
  useDeepSelector: {
    (): DeepReadonly<UnwrapNestedRefs<T>>;
    <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, compare?: <Q extends P = P>(prev: Q, next: Q) => boolean): P;
  };
  useDeepStableSelector: {
    (): DeepReadonly<UnwrapNestedRefs<T>>;
    <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, compare?: <Q extends P = P>(prev: Q, next: Q) => boolean): P;
  };
  clear: () => void;
};

/**
 * @public
 *
 * @example
 * ```typescript
 * import { createStore, ref } from "r-store";
 *
 * const count = createStore(() => {
 *  const state = ref(0);
 *
 *  const increment = () => {
 *    state.value++;
 *  };
 *
 *  return { state, increment };
 * });
 * ```
 */
export const createStore = <T extends Record<string, unknown>>(creator: Creator<T>): UseSelectorWithStore<T> => {
  return internalCreateStore(creator);
};
