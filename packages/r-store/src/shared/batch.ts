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

export const wrapperBatchUpdate = (cb: () => void) => {
  return () => batchObject.current(cb);
};
