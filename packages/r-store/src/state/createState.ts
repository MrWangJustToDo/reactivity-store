/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
// `createState` provider

import { internalCreateState } from "./_internal";

import type { MaybeStateWithMiddleware, StateWithMiddleware, UnWrapMiddleware, WithActionsProps, WithNamespaceProps, WithPersistProps } from "./tools";
import type { LifeCycle } from "../shared/lifeCycle";
import type { DeepReadonly, UnwrapNestedRefs } from "@vue/reactivity";

export type { MaybeStateWithMiddleware, StateWithMiddleware, UnWrapMiddleware, WithActionsProps, WithNamespaceProps, WithPersistProps } from "./tools";

/**
 * @public
 */
export type Setup<T> = () => T;

/**
 * @public
 *
 * The return type of `createState`, a hook function with additional methods for state management.
 *
 * @typeParam T - The state type
 * @typeParam C - The actions type (from `withActions` middleware)
 */
export type UseSelectorWithState<T, C> = {
  /**
   * Use the entire state (called without arguments)
   * @returns The full readonly state merged with actions
   */
  (): DeepReadonly<UnwrapNestedRefs<T>> & C;
  /**
   * Use a selected slice of the state (called with selector)
   * @param selector - A function to select part of the state
   * @param compare - Optional comparison function. If returns `true`, component won't re-render
   * @returns The selected state slice
   */
  <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P, compare?: <Q extends P = P>(prev: Q, next: Q) => boolean): P;
  /**
   * @deprecated Use `getReactiveState` or `getReadonlyState` instead
   */
  getState: () => T;
  /**
   * Get the actions defined in `withActions` middleware
   * @returns The actions object
   */
  getActions: () => C;
  /**
   * Get the internal lifecycle object (advanced usage)
   * @returns The lifecycle object
   */
  getLifeCycle: () => LifeCycle;
  /**
   * Get the mutable reactive state. Changes will trigger component updates.
   * @returns The reactive state (mutable)
   */
  getReactiveState: () => UnwrapNestedRefs<T>;
  /**
   * Get a readonly version of the state. Safe to use anywhere without causing mutations.
   * @returns The readonly state
   */
  getReadonlyState: () => DeepReadonly<UnwrapNestedRefs<T>>;
  /**
   * Subscribe to state changes outside of React components
   * @param selector - A function to select part of the state to watch
   * @param cb - Callback function invoked when selected state changes
   * @param shallow - If true, only shallow compare the selected state
   * @returns An unsubscribe function
   */
  subscribe: <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, cb?: () => void, shallow?: boolean) => () => void;
  /**
   * Wait for a specific state value to be reached. Useful for async flows.
   * @param params - Configuration object with key, value, single (AbortSignal), and optional compare function
   * @returns A promise that resolves when the value matches, or rejects if aborted
   */
  waitingValueTo: <K extends keyof UnwrapNestedRefs<T> = keyof UnwrapNestedRefs<T>>(params: {
    key: K;
    value: UnwrapNestedRefs<T>[K];
    single: AbortSignal;
    compare?: (exist: UnwrapNestedRefs<T>[K], target: UnwrapNestedRefs<T>[K]) => boolean;
  }) => Promise<void>;
  /**
   * Hook variant that deeply tracks all nested state changes
   */
  useDeepSelector: {
    (): DeepReadonly<UnwrapNestedRefs<T>> & C;
    <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P, compare?: <Q extends P = P>(prev: Q, next: Q) => boolean): P;
  };
  /**
   * Hook variant with deep tracking and stable selector reference
   */
  useDeepStableSelector: {
    (): DeepReadonly<UnwrapNestedRefs<T>> & C;
    <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P, compare?: <Q extends P = P>(prev: Q, next: Q) => boolean): P;
  };
  /**
   * Hook variant that only shallowly tracks state changes (better performance)
   */
  useShallowSelector: {
    (): DeepReadonly<UnwrapNestedRefs<T>> & C;
    <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P, compare?: <Q extends P = P>(prev: Q, next: Q) => boolean): P;
  };
  /**
   * Hook variant with shallow tracking and stable selector reference
   */
  useShallowStableSelector: {
    (): DeepReadonly<UnwrapNestedRefs<T>> & C;
    <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P, compare?: <Q extends P = P>(prev: Q, next: Q) => boolean): P;
  };
  /**
   * Clear/reset the state subscription. Useful for cleanup.
   */
  clear: () => void;
};

