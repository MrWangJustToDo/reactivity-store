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
  ["$$__selectorOptions__$$"]: { deepSelector?: boolean; stableSelector?: boolean };
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
export type WithNamespaceProps<T> = {
  namespace: string;
  reduxDevTool?: boolean;
  // shallow subscribe the state change
  shallow?: boolean;
  // target state to subscribe
  listener?: (state: T) => any;
};

/**
 * @public
 */
export type WithSelectorOptionsProps = {
  deepSelector?: boolean;
  stableSelector?: boolean;
  /**
   * state what return from the selector will be used to compare with the previous state, if the state is equal, the component will not update
   * @default false
   */
  triggerUpdateOnlyChanged?: boolean;
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
    return (state["$$__namespace__$$"] || {}) as WithNamespaceProps<T>;

  return {} as WithNamespaceProps<T>;
};

/**
 * @internal
 */
export const getFinalSelectorOptions = <T extends Record<string, unknown>, P extends Record<string, Function>>(state: MaybeStateWithMiddleware<T, P>) => {
  if (state["$$__state__$$"]) return (state["$$__selectorOptions__$$"] || {}) as WithSelectorOptionsProps;

  return {} as WithSelectorOptionsProps;
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

    const selectorOptions = getFinalSelectorOptions(state);

    if (__DEV__ && middleware[options.name]) {
      console.warn(`[reactivity-store/middleware] you are using multiple of the '${options.name}' middleware, this is a unexpected usage`);
    }

    middleware[options.name] = true;

    return {
      ["$$__state__$$"]: initialState,
      ["$$__actions__$$"]: actions,
      // field to check duplicate middleware
      ["$$__middleware__$$"]: middleware,
      ["$$__namespace__$$"]: namespace,
      ["$$__selectorOptions__$$"]: selectorOptions,
    } as T;
  };
}
