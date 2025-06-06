/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { reactive, readonly, toRaw } from "@vue/reactivity";
import { isPromise } from "@vue/shared";

import { Controller } from "../../shared/controller";
import { setDevController } from "../../shared/dev";
import { InternalNameSpace, isServer } from "../../shared/env";
import { createLifeCycle } from "../../shared/lifeCycle";
import { checkHasReactive, traverse, traverseShallow } from "../../shared/tools";
import {
  createMiddleware,
  debounce,
  getFinalActions,
  getFinalSelectorOptions,
  getFinalMiddleware,
  getFinalNamespace,
  getFinalState,
  persistKey,
} from "../tools";

import type { MaybeStateWithMiddleware, Setup, StateWithMiddleware, UnWrapMiddleware, WithPersistProps } from "../createState";
import type { StorageState } from "../tools";

const temp = new Set<Controller>();

const defaultCompare = () => false;

/**
 * @public
 */
export function withPersist<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<StateWithMiddleware<T, P>>,
  options: WithPersistProps<T>
): Setup<StateWithMiddleware<T, P>>;
/**
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function withPersist<T extends Record<string, unknown>>(setup: Setup<T>, options: WithPersistProps<T>): Setup<StateWithMiddleware<T, {}>>;
/**
 * @public
 */
export function withPersist<T extends Record<string, unknown>, P extends Record<string, Function>>(
  setup: Setup<MaybeStateWithMiddleware<T, P>>,
  options: WithPersistProps<UnWrapMiddleware<T>>
): Setup<StateWithMiddleware<UnWrapMiddleware<T>, P>> {
  return createMiddleware(
    () => {
      const _initialState = setup();

      const initialState = getFinalState(_initialState) as UnWrapMiddleware<T>;

      const middleware = getFinalMiddleware(_initialState);

      const auctions = getFinalActions(_initialState);

      const namespace = getFinalNamespace(_initialState);

      const selectorOptions = getFinalSelectorOptions(_initialState);

      let hasSet = false;

      if (middleware["withPersist"]) hasSet = true;

      if (__DEV__ && checkHasReactive(initialState)) {
        console.error(
          `[reactivity-store/persist] the 'setup' which from 'withPersist' should return a plain object, but current is a reactive object %o, you may use 'reactiveApi' in the 'setup' function`,
          initialState
        );
      }

      if (!isServer && !hasSet) {
        let re = initialState;

        const storageKey = persistKey + options.key;

        let storage: Storage | null = null;

        try {
          storage = options?.getStorage?.() || window?.localStorage;

          if (!storage) {
            if (__DEV__) {
              console.error(`[reactivity-store/persist] can't find storage, please check your environment`);
            }

            return {
              ["$$__state__$$"]: toRaw(initialState),
              ["$$__middleware__$$"]: middleware,
              ["$$__actions__$$"]: auctions,
              ["$$__namespace__$$"]: namespace,
              ["$$__selectorOptions__$$"]: selectorOptions,
            } as StateWithMiddleware<UnWrapMiddleware<T>, P>;
          }

          const storageStateString = storage.getItem(storageKey) as string;

          const storageState = JSON.parse(storageStateString) as StorageState;

          if (storageState?.version === (options.version || options.key) && storageState.data) {
            const cachedState = options?.parse?.(storageState.data) || JSON.parse(storageState.data);

            re = options?.merge?.(initialState, cachedState) || Object.assign(initialState, cachedState);
          }
        } catch (e) {
          if (__DEV__) {
            console.error(`[reactivity-store/persist] middleware failed, error: ${e.message}`);
          }

          storage.removeItem?.(storageKey);
        }

        re = reactive(re as object) as UnWrapMiddleware<T>;

        const onUpdate = debounce(() => {
          try {
            const stringifyState = options?.stringify?.(re) || JSON.stringify(re);

            const cache = { data: stringifyState, version: options.version || options.key };

            if (__DEV__ && options.devLog) {
              console.log(`[reactivity-store/persist] state changed, try to cache newState: %o`, cache);
            }

            storage.setItem?.(storageKey, JSON.stringify(cache));
          } catch (e) {
            if (__DEV__) {
              console.error(`[reactivity-store/persist] cache newState error, error: %o`, e);
            }

            storage.removeItem?.(storageKey);
          }
        }, options.debounceTime || 40);

        const subscribe = () => {
          let _re = re;

          if (typeof options.listener === "function") {
            _re = options.listener(re);
          }

          if (__DEV__ && isPromise(_re)) {
            console.error(`[reactivity-store/persist] listener should return a plain object, but current is a promise`);
            return;
          }

          if (options.shallow) {
            traverseShallow(_re);
          } else {
            traverse(_re);
          }
        };

        const ControllerInstance = new Controller(subscribe, defaultCompare, createLifeCycle(), temp, InternalNameSpace.$$__persist__$$, onUpdate);

        ControllerInstance.run();

        const readonlyState = readonly(toRaw(re) as object);

        if (__DEV__) {
          setDevController(ControllerInstance, readonlyState);

          ControllerInstance._devPersistOptions = options;
        }

        return {
          ["$$__state__$$"]: toRaw(re),
          ["$$__middleware__$$"]: middleware,
          ["$$__actions__$$"]: auctions,
          ["$$__namespace__$$"]: namespace,
          ["$$__selectorOptions__$$"]: selectorOptions,
        } as StateWithMiddleware<UnWrapMiddleware<T>, P>;
      } else {
        return {
          ["$$__state__$$"]: toRaw(initialState),
          ["$$__middleware__$$"]: middleware,
          ["$$__actions__$$"]: auctions,
          ["$$__namespace__$$"]: namespace,
          ["$$__selectorOptions__$$"]: selectorOptions,
        } as StateWithMiddleware<UnWrapMiddleware<T>, P>;
      }
    },
    { name: "withPersist" }
  );
}