/**
 * @public
 *
 * Creates a global reactive state that can be used across React components.
 * Built on Vue's reactivity system (`@vue/reactivity`) for fine-grained updates.
 *
 * Works in both browser and non-browser environments (terminal UI frameworks, etc.).
 *
 * @param setup - A function that returns the initial state object
 * @param options - Optional configuration for middleware and selectors
 * @returns A hook function with additional methods for state management
 *
 * @example Basic usage
 * ```tsx
 * import { createState } from 'reactivity-store';
 *
 * // Create a simple counter state
 * const useCounter = createState(() => ({ count: 0 }));
 *
 * function Counter() {
 *   // Use entire state
 *   const state = useCounter();
 *
 *   // Or use with selector for optimized re-renders
 *   const count = useCounter((s) => s.count);
 *
 *   return <div>{count}</div>;
 * }
 * ```
 *
 * @example With actions
 * ```tsx
 * import { createState, withActions } from 'reactivity-store';
 *
 * const useCounter = createState(
 *   withActions(
 *     () => ({ count: 0 }),
 *     (state) => ({
 *       increment: () => state.count++,
 *       decrement: () => state.count--,
 *       add: (n: number) => state.count += n,
 *     })
 *   )
 * );
 *
 * function Counter() {
 *   const { count, increment, decrement } = useCounter();
 *   return (
 *     <div>
 *       <span>{count}</span>
 *       <button onClick={increment}>+</button>
 *       <button onClick={decrement}>-</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example With persistence
 * ```tsx
 * import { createState, withPersist } from 'reactivity-store';
 *
 * // Browser: uses localStorage by default
 * const useSettings = createState(
 *   withPersist(
 *     () => ({ theme: 'light', fontSize: 14 }),
 *     { key: 'app-settings' }
 *   )
 * );
 *
 * // CLI/Node.js: use custom storage adapter
 * import { createStorageAdapter } from 'reactivity-store';
 *
 * const storage = createStorageAdapter({
 *   read: (key) => fs.existsSync(key) ? fs.readFileSync(key, 'utf-8') : null,
 *   write: (key, value) => fs.writeFileSync(key, value),
 *   remove: (key) => fs.existsSync(key) && fs.unlinkSync(key),
 * });
 *
 * const useSettings = createState(
 *   withPersist(
 *     () => ({ theme: 'light' }),
 *     { key: 'settings', getStorage: () => storage }
 *   )
 * );
 * ```
 *
 * @example With options shorthand
 * ```tsx
 * import { createState } from 'reactivity-store';
 *
 * const useCounter = createState(() => ({ count: 0 }), {
 *   withActions: (state) => ({
 *     increment: () => state.count++,
 *   }),
 *   withPersist: 'counter',
 *   withNamespace: 'counter',
 *   withDeepSelector: true,
 *   withStableSelector: true,
 * });
 * ```
 *
 * @example Accessing state outside components
 * ```tsx
 * const useCounter = createState(() => ({ count: 0 }));
 *
 * // Get mutable state (changes trigger updates)
 * const state = useCounter.getReactiveState();
 * state.count++;
 *
 * // Get readonly state (safe, no mutations)
 * const readonlyState = useCounter.getReadonlyState();
 * console.log(readonlyState.count);
 *
 * // Subscribe to changes
 * const unsubscribe = useCounter.subscribe(
 *   (s) => s.count,
 *   () => console.log('count changed!')
 * );
 * ```
 */
export function createState<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<StateWithMiddleware<T, P>>
): UseSelectorWithState<T, P>;
/** 
 * @public 
 */
export function createState<T extends Record<string, unknown>>(setup: Setup<T>): UseSelectorWithState<T, {}>;
/** 
 * @public 
 */
export function createState<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, P>>
): UseSelectorWithState<UnWrapMiddleware<T>, P>;
/** 
 * @public 
 */
export function createState<T extends Record<string, unknown>, P extends Record<string, Function>, L extends Record<string, Function>>(
  setup: Setup<StateWithMiddleware<T, L>>,
  options: {
    withActions: WithActionsProps<T, P>["generateActions"];
    withPersist?: string | WithPersistProps<T>;
    withNamespace?: string | WithNamespaceProps<T>;
    withDeepSelector?: boolean;
    withStableSelector?: boolean;
  }
): UseSelectorWithState<T, P & L>;
/** 
 * @public 
 */
export function createState<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<T>,
  options: {
    withActions: WithActionsProps<T, P>["generateActions"];
    withPersist?: string | WithPersistProps<T>;
    withNamespace?: string | WithNamespaceProps<T>;
    withDeepSelector?: boolean;
    withStableSelector?: boolean;
  }
): UseSelectorWithState<T, P>;
/** 
 * @public 
 */
export function createState<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<StateWithMiddleware<T, P>>,
  options: {
    withPersist?: string | WithPersistProps<T>;
    withNamespace?: string | WithNamespaceProps<T>;
    withDeepSelector?: boolean;
    withStableSelector?: boolean;
  }
): UseSelectorWithState<T, P>;
/** 
 * @public 
 */
export function createState<T extends Record<string, unknown>>(
  setup: Setup<T>,
  options: {
    withPersist?: string | WithPersistProps<T>;
    withNamespace?: string | WithNamespaceProps<T>;
    withDeepSelector?: boolean;
    withStableSelector?: boolean;
  }
): UseSelectorWithState<T, {}>;
/** 
 * @public 
 */
export function createState<T extends Record<string, unknown>, P extends Record<string, Function>, L extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, L>>,
  options?: {
    withPersist?: string | WithPersistProps<T>;
    withNamespace?: string | WithNamespaceProps<T>;
    withActions?: WithActionsProps<UnWrapMiddleware<T>, P>["generateActions"];
    withDeepSelector?: boolean;
    withStableSelector?: boolean;
  }
) {
  return internalCreateState<T, P, L>(setup, "createState", options);
}
