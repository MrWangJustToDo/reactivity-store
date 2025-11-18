/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { reactive, toRaw } from "@vue/reactivity";

import { createMiddleware, getFinalActions, getFinalLifeCycle, getFinalMiddleware, getFinalNamespace, getFinalSelectorOptions, getFinalState } from "../tools";

import type { MaybeStateWithMiddleware, Setup, StateWithMiddleware, UnWrapMiddleware } from "../createState";
import type { Reactive } from "@vue/reactivity";

/**
 * @public
 */
export function withLifeCycle<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<StateWithMiddleware<T, P>>,
  options: (state: Reactive<T>) => void
): Setup<StateWithMiddleware<T, P>>;
/**
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function withLifeCycle<T extends Record<string, unknown>>(setup: Setup<T>, options: (state: Reactive<T>) => void): Setup<StateWithMiddleware<T, {}>>;
/**
 * @public
 */
export function withLifeCycle<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, P>>,
  options: (state: Reactive<T>) => void
): Setup<StateWithMiddleware<UnWrapMiddleware<T>, P>> {
  return createMiddleware(
    () => {
      const _initialState = setup();

      const initialState = getFinalState(_initialState);

      const middleware = getFinalMiddleware(_initialState);

      const actions = getFinalActions(_initialState);

      let lifeCycle = getFinalLifeCycle(_initialState);

      const namespace = getFinalNamespace(_initialState);

      const selectorOptions = getFinalSelectorOptions(_initialState);

      const reactiveState = reactive(initialState);

      if (lifeCycle) {
        lifeCycle = () => {
          lifeCycle(reactiveState);
          options(reactiveState);
        }
      } else {
        lifeCycle = () => options(reactiveState);
      }

      return {
        ["$$__state__$$"]: toRaw(initialState),
        ["$$__actions__$$"]: actions,
        ["$$__middleware__$$"]: middleware,
        ["$$__namespace__$$"]: namespace,
        ["$$__lifeCycle__$$"]: lifeCycle,
        ["$$__selectorOptions__$$"]: { ...selectorOptions, ...options },
      } as StateWithMiddleware<UnWrapMiddleware<T>, P>;
    },
    {
      name: "withReactive",
    }
  );
}
