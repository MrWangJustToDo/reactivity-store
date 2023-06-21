import { ReactiveEffect } from "@vue/reactivity";

import { isServer } from "./env";

import type { LifeCycle } from "./lifeCycle";

// TODO
export class Controller<T = any> {
  readonly listeners = new Set<() => void>();

  effect: ReactiveEffect<T>;

  // make the state change and component update
  count = 0;

  constructor(readonly state: () => T, readonly lifeCycle: LifeCycle, readonly onUpdate?: () => void) {
    this.effect = new ReactiveEffect(state, this.notify);
  }

  notify = () => {
    if (this.lifeCycle.canUpdateComponent) {
      if (__DEV__ && isServer) {
        console.error(`[reactivity-store] unexpected update for reactivity-store, should not update a state on the server`);
      }
      this.onUpdate?.();
      this.count++;
      this.listeners.forEach((f) => f());
    }
  };

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getState = () => {
    return this.count;
  };

  getEffect = () => {
    return this.effect;
  };

  getLifeCycle = () => {
    return this.lifeCycle;
  }
}
