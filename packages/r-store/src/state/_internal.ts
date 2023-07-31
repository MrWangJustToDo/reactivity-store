import { proxyRefs, reactive, toRaw } from "@vue/reactivity";

import { createHook } from "../shared/hook";
import { createLifeCycle } from "../shared/lifeCycle";
import { checkHasReactive } from "../shared/tools";

import { withActions, withPersist } from "./middleware";
import { getFinalActions, getFinalState } from "./tools";

import type { Setup } from "./createState";
import type { MaybeStateWithMiddleware, StateWithMiddleware, WithActionsProps } from "./tools";
import type { ShallowUnwrapRef } from "@vue/reactivity";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type UnWrapMiddleware<T> = T extends StateWithMiddleware<infer Q, infer _> ? UnWrapMiddleware<Q> : T;

/**
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function internalCreateState<T extends Record<string, unknown>, P extends Record<string, Function>, L extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, L>>,
  option?: {
    withPersist?: string;
    withActions?: WithActionsProps<UnWrapMiddleware<T>, P>["generateActions"];
  }
) {
  let creator: any = setup;

  if (option?.withActions && option?.withPersist) {
    creator = withPersist(creator, { key: option.withPersist });
    creator = withActions(creator, { generateActions: option.withActions });
  } else if (option?.withActions) {
    creator = withActions(creator, { generateActions: option.withActions });
  } else if (option?.withPersist) {
    creator = withPersist(creator, { key: option.withPersist });
  }

  const lifeCycle = createLifeCycle();

  const state = creator();

  // handle withActions middleware;
  const initialState = getFinalState(state);

  const actions = getFinalActions(state);

  const rawState = toRaw(initialState);

  if (__DEV__ && checkHasReactive(rawState)) {
    console.error(`[reactivity-store] 'createState' expect receive a plain object but got a reactive object, this is a unexpected usage. should not use 'reactiveApi' in this 'setup' function`)
  }

  const reactiveState = reactive(initialState);

  const finalState = proxyRefs(reactiveState);

  const useSelector = createHook<T, P & L>(finalState as ShallowUnwrapRef<T>, initialState, lifeCycle, actions as P & L);

  return useSelector;
}