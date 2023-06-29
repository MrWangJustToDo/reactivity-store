import { unstable_batchedUpdates } from "react-dom";

export const batchObject: { current: (cb: () => void) => void } = { current: unstable_batchedUpdates };

export const setBatch = (batch: (cb: () => void) => void) => {
  batchObject.current = batch;
};

export const getBatch = () => {
  return batchObject.current;
};

export const resetBatch = () => {
  batchObject.current = unstable_batchedUpdates;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const wrapperBatchUpdate = <T extends Function>(cb: T): T => {
  return ((...args: any[]) => batchObject.current(() => (args.length ? cb.call(null, ...args) : cb.call(null)))) as unknown as T;
};
