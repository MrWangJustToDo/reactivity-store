/**
 * @public
 */
export type LifeCycle = {
  onBeforeMount: Array<() => void>;

  onMounted: Array<() => void>;

  onBeforeUpdate: Array<() => void>;

  onUpdated: Array<() => void>;

  onBeforeUnmount: Array<() => void>;

  onUnmounted: Array<() => void>;

  hasHookInstall: boolean;

  canUpdateComponent: boolean;

  syncUpdateComponent: boolean;
}

/**
 * @internal
 */
export const createLifeCycle = (): LifeCycle => ({
  onBeforeMount: [],
  onBeforeUpdate: [],
  onBeforeUnmount: [],
  onMounted: [],
  onUpdated: [],
  onUnmounted: [],
  hasHookInstall: false,
  canUpdateComponent: true,
  syncUpdateComponent: false,
});
