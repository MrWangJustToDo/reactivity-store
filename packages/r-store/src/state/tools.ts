/* eslint-disable @typescript-eslint/ban-types */
import { wrapperBatchUpdate } from "../shared/batch";

import type { Setup } from "./createState";

/**
 * @internal
 */
export const persistKey = "reactivity-store/persist-";

export type StorageState = {
  version: string;
  data: any;
};

/**
 * @public
 */
export type StateWithMiddleware<T, P> = {
  ["$$__state__$$"]: T;
  ["$$__middleware__$$"]: Record<string, unknown>;
  ["$$__actions__$$"]: P;
  ["$$__namespace__$$"]: { namespace?: string; reduxDevTool?: boolean };
  ["$$__deepSelector__$$"]: { deepSelector?: boolean };
};

/**
 * @public
 */
export type MaybeStateWithMiddleware<T, P> = T | StateWithMiddleware<T, P>;

/**
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type UnWrapMiddleware<T> = T extends StateWithMiddleware<infer Q, infer _> ? UnWrapMiddleware<Q> : T;

/**
 * @public
 */
export type WithPersistProps<T extends Record<string, unknown>> = {
  key: string;
  version?: string;
  debounceTime?: number;
  getStorage?: () => Storage;
  stringify?: (s: T) => string;
  parse?: (s: string) => Partial<T>;
  merge?: (fromCreator: T, fromStorage: Partial<T>) => T;
  devLog?: boolean;
  // shallow subscribe the state change
  shallow?: boolean;
  // target state to subscribe
  listener?: (state: T) => any;
};

/**
 * @public
 */
export type WithActionsProps<T, P> = {
  generateActions?: (state: T) => P;
  automaticBatchAction?: boolean;
};

/**
 * @public
 */
export type WithNamespaceProps = {
  namespace: string;
  reduxDevTool?: boolean;
  // shallow subscribe the state change
  shallow?: boolean;
  // target state to subscribe
  listener?: (state: any) => any;
};

/**
 * @public
 */
export type WithDeepSelectorProps = {
  deepSelector?: boolean;
};

/**
 * @internal
 */
export const debounce = <T extends Function>(cb: T, time): T => {
  let id = null;
  return ((...args: any[]) => {
    clearTimeout(id);
    id = setTimeout(() => cb.call(null, ...args), time);
  }) as unknown as T;
};

/**
 * @internal
 */
export const getBatchUpdateActions = (actions: ReturnType<typeof getFinalActions>) => {
  return Object.keys(actions).reduce<typeof actions>((p, c) => {
    p[c] = wrapperBatchUpdate(actions[c] as () => void);
    return p;
  }, {}) as ReturnType<typeof getFinalActions>;
};

/**
 * @internal
 */
export const getFinalState = <T extends Record<string, unknown>, P extends Record<string, Function>>(state: MaybeStateWithMiddleware<T, P>) => {
  if (state["$$__state__$$"]) return state["$$__state__$$"] as T;

  return state as T;
};

/**
 * @internal
 */
export const getFinalMiddleware = <T extends Record<string, unknown>, P extends Record<string, Function>>(state: MaybeStateWithMiddleware<T, P>) => {
  if (state["$$__state__$$"]) return (state["$$__middleware__$$"] || {}) as Record<string, unknown>;

  return {} as Record<string, unknown>;
};

/**
 * @internal
 */
export const getFinalActions = <T extends Record<string, unknown>, P extends Record<string, Function>>(state: MaybeStateWithMiddleware<T, P>) => {
  if (state["$$__state__$$"]) return (state["$$__actions__$$"] || {}) as P;

  return {} as P;
};

/**
 * @internal
 */
export const getFinalNamespace = <T extends Record<string, unknown>, P extends Record<string, Function>>(state: MaybeStateWithMiddleware<T, P>) => {
  if (state["$$__state__$$"])
    return (state["$$__namespace__$$"] || {}) as { namespace?: string; reduxDevTool?: boolean; listener?: (state: any) => any; shallow?: boolean };

  return {} as { namespace?: string; reduxDevTool?: boolean; listener?: (state: any) => any; shallow?: boolean };
};

/**
 * @internal
 */
export const getFinalDeepSelector = <T extends Record<string, unknown>, P extends Record<string, Function>>(state: MaybeStateWithMiddleware<T, P>) => {
  if (state["$$__state__$$"]) return (state["$$__deepSelector__$$"] || {}) as { deepSelector?: boolean };

  return {} as { deepSelector?: boolean };
};

// function for help to build external middleware

/**
 * @internal
 */
export function createMiddleware<T>(setup: Setup<any>, options: { name: string }) {
  return () => {
    const state = setup();

    const initialState = getFinalState(state);

    const middleware = getFinalMiddleware(state);

    const actions = getFinalActions(state);

    const namespace = getFinalNamespace(state);

    const deepSelector = getFinalDeepSelector(state);

    if (__DEV__ && middleware[options.name]) {
      console.warn(`[reactivity-store/middleware] you are using multiple of the '${options.name}' middleware, this is a unexpected usage`);
    }

    middleware[options.name] = true;

    return {
      ["$$__state__$$"]: initialState,
      ["$$__actions__$$"]: actions,
      ["$$__middleware__$$"]: middleware,
      ["$$__namespace__$$"]: namespace,
      ["$$__deepSelector__$$"]: deepSelector,
    } as T;
  };
}
