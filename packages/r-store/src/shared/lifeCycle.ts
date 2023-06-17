export type LifeCycle = {
  onBeforeMount: Array<() => void>;

  onMounted: Array<() => void>;

  onBeforeUpdate: Array<() => void>;

  onUpdated: Array<() => void>;

  onBeforeUnmount: Array<() => void>;

  onUnmounted: Array<() => void>;

  hasHookInstall: boolean;

  canUpdateComponent: boolean;

  shouldRunSelector: boolean;
};

export const createLifeCycle = (): LifeCycle => ({
  onBeforeMount: [],
  onBeforeUpdate: [],
  onBeforeUnmount: [],
  onMounted: [],
  onUpdated: [],
  onUnmounted: [],
  hasHookInstall: false,
  // a flag to make selector rerun when the state has been changed
  shouldRunSelector: true,
  canUpdateComponent: true,
});
