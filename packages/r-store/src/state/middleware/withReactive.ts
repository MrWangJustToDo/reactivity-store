/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { reactive, toRaw } from "@vue/reactivity";

import { createMiddleware, getFinalActions, getFinalMiddleware, getFinalNamespace, getFinalSelectorOptions, getFinalState } from "../tools";

import type { MaybeStateWithMiddleware, Setup, StateWithMiddleware, UnWrapMiddleware } from "../createState";
import type { Reactive } from "@vue/reactivity";

/**
 * @public
 */
export function withReactive<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<StateWithMiddleware<T, P>>,
  options: (state: Reactive<T>) => void
): Setup<StateWithMiddleware<T, P>>;
/**
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function withReactive<T extends Record<string, unknown>>(setup: Setup<T>, options: (state: Reactive<T>) => void): Setup<StateWithMiddleware<T, {}>>;
/**
 * @public
 */
export function withReactive<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, P>>,
  options: (state: Reactive<T>) => void
): Setup<StateWithMiddleware<UnWrapMiddleware<T>, P>> {
  return createMiddleware(
    () => {
      const _initialState = setup();

      const initialState = getFinalState(_initialState);

      const middleware = getFinalMiddleware(_initialState);

      const actions = getFinalActions(_initialState);

      const namespace = getFinalNamespace(_initialState);

      const selectorOptions = getFinalSelectorOptions(_initialState);

      const reactiveState = reactive(initialState);

      try {
        options(reactiveState);
      } catch (error) {
        if (__DEV__) {
          console.error(`[reactivity-store/withReactive] something wrong when execute the 'options' callback: %o`, error);
        }
      }

      return {
        ["$$__state__$$"]: toRaw(initialState),
        ["$$__actions__$$"]: actions,
        ["$$__middleware__$$"]: middleware,
        ["$$__namespace__$$"]: namespace,
        ["$$__selectorOptions__$$"]: { ...selectorOptions, ...options },
      } as StateWithMiddleware<UnWrapMiddleware<T>, P>;
    },
    {
      name: "withReactive",
    }
  );
}
