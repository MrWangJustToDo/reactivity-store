/* eslint-disable @typescript-eslint/ban-types */
// `createState` provider
import { internalCreateState } from "./_internal";

import type { UnWrapMiddleware } from "./_internal";
import type { MaybeStateWithMiddleware, StateWithMiddleware, WithActionsProps } from "./tools";
import type { LifeCycle } from "../shared/lifeCycle";
import type { DeepReadonly, UnwrapNestedRefs } from "@vue/reactivity";

export type Setup<T> = () => T;

type UseSelector<T, C> = {
  (): DeepReadonly<UnwrapNestedRefs<T>> & C;
  <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P): P;
  getState: () => T;
  getActions: () => C;
  getLifeCycle: () => LifeCycle;
  getReactiveState: () => UnwrapNestedRefs<T>;
  getReadonlyState: () => DeepReadonly<UnwrapNestedRefs<T>>;
  subscribe: <P>(selector: (state: UnwrapNestedRefs<T>) => P, cb?: () => void) => () => void;
};

export function createState<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, P>>
): UseSelector<UnWrapMiddleware<T>, P>;
export function createState<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, P>>,
  options: { withPersist: string; withNamespace?: string }
): UseSelector<UnWrapMiddleware<T>, P>;

export function createState<
  T extends StateWithMiddleware<Q, L>,
  Q extends Record<string, unknown>,
  P extends Record<string, Function>,
  L extends Record<string, Function>
>(
  setup: Setup<StateWithMiddleware<Q, L>>,
  options: { withActions: WithActionsProps<Q, P>["generateActions"]; withNamespace?: string }
): UseSelector<UnWrapMiddleware<T>, P & L>;
export function createState<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<T>,
  options: { withActions: WithActionsProps<T, P>["generateActions"]; withNamespace?: string }
): UseSelector<UnWrapMiddleware<T>, P>;
export function createState<
  T extends StateWithMiddleware<Q, L>,
  Q extends Record<string, unknown>,
  P extends Record<string, Function>,
  L extends Record<string, Function>
>(
  setup: Setup<StateWithMiddleware<Q, L>>,
  options: { withActions: WithActionsProps<Q, P>["generateActions"]; withPersist: string; withNamespace?: string }
): UseSelector<UnWrapMiddleware<T>, P & L>;
export function createState<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<T>,
  options: { withPersist: string; withActions: WithActionsProps<T, P>["generateActions"]; withNamespace?: string }
): UseSelector<T, P>;

export function createState<T extends Record<string, unknown>, P extends Record<string, Function>, L extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, L>>,
  options?: {
    withPersist?: string;
    withActions?: WithActionsProps<UnWrapMiddleware<T>, P>["generateActions"];
    withNamespace?: string;
  }
) {
  return internalCreateState<T, P, L>(setup, "createState", options);
}
