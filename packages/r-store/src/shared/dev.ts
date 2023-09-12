import { isServer } from "./env";

const devMap: Record<string, unknown> = {};

/**
 * @internal
 */
export const setDevMap = (key: string, value: unknown) => {
  devMap[key] = value;
};

/**
 * @internal
 */
export const checkHasKey = (key: string) => {
  return key in devMap;
};

if (!isServer) {
  try {
    if (__DEV__ && globalThis["@reactivity-store"]) {
      console.error(`[reactivity-store] you are using multiple version of reactivity-store, this is a unexpected usage`);
    }
    globalThis["@reactivity-store"] = devMap;
  } catch {
    void 0;
  }
}
