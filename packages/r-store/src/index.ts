export { onBeforeMount, onBeforeUpdate, onBeforeUnmount, onMounted, onUpdated, onUnmounted } from "./store/lifeCycle";

export { withActions, withPersist, withNamespace, withDeepSelector, withSelectorOptions } from "./state/middleware";

export { getCurrentController, Controller } from "./shared/controller";

export * from "./store/createStoreWithComponent";

export * from "./store/createStore";

export * from "./state/createState";

export { wrapperBatchUpdate, getBatch, setBatch, resetBatch } from "./shared/batch";

export { useReactiveEffect } from "./hook/useReactiveEffect";

export { useReactiveState } from "./hook/useReactiveState";

// Non-browser environment support
export { configureEnv, isBrowser, isServer } from "./shared/env";
export type { EnvConfigOptions } from "./shared/env";
export { createStorageAdapter } from "./state/storage";
export type { CreateStorageAdapterOptions } from "./state/storage";
export type { StorageAdapter, StorageState, WithSelectorOptionsProps } from "./state/tools";
export type { LifeCycle } from "./shared/lifeCycle";

export * from "@vue/reactivity";

/**
 * @public
 */
export const version = __VERSION__;
