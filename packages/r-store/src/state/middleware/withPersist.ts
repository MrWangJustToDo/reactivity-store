/* eslint-disable @typescript-eslint/ban-types */
import { reactive, toRaw } from "@vue/reactivity";

import { Controller } from "../../shared/controller";
import { setDevController } from "../../shared/dev";
import { InternalNameSpace, isServer } from "../../shared/env";
import { createLifeCycle } from "../../shared/lifeCycle";
import { checkHasReactive, traverse } from "../../shared/tools";
import { createMiddleware, debounce, getFinalActions, getFinalDeepSelector, getFinalMiddleware, getFinalNamespace, getFinalState, persistKey } from "../tools";

import type { MaybeStateWithMiddleware, Setup, StateWithMiddleware, UnWrapMiddleware, WithPersistProps } from "../createState";
import type { StorageState } from "../tools";

const temp = new Set<Controller>();

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

      const deepSelector = getFinalDeepSelector(_initialState);

      let hasSet = false;

      if (middleware["withPersist"]) hasSet = true;

      if (__DEV__ && checkHasReactive(initialState)) {
        console.error(
          `[reactivity-store/persist] the 'setup' which from 'withPersist' should return a plain object, but current is a reactive object %o, you may use 'reactiveApi' in the 'setup' function`,
          initialState
        );
      }

      if (!isServer && !hasSet) {
        try {
          const storage = options?.getStorage?.() || window?.localStorage;

          if (!storage) {
            if (__DEV__) {
              console.error(`[reactivity-store/persist] can't find storage, please check your environment`);
            }

            return {
              ["$$__state__$$"]: initialState,
              ["$$__middleware__$$"]: middleware,
              ["$$__actions__$$"]: auctions,
              ["$$__namespace__$$"]: namespace,
              ["$$__deepSelector__$$"]: deepSelector,
            };
          }

          const storageStateString = storage.getItem(persistKey + options.key) as string;

          const storageState = JSON.parse(storageStateString) as StorageState;

          let re = initialState;

          if (storageState?.version === (options.version || options.key) && storageState.data) {
            const cachedState = options?.parse?.(storageState.data) || JSON.parse(storageState.data);

            re = options?.merge?.(initialState, cachedState) || Object.assign(initialState, cachedState);
          }

          re = reactive(re) as UnWrapMiddleware<T>;

          const onUpdate = debounce((instance: Controller) => {
            try {
              instance.run();

              const stringifyState = options?.stringify?.(re) || JSON.stringify(re);

              const cache = { data: stringifyState, version: options.version || options.key };

              if (__DEV__ && options.devLog) {
                console.log(`[reactivity-store/persist] state changed, try to cache newState: %o`, cache);
              }

              storage.setItem(persistKey + options.key, JSON.stringify(cache));
            } catch (e) {
              if (__DEV__) {
                console.error(`[reactivity-store/persist] cache newState error, error: %o`, e);
              }

              instance?.stop();
            }
          }, options.debounceTime || 40);

          const ControllerInstance = new Controller(() => traverse(re), createLifeCycle(), temp, InternalNameSpace.$$__persist__$$, onUpdate);

          ControllerInstance.run();

          if (__DEV__) {
            setDevController(ControllerInstance, initialState);
          }

          return {
            ["$$__state__$$"]: toRaw(re),
            ["$$__middleware__$$"]: middleware,
            ["$$__actions__$$"]: auctions,
            ["$$__namespace__$$"]: namespace,
            ["$$__deepSelector__$$"]: deepSelector,
          };
        } catch (e) {
          if (__DEV__) {
            console.error(`[reactivity-store/persist] middleware failed, error: ${e.message}`);
          }

          return {
            ["$$__state__$$"]: initialState,
            ["$$__middleware__$$"]: middleware,
            ["$$__actions__$$"]: auctions,
            ["$$__namespace__$$"]: namespace,
            ["$$__deepSelector__$$"]: deepSelector,
          };
        }
      } else {
        return {
          ["$$__state__$$"]: initialState,
          ["$$__middleware__$$"]: middleware,
          ["$$__actions__$$"]: auctions,
          ["$$__namespace__$$"]: namespace,
          ["$$__deepSelector__$$"]: deepSelector,
        };
      }
    },
    { name: "withPersist" }
  );
}
