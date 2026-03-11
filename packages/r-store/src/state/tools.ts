/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { toRaw } from "@vue/reactivity";

import { checkMiddlewareValid } from "../shared/tools";

import type { Setup } from "./createState";

/**
 * @internal
 */
export const persistKey = "reactivity-store/persist-";

/**
 * @public
 * Represents the persisted state structure stored in storage
 */
export type StorageState = {
  /** Version identifier for the stored state */
  version: string;
  /** The serialized state data */
  data: any;
};

/**
 * @public
 *
 * Platform-agnostic storage interface for persistence.
 * Compatible with browser localStorage, Node.js file storage, or custom implementations.
 *
 * @example Browser localStorage (default)
 * ```ts
 * // localStorage implements this interface natively
 * getStorage: () => localStorage
 * ```
 *
 * @example Custom storage with createStorageAdapter
 * ```ts
 * import { createStorageAdapter } from 'reactivity-store';
 *
 * // In-memory storage
 * const memoryStorage = createStorageAdapter();
 *
 * // File-based storage (Node.js)
 * const fileStorage = createStorageAdapter({
 *   read: (key) => fs.existsSync(key) ? fs.readFileSync(key, 'utf-8') : null,
 *   write: (key, value) => fs.writeFileSync(key, value),
 *   remove: (key) => fs.existsSync(key) && fs.unlinkSync(key),
 * });
 * ```
 */
export interface StorageAdapter {
  /** Get a value by key. Returns null if not found. */
  getItem(key: string): string | null;
  /** Set a value by key */
  setItem(key: string, value: string): void;
  /** Remove a value by key */
  removeItem(key: string): void;
}

/**
 * @public
 *
 * Internal wrapper type used by middleware to compose state with metadata.
 * You typically don't need to use this type directly.
 *
 * @typeParam T - The state type
 * @typeParam P - The actions type
 */
export type StateWithMiddleware<T, P> = {
  // field to check duplicate middleware
  ["$$__middleware__$$"]: Record<string, unknown>;
  ["$$__state__$$"]: T;
  ["$$__actions__$$"]: P;
  ["$$__namespace__$$"]: WithNamespaceProps<T>;
  ["$$__lifeCycle__$$"]: Function;
  ["$$__selectorOptions__$$"]: WithSelectorOptionsProps;
};

/**
 * @public
 *
 * Union type representing either a plain state object or state wrapped with middleware.
 *
 * @typeParam T - The state type
 * @typeParam P - The actions type
 */
export type MaybeStateWithMiddleware<T, P> = T | StateWithMiddleware<T, P>;

/**
 * @public
 *
 * Utility type to extract the raw state type from middleware-wrapped state.
 * Recursively unwraps nested middleware layers.
 *
 * @typeParam T - The potentially wrapped state type
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type UnWrapMiddleware<T> = T extends StateWithMiddleware<infer Q, infer _> ? UnWrapMiddleware<Q> : T;

/**
 * @public
 *
 * Configuration options for the `withPersist` middleware.
 * Enables automatic state persistence to storage (localStorage, file, etc.)
 *
 * @typeParam T - The state type
 *
 * @example Basic usage
 * ```ts
 * withPersist(() => ({ count: 0 }), {
 *   key: 'my-counter'
 * })
 * ```
 *
 * @example With version and migration
 * ```ts
 * withPersist(() => ({ count: 0, name: '' }), {
 *   key: 'my-counter',
 *   version: '2',
 *   migrateVersion: '1',
 *   migrateState: (prev, onDelete) => {
 *     onDelete(); // Remove old version from storage
 *     return { count: prev?.data?.count ?? 0 };
 *   }
 * })
 * ```
 *
 * @example Custom storage for CLI/Node.js
 * ```ts
 * withPersist(() => ({ count: 0 }), {
 *   key: 'my-counter',
 *   getStorage: () => createStorageAdapter({
 *     read: (key) => fs.existsSync(key) ? fs.readFileSync(key, 'utf-8') : null,
 *     write: (key, value) => fs.writeFileSync(key, value),
 *     remove: (key) => fs.unlinkSync(key),
 *   })
 * })
 * ```
 */
export type WithPersistProps<T> = {
  /** Unique key for storage. Used as the storage key prefix. */
  key: string;
  /** Version string for the persisted state. Useful for migrations. */
  version?: string;
  /** Debounce time in ms before persisting changes. Default: 40ms */
  debounceTime?: number;
  /**
   * Custom storage provider. Defaults to `localStorage` in browsers.
   * For non-browser environments, use `createStorageAdapter()` to create custom storage.
   */
  getStorage?: () => StorageAdapter | Storage;
  /** Custom serialization function. Default: JSON.stringify */
  stringify?: (s: T) => string;
  /** Custom deserialization function. Default: JSON.parse */
  parse?: (s: string) => Partial<T>;
  /** Custom merge function to combine initial state with stored state */
  merge?: (fromCreator: T, fromStorage: Partial<T>) => T;
  /**
   * @deprecated This option is no longer supported and will be ignored
   */
  migrateVersion?: string;
  /**
   * @deprecated This option is no longer supported and will be ignored
   */
  migrateState?: (prevState: StorageState | null, onDeleteFromStorage: () => void) => Partial<T> | null;
  /** Enable debug logging for persistence operations */
  devLog?: boolean;
  /** Use shallow comparison for detecting state changes */
  shallow?: boolean;
  /** Custom listener to select which part of state to persist */
  listener?: (state: T) => any;
};

