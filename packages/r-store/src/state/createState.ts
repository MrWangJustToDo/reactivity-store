/* eslint-disable @typescript-eslint/ban-types */
// `createState` provider

import { internalCreateState } from "./_internal";

import type { MaybeStateWithMiddleware, StateWithMiddleware, UnWrapMiddleware, WithActionsProps, WithNamespaceProps, WithPersistProps } from "./tools";
import type { LifeCycle } from "../shared/lifeCycle";
import type { DeepReadonly, UnwrapNestedRefs } from "@vue/reactivity";

export type { MaybeStateWithMiddleware, StateWithMiddleware, UnWrapMiddleware, WithActionsProps, WithNamespaceProps, WithPersistProps } from "./tools";

/**
 * @public
 */
export type Setup<T> = () => T;

/**
 * @public
 */
export type UseSelectorWithState<T, C> = {
  (): DeepReadonly<UnwrapNestedRefs<T>> & C;
  <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P, compare?: <Q extends P = P>(prev: Q, next: Q) => boolean): P;
  /**
   * @deprecated
   * use `getReactiveState` / `getReadonlyState` instead
   */
  getState: () => T;
  getActions: () => C;
  getLifeCycle: () => LifeCycle;
  getReactiveState: () => UnwrapNestedRefs<T>;
  getReadonlyState: () => DeepReadonly<UnwrapNestedRefs<T>>;
  /**
   *
   * @param selector - a method to select the state, when the state change, the `cb` will be called
   * @param cb - a callback function
   * @returns a unsubscribe function
   */
  subscribe: <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, cb?: () => void, shallow?: boolean) => () => void;
  useDeepSelector: {
    (): DeepReadonly<UnwrapNestedRefs<T>> & C;
    <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P, compare?: <Q extends P = P>(prev: Q, next: Q) => boolean): P;
  };
  useDeepStableSelector: {
    (): DeepReadonly<UnwrapNestedRefs<T>> & C;
    <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P, compare?: <Q extends P = P>(prev: Q, next: Q) => boolean): P;
  };
  useShallowSelector: {
    (): DeepReadonly<UnwrapNestedRefs<T>> & C;
    <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P, compare?: <Q extends P = P>(prev: Q, next: Q) => boolean): P;
  };
  useShallowStableSelector: {
    (): DeepReadonly<UnwrapNestedRefs<T>> & C;
    <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P, compare?: <Q extends P = P>(prev: Q, next: Q) => boolean): P;
  };
};

/**
 * @public
 */
export function createState<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<StateWithMiddleware<T, P>>
): UseSelectorWithState<T, P>;
/**
 * @public
 */
export function createState<T extends Record<string, unknown>>(setup: Setup<T>): UseSelectorWithState<T, {}>;
/**
 * @public
 */
export function createState<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, P>>
): UseSelectorWithState<UnWrapMiddleware<T>, P>;

/**
 * @public
 */
export function createState<T extends Record<string, unknown>, P extends Record<string, Function>, L extends Record<string, Function>>(
  setup: Setup<StateWithMiddleware<T, L>>,
  options: {
    withActions: WithActionsProps<T, P>["generateActions"];
    withPersist?: string | WithPersistProps<T>;
    withNamespace?: string | WithNamespaceProps<T>;
    withDeepSelector?: boolean;
    withStableSelector?: boolean;
  }
): UseSelectorWithState<T, P & L>;
/**
 * @public
 */
export function createState<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<T>,
  options: {
    withActions: WithActionsProps<T, P>["generateActions"];
    withPersist?: string | WithPersistProps<T>;
    withNamespace?: string | WithNamespaceProps<T>;
    withDeepSelector?: boolean;
    withStableSelector?: boolean;
  }
): UseSelectorWithState<T, P>;

/**
 * @public
 */
export function createState<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<StateWithMiddleware<T, P>>,
  options: {
    withPersist?: string | WithPersistProps<T>;
    withNamespace?: string | WithNamespaceProps<T>;
    withDeepSelector?: boolean;
    withStableSelector?: boolean;
  }
): UseSelectorWithState<T, P>;
/**
 * @public
 */
export function createState<T extends Record<string, unknown>>(
  setup: Setup<T>,
  options: {
    withPersist?: string | WithPersistProps<T>;
    withNamespace?: string | WithNamespaceProps<T>;
    withDeepSelector?: boolean;
    withStableSelector?: boolean;
  }
): UseSelectorWithState<T, {}>;

/**
 * @public
 */
export function createState<T extends Record<string, unknown>, P extends Record<string, Function>, L extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, L>>,
  options?: {
    withPersist?: string | WithPersistProps<T>;
    withNamespace?: string | WithNamespaceProps<T>;
    withActions?: WithActionsProps<UnWrapMiddleware<T>, P>["generateActions"];
    withDeepSelector?: boolean;
    withStableSelector?: boolean;
  }
) {
  return internalCreateState<T, P, L>(setup, "createState", options);
}
