import { rm } from "fs/promises";
import { resolve } from "path";

// api-extractor writes the rolled-up declaration straight to dist/octane/index.d.ts,
// so the intermediate per-module declarations only need to be removed.
const typeDirs = resolve(process.cwd(), "packages", "r-store", "dist", "octane-types");

const run = async () => {
  await rm(typeDirs, { recursive: true, force: true });
};

run();
