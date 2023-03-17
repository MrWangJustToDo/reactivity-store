import type { OutputOptions } from "rollup";

export type packages = "r-store";
export type Mode = "production" | "development";
export type MultipleOutput = OutputOptions & {
  multiple?: boolean;
};
