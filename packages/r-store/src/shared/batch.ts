/**
 * @public
 * @deprecated
 * no need to use this function
 */
export const setBatch = (_batch: (cb: () => void) => void) => {
};

/**
 * @public
 * @deprecated
 * no need to use this function
 */
export const getBatch = () => {
};

/**
 * @public
 * @deprecated
 * no need to use this function
 */
export const resetBatch = () => {
};

/**
 * @public
 * @deprecated
 * no need to use this function
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const wrapperBatchUpdate = <T extends Function>(_cb: T): T => {
  return _cb;
};
