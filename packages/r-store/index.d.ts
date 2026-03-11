import type { DeepReadonly } from '@vue/reactivity';
import type { ReactElement } from 'react';
import { ReactiveEffect } from '@vue/reactivity';
import type { ReactNode } from 'react';
import type { UnwrapNestedRefs } from '@vue/reactivity';

/**
 * @public
 *
 * Configure environment settings for non-browser usage (terminal UI frameworks, etc.)
 *
 * @example
 * ```ts
 * import { configureEnv } from 'reactivity-store';
 *
 * // Enable for terminal UI frameworks
 * configureEnv({ allowNonBrowserUpdates: true });
 * ```
 */
export declare function configureEnv(options: Partial<EnvConfigOptions>): void;

/**
 * @public
 */
export declare class Controller<T = any> {
    readonly _getState: () => T;
    readonly _compare: (prev: T, next: T) => boolean;
    readonly _lifeCycle: LifeCycle;
    readonly _namespace?: string;
    readonly _onUpdate?: () => void;
    readonly _listeners: Set<() => void>;
    _getStateSafe: () => T;
    _effect: ReactiveEffect<T>;
    _state: T;
    _devState: any;
    _devCompare: any;
    _devSelector: any;
    _devActions: any;
    _devWithDeep: any;
    _devWithStable: any;
    _devVersion: string;
    _devReduxOptions: any;
    _devPersistOptions: any;
    _devType: any;
    _devResult: any;
    _devRunCount: number;
    _updateCount: number;
    _isActive: boolean;
    constructor(_getState: () => T, _compare: (prev: T, next: T) => boolean, _lifeCycle: LifeCycle, _namespace?: string, _onUpdate?: () => void);
    notify: () => void;
    _scheduler: () => void;
    subscribe: (listener: () => void) => () => boolean;
    getState: () => number;
    getEffect: () => ReactiveEffect<T>;
    getSelectorState: () => T;
    getLifeCycle: () => LifeCycle;
    run(): void;
    stop(): void;
    setActive(d: boolean): void;
}

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
export declare function createState<T extends Record<string, unknown>, P extends Record<string, Function>>(setup: Setup<StateWithMiddleware<T, P>>): UseSelectorWithState<T, P>;

/**
 * @public
 */
export declare function createState<T extends Record<string, unknown>>(setup: Setup<T>): UseSelectorWithState<T, {}>;

/**
 * @public
 */
export declare function createState<T extends Record<string, unknown>, P extends Record<string, Function>>(setup: Setup<MaybeStateWithMiddleware<T, P>>): UseSelectorWithState<UnWrapMiddleware<T>, P>;

/**
 * @public
 */
export declare function createState<T extends Record<string, unknown>, P extends Record<string, Function>, L extends Record<string, Function>>(setup: Setup<StateWithMiddleware<T, L>>, options: {
    withActions: WithActionsProps<T, P>["generateActions"];
    withPersist?: string | WithPersistProps<T>;
    withNamespace?: string | WithNamespaceProps<T>;
    withDeepSelector?: boolean;
    withStableSelector?: boolean;
}): UseSelectorWithState<T, P & L>;

/**
 * @public
 */
export declare function createState<T extends Record<string, unknown>, P extends Record<string, Function>>(setup: Setup<T>, options: {
    withActions: WithActionsProps<T, P>["generateActions"];
    withPersist?: string | WithPersistProps<T>;
    withNamespace?: string | WithNamespaceProps<T>;
    withDeepSelector?: boolean;
    withStableSelector?: boolean;
}): UseSelectorWithState<T, P>;

/**
 * @public
 */
export declare function createState<T extends Record<string, unknown>, P extends Record<string, Function>>(setup: Setup<StateWithMiddleware<T, P>>, options: {
    withPersist?: string | WithPersistProps<T>;
    withNamespace?: string | WithNamespaceProps<T>;
    withDeepSelector?: boolean;
    withStableSelector?: boolean;
}): UseSelectorWithState<T, P>;

/**
 * @public
 */
export declare function createState<T extends Record<string, unknown>>(setup: Setup<T>, options: {
    withPersist?: string | WithPersistProps<T>;
    withNamespace?: string | WithNamespaceProps<T>;
    withDeepSelector?: boolean;
    withStableSelector?: boolean;
}): UseSelectorWithState<T, {}>;

