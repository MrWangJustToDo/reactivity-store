import { unstable_batchedUpdates } from "react-dom";

/**
 * @internal
 */
const batchObject: { current: (cb: () => void) => void } = { current: unstable_batchedUpdates };

/**
 * @public
 */
export const setBatch = (batch: (cb: () => void) => void) => {
  batchObject.current = batch;
};

/**
 * @public
 */
export const getBatch = () => {
  return batchObject.current;
};

/**
 * @public
 */
export const resetBatch = () => {
  batchObject.current = unstable_batchedUpdates;
};

/**
 * @public
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const wrapperBatchUpdate = <T extends Function>(cb: T): T => {
  return ((...args: any[]) => batchObject.current(() => (args.length ? cb.call(null, ...args) : cb.call(null)))) as unknown as T;
};
