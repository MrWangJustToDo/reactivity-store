/* eslint-disable @typescript-eslint/ban-types */
import { ReactiveEffect, reactive } from "@vue/reactivity";

import { isReact18, isServer } from "../shared/env";
import { checkHasReactive, traverse } from "../shared/tools";

import { getFinalActions, getFinalMiddleware, getFinalState, persistKey, debounce, getBatchUpdateActions } from "./tools";

import type { UnWrapMiddleware } from "./_internal";
import type { Setup } from "./createState";
import type { MaybeStateWithMiddleware, StateWithMiddleware, StorageState, WithActionsProps, WithPersistProps } from "./tools";

export const withPersist = <T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, P>>,
  options: WithPersistProps<UnWrapMiddleware<T>>
): Setup<StateWithMiddleware<UnWrapMiddleware<T>, P>> => {
  return () => {
    const _initialState = setup();

    if (__DEV__ && _initialState["$$__state__$$"] && _initialState["$$__middleware__$$"] && _initialState["$$__middleware__$$"]["withPersist"]) {
      console.warn(`[reactivity-store/persist] you are using multiple of the 'withPersist' middleware, this is a unexpected usage`);
    }

    const initialState = getFinalState(_initialState) as UnWrapMiddleware<T>;

    if (__DEV__ && checkHasReactive(initialState)) {
      console.error(
        `[reactivity-store/persist] the 'setup' which from 'withPersist' should return a plain object, but current is a reactive object 
          you may: 1. write 'withActions' in the 'withPersist'
                   2. use 'reactiveApi' in the 'setup' function 
        `
      );
    }

    const middleware = getFinalMiddleware(_initialState);

    const auctions = getFinalActions(_initialState);

    middleware["withPersist"] = true;

    if (!isServer) {
      try {
        const storage = options?.getStorage?.() || window.localStorage;

        const storageStateString = storage.getItem(persistKey + options.key) as string;

        const storageState = JSON.parse(storageStateString) as StorageState;

        let re = initialState;

        if (storageState?.version === (options.version || options.key) && storageState.data) {
          const cachedState = options?.parse?.(storageState.data) || JSON.parse(storageState.data);

          re = options?.merge?.(initialState, cachedState) || Object.assign(initialState, cachedState);
        }

        re = reactive(re) as UnWrapMiddleware<T>;

        new ReactiveEffect(
          () => traverse(re),
          debounce(() => {
            try {
              const stringifyState = options?.stringify?.(re) || JSON.stringify(re);

              const cache = { data: stringifyState, version: options.version || options.key };

              storage.setItem(persistKey + options.key, JSON.stringify(cache));
            } catch (e) {
              if (__DEV__) {
                console.error(`[reactivity-store/persist] cache newState error, error: ${e}`);
              }
            }
          }, options.debounceTime || 40)
        ).run();

        return { ["$$__state__$$"]: re, ["$$__middleware__$$"]: middleware, ["$$__actions__$$"]: auctions };
      } catch (e) {
        if (__DEV__) {
          console.error(`[reactivity-store/persist] middleware failed, error: ${e.message}`);
        }

        return { ["$$__state__$$"]: initialState, ["$$__middleware__$$"]: middleware, ["$$__actions__$$"]: auctions };
      }
    } else {
      return { ["$$__state__$$"]: initialState, ["$$__middleware__$$"]: middleware, ["$$__actions__$$"]: auctions };
    }
  };
};

// export function withActions<T extends StateWithMiddleware<T, L>, P extends Record<string, Function>, L extends Record<string, Function>>(
//   setup: Setup<T>,
//   options: WithActionsProps<UnWrapMiddleware<T>, P>
// ): Setup<StateWithMiddleware<UnWrapMiddleware<T>, P & L>>;
// export function withActions<T extends Record<string, unknown>, P extends Record<string, Function>>(
//   setup: Setup<T>,
//   options: WithActionsProps<UnWrapMiddleware<T>, P>
// ): Setup<StateWithMiddleware<UnWrapMiddleware<T>, P>>;
export function withActions<T extends Record<string, unknown>, P extends Record<string, Function>, L extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, L>>,
  options: WithActionsProps<UnWrapMiddleware<T>, P>
): Setup<StateWithMiddleware<UnWrapMiddleware<T>, P & L>> {
  return () => {
    const _initialState = setup();

    if (__DEV__ && _initialState["$$__state__$$"] && _initialState["$$__middleware__$$"] && _initialState["$$__middleware__$$"]["withActions"]) {
      console.warn(`[reactivity-store/actions] you are using multiple of the 'withActions' middleware, this is a unexpected usage`);
    }

    const initialState = getFinalState(_initialState);

    const middleware = getFinalMiddleware(_initialState);

    const actions = getFinalActions(_initialState);

    const reactiveState = reactive(initialState) as UnWrapMiddleware<T>;

    const pendingGenerate = options.generateActions;

    const allActions = pendingGenerate?.(reactiveState);

    const batchActions = isReact18
      ? options.automaticBatchAction === true
        ? getBatchUpdateActions(allActions)
        : allActions
      : options.automaticBatchAction === undefined || options.automaticBatchAction === null || options.automaticBatchAction === true
      ? getBatchUpdateActions(allActions)
      : allActions;

    middleware["withActions"] = true;

    // check duplicate key
    if (__DEV__) {
      Object.keys(initialState).forEach((key) => {
        if (allActions[key]) {
          console.error(`[reactivity-store/actions] there are duplicate key in the 'setup' and 'generateAction' returned value, this is a unexpected behavior`);
        }
      });
      Object.keys(allActions).forEach((key) => {
        if (typeof allActions[key] !== "function") {
          console.error(`[reactivity-store/actions] the value[${key}] return from 'generateActions' should be a function, but current is ${allActions[key]}`);
        }
      });
    }

    return {
      ["$$__state__$$"]: reactiveState,
      ["$$__actions__$$"]: { ...actions, ...batchActions },
      ["$$__middleware__$$"]: middleware,
    } as StateWithMiddleware<UnWrapMiddleware<T>, P & L>;
  };
}
