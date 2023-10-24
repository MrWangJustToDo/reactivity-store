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
  <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P): P;
  /**
   * @deprecated
   * use `getReactiveState` / `getReadonlyState` in stead
   */
  getState: () => T;
  getLifeCycle: () => LifeCycle;
  getReactiveState: () => UnwrapNestedRefs<T>;
  getReadonlyState: () => DeepReadonly<UnwrapNestedRefs<T>>;
  subscribe: <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, cb?: () => void) => () => void;
  useShallowSelector: {
    (): DeepReadonly<UnwrapNestedRefs<T>>;
    <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P): P;
  };
};

/**
 * @public
 */
export const createStore = <T extends Record<string, unknown>>(creator: Creator<T>): UseSelectorWithStore<T> => {
  return internalCreateStore(creator);
};
