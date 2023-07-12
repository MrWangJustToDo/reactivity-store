/* eslint-disable @typescript-eslint/ban-types */
import { wrapperBatchUpdate } from "../shared/batch";

/**
 * @internal
 */
export const persistKey = "reactivity-store/persist-";

export type StorageState = {
  version: string;
  data: any;
};

export type StateWithMiddleware<T, P> = { ["$$__state__$$"]: T; ["$$__middleware__$$"]: Record<string, unknown>; ["$$__actions__$$"]: P };

export type MaybeStateWithMiddleware<T, P> = T | StateWithMiddleware<T, P>;

export type WithPersistProps<T extends Record<string, unknown>> = {
  key: string;
  version?: string;
  debounceTime?: number;
  getStorage?: () => Storage;
  stringify?: (s: T) => string;
  parse?: (s: string) => Partial<T>;
  merge?: (fromCreator: T, fromStorage: Partial<T>) => T;
};

export type WithActionsProps<T, P> = {
  generateActions?: (state: T) => P;
  automaticBatchAction?: boolean;
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