/**
 * @public
 *
 * Configuration options for the `withActions` middleware.
 * Allows defining actions that can mutate the state.
 *
 * @typeParam T - The state type
 * @typeParam P - The actions type (inferred from generateActions return type)
 *
 * @example
 * ```ts
 * withActions(
 *   () => ({ count: 0 }),
 *   (state) => ({
 *     increment: () => state.count++,
 *     decrement: () => state.count--,
 *     add: (n: number) => state.count += n,
 *     reset: () => state.count = 0,
 *   })
 * )
 * ```
 */
export type WithActionsProps<T, P> = {
  /** Function that receives the reactive state and returns an object of action functions */
  generateActions?: (state: T) => P;
  /**
   * @deprecated No longer needed, actions are automatically batched
   */
  automaticBatchAction?: boolean;
};

/**
 * @public
 *
 * Configuration options for the `withNamespace` middleware.
 * Enables Redux DevTools integration and state namespacing.
 *
 * @typeParam T - The state type
 *
 * @example Basic usage
 * ```ts
 * withNamespace(() => ({ count: 0 }), {
 *   namespace: 'counter'
 * })
 * ```
 *
 * @example With Redux DevTools
 * ```ts
 * withNamespace(() => ({ count: 0 }), {
 *   namespace: 'counter',
 *   reduxDevTool: true  // Enable Redux DevTools integration
 * })
 * ```
 */
export type WithNamespaceProps<T> = {
  /** Unique namespace identifier for this state */
  namespace: string;
  /** Enable Redux DevTools integration (browser only) */
  reduxDevTool?: boolean;
  /** Use shallow comparison for detecting state changes */
  shallow?: boolean;
  /** Custom listener to select which part of state to track */
  listener?: (state: T) => any;
};

/**
 * @public
 *
 * Configuration options for selector behavior.
 * Used by `withSelectorOptions` middleware or `createState` options.
 *
 * @example
 * ```ts
 * createState(() => ({ nested: { deep: { value: 1 } } }), {
 *   withDeepSelector: true,    // Track deeply nested changes
 *   withStableSelector: true,  // Memoize selector function
 * })
 * ```
 */
export type WithSelectorOptionsProps = {
  /** Enable deep tracking of nested state changes */
  deepSelector?: boolean;
  /** Enable stable comparison between renders */
  stableCompare?: boolean;
  /** Memoize selector function reference */
  stableSelector?: boolean;
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
  if (state["$$__state__$$"]) return (state["$$__namespace__$$"] || {}) as WithNamespaceProps<T>;

  return {} as WithNamespaceProps<T>;
};

/**
 * @internal
 */
export const getFinalSelectorOptions = <T extends Record<string, unknown>, P extends Record<string, Function>>(state: MaybeStateWithMiddleware<T, P>) => {
  if (state["$$__state__$$"]) return (state["$$__selectorOptions__$$"] || {}) as WithSelectorOptionsProps;

  return {} as WithSelectorOptionsProps;
};

/**
 * @internal
 */
export const getFinalLifeCycle = <T extends Record<string, unknown>, P extends Record<string, Function>>(
  state: MaybeStateWithMiddleware<T, P>
): Function | null => {
  if (state["$$__state__$$"]) return (state["$$__lifeCycle__$$"] || null) as Function | null;

  return null;
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

    const lifeCycle = getFinalLifeCycle(state);

    const selectorOptions = getFinalSelectorOptions(state);

    if (__DEV__ && middleware[options.name]) {
      console.warn(`[reactivity-store/middleware] you are using multiple of the '${options.name}' middleware, this is a unexpected usage`);
    }

    if (__DEV__ && !checkMiddlewareValid(state)) {
      console.warn(`[reactivity-store/middleware] the middleware:${options.name} you created is invalid, please check your code for '%o'`, state);
    }

    middleware[options.name] = true;

    return {
      ["$$__state__$$"]: toRaw(initialState),
      ["$$__actions__$$"]: actions,
      // field to check duplicate middleware
      ["$$__middleware__$$"]: middleware,
      ["$$__namespace__$$"]: namespace,
      ["$$__lifeCycle__$$"]: lifeCycle,
      ["$$__selectorOptions__$$"]: selectorOptions,
    } as T;
  };
}
