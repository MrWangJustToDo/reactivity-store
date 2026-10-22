import { createRequire } from "node:module";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import { readFileSync } from "node:fs";

const projectRoot = resolve(import.meta.dirname, "..");
const packageRoot = resolve(projectRoot, "packages/r-store");
const require = createRequire(import.meta.url);

const assertStoreSurface = (binding, label) => {
  if (typeof binding.createStore !== "function" || typeof binding.ref !== "function") {
    throw new Error(`[reactivity-store/react-build] ${label} is missing createStore/ref`);
  }
  const count = binding.ref(1);
  const store = binding.createStore(() => ({ count }));
  if (store.getReadonlyState().count !== 1) {
    throw new Error(`[reactivity-store/react-build] ${label} cannot read store state`);
  }
};

const esm = await import(resolve(packageRoot, "dist/esm/index.mjs"));
assertStoreSurface(esm, "ESM");

for (const mode of ["development", "production"]) {
  const cjs = require(resolve(packageRoot, `dist/cjs/index.${mode}.js`));
  assertStoreSurface(cjs, `CJS ${mode}`);
}

const context = {
  React: require("react"),
  ReactDOM: require("react-dom"),
  console,
  process: { env: { NODE_ENV: "development" } },
};
context.globalThis = context;
context.self = context;
runInNewContext(readFileSync(resolve(packageRoot, "dist/umd/index.development.js"), "utf8"), context);
assertStoreSurface(context.RStore, "UMD development");

const outputs = ["dist/esm/index.mjs", "dist/cjs/index.development.js", "dist/cjs/index.production.js"].map((path) =>
  readFileSync(resolve(packageRoot, path), "utf8")
);
if (outputs.some((source) => /(?:from\s*|require\s*\()\s*["']use-sync-external-store/.test(source))) {
  throw new Error("[reactivity-store/react-build] use-sync-external-store was not inlined");
}

console.log("verified React ESM, CJS development/production, and UMD builds");
