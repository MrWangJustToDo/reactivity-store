import type { DeepReadonly } from '@vue/reactivity';
import type { ReactElement } from 'react';
import type { ReactNode } from 'react';
import type { UnwrapNestedRefs } from '@vue/reactivity';

/**
 * @public
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
export declare function createState<T extends Record<string, unknown>, P extends Record<string, Function>>(setup: Setup<MaybeStateWithMiddleware<T, P>>, options: {
    withNamespace?: string;
    withDeepSelector?: boolean;
}): UseSelectorWithState<UnWrapMiddleware<T>, P>;

/**
 * @public
 */
export declare function createState<T extends Record<string, unknown>, P extends Record<string, Function>>(setup: Setup<MaybeStateWithMiddleware<T, P>>, options: {
    withPersist: string;
    withNamespace?: string;
    withDeepSelector?: boolean;
}): UseSelectorWithState<UnWrapMiddleware<T>, P>;

/**
 * @public
 */
export declare function createState<T extends StateWithMiddleware<Q, L>, Q extends Record<string, unknown>, P extends Record<string, Function>, L extends Record<string, Function>>(setup: Setup<StateWithMiddleware<Q, L>>, options: {
    withActions: WithActionsProps<Q, P>["generateActions"];
    withNamespace?: string;
    withDeepSelector?: boolean;
}): UseSelectorWithState<UnWrapMiddleware<T>, P & L>;

/**
 * @public
 */
export declare function createState<T extends Record<string, unknown>, P extends Record<string, Function>>(setup: Setup<T>, options: {
    withActions: WithActionsProps<T, P>["generateActions"];
    withNamespace?: string;
    withDeepSelector?: boolean;
}): UseSelectorWithState<UnWrapMiddleware<T>, P>;

/**
 * @public
 */
export declare function createState<T extends StateWithMiddleware<Q, L>, Q extends Record<string, unknown>, P extends Record<string, Function>, L extends Record<string, Function>>(setup: Setup<StateWithMiddleware<Q, L>>, options: {
    withActions: WithActionsProps<Q, P>["generateActions"];
    withPersist: string;
    withNamespace?: string;
    withDeepSelector?: boolean;
}): UseSelectorWithState<UnWrapMiddleware<T>, P & L>;

/**
 * @public
 */
export declare function createState<T extends Record<string, unknown>, P extends Record<string, Function>>(setup: Setup<T>, options: {
    withPersist: string;
    withActions: WithActionsProps<T, P>["generateActions"];
    withNamespace?: string;
    withDeepSelector?: boolean;
}): UseSelectorWithState<T, P>;

/**
 * @public
 */
export declare const createStore: <T extends Record<string, unknown>>(creator: Creator<T>) => UseSelectorWithStore<T>;

/**
 * @public
 */
export declare function createStoreWithComponent<T extends Record<string, unknown>>(props: CreateStoreWithComponentProps<NonNullable<unknown>, T>): ({ children }: {
    children?: (p: DeepReadonly<UnwrapNestedRefs<T>>) => ReactNode;
}) => ReactElement;

/**
 * @public
 */
export declare function createStoreWithComponent<P extends Record<string, unknown>, T extends Record<string, unknown>>(props: CreateStoreWithComponentProps<P, T>): ({ children }: {
    children?: (p: P & DeepReadonly<UnwrapNestedRefs<T>>) => ReactNode;
} & P) => ReactElement;

/**
 * @public
 */
export declare type CreateStoreWithComponentProps<P extends Record<string, unknown>, T extends Record<string, unknown>> = {
    setup: Creator<T>;
    render?: (props: P & DeepReadonly<UnwrapNestedRefs<T>>) => ReactNode;
};

/**
 * @public
 */
export declare type Creator<T extends Record<string, unknown>> = () => T;

/**
 * @public
 * @deprecated
 * no need to use this function
 */
export declare const getBatch: () => (cb: () => void) => void;

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
export declare const setBatch: (batch: (cb: () => void) => void) => void;

