import { version } from "react";

/**
 * @internal
 */
export const isServer = typeof window === "undefined";

/**
 * @internal
 */
export const isReact18 = version?.startsWith("18");
