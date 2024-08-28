/* eslint-disable @typescript-eslint/ban-types */

import { checkHasKey } from "../../shared/dev";
import { InternalNameSpace, isServer } from "../../shared/env";
import {
  type MaybeStateWithMiddleware,
  type UnWrapMiddleware,
  type WithNamespaceProps,
  type StateWithMiddleware,
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
export function withNamespace<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<StateWithMiddleware<T, P>>,
  options: WithNamespaceProps<T>
): Setup<StateWithMiddleware<T, P>>;
/**
 * @public
 */
export function withNamespace<T extends Record<string, unknown>>(setup: Setup<T>, options: WithNamespaceProps<T>): Setup<StateWithMiddleware<T, {}>>;
/**
 * @public
 */
export function withNamespace<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, P>>,
  options: WithNamespaceProps<T>
): Setup<StateWithMiddleware<UnWrapMiddleware<T>, P>> {
  return createMiddleware(
    () => {
      const _initialState = setup();

      const initialState = getFinalState(_initialState);

      const middleware = getFinalMiddleware(_initialState);

      const actions = getFinalActions(_initialState);

      const namespace = getFinalNamespace(_initialState);

      const selectorOptions = getFinalSelectorOptions(_initialState);

      if (
        __DEV__ &&
        (options.namespace === InternalNameSpace.$$__ignore__$$ ||
          options.namespace === InternalNameSpace.$$__persist__$$ ||
          options.namespace === InternalNameSpace.$$__subscribe__$$ ||
          options.namespace === InternalNameSpace.$$__redux_dev_tool__$$)
      ) {
        console.warn(`[reactivity-store/namespace] current namespace: '${options.namespace}' is a internal namespace, try to use another one`);
      }

      if (
        __DEV__ &&
        !isServer &&
        options.namespace !== InternalNameSpace.$$__ignore__$$ &&
        options.namespace !== InternalNameSpace.$$__persist__$$ &&
        options.namespace !== InternalNameSpace.$$__subscribe__$$ &&
        options.namespace !== InternalNameSpace.$$__redux_dev_tool__$$
      ) {
        const alreadyHasNameSpace = checkHasKey(options.namespace);
        if (alreadyHasNameSpace) {
          console.warn(`[reactivity-store/middleware] you have duplicate namespace '${options.namespace}' for current store, this is a unexpected usage`);
        }
        // setNamespaceMap(options.namespace, initialState);
      }

      return {
        ["$$__state__$$"]: initialState,
        ["$$__actions__$$"]: actions,
        ["$$__middleware__$$"]: middleware,
        ["$$__namespace__$$"]: { ...namespace, ...options },
        ["$$__selectorOptions__$$"]: selectorOptions,
      } as StateWithMiddleware<UnWrapMiddleware<T>, P>;
    },
    { name: "withNamespace" }
  );
}
