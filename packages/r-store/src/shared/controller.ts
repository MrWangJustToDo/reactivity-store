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

const catchError = <T>(cb: () => T, instance: Controller) => {
  return () => {
    if (!instance._isActive) return;

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
};

// TODO
/**
 * @internal
 */
export class Controller<T = any> {
  readonly _listeners = new Set<() => void>();

  readonly _list: Set<Controller>;

  _getStateSafe: () => T;

  _effect: ReactiveEffect<T>;

  _devState: any;

  _devSelector: any;

  _devActions: any;

  _devWithDeep: any;

  _devWithStable: any;

  _devVersion: string;

  _devType: any;

  _devResult: any;

  _devRunCount = 0;

  // make the state change and component update
  _updateCount = 0;

  _isActive = true;

  constructor(
    readonly _getState: () => T,
    readonly _lifeCycle: LifeCycle,
    _list: Set<Controller>,
    readonly _namespace?: string,
    readonly _onUpdate?: () => void
  ) {
    this._getStateSafe = catchError(_getState, this);

    this._effect = new ControllerEffect(this._getStateSafe, () => {
      this.run();

      if (!this._isActive) {
        if (__DEV__) {
          console.error(`[reactivity-store] unexpected update for reactivity-store, current store have been inactivated`);
        }
        return;
      }

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

    if (__DEV__) {
      this._devVersion = __VERSION__;
    }
  }

  notify = () => {
    // TODO implement server side initialState
    if (__DEV__ && isServer) {
      console.error(`[reactivity-store] unexpected update for reactivity-store, should not update a state on the server`);
    }

    this._updateCount++;

    try {
      this._onUpdate?.();
    } catch (e) {
      if (__DEV__) {
        console.error(`[reactivity-store] have an error for current updater, ${(e as Error)?.message}, please check your subscribe, %o`, this);
      }

      this._lifeCycle.canUpdateComponent = false;
    }

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
    return this._getStateSafe();
  };

  getLifeCycle = () => {
    return this._lifeCycle;
  };

  // TODO move into constructor function?
  run() {
    this._effect.run();
  }

  stop() {
    this._effect.stop();

    this._listeners.clear();

    this._list?.delete?.(this);

    this._isActive = false;
  }
}
