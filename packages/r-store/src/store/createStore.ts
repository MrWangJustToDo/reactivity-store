import { internalCreateStore } from "./_internal";

import type { Creator } from "./_internal";
import type { LifeCycle } from "../shared/lifeCycle";
import type { DeepReadonly, UnwrapNestedRefs } from "@vue/reactivity";

export type { Creator } from "./_internal";

/**
 * @public
 *
 * The return type of `createStore`, a hook function with additional methods for state management.
 * Similar to `UseSelectorWithState` but without actions (use returned functions from creator instead).
 *
 * @typeParam T - The state type returned by the creator function
 */
export type UseSelectorWithStore<T> = {
  /**
   * Use the entire state (called without arguments)
   * @returns The full readonly state
   */
  (): DeepReadonly<UnwrapNestedRefs<T>>;
  /**
   * Use a selected slice of the state (called with selector)
   * @param selector - A function to select part of the state
   * @param compare - Optional comparison function. If returns `true`, component won't re-render
   * @returns The selected state slice
   */
  <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, compare?: <Q extends P = P>(prev: Q, next: Q) => boolean): P;
  /**
   * @deprecated Use `getReactiveState` or `getReadonlyState` instead
   */
  getState: () => T;
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
   * Hook variant that only shallowly tracks state changes (better performance)
   */
  useShallowSelector: {
    (): DeepReadonly<UnwrapNestedRefs<T>>;
    <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, compare?: <Q extends P = P>(prev: Q, next: Q) => boolean): P;
  };
  /**
   * Hook variant with shallow tracking and stable selector reference
   */
  useShallowStableSelector: {
    (): DeepReadonly<UnwrapNestedRefs<T>>;
    <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, compare?: <Q extends P = P>(prev: Q, next: Q) => boolean): P;
  };
  /**
   * Hook variant that deeply tracks all nested state changes
   */
  useDeepSelector: {
    (): DeepReadonly<UnwrapNestedRefs<T>>;
    <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, compare?: <Q extends P = P>(prev: Q, next: Q) => boolean): P;
  };
  /**
   * Hook variant with deep tracking and stable selector reference
   */
  useDeepStableSelector: {
    (): DeepReadonly<UnwrapNestedRefs<T>>;
    <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, compare?: <Q extends P = P>(prev: Q, next: Q) => boolean): P;
  };
  /**
   * Clear/reset the state subscription. Useful for cleanup.
   */
  clear: () => void;
};

/**
 * @public
 *
 * Creates a global reactive store using Vue's reactivity primitives.
 * Unlike `createState`, this API allows using Vue's `ref`, `reactive`, `computed`, etc. directly.
 *
 * Works in both browser and non-browser environments (terminal UI frameworks, etc.).
 *
 * **Note:** Lifecycle hooks (`onMounted`, `onUnmounted`, etc.) only work with
 * `createStoreWithComponent`, not with `createStore`.
 *
 * @param creator - A function that creates and returns the reactive state using Vue reactivity APIs
 * @returns A hook function with additional methods for state management
 *
 * @example Basic usage with ref
 * ```tsx
 * import { createStore, ref } from 'reactivity-store';
 *
 * const useCounter = createStore(() => {
 *   const count = ref(0);
 *
 *   const increment = () => count.value++;
 *   const decrement = () => count.value--;
 *
 *   return { count, increment, decrement };
 * });
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
 * @example With reactive and computed
 * ```tsx
 * import { createStore, reactive, computed } from 'reactivity-store';
 *
 * const useTodos = createStore(() => {
 *   const state = reactive({
 *     todos: [] as { id: number; text: string; done: boolean }[],
 *     filter: 'all' as 'all' | 'active' | 'done',
 *   });
 *
 *   const filteredTodos = computed(() => {
 *     if (state.filter === 'all') return state.todos;
 *     if (state.filter === 'active') return state.todos.filter(t => !t.done);
 *     return state.todos.filter(t => t.done);
 *   });
 *
 *   const addTodo = (text: string) => {
 *     state.todos.push({ id: Date.now(), text, done: false });
 *   };
 *
 *   const toggleTodo = (id: number) => {
 *     const todo = state.todos.find(t => t.id === id);
 *     if (todo) todo.done = !todo.done;
 *   };
 *
 *   return { state, filteredTodos, addTodo, toggleTodo };
 * });
 * ```
 *
 * @example Using selector for optimized re-renders
 * ```tsx
 * const useStore = createStore(() => {
 *   const state = reactive({ count: 0, name: 'test' });
 *   return { state };
 * });
 *
 * function CountDisplay() {
 *   // Only re-renders when count changes, not when name changes
 *   const count = useStore(s => s.state.count);
 *   return <div>{count}</div>;
 * }
 * ```
 *
 * @example Accessing state outside components
 * ```tsx
 * const useCounter = createStore(() => {
 *   const count = ref(0);
 *   return { count };
 * });
 *
 * // Get mutable state
 * const state = useCounter.getReactiveState();
 * state.count++;
 *
 * // Subscribe to changes
 * const unsubscribe = useCounter.subscribe(
 *   (s) => s.count,
 *   () => console.log('count changed!')
 * );
 * ```
 */
export const createStore = <T extends Record<string, unknown>>(creator: Creator<T>): UseSelectorWithStore<T> => {
  return internalCreateStore(creator);
};
