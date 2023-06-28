import { version } from "react";

export const isServer = typeof window === "undefined";

export const isReact18 = version?.startsWith("18");
