import { ReactiveEffect } from "@vue/reactivity";
import { isPromise } from "@vue/shared";

import { isServer } from "./env";

import type { LifeCycle } from "./lifeCycle";

const catchError =
  <T>(cb: () => T) =>
  () => {
    try {
      const res = cb();
      if (isPromise(res)) {
        throw new Error(`[reactivity-store] selector should be a pure function, but current is a async function`);
      }
      return res;
    } catch (e) {
      if (__DEV__) {
        console.error(`[reactivity-store] have an error for current selector, ${(e as Error)?.message}`);
      }
      return null;
    }
  };

// TODO
/**
 * @internal
 */
export class Controller<T = any> {
  readonly _listeners = new Set<() => void>();

  name: string;

  _safeGetState: () => T;

  _effect: ReactiveEffect<T>;

  // make the state change and component update
  _updateCount = 0;

  constructor(readonly _state: () => T, readonly _lifeCycle: LifeCycle, readonly _onUpdate?: () => void) {
    this._safeGetState = catchError(_state);
    this._effect = new ReactiveEffect(this._safeGetState, this.notify);
  }

  notify = () => {
    if (this._lifeCycle.canUpdateComponent) {
      if (__DEV__ && isServer) {
        console.error(`[reactivity-store] unexpected update for reactivity-store, should not update a state on the server`);
      }
      this._onUpdate?.();
      this._updateCount++;
      this._listeners.forEach((f) => f());
    }
  };

  subscribe = (listener: () => void) => {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  };

  getState = () => {
    return this._updateCount;
  };

  getEffect = () => {
    return this._effect;
  };

  getSelectorState = () => {
    return this._safeGetState();
  };

  getLifeCycle = () => {
    return this._lifeCycle;
  };
}