/**
 * @public
 *
 * Creates a storage adapter for persistence
 * - Without options: creates an in-memory storage
 * - With options: creates a custom storage from read/write/remove functions
 *
 * @example
 * ```ts
 * // In-memory storage (for testing or temporary storage)
 * const memoryStorage = createStorageAdapter();
 *
 * // Node.js file-based storage
 * import * as fs from 'fs';
 * import * as path from 'path';
 *
 * const dataDir = path.join(process.cwd(), '.myapp-data');
 * fs.mkdirSync(dataDir, { recursive: true });
 *
 * const fileStorage = createStorageAdapter({
 *   read: (key) => {
 *     const file = path.join(dataDir, `${key}.json`);
 *     return fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : null;
 *   },
 *   write: (key, value) => {
 *     const file = path.join(dataDir, `${key}.json`);
 *     fs.writeFileSync(file, value, 'utf-8');
 *   },
 *   remove: (key) => {
 *     const file = path.join(dataDir, `${key}.json`);
 *     if (fs.existsSync(file)) fs.unlinkSync(file);
 *   }
 * });
 *
 * // Usage with withPersist
 * const useStore = createState(
 *   withPersist(() => ({ count: 0 }), {
 *     key: 'counter',
 *     getStorage: () => fileStorage
 *   })
 * );
 * ```
 */
export declare function createStorageAdapter(options?: CreateStorageAdapterOptions): StorageAdapter;

/**
 * @public
 *
 * Options for creating a custom storage adapter
 */
export declare interface CreateStorageAdapterOptions {
    /** Read value by key, return null if not found */
    read: (key: string) => string | null;
    /** Write value by key */
    write: (key: string, value: string) => void;
    /** Remove value by key */
    remove: (key: string) => void;
}

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
export declare const createStore: <T extends Record<string, unknown>>(creator: Creator<T>) => UseSelectorWithStore<T>;

/**
 * @public
 * @deprecated
 * not recommend to use this function, use `createStore` instead
 */
export declare function createStoreWithComponent<T extends Record<string, unknown>>(props: CreateStoreWithComponentProps<NonNullable<unknown>, T>): ({ children }: {
    children?: (p: DeepReadonly<UnwrapNestedRefs<T>>) => ReactNode;
}) => ReactElement;

/**
 * @public
 * @deprecated
 * not recommend to use this function, use `createStore` instead
 */
export declare function createStoreWithComponent<P extends Record<string, unknown>, T extends Record<string, unknown>>(props: CreateStoreWithComponentProps<P, T>): ({ children }: {
    children?: (p: P & DeepReadonly<UnwrapNestedRefs<T>>) => ReactNode;
} & P) => ReactElement;

/**
 * @public
 */
export declare type CreateStoreWithComponentProps<P extends Record<string, unknown>, T extends Record<string, unknown>> = {
    setup: Creator<T>;
    deepWatchProps?: boolean;
    render?: (props: P & DeepReadonly<UnwrapNestedRefs<T>>) => ReactNode;
};

/**
 * @public
 */
export declare type Creator<T extends Record<string, unknown>> = () => T;

/**
 * @public
 *
 * Environment configuration options for non-browser usage
 */
export declare interface EnvConfigOptions {
    /**
     * When true, suppresses warnings about state updates in non-browser environments.
     * Set to true for terminal UI frameworks.
     */
    allowNonBrowserUpdates: boolean;
    /**
     * When true, enables persistence even without browser localStorage.
     * Requires custom storage via getStorage option.
     */
    allowCustomStorage: boolean;
}

/**
 * @public
 * @deprecated
 * no need to use this function
 */
export declare const getBatch: () => void;

/**
 * @public
 */
export declare function getCurrentController(): Controller | null;

/**
 * @public
 *
 * Detects if running in a browser environment (has window and document)
 */
export declare const isBrowser: boolean;

/**
 * @public
 *
 * Detects if running in a server/Node.js environment (no window)
 */
export declare const isServer: boolean;

/**
 * @public
 */
export declare type LifeCycle = {
    onBeforeMount: Array<() => void>;
    onMounted: Array<() => void>;
    onBeforeUpdate: Array<() => void>;
    onUpdated: Array<() => void>;
    onBeforeUnmount: Array<() => void>;
    onUnmounted: Array<() => void>;
    hasHookInstall: boolean;
    canUpdateComponent: boolean;
    syncUpdateComponent: boolean;
};

/**
 * @public
 *
 * Union type representing either a plain state object or state wrapped with middleware.
 *
 * @typeParam T - The state type
 * @typeParam P - The actions type
 */
export declare type MaybeStateWithMiddleware<T, P> = T | StateWithMiddleware<T, P>;

/**
 * @public
 */
export declare const onBeforeMount: (cb: () => void) => void;

/**
 * @public
 */
export declare const onBeforeUnmount: (cb: () => void) => void;

/**
 * @public
 */
export declare const onBeforeUpdate: (cb: () => void) => void;

/**
 * @public
 */
export declare const onMounted: (cb: () => void) => void;

/**
 * @public
 */
export declare const onUnmounted: (cb: () => void) => void;

/**
 * @public
 */
export declare const onUpdated: (cb: () => void) => void;

/**
 * @public
 * @deprecated
 * no need to use this function
 */
export declare const resetBatch: () => void;

/**
 * @public
 * @deprecated
 * no need to use this function
 */
export declare const setBatch: (_batch: (cb: () => void) => void) => void;

/**
 * @public
 */
export declare type Setup<T> = () => T;

