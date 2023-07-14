import { internalCreateStore } from "./_internal";

import type { Creator} from "./_internal";

export const createStore = <T extends Record<string, unknown>>(creator: Creator<T>) => {
  return internalCreateStore(creator);
};
