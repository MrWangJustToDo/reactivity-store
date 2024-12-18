/* eslint-disable @typescript-eslint/ban-types */
import {
  type StateWithMiddleware,
  type WithSelectorOptionsProps,
  type MaybeStateWithMiddleware,
  type UnWrapMiddleware,
  createMiddleware,
  getFinalState,
  getFinalMiddleware,
  getFinalActions,
  getFinalNamespace,
  getFinalSelectorOptions,
} from "../tools";

import type { Setup } from "../createState";

/**
 * @public
 */
export function withSelectorOptions<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<StateWithMiddleware<T, P>>,
  options: WithSelectorOptionsProps
): Setup<StateWithMiddleware<T, P>>;
/**
 * @public
 */
export function withSelectorOptions<T extends Record<string, unknown>>(setup: Setup<T>, options: WithSelectorOptionsProps): Setup<StateWithMiddleware<T, {}>>;
/**
 * @public
 */
export function withSelectorOptions<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, P>>,
  options: WithSelectorOptionsProps
): Setup<StateWithMiddleware<UnWrapMiddleware<T>, P>> {
  return createMiddleware(
    () => {
      const _initialState = setup();

      const initialState = getFinalState(_initialState);

      const middleware = getFinalMiddleware(_initialState);

      const actions = getFinalActions(_initialState);

      const namespace = getFinalNamespace(_initialState);

      const selectorOptions = getFinalSelectorOptions(_initialState);

      return {
        ["$$__state__$$"]: initialState,
        ["$$__actions__$$"]: actions,
        ["$$__middleware__$$"]: middleware,
        ["$$__namespace__$$"]: namespace,
        ["$$__selectorOptions__$$"]: { ...selectorOptions, ...options },
      } as StateWithMiddleware<UnWrapMiddleware<T>, P>;
    },
    { name: "withSelectorOptions" }
  );
}

/**
 * @public
 * @deprecated
 * use `withSelectorOptions` instead
 */
export const withDeepSelector = withSelectorOptions;
