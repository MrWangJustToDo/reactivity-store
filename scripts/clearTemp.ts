import { copyFile, rm } from "fs/promises";
import { resolve } from "path";

const typeDirs = resolve(process.cwd(), "packages", "r-store", "dist", "types");

const tempPath = resolve(process.cwd(), "packages", "r-store", "dist", "reactivity-store.d.ts");

const resultPath = resolve(process.cwd(), "packages", "r-store", "index.d.ts");

const run = async () => {
  await rm(typeDirs, { recursive: true, force: true });
  await copyFile(tempPath, resultPath);
  await rm(tempPath);
};

run();
