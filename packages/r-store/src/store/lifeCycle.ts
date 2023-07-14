// vue like lifeCycle for react app;
import { globalStoreLifeCycle } from "./_internal";

export const onMounted = (cb: () => void) => {
  if (!globalStoreLifeCycle) throw new Error("[reactivity-store] can not use 'onMounted' outside of the 'createStoreWithComponent' function");

  globalStoreLifeCycle.onMounted.push(cb);

  globalStoreLifeCycle.hasHookInstall = true;
};

export const onUpdated = (cb: () => void) => {
  if (!globalStoreLifeCycle) throw new Error("[reactivity-store] can not use 'onUpdated' outside of the 'createStoreWithComponent' function");

  globalStoreLifeCycle.onUpdated.push(cb);

  globalStoreLifeCycle.hasHookInstall = true;
};

export const onUnmounted = (cb: () => void) => {
  if (!globalStoreLifeCycle) throw new Error("[reactivity-store] can not use 'onUnmounted' outside of the 'createStoreWithComponent' function");

  globalStoreLifeCycle.onUnmounted.push(cb);

  globalStoreLifeCycle.hasHookInstall = true;
};

export const onBeforeMount = (cb: () => void) => {
  if (!globalStoreLifeCycle) throw new Error("[reactivity-store] can not use 'onBeforeMount' outside of the 'createStoreWithComponent' function");

  globalStoreLifeCycle.onBeforeMount.push(cb);

  globalStoreLifeCycle.hasHookInstall = true;
};

export const onBeforeUpdate = (cb: () => void) => {
  if (!globalStoreLifeCycle) throw new Error("[reactivity-store] can not use 'onBeforeUpdate' outside of the 'createStoreWithComponent' function");

  globalStoreLifeCycle.onBeforeUpdate.push(cb);

  globalStoreLifeCycle.hasHookInstall = true;
};

export const onBeforeUnmount = (cb: () => void) => {
  if (!globalStoreLifeCycle) throw new Error("[reactivity-store] can not use 'onBeforeUnmount' outside of the 'createStoreWithComponent' function");

  globalStoreLifeCycle.onBeforeUnmount.push(cb);

  globalStoreLifeCycle.hasHookInstall = true;
};
