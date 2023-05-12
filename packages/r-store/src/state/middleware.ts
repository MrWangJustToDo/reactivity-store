import { isServer } from "../shared";

import type { Setup } from "./createState";

type WithPersistProps<T extends Record<string, unknown>> = {
  key: string;
  getStorage?: () => Map<any, any>;
  stringify?: (s: T) => string;
  parse?: (s: string) => Partial<T>;
  merge?: (fromCreator: T, fromStorage: Partial<T>) => T;
};

// TODO
export const withPersist = <T extends Record<string, unknown>>(setup: Setup<T>, options: WithPersistProps<T>): Setup<T> => {
  if (isServer) {
    return setup;
  } else {
    if (__DEV__) {
      console.warn(
        `[r-store] the persist middleware may cause hydrate error for 'React' app, because of the initialState what from server and client may do not have the same state`
      );
    }
    return setup;
  }
};
