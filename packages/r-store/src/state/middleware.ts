import { ReactiveEffect, reactive } from "@vue/reactivity";

import { isServer, traverse } from "../shared";

import type { Setup } from "./createState";

const persistKey = "r-store/persist-";

type StorageState = {
  version: string;
  data: any;
};

type WithPersistProps<T extends Record<string, unknown>> = {
  key: string;
  version?: string;
  debounceTime?: number;
  getStorage?: () => Storage;
  stringify?: (s: T) => string;
  parse?: (s: string) => Partial<T>;
  merge?: (fromCreator: T, fromStorage: Partial<T>) => T;
};

// eslint-disable-next-line @typescript-eslint/ban-types
const debounce = <T extends Function>(cb: T, time): T => {
  let id = null;
  return ((...args: any[]) => {
    clearTimeout(id);
    id = setTimeout(() => cb.call(null, ...args), time);
  }) as unknown as T;
};

// TODO
export const withPersist = <T extends Record<string, unknown>>(setup: Setup<T>, options: WithPersistProps<T>): Setup<T> => {
  if (isServer) {
    return setup;
  } else {
    if (__DEV__) {
      console.warn(
        `[r-store/persist] the persist middleware may cause hydrate error for 'React' app, because of the initialState what from server and client may do not have the same state`
      );
    }
    return () => {
      const initialState = setup();

      const storage = options?.getStorage?.() || window.localStorage;

      const storageStateString = storage.getItem(persistKey + options.key) as string;

      const storageState = JSON.parse(storageStateString) as StorageState;

      let re = initialState;

      if (storageState?.version === (options.version || options.key) && storageState.data) {
        try {
          const cachedState = options?.parse?.(storageState.data) || JSON.parse(storageState.data);
  
          re = options?.merge?.(initialState, cachedState) || Object.assign(initialState, cachedState);
        } catch(e) {
          console.error(`[r-store/persist] parse state error, error: ${e}`)
        }
      }

      re = reactive(re) as T;

      new ReactiveEffect(
        () => traverse(re),
        debounce(() => {
          try {
            const stringifyState = options?.stringify?.(re) || JSON.stringify(re);

            const cache = { data: stringifyState, version: options.version || options.key };

            storage.setItem(persistKey + options.key, JSON.stringify(cache));
          } catch (e) {
            if (__DEV__) {
              console.error(`[r-store/persist] cache newState error, error: ${e}`);
            }
          }
        }, options.debounceTime || 40)
      ).run();

      return re;
    };
  }
};
