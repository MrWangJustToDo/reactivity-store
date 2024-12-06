const defaultBatch = (cb: () => void) => cb();

/**
 * @internal
 */
const batchObject: { current: (cb: () => void) => void } = { current: defaultBatch };

/**
 * @public
 * @deprecated
 * no need to use this function
 */
export const setBatch = (batch: (cb: () => void) => void) => {
  batchObject.current = batch;
};

/**
 * @public
 * @deprecated
 * no need to use this function
 */
export const getBatch = () => {
  return batchObject.current;
};

/**
 * @public
 * @deprecated
 * no need to use this function
 */
export const resetBatch = () => {
  batchObject.current = defaultBatch;
};

/**
 * @public
 * @deprecated
 * no need to use this function
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const wrapperBatchUpdate = <T extends Function>(cb: T): T => {
  return ((...args: any[]) => batchObject.current(() => (args.length ? cb.call(null, ...args) : cb.call(null)))) as unknown as T;
};
