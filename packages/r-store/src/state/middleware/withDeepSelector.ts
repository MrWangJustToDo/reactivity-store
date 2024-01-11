/* eslint-disable @typescript-eslint/ban-types */
import {
  type StateWithMiddleware,
  type WithDeepSelectorProps,
  type MaybeStateWithMiddleware,
  type UnWrapMiddleware,
  createMiddleware,
  getFinalState,
  getFinalMiddleware,
  getFinalActions,
  getFinalNamespace,
  getFinalDeepSelector,
} from "../tools";

import type { Setup } from "../createState";

/**
 * @public
 */
export function withDeepSelector<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<StateWithMiddleware<T, P>>,
  options: WithDeepSelectorProps
): Setup<StateWithMiddleware<T, P>>;
/**
 * @public
 */
export function withDeepSelector<T extends Record<string, unknown>>(setup: Setup<T>, options: WithDeepSelectorProps): Setup<StateWithMiddleware<T, {}>>;
/**
 * @public
 */
export function withDeepSelector<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, P>>,
  options: WithDeepSelectorProps
): Setup<StateWithMiddleware<UnWrapMiddleware<T>, P>> {
  return createMiddleware(
    () => {
      const _initialState = setup();

      const initialState = getFinalState(_initialState);

      const middleware = getFinalMiddleware(_initialState);

      const actions = getFinalActions(_initialState);

      const namespace = getFinalNamespace(_initialState);

      const deepSelector = getFinalDeepSelector(_initialState);

      return {
        ["$$__state__$$"]: initialState,
        ["$$__actions__$$"]: actions,
        ["$$__middleware__$$"]: middleware,
        ["$$__namespace__$$"]: namespace,
        ["$$__deepSelector__$$"]: { ...deepSelector, ...options },
      };
    },
    { name: "withDeepSelector" }
  );
}
