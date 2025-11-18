/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { reactive, toRaw } from "@vue/reactivity";
import { isPromise } from "@vue/shared";

import { Controller } from "../../shared/controller";
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
  getFinalLifeCycle,
} from "../tools";

import type { MaybeStateWithMiddleware, Setup, StateWithMiddleware, UnWrapMiddleware, WithPersistProps } from "../createState";
import type { StorageState } from "../tools";

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

      const lifeCycle = getFinalLifeCycle(_initialState);

      const namespace = getFinalNamespace(_initialState);

      const selectorOptions = getFinalSelectorOptions(_initialState);

      let hasSet = false;

      if (middleware["withPersist"]) hasSet = true;

      if (__DEV__ && checkHasReactive(initialState)) {
        console.error(
          `[reactivity-store/withPersist] the 'setup' which from 'withPersist' should return a plain object, but current is a reactive object %o, you may use 'reactiveApi' in the 'setup' function`,
          initialState
        );
      }

      const getMigrateState = (storage: Storage) => {
        try {
          if (options.migrateVersion) {
            const migrateKey = persistKey + options.key + `_${options.migrateVersion}`;

            const migrateStateString = storage.getItem(migrateKey) as string;

            if (migrateStateString) {
              const migrateState = JSON.parse(migrateStateString) as StorageState;

              if (migrateState?.version === options.migrateVersion && migrateState.data) {
                return options.migrateState(migrateState, () => storage.removeItem?.(migrateKey));
              }
            }
          }

          return null;
        } catch {
          void 0;
        }
      };

      if (!isServer && !hasSet) {
        let re = initialState;

        const storageKey = persistKey + options.key + (options.version ? `_${options.version}` : "");

        let storage: Storage | null = null;

        try {
          storage = options?.getStorage?.() || window?.localStorage;

          if (!storage) {
            if (__DEV__) {
              console.error(`[reactivity-store/withPersist] can't find storage, please check your environment`);
            }

            return {
              ["$$__state__$$"]: toRaw(initialState),
              ["$$__middleware__$$"]: middleware,
              ["$$__actions__$$"]: auctions,
              ["$$__lifeCycle__$$"]: lifeCycle,
              ["$$__namespace__$$"]: namespace,
              ["$$__selectorOptions__$$"]: selectorOptions,
            } as StateWithMiddleware<UnWrapMiddleware<T>, P>;
          }

          const storageStateString = storage.getItem(storageKey) as string;

          const storageState = JSON.parse(storageStateString) as StorageState;

          const migrateState = getMigrateState(storage);

          if (__DEV__ && migrateState && storageState) {
            console.warn(
              `[reactivity-store/withPersist] found both migrate state and current version state, you may forget to remove the old version state from storage, please check it, current version: ${options.version}, migrate version: ${options.migrateVersion}`
            );
          }

          if (storageState?.version === (options.version || options.key) && storageState.data) {
            const cachedState = options?.parse?.(storageState.data) || JSON.parse(storageState.data);

            re = options?.merge?.(initialState, cachedState) || Object.assign(initialState, cachedState);
          } else if (migrateState) {
            re = options?.merge?.(initialState, migrateState) || Object.assign(initialState, migrateState);
          }
        } catch (e) {
          if (__DEV__) {
            console.error(`[reactivity-store/withPersist] middleware failed, error: ${e.message}`);
          }

          try {
            storage.removeItem?.(storageKey);
          } catch {
            void 0;
          }
        }

        re = reactive(re as object) as UnWrapMiddleware<T>;

        const onUpdate = debounce(() => {
          try {
            const stringifyState = options?.stringify?.(re) || JSON.stringify(re);

            const cache = { data: stringifyState, version: options.version || options.key };

            if (__DEV__ && options.devLog) {
              console.log(`[reactivity-store/withPersist] state changed, try to cache newState: %o`, cache);
            }

            storage.setItem?.(storageKey, JSON.stringify(cache));
          } catch (e) {
            if (__DEV__) {
              console.error(`[reactivity-store/withPersist] cache newState error, error: %o`, e);
            }

            try {
              storage.removeItem?.(storageKey);
            } catch {
              void 0;
            }
          }
        }, options.debounceTime || 40);

        const subscribe = () => {
          let _re = re;

          if (typeof options.listener === "function") {
            _re = options.listener(re);
          }

          if (__DEV__ && isPromise(_re)) {
            console.error(`[reactivity-store/withPersist] listener should return a plain object, but current is a promise`);
            return;
          }

          if (options.shallow) {
            traverseShallow(_re);
          } else {
            traverse(_re);
          }
        };

        const ControllerInstance = new Controller(subscribe, defaultCompare, createLifeCycle(), InternalNameSpace.$$__persist__$$, onUpdate);

        ControllerInstance.run();

        if (__DEV__) {
          ControllerInstance._devPersistOptions = options;
        }

        return {
          ["$$__state__$$"]: toRaw(re),
          ["$$__middleware__$$"]: middleware,
          ["$$__actions__$$"]: auctions,
          ["$$__lifeCycle__$$"]: lifeCycle,
          ["$$__namespace__$$"]: namespace,
          ["$$__selectorOptions__$$"]: selectorOptions,
        } as StateWithMiddleware<UnWrapMiddleware<T>, P>;
      } else {
        return {
          ["$$__state__$$"]: toRaw(initialState),
          ["$$__middleware__$$"]: middleware,
          ["$$__actions__$$"]: auctions,
          ["$$__lifeCycle__$$"]: lifeCycle,
          ["$$__namespace__$$"]: namespace,
          ["$$__selectorOptions__$$"]: selectorOptions,
        } as StateWithMiddleware<UnWrapMiddleware<T>, P>;
      }
    },
    { name: "withPersist" }
  );
}
