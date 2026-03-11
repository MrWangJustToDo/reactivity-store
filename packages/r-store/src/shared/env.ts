/**
 * @public
 *
 * Detects if running in a browser environment (has window and document)
 */
export const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

/**
 * @public
 *
 * Detects if running in a server/Node.js environment (no window)
 */
export const isServer = !isBrowser;

/**
 * @public
 *
 * Environment configuration options for non-browser usage
 */
export interface EnvConfigOptions {
  /**
   * When true, suppresses warnings about state updates in non-browser environments.
   * Set to true for terminal UI frameworks.
   */
  allowNonBrowserUpdates: boolean;

  /**
   * When true, enables persistence even without browser localStorage.
   * Requires custom storage via getStorage option.
   */
  allowCustomStorage: boolean;
}

/**
 * @internal
 *
 * Configuration for environment behavior
 * Can be modified to enable/disable features in different environments
 */
export const envConfig: EnvConfigOptions = {
  allowNonBrowserUpdates: false,
  allowCustomStorage: true,
};

/**
 * @public
 *
 * Configure environment settings for non-browser usage (terminal UI frameworks, etc.)
 *
 * @example
 * ```ts
 * import { configureEnv } from 'reactivity-store';
 *
 * // Enable for terminal UI frameworks
 * configureEnv({ allowNonBrowserUpdates: true });
 * ```
 */
export function configureEnv(options: Partial<EnvConfigOptions>): void {
  Object.assign(envConfig, options);
}

/**
 * @internal
 */
export enum InternalNameSpace {
  "$$__ignore__$$" = "$$__ignore__$$",
  "$$__persist__$$" = "$$__persist__$$",
  "$$__subscribe__$$" = "$$__subscribe__$$",
  "$$__redux_dev_tool__$$" = "$$__redux_dev_tool__$$",
}
