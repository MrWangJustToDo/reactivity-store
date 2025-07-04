/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { isPromise } from "@vue/shared";

import { Controller } from "./controller";
import { InternalNameSpace } from "./env";
import { createLifeCycle } from "./lifeCycle";
import { traverse, traverseShallow } from "./tools";

const namespaceMap: Record<string, unknown> = {};

const temp = new Set<Controller>();

const defaultCompare = () => false;

/**
 * @internal
 */
export const setNamespaceMap = (key: string, value: unknown) => {
  namespaceMap[key] = value;
};

/**
 * @internal
 */
export const delNamespace = (key: string) => {
  delete namespaceMap[key];
};

/**
 * @internal
 */
export const checkHasKey = (key: string) => {
  return key in namespaceMap;
};

// cache state which has connect to devtool
const devToolMap: Record<string, any> = {};

const devController: Record<string, Controller> = {};

const globalName = "__reactivity-store-redux-devtools__";

type Action = { type: string; $payload?: any; getUpdatedState: () => any };

let globalDevTools = null;

/**
 * @internal
 */
const getDevToolInstance = () => globalDevTools || window.__REDUX_DEVTOOLS_EXTENSION__.connect({ name: globalName });

/**
 * @internal
 */
const sendToDevTools = (action: Action) => {
  const { getUpdatedState, ...rest } = action;
  try {
    const state = getUpdatedState();

    getDevToolInstance().send(rest, state);
  } catch (e) {
    console.log(e);
  }
};

/**
 * @internal
 */
export const connectDevTool = (
  name: string,
  actions: Record<string, Function>,
  readonlyState: any,
  reactiveState: any,
  options?: {
    shallow?: boolean;
    listener?: (state: any) => any;
  }
) => {
  if (window && window.__REDUX_DEVTOOLS_EXTENSION__ && typeof window.__REDUX_DEVTOOLS_EXTENSION__.connect === "function") {
    try {
      const devTools = globalDevTools || window.__REDUX_DEVTOOLS_EXTENSION__.connect({ name: globalName });

      globalDevTools = devTools;

      const existController = devController[name];

      if (existController) {
        existController.stop();
      }

      devToolMap[name] = readonlyState;

      const lifeCycle = createLifeCycle();

      lifeCycle.syncUpdateComponent = true;

      let updateInActionCount = 0;

      const onUpdateWithoutAction = () => {
        if (updateInActionCount > 0) return;
        sendToDevTools({
          type: `subscribeAction-${name}`,
          getUpdatedState: () => ({ ...devToolMap, [name]: readonlyState }),
        });
      };

      const subscribe = () => {
        let re = reactiveState;
        if (options?.listener && typeof options?.listener === "function") {
          re = options.listener(reactiveState);
        }
        if (options?.shallow) {
          traverseShallow(re);
        } else {
          traverse(re);
        }
      };

      // create a subscribe controller to listen to the state change, because some state change may not trigger by the `action`
      const controller = new Controller(subscribe, defaultCompare, lifeCycle, temp, InternalNameSpace.$$__redux_dev_tool__$$, onUpdateWithoutAction);

      controller._devReduxOptions = options;

      devController[name] = controller;

      controller.run();

      const obj = { ...devToolMap };

      devTools.init(obj);

      return Object.keys(actions).reduce((p, c) => {
        p[c] = (...args) => {
          updateInActionCount++;

          const len = actions[c].length || 0;

          const re = actions[c](...args);

          const action = actions[c];

          if (isPromise(re)) {
            re.finally(() => {
              sendToDevTools({
                type: `asyncAction-${name}/${action.name || "anonymous"}`,
                $payload: args.slice(0, len),
                getUpdatedState: () => ({ ...devToolMap, [name]: readonlyState }),
              });
              updateInActionCount--;
            });
          } else {
            sendToDevTools({
              type: `syncAction-${name}/${action.name || "anonymous"}`,
              $payload: args.slice(0, len),
              getUpdatedState: () => ({ ...devToolMap, [name]: readonlyState }),
            });
            updateInActionCount--;
          }
          return re;
        };
        return p;
      }, {});
    } catch (e) {
      if (__DEV__) {
        console.warn(`[reactivity-store] connect to redux devtools failed, please check the redux devtools extension`, e);
      }
      return actions;
    }
  } else {
    return actions;
  }
};
