/* eslint-disable @typescript-eslint/ban-types */
import { ReactiveEffect, reactive, toRaw } from "@vue/reactivity";

import { isServer } from "../shared/env";
import { checkHasReactive, traverse } from "../shared/tools";

import { getFinalActions, getFinalMiddleware, getFinalState, persistKey, debounce, getBatchUpdateActions, getFinalNamespace } from "./tools";

import type { UnWrapMiddleware } from "./_internal";
import type { Setup } from "./createState";
import type { MaybeStateWithMiddleware, StateWithMiddleware, StorageState, WithActionsProps, WithPersistProps, WithNamespaceProps } from "./tools";

// build in middleware

export const withPersist = <T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, P>>,
  options: WithPersistProps<UnWrapMiddleware<T>>
): Setup<StateWithMiddleware<UnWrapMiddleware<T>, P>> => {
  return createMiddleware(
    () => {
      const _initialState = setup();

      const initialState = getFinalState(_initialState) as UnWrapMiddleware<T>;

      const middleware = getFinalMiddleware(_initialState);

      const auctions = getFinalActions(_initialState);

      const namespace = getFinalNamespace(_initialState);

      let hasSet = false;

      if (middleware["withPersist"]) hasSet = true;

      if (__DEV__ && checkHasReactive(initialState)) {
        console.error(
          `[reactivity-store/persist] the 'setup' which from 'withPersist' should return a plain object, but current is a reactive object %o, you may use 'reactiveApi' in the 'setup' function`,
          initialState
        );
      }

      if (!isServer && !hasSet) {
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

          const onUpdate = debounce(() => {
            try {
              const stringifyState = options?.stringify?.(re) || JSON.stringify(re);

              const cache = { data: stringifyState, version: options.version || options.key };

              storage.setItem(persistKey + options.key, JSON.stringify(cache));
            } catch (e) {
              if (__DEV__) {
                console.error(`[reactivity-store/persist] cache newState error, error: %o`, e);
              }
            }
          }, options.debounceTime || 40);

          new ReactiveEffect(() => traverse(re), onUpdate).run();

          return { ["$$__state__$$"]: toRaw(re), ["$$__middleware__$$"]: middleware, ["$$__actions__$$"]: auctions, ["$$__namespace__$$"]: namespace };
        } catch (e) {
          if (__DEV__) {
            console.error(`[reactivity-store/persist] middleware failed, error: ${e.message}`);
          }

          return { ["$$__state__$$"]: initialState, ["$$__middleware__$$"]: middleware, ["$$__actions__$$"]: auctions, ["$$__namespace__$$"]: namespace };
        }
      } else {
        return { ["$$__state__$$"]: initialState, ["$$__middleware__$$"]: middleware, ["$$__actions__$$"]: auctions, ["$$__namespace__$$"]: namespace };
      }
    },
    { name: "withPersist" }
  );
};

export function withActions<
  T extends StateWithMiddleware<Q, L>,
  Q extends Record<string, unknown>,
  P extends Record<string, Function>,
  L extends Record<string, Function>
>(setup: Setup<StateWithMiddleware<Q, L>>, options: WithActionsProps<Q, P>): Setup<StateWithMiddleware<UnWrapMiddleware<T>, P & L>>;
export function withActions<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<T>,
  options: WithActionsProps<T, P>
): Setup<StateWithMiddleware<T, P>>;
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
            console.error(`[reactivity-store/actions] the value[${key}] return from 'generateActions' should be a function, but current is ${allActions[key]} in %o`, allActions);
          }
        });
        Object.keys(actions).forEach((key) => {
          if (allActions[key]) {
            console.error(
              `[reactivity-store/actions] there are duplicate key: [${key}] in the 'action' return from 'withActions',this is a unexpected behavior.`
            );
          }
        });
      }

      return {
        ["$$__state__$$"]: toRaw(reactiveState),
        ["$$__actions__$$"]: { ...actions, ...batchActions },
        ["$$__middleware__$$"]: middleware,
        ["$$__namespace__$$"]: namespace,
      } as StateWithMiddleware<UnWrapMiddleware<T>, P & L>;
    },
    { name: "withActions" }
  );
}

export const withNamespace = <T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, P>>,
  options: WithNamespaceProps
): Setup<StateWithMiddleware<UnWrapMiddleware<T>, P>> => {
  return createMiddleware(
    () => {
      const _initialState = setup();

      const initialState = getFinalState(_initialState);

      const middleware = getFinalMiddleware(_initialState);

      const actions = getFinalActions(_initialState);

      if (__DEV__ && options.namespace === "$$__ignore__$$") {
        console.warn(`[reactivity-store/namespace] current namespace: ${options.namespace} is a internal namespace, try to use another one`);
      }

      return {
        ["$$__state__$$"]: initialState,
        ["$$__actions__$$"]: actions,
        ["$$__middleware__$$"]: middleware,
        ["$$__namespace__$$"]: options.namespace,
      } as StateWithMiddleware<UnWrapMiddleware<T>, P>;
    },
    { name: "withNamespace" }
  );
};

// function for help to build external middleware

export function createMiddleware<T>(setup: Setup<any>, options: { name: string }) {
  return () => {
    const state = setup();

    const initialState = getFinalState(state);

    const middleware = getFinalMiddleware(state);

    const actions = getFinalActions(state);

    const namespace = getFinalNamespace(state);

    if (__DEV__ && middleware[options.name]) {
      console.warn(`[reactivity-store/middleware] you are using multiple of the '${options.name}' middleware, this is a unexpected usage`);
    }

    middleware[options.name] = true;

    return {
      ["$$__state__$$"]: initialState,
      ["$$__actions__$$"]: actions,
      ["$$__middleware__$$"]: middleware,
      ["$$__namespace__$$"]: namespace,
    } as T;
  };
}