/**
 * @public
 *
 * Internal wrapper type used by middleware to compose state with metadata.
 * You typically don't need to use this type directly.
 *
 * @typeParam T - The state type
 * @typeParam P - The actions type
 */
export declare type StateWithMiddleware<T, P> = {
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
export declare interface StorageAdapter {
    /** Get a value by key. Returns null if not found. */
    getItem(key: string): string | null;
    /** Set a value by key */
    setItem(key: string, value: string): void;
    /** Remove a value by key */
    removeItem(key: string): void;
}

/**
 * @public
 * Represents the persisted state structure stored in storage
 */
export declare type StorageState = {
    /** Version identifier for the stored state */
    version: string;
    /** The serialized state data */
    data: any;
};

/**
 * @public
 *
 * Utility type to extract the raw state type from middleware-wrapped state.
 * Recursively unwraps nested middleware layers.
 *
 * @typeParam T - The potentially wrapped state type
 */
export declare type UnWrapMiddleware<T> = T extends StateWithMiddleware<infer Q, infer _> ? UnWrapMiddleware<Q> : T;

/**
 * @public
 */
export declare const useReactiveEffect: (effectCallback: () => void | (() => void)) => void;

/**
 * @public
 */
export declare const useReactiveState: <T extends Record<string, unknown>>(initialState: T | (() => T)) => [DeepReadonly<UnwrapNestedRefs<T>>, (payload: UnwrapNestedRefs<T> | ((t: UnwrapNestedRefs<T>) => void)) => void];

/**
 * @public
 *
 * The return type of `createState`, a hook function with additional methods for state management.
 *
 * @typeParam T - The state type
 * @typeParam C - The actions type (from `withActions` middleware)
 */
export declare type UseSelectorWithState<T, C> = {
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
 * The return type of `createStore`, a hook function with additional methods for state management.
 * Similar to `UseSelectorWithState` but without actions (use returned functions from creator instead).
 *
 * @typeParam T - The state type returned by the creator function
 */
export declare type UseSelectorWithStore<T> = {
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
 */
export declare const version: string;

/**
 * @public
 */
export declare function withActions<T extends StateWithMiddleware<Q, L>, Q extends Record<string, unknown>, P extends Record<string, Function>, L extends Record<string, Function>>(setup: Setup<StateWithMiddleware<Q, L>>, options: WithActionsProps<Q, P>): Setup<StateWithMiddleware<UnWrapMiddleware<T>, P & L>>;

/**
 * @public
 */
export declare function withActions<T extends Record<string, unknown>, P extends Record<string, Function>>(setup: Setup<T>, options: WithActionsProps<T, P>): Setup<StateWithMiddleware<T, P>>;

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
export declare type WithActionsProps<T, P> = {
    /** Function that receives the reactive state and returns an object of action functions */
    generateActions?: (state: T) => P;
    /**
     * @deprecated No longer needed, actions are automatically batched
     */
    automaticBatchAction?: boolean;
};

/**
 * @public
 * @deprecated
 * use `withSelectorOptions` instead
 */
export declare const withDeepSelector: typeof withSelectorOptions;

/**
 * @public
 */
export declare function withNamespace<T extends Record<string, unknown>, P extends Record<string, Function>>(setup: Setup<StateWithMiddleware<T, P>>, options: WithNamespaceProps<T>): Setup<StateWithMiddleware<T, P>>;

/**
 * @public
 */
export declare function withNamespace<T extends Record<string, unknown>>(setup: Setup<T>, options: WithNamespaceProps<T>): Setup<StateWithMiddleware<T, {}>>;

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
export declare type WithNamespaceProps<T> = {
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
 */
export declare function withPersist<T extends Record<string, unknown>, P extends Record<string, Function>>(setup: Setup<StateWithMiddleware<T, P>>, options: WithPersistProps<T>): Setup<StateWithMiddleware<T, P>>;

/**
 * @public
 */
export declare function withPersist<T extends Record<string, unknown>>(setup: Setup<T>, options: WithPersistProps<T>): Setup<StateWithMiddleware<T, {}>>;

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
export declare type WithPersistProps<T> = {
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
 */
export declare function withSelectorOptions<T extends Record<string, unknown>, P extends Record<string, Function>>(setup: Setup<StateWithMiddleware<T, P>>, options: WithSelectorOptionsProps): Setup<StateWithMiddleware<T, P>>;

/**
 * @public
 */
export declare function withSelectorOptions<T extends Record<string, unknown>>(setup: Setup<T>, options: WithSelectorOptionsProps): Setup<StateWithMiddleware<T, {}>>;

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
export declare type WithSelectorOptionsProps = {
    /** Enable deep tracking of nested state changes */
    deepSelector?: boolean;
    /** Enable stable comparison between renders */
    stableCompare?: boolean;
    /** Memoize selector function reference */
    stableSelector?: boolean;
};

/**
 * @public
 * @deprecated
 * no need to use this function
 */
export declare const wrapperBatchUpdate: <T extends Function>(_cb: T) => T;


export * from "@vue/reactivity";

export { }
