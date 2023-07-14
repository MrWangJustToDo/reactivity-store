/* eslint-disable @typescript-eslint/ban-types */
// `createState` provider
import { internalCreateState } from "./_internal";

import type { UnWrapMiddleware } from "./_internal";
import type { MaybeStateWithMiddleware, WithActionsProps } from "./tools";
import type { LifeCycle } from "../shared/lifeCycle";
import type { ShallowUnwrapRef } from "@vue/reactivity";

export type Setup<T> = () => T;

type UseSelector<T, C> = {
  (): ShallowUnwrapRef<T> & C;
  <P>(selector: (state: ShallowUnwrapRef<T> & C) => P): P;
  getState: () => T;
  getLifeCycle: () => LifeCycle;
  getFinalState: () => ShallowUnwrapRef<T>;
};

export function createState<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, P>>
): UseSelector<UnWrapMiddleware<T>, P>;
export function createState<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, P>>,
  options: { withPersist: string }
): UseSelector<UnWrapMiddleware<T>, P>;
export function createState<T extends Record<string, unknown>, P extends Record<string, Function>, L extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, L>>,
  options: { withActions: WithActionsProps<UnWrapMiddleware<T>, P>["generateActions"] }
): UseSelector<UnWrapMiddleware<T>, P & L>;
export function createState<T extends Record<string, unknown>, P extends Record<string, Function>, L extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, L>>,
  options: { withPersist: string; withActions: WithActionsProps<UnWrapMiddleware<T>, P>["generateActions"] }
): UseSelector<UnWrapMiddleware<T>, P & L>;
export function createState<T extends Record<string, unknown>, P extends Record<string, Function>, L extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, L>>,
  options?: {
    withPersist?: string;
    withActions?: WithActionsProps<UnWrapMiddleware<T>, P>["generateActions"];
  }
) {
  return internalCreateState<T, P, L>(setup, options);
}
