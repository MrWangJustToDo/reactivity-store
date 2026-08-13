import type { DeepReadonly } from '@vue/reactivity';
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
 * Creates a Vue-reactivity-backed store whose selector hook runs on Octane.
 * The returned store API matches the React entry point.
 *
 * @public
 */
export declare const createStore: <T extends Record<string, unknown>>(creator: Creator<T>) => UseSelectorWithStore<T>;

/** @public */
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

/** @public */
export declare type UseSelectorHook<T> = {
    (): DeepReadonly<UnwrapNestedRefs<T>>;
    <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, compare?: (prev: P, next: P) => boolean): P;
};

/** @public */
export declare type UseSelectorWithStore<T> = {
    (): DeepReadonly<UnwrapNestedRefs<T>>;
    <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, compare?: (prev: P, next: P) => boolean): P;
    getState: () => T;
    getLifeCycle: () => LifeCycle;
    getReactiveState: () => UnwrapNestedRefs<T>;
    getReadonlyState: () => DeepReadonly<UnwrapNestedRefs<T>>;
    subscribe: <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, cb?: () => void, shallow?: boolean) => () => void;
    waitingValueTo: <K extends keyof UnwrapNestedRefs<T>>(params: {
        key: K;
        value: UnwrapNestedRefs<T>[K];
        single?: AbortSignal;
        compare?: (exist: UnwrapNestedRefs<T>[K], target: UnwrapNestedRefs<T>[K]) => boolean;
    }) => Promise<void>;
    useShallowSelector: UseSelectorHook<T>;
    useShallowStableSelector: UseSelectorHook<T>;
    useDeepSelector: UseSelectorHook<T>;
    useDeepStableSelector: UseSelectorHook<T>;
    clear: () => void;
};


export * from "@vue/reactivity";

export { }
