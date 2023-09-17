import { reactive, toRaw } from "@vue/reactivity";

import { createHook } from "../shared/hook";
import { createLifeCycle } from "../shared/lifeCycle";
import { checkHasFunction, checkHasReactive } from "../shared/tools";

import { withActions, withNamespace, withPersist } from "./middleware";
import { getFinalActions, getFinalNamespace, getFinalState } from "./tools";

import type { Setup } from "./createState";
import type { MaybeStateWithMiddleware, WithActionsProps , UnWrapMiddleware } from "./tools";

/**
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function internalCreateState<T extends Record<string, unknown>, P extends Record<string, Function>, L extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, L>>,
  name: string,
  option?: {
    withPersist?: string;
    withActions?: WithActionsProps<UnWrapMiddleware<T>, P>["generateActions"];
    withNamespace?: string;
    withDeepSelector?: boolean;
  }
) {
  let creator: any = setup;

  if (option?.withPersist) {
    creator = withPersist(creator, { key: option.withPersist });
  }

  if (option?.withActions) {
    creator = withActions(creator, { generateActions: option.withActions });
  }

  if (option?.withNamespace) {
    creator = withNamespace(creator, { namespace: option.withNamespace });
  }

  const lifeCycle = createLifeCycle();

  const state = creator();

  // handle withActions middleware;
  const initialState = getFinalState(state) as T;

  const actions = getFinalActions(state);

  const namespace = getFinalNamespace(state);

  const rawState = toRaw(initialState);

  if (__DEV__ && checkHasReactive(rawState)) {
    console.error(
      `[reactivity-store] '${name}' expect receive a plain object but got a reactive object/field %o, this is a unexpected usage. should not use 'reactiveApi' in this 'setup' function`,
      rawState
    );
  }

  if (__DEV__ && checkHasFunction(rawState)) {
    console.error(
      `[reactivity-store] '${name}' has a function field in state %o, this is a unexpected usage. state should be only a plain object with data field`,
      rawState
    );
  }

  const reactiveState = reactive(initialState);

  const deepSelector = option?.withDeepSelector ?? true;

  const useSelector = createHook<T, P & L>(reactiveState, rawState, lifeCycle, deepSelector, namespace, actions as P & L);

  return useSelector;
}
