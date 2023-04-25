import { rollupBuild } from "project-tool/rollup";

const start = async () => {
  await rollupBuild({ packageName: "r-store", packageScope: "packages" });
  process.exit(0);
};

start();
