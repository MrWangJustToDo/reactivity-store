import { reactive, toRaw } from "@vue/reactivity";
import { isObject, isPromise } from "@vue/shared";

import { connectDevTool } from "../shared/dev";
import { isServer } from "../shared/env";
import { createHook } from "../shared/hook";
import { createLifeCycle } from "../shared/lifeCycle";
import { checkHasFunction, checkHasReactive, checkHasSameField } from "../shared/tools";

import { withActions, withSelectorOptions, withNamespace, withPersist } from "./middleware";
import { getFinalActions, getFinalSelectorOptions, getFinalNamespace, getFinalState } from "./tools";

import type { Setup, WithNamespaceProps, WithPersistProps } from "./createState";
import type { MaybeStateWithMiddleware, WithActionsProps, UnWrapMiddleware } from "./tools";

/**
 * @internal
 */

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function internalCreateState<T extends Record<string, unknown>, P extends Record<string, Function>, L extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, L>>,
  name: string,
  option?: {
    withPersist?: string | WithPersistProps<T>;
    withNamespace?: string | WithNamespaceProps<T>;
    withActions?: WithActionsProps<UnWrapMiddleware<T>, P>["generateActions"];
    withDeepSelector?: boolean;
    withStableSelector?: boolean;
  }
) {
  let creator: any = setup;

  if (option?.withPersist) {
    creator = withPersist(creator, typeof option.withPersist === "string" ? { key: option.withPersist } : option.withPersist);
  }

  if (option?.withActions) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    creator = withActions(creator, { generateActions: option.withActions });
  }

  if (option?.withNamespace) {
    creator = withNamespace(creator, typeof option.withNamespace === "string" ? { namespace: option.withNamespace, reduxDevTool: true } : option.withNamespace);
  }

  if (typeof option?.withDeepSelector !== "undefined" || typeof option?.withStableSelector !== "undefined") {
    creator = withSelectorOptions(creator, { deepSelector: option.withDeepSelector, stableSelector: option.withStableSelector });
  }

  const lifeCycle = createLifeCycle();

  const state = creator();

  if (__DEV__ && !isObject(state)) {
    console.error(
      `[reactivity-store] '${name}' expect receive a plain object but got a ${state}, this is a unexpected usage. should return a plain object in this 'setup' function`
    );
  }

  // handle withActions middleware;
  const initialState = getFinalState(state) as T;

  if (__DEV__ && isPromise(initialState)) {
    console.error(
      `[reactivity-store] '${name}' expect receive a plain object but got a promise %o, this is a unexpected usage. should not return a promise in this 'setup' function`,
      initialState
    );
  }

  let actions = getFinalActions(state);

  const namespaceOptions = getFinalNamespace(state);

  const selectorOptions = getFinalSelectorOptions(state);

  const rawState = toRaw(initialState);

  const reduxDevTool = namespaceOptions.reduxDevTool && !isServer;

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

  if (__DEV__) {
    const sameField = checkHasSameField(rawState, actions);
    sameField.forEach((key) =>
      console.warn(`[reactivity-store] duplicate key: [${key}] in 'state' and 'actions' from createState, this is a unexpected usage`)
    );
  }

  const reactiveState = reactive(initialState);

  const deepSelector = selectorOptions?.deepSelector ?? true;

  const stableSelector = selectorOptions?.stableSelector ?? false;

  const stableCompare = selectorOptions.stableCompare ?? true;

  // TODO
  if (__DEV__ && reduxDevTool) {
    actions = connectDevTool(namespaceOptions.namespace, actions, rawState, reactiveState, namespaceOptions) as P;
  }

  const useSelector = createHook<T, P & L>(
    reactiveState,
    rawState,
    lifeCycle,
    deepSelector,
    stableSelector,
    stableCompare,
    namespaceOptions.namespace,
    actions as P & L
  );

  return useSelector;
}
