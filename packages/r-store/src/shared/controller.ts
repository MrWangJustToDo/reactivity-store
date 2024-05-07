import { ReactiveEffect } from "@vue/reactivity";
import { isPromise } from "@vue/shared";

import { InternalNameSpace, isServer } from "./env";
import { queueJob } from "./queue";

import type { LifeCycle } from "./lifeCycle";

class ControllerEffect extends ReactiveEffect {
  get _isControllerEffect() {
    return true;
  }
}

const catchError =
  <T>(cb: () => T, instance: Controller) =>
  () => {
    if (__DEV__) {
      instance._devRunCount++;
    }
    try {
      const res = cb();
      if (isPromise(res)) {
        throw new Error(`[reactivity-store] selector should be a pure function, but current is a async function`);
      }
      return res;
    } catch (e) {
      if (__DEV__) {
        console.error(
          `[reactivity-store] have an error for current selector, ${(e as Error)?.message}, maybe you use the middleware with wrong usage, %o`,
          instance
        );
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

  readonly _list: Set<Controller>;

  _safeGetState: () => T;

  _effect: ReactiveEffect<T>;

  _devState: any;

  _devSelector: any;

  _devActions: any;

  _devWithDeep: any;

  _devResult: any;

  _devRunCount = 0;

  // make the state change and component update
  _updateCount = 0;

  constructor(
    readonly _state: () => T,
    readonly _lifeCycle: LifeCycle,
    _list: Set<Controller>,
    readonly _namespace?: string,
    readonly _onUpdate?: (instance: Controller) => void
  ) {
    this._safeGetState = catchError(_state, this);
    this._effect = new ControllerEffect(this._safeGetState, () => {
      if (this._lifeCycle.canUpdateComponent) {
        if (this._lifeCycle.syncUpdateComponent) {
          this.notify();
        } else {
          queueJob(this);
        }
      }
    });
    if (
      this._namespace !== InternalNameSpace.$$__persist__$$ &&
      this._namespace !== InternalNameSpace.$$__subscribe__$$ &&
      this._namespace !== InternalNameSpace.$$__redux_dev_tool__$$
    ) {
      this._list = _list;
      this._list.add(this);
    }
  }

  notify = () => {
    // TODO implement server side initialState
    if (__DEV__ && isServer) {
      console.error(`[reactivity-store] unexpected update for reactivity-store, should not update a state on the server`);
    }
    this._updateCount++;
    this._onUpdate?.(this);
    this._listeners.forEach((f) => f());
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

  run() {
    this._effect.run();
  }

  stop() {
    this._effect.stop();

    this._listeners.clear();

    this._list?.delete?.(this);
  }
}
