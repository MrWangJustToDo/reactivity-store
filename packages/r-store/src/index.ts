import { useReactiveEffect as _useReactiveEffect } from "./hook/useReactiveEffect";
import { useReactiveState as _useReactiveState } from "./hook/useReactiveState";
import { wrapperBatchUpdate as _wrapperBatchUpdate, getBatch as _getBatch, setBatch as _setBatch, resetBatch as _resetBatch } from "./shared/batch";
import { createState as _createState } from "./state/createState";
import { withActions as _withActions, withPersist as _withPersist, withNamespace as _withNameSpace } from "./state/middleware";
import { createStore as _createStore } from "./store/createStore";
import { createStoreWithComponent as _createStoreWithComponent } from "./store/createStoreWithComponent";
import {
  onBeforeMount as _onBeforeMount,
  onBeforeUpdate as _onBeforeUpdate,
  onBeforeUnmount as _onBeforeUnmount,
  onMounted as _onMounted,
  onUpdated as _onUpdated,
  onUnmounted as _onUnmounted,
} from "./store/lifeCycle";

export const createStore = _createStore;

export const createStoreWithComponent = _createStoreWithComponent;

export const onBeforeMount = _onBeforeMount;

export const onBeforeUpdate = _onBeforeUpdate;

export const onBeforeUnmount = _onBeforeUnmount;

export const onMounted = _onMounted;

export const onUpdated = _onUpdated;

export const onUnmounted = _onUnmounted;

export const useReactiveState = _useReactiveState;

export const useReactiveEffect = _useReactiveEffect;

export const createState = _createState;

export const withActions = _withActions;

export const withPersist = _withPersist;

export const withNamespace = _withNameSpace;

export const wrapperBatchUpdate = _wrapperBatchUpdate;

export const getBatch = _getBatch;

export const setBatch = _setBatch;

export const resetBatch = _resetBatch;

export * from "@vue/reactivity";

export const version = __VERSION__;
