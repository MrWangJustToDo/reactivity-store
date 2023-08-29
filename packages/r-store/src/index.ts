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
/**
 * @deprecated
 * try to import from 'reactivity-store/react'
 */
export const createStore = _createStore;
/**
 * @deprecated
 * try to import from 'reactivity-store/react'
 */
export const createStoreWithComponent = _createStoreWithComponent;
/**
 * @deprecated
 * try to import from 'reactivity-store/react'
 */
export const onBeforeMount = _onBeforeMount;
/**
 * @deprecated
 * try to import from 'reactivity-store/react'
 */
export const onBeforeUpdate = _onBeforeUpdate;
/**
 * @deprecated
 * try to import from 'reactivity-store/react'
 */
export const onBeforeUnmount = _onBeforeUnmount;
/**
 * @deprecated
 * try to import from 'reactivity-store/react'
 */
export const onMounted = _onMounted;
/**
 * @deprecated
 * try to import from 'reactivity-store/react'
 */
export const onUpdated = _onUpdated;
/**
 * @deprecated
 * try to import from 'reactivity-store/react'
 */
export const onUnmounted = _onUnmounted;
/**
 * @deprecated
 * try to import from 'reactivity-store/react'
 */
export const useReactiveState = _useReactiveState;
/**
 * @deprecated
 * try to import from 'reactivity-store/react'
 */
export const useReactiveEffect = _useReactiveEffect;

/**
 * @deprecated
 * try to import from 'reactivity-store/react'
 */
export const createState = _createState;
/**
 * @deprecated
 * try to import from 'reactivity-store/react'
 */
export const withActions = _withActions;
/**
 * @deprecated
 * try to import from 'reactivity-store/react'
 */
export const withPersist = _withPersist;
/**
 * @deprecated
 * try to import from 'reactivity-store/react'
 */
export const withNamespace = _withNameSpace;

/**
 * @deprecated
 * try to import from 'reactivity-store/react'
 */
export const wrapperBatchUpdate = _wrapperBatchUpdate;
/**
 * @deprecated
 * try to import from 'reactivity-store/react'
 */
export const getBatch = _getBatch;
/**
 * @deprecated
 * try to import from 'reactivity-store/react'
 */
export const setBatch = _setBatch;
/**
 * @deprecated
 * try to import from 'reactivity-store/react'
 */
export const resetBatch = _resetBatch;

export * from "@vue/reactivity";

export const version = __VERSION__;
