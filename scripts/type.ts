import type { OutputOptions } from "rollup";

export type packages = "v-r-store";
export type Mode = "production" | "development";
export type MultipleOutput = OutputOptions & {
  multiple?: boolean;
};
