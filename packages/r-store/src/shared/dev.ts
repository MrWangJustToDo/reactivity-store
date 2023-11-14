/* eslint-disable @typescript-eslint/ban-types */
import { isServer } from "./env";

import type { Controller } from "./controller";

const namespaceMap: Record<string, unknown> = {};

/**
 * @internal
 */
export const setNamespaceMap = (key: string, value: unknown) => {
  namespaceMap[key] = value;
};

/**
 * @internal
 */
export const checkHasKey = (key: string) => {
  return key in namespaceMap;
};

if (!isServer) {
  try {
    if (__DEV__ && globalThis["@reactivity-store"]) {
      console.error(`[reactivity-store] you are using multiple version of reactivity-store, this is a unexpected usage`);
    }
    globalThis["@reactivity-store"] = new WeakMap();
  } catch {
    void 0;
  }
}

/**
 * @internal
 */
export const setDevController = (controller: Controller, state: any) => {
  if (__DEV__ && !isServer) {
    if (!globalThis["@reactivity-store"]) return;
    try {
      const set = (globalThis["@reactivity-store"]?.get?.(state) || new Set()) as Set<Controller>;

      set.add(controller);

      globalThis["@reactivity-store"]?.set?.(state, set);
    } catch {
      void 0;
    }
  }
};

/**
 * @internal
 */
export const delDevController = (controller: Controller, state: any) => {
  if (__DEV__ && !isServer) {
    if (!globalThis["@reactivity-store"]) return;
    try {
      const set = globalThis["@reactivity-store"]?.get?.(state) as Set<Controller>;

      set?.delete?.(controller);

      if (set.size === 0) {
        globalThis["@reactivity-store"]?.delete?.(state);
      }
    } catch {
      void 0;
    }
  }
};

// cache state which has connect to devtool
const devToolMap: Record<string, any> = {};

const globalName = "__reactivity-store-redux-devtools__";

let globalDevTools = null;

/**
 * @internal
 */
export const connectDevTool = (name: string, actions: Record<string, Function>, state: any) => {
  if (window && window.__REDUX_DEVTOOLS_EXTENSION__ && typeof window.__REDUX_DEVTOOLS_EXTENSION__.connect === "function") {
    if (devToolMap[name] && devToolMap[name] !== state) {
      console.warn(`[reactivity-store/middleware] can not connect the devtool with same namespace ${name} but with different state object!`);

      return actions;
    }

    const devTools = globalDevTools || window.__REDUX_DEVTOOLS_EXTENSION__.connect({ name: globalName });

    globalDevTools = devTools;

    devToolMap[name] = state;

    const obj = { ...devToolMap };

    devTools.init(obj);

    const action = { type: `action/change-${name}` };

    return Object.keys(actions).reduce((p, c) => {
      p[c] = (...args) => {
        const re = actions[c](...args);
        try {
          const nextObj = { ...devToolMap, [name]: JSON.parse(JSON.stringify(state)) };

          devTools.send({ ...action, $payload: args }, nextObj);
        } catch (e) {
          console.log(e);

          void 0;
        }
        return re;
      };
      return p;
    }, {});
  } else {
    return actions;
  }
};
