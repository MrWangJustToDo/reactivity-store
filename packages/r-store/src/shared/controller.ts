import { ReactiveEffect } from "@vue/reactivity";
import { isPromise } from "@vue/shared";

import { InternalNameSpace, isServer } from "./env";
import { queueJob } from "./queue";

import type { LifeCycle } from "./lifeCycle";

class ControllerEffect<T = any> extends ReactiveEffect<T> {
  _devVersion: string;

  get _isControllerEffect() {
    return true;
  }

  constructor(getter: () => T) {
    super(getter);

    if (__DEV__) {
      this._devVersion = __VUE_VERSION__;
    }
  }
}

const catchError = <T>(cb: () => T, instance: Controller) => {
  return () => {
    if (!instance._isActive) return;

    if (__DEV__) {
      instance._devRunCount = instance._devRunCount || 0;

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

  _state: T;

  _devState: any;

  _devCompare: any;

  _devSelector: any;

  _devActions: any;

  _devWithDeep: any;

  _devWithStable: any;

  _devVersion: string;

  _devReduxOptions: any;

  _devPersistOptions: any;

  _devType: any;

  _devResult: any;

  _devRunCount: number;

  // make the state change and component update
  _updateCount = 0;

  _isActive = true;

  constructor(
    readonly _getState: () => T,
    readonly _compare: (prev: T, next: T) => boolean,
    readonly _lifeCycle: LifeCycle,
    _list: Set<Controller>,
    readonly _namespace?: string,
    readonly _onUpdate?: () => void
  ) {
    this._getStateSafe = catchError(_getState, this);

    this._effect = new ControllerEffect(this._getStateSafe);

    this._effect.scheduler = this._scheduler;

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
    if (!this._isActive) return;

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

  _scheduler = () => {
    const newState = this._effect.run();

    if (!this._isActive) return;

    const isSame = this._compare(this._state, newState);

    this._state = newState;

    if (!isSame) {
      if (this._lifeCycle.canUpdateComponent) {
        if (this._lifeCycle.syncUpdateComponent) {
          this.notify();
        } else {
          queueJob(this);
        }
      }
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
    return this._getStateSafe();
  };

  getLifeCycle = () => {
    return this._lifeCycle;
  };

  // TODO move into constructor function?
  run() {
    this._state = this._effect.run();
  }

  stop() {
    this._effect.stop();

    this._listeners.clear();

    this._list?.delete?.(this);

    this._isActive = false;
  }

  inactive() {
    this._isActive = false;
  }

  active() {
    this._isActive = true;
  }
}
