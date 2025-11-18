/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { toRaw } from "@vue/reactivity";

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
  getFinalLifeCycle,
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
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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

      const lifeCycle = getFinalLifeCycle(_initialState);

      const actions = getFinalActions(_initialState);

      const namespace = getFinalNamespace(_initialState);

      const selectorOptions = getFinalSelectorOptions(_initialState);

      return {
        ["$$__state__$$"]: toRaw(initialState),
        ["$$__actions__$$"]: actions,
        ["$$__middleware__$$"]: middleware,
        ["$$__namespace__$$"]: namespace,
        ["$$__lifeCycle__$$"]: lifeCycle,
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
