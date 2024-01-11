/* eslint-disable @typescript-eslint/ban-types */
import { reactive, toRaw } from "@vue/reactivity";

import { createMiddleware, getBatchUpdateActions, getFinalActions, getFinalDeepSelector, getFinalMiddleware, getFinalNamespace, getFinalState } from "../tools";

import type { Setup } from "../createState";
import type { MaybeStateWithMiddleware, UnWrapMiddleware, WithActionsProps, StateWithMiddleware } from "../tools";

/**
 * @public
 */
export function withActions<
  T extends StateWithMiddleware<Q, L>,
  Q extends Record<string, unknown>,
  P extends Record<string, Function>,
  L extends Record<string, Function>,
>(setup: Setup<StateWithMiddleware<Q, L>>, options: WithActionsProps<Q, P>): Setup<StateWithMiddleware<UnWrapMiddleware<T>, P & L>>;
/**
 * @public
 */
export function withActions<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<T>,
  options: WithActionsProps<T, P>
): Setup<StateWithMiddleware<T, P>>;
/**
 * @public
 */
export function withActions<T extends Record<string, unknown>, P extends Record<string, Function>, L extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, L>>,
  options: WithActionsProps<UnWrapMiddleware<T>, P>
): Setup<StateWithMiddleware<UnWrapMiddleware<T>, P & L>> {
  return createMiddleware(
    () => {
      const _initialState = setup();

      const initialState = getFinalState(_initialState);

      const middleware = getFinalMiddleware(_initialState);

      const actions = getFinalActions(_initialState);

      const namespace = getFinalNamespace(_initialState);

      const deepSelector = getFinalDeepSelector(_initialState);

      const reactiveState = reactive(initialState) as UnWrapMiddleware<T>;

      const pendingGenerate = options.generateActions;

      const allActions = pendingGenerate?.(reactiveState);

      const batchActions = options.automaticBatchAction === true ? getBatchUpdateActions(allActions) : allActions;

      // check duplicate key
      if (__DEV__) {
        Object.keys(initialState).forEach((key) => {
          if (allActions[key]) {
            console.error(
              `[reactivity-store/actions] there are duplicate key: [${key}] in the 'setup' and 'generateAction' returned value, this is a unexpected behavior.`
            );
          }
        });
        Object.keys(allActions).forEach((key) => {
          if (typeof allActions[key] !== "function") {
            console.error(
              `[reactivity-store/actions] the value[${key}] return from 'generateActions' should be a function, but current is ${allActions[key]} in %o`,
              allActions
            );
          }
        });
        Object.keys(actions).forEach((key) => {
          if (allActions[key]) {
            console.error(
              `[reactivity-store/actions] there are duplicate key: [${key}] in the 'action' return from 'withActions', this is a unexpected behavior.`
            );
          }
        });
      }

      return {
        ["$$__state__$$"]: toRaw(reactiveState),
        ["$$__actions__$$"]: { ...actions, ...batchActions },
        ["$$__middleware__$$"]: middleware,
        ["$$__namespace__$$"]: namespace,
        ["$$__deepSelector__$$"]: deepSelector,
      } as StateWithMiddleware<UnWrapMiddleware<T>, P & L>;
    },
    { name: "withActions" }
  );
}
