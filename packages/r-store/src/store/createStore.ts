import { createStoreWithLifeCycle } from "./internal";

import type { Creator} from "./internal";

export const createStore = <T extends Record<string, unknown>>(creator: Creator<T>) => {
  return createStoreWithLifeCycle(creator);
};
