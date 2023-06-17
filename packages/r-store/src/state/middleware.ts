/* eslint-disable @typescript-eslint/ban-types */
import { ReactiveEffect, reactive } from "@vue/reactivity";

import { isServer, traverse } from "../shared";

import type { Setup } from "./createState";

const persistKey = "reactivity-store/persist-";

type StorageState = {
  version: string;
  data: any;
};

type StateWithMiddleware<T> = { ["$$__state__$$"]: T; ["$$__middleware__$$"]: Record<string, unknown>; ["$$__actions__$$"]: Record<string, unknown> };

export type MaybeStateWithMiddleware<T> = T | StateWithMiddleware<T>;

type WithPersistProps<T extends Record<string, unknown>> = {
  key: string;
  version?: string;
  debounceTime?: number;
  getStorage?: () => Storage;
  stringify?: (s: T) => string;
  parse?: (s: string) => Partial<T>;
  merge?: (fromCreator: T, fromStorage: Partial<T>) => T;
};

type WithActionsProps<T, P> = {
  generateActions?: (state: T) => P;
};

const debounce = <T extends Function>(cb: T, time): T => {
  let id = null;
  return ((...args: any[]) => {
    clearTimeout(id);
    id = setTimeout(() => cb.call(null, ...args), time);
  }) as unknown as T;
};

const once = <T extends Function>(cb: T) => {
  let hasCalled = false;
  return ((...args) => {
    if (hasCalled) return;
    hasCalled = true;
    return cb.call(null, ...args);
  }) as unknown as T;
};

const onceWarn = once((message: string) => {
  console.warn(message);
});

export const getFinalState = <T extends Record<string, unknown>>(state: MaybeStateWithMiddleware<T>) => {
  if (state["$$__state__$$"]) return state["$$__state__$$"] as T;

  return state as T;
};

export const getFinalMiddleware = <T extends Record<string, unknown>>(state: MaybeStateWithMiddleware<T>) => {
  if (state["$$__state__$$"]) return (state["$$__middleware__$$"] || {}) as Record<string, unknown>;

  return {} as Record<string, unknown>;
};

export const getFinalActions = <T extends Record<string, unknown>>(state: MaybeStateWithMiddleware<T>) => {
  if (state["$$__state__$$"]) return (state["$$__actions__$$"] || {}) as Record<string, unknown>;

  return {} as Record<string, unknown>;
};

export const withPersist = <T extends Record<string, unknown>>(
  setup: Setup<MaybeStateWithMiddleware<T>>,
  options: WithPersistProps<T>
): Setup<StateWithMiddleware<T>> => {
  return () => {
    const _initialState = setup();
    if (!isServer && __DEV__) {
      onceWarn(
        `[reactivity-store/persist] the persist middleware may cause hydrate error for 'React' app, because of the initialState what from server and client may do not have the same state`
      );
    }
    if (__DEV__ && _initialState["$$__state__$$"] && _initialState["$$__middleware__$$"] && _initialState["$$__middleware__$$"]["withPersist"]) {
      console.warn(`[reactivity-store/persist] you are using multiple of the 'withPersist' middleware, this is a unexpected usage`);
    }

    const initialState = getFinalState(_initialState);

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

        re = reactive(re) as T;

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

export const withActions = <T extends Record<string, unknown>, P = Record<string, () => any>>(
  setup: Setup<MaybeStateWithMiddleware<T>>,
  options: WithActionsProps<T, P>
): Setup<StateWithMiddleware<T & P>> => {
  return () => {
    const _initialState = setup();

    if (__DEV__ && _initialState["$$__state__$$"] && _initialState["$$__middleware__$$"] && _initialState["$$__middleware__$$"]["withActions"]) {
      console.warn(`[reactivity-store/persist] you are using multiple of the 'withActions' middleware, this is a unexpected usage`);
    }

    const initialState = getFinalState(_initialState);

    const middleware = getFinalMiddleware(_initialState);

    const actions = getFinalActions(_initialState);

    const reactiveState = reactive(initialState) as T;

    const pendingGenerate = options.generateActions;

    const allActions = pendingGenerate(reactiveState);

    middleware["withActions"] = true;

    // check duplicate key
    if (__DEV__) {
      Object.keys(initialState).forEach((key) => {
        if (allActions[key]) {
          console.error(`[reactivity-store/action] there are duplicate key in the 'setup' and 'generateAction' returned value, this is a unexpected behavior`);
        }
      });
    }

    return {
      ["$$__state__$$"]: reactiveState,
      ["$$__actions__$$"]: { ...actions, ...allActions },
      ["$$__middleware__$$"]: middleware,
    } as unknown as StateWithMiddleware<T & P>;
  };
};