/**
 * @public
 */
export declare type Setup<T> = () => T;

/**
 * @public
 */
export declare type StateWithMiddleware<T, P> = {
    ["$$__state__$$"]: T;
    ["$$__middleware__$$"]: Record<string, unknown>;
    ["$$__actions__$$"]: P;
    ["$$__namespace__$$"]: string;
};

/**
 * @public
 */
export declare type UnWrapMiddleware<T> = T extends StateWithMiddleware<infer Q, infer _> ? UnWrapMiddleware<Q> : T;

/**
 * @public
 */
export declare const useReactiveEffect: (effectCallback: () => void | (() => void)) => void;

/**
 * @public
 */
export declare const useReactiveState: <T extends Record<string, unknown>>(initialState: T | (() => T)) => [DeepReadonly<UnwrapNestedRefs<T>>, (cb: (t: UnwrapNestedRefs<T>) => void) => void];

/**
 * @public
 */
export declare type UseSelectorWithState<T, C> = {
    (): DeepReadonly<UnwrapNestedRefs<T>> & C;
    <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P): P;
    /**
     * @deprecated
     * use `getReactiveState` / `getReadonlyState` in stead
     */
    getState: () => T;
    getActions: () => C;
    getLifeCycle: () => LifeCycle;
    getReactiveState: () => UnwrapNestedRefs<T>;
    getReadonlyState: () => DeepReadonly<UnwrapNestedRefs<T>>;
    subscribe: <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, cb?: () => void) => () => void;
    useDeepSelector: {
        (): DeepReadonly<UnwrapNestedRefs<T>> & C;
        <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P): P;
    };
    useShallowSelector: {
        (): DeepReadonly<UnwrapNestedRefs<T>> & C;
        <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>> & C) => P): P;
    };
};

/**
 * @public
 */
export declare type UseSelectorWithStore<T> = {
    (): DeepReadonly<UnwrapNestedRefs<T>>;
    <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P): P;
    /**
     * @deprecated
     * use `getReactiveState` / `getReadonlyState` in stead
     */
    getState: () => T;
    getLifeCycle: () => LifeCycle;
    getReactiveState: () => UnwrapNestedRefs<T>;
    getReadonlyState: () => DeepReadonly<UnwrapNestedRefs<T>>;
    subscribe: <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P, cb?: () => void) => () => void;
    useShallowSelector: {
        (): DeepReadonly<UnwrapNestedRefs<T>>;
        <P>(selector: (state: DeepReadonly<UnwrapNestedRefs<T>>) => P): P;
    };
};

/**
 * @public
 */
export declare const version = "0.2.5";

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
 */
export declare type WithActionsProps<T, P> = {
    generateActions?: (state: T) => P;
    automaticBatchAction?: boolean;
};

/**
 * @public
 */
export declare function withNamespace<T extends Record<string, unknown>, P extends Record<string, Function>>(setup: Setup<StateWithMiddleware<T, P>>, options: WithNamespaceProps): Setup<StateWithMiddleware<T, P>>;

/**
 * @public
 */
export declare function withNamespace<T extends Record<string, unknown>>(setup: Setup<T>, options: WithNamespaceProps): Setup<StateWithMiddleware<T, {}>>;

/**
 * @public
 */
export declare type WithNamespaceProps = {
    namespace: string;
    reduxDevTool?: boolean;
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
 */
export declare type WithPersistProps<T extends Record<string, unknown>> = {
    key: string;
    version?: string;
    debounceTime?: number;
    getStorage?: () => Storage;
    stringify?: (s: T) => string;
    parse?: (s: string) => Partial<T>;
    merge?: (fromCreator: T, fromStorage: Partial<T>) => T;
    devLog?: boolean;
};

/**
 * @public
 * @deprecated
 * no need to use this function
 */
export declare const wrapperBatchUpdate: <T extends Function>(cb: T) => T;


export * from "@vue/reactivity";

export { }
