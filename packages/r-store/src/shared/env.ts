import { version } from "react";

/**
 * @internal
 */
export const isServer = typeof window === "undefined";

/**
 * @internal
 */
export const isNewStrictModeReact = version?.startsWith("18") || version?.startsWith("19");

/**
 * @internal
 */
export enum InternalNameSpace {
  "$$__ignore__$$" = "$$__ignore__$$",
  "$$__persist__$$" = "$$__persist__$$",
  "$$__subscribe__$$" = "$$__subscribe__$$",
  "$$__redux_dev_tool__$$" = "$$__redux_dev_tool__$$",
}
