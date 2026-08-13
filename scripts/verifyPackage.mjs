import { build } from "esbuild";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const packageRoot = join(projectRoot, "packages/r-store");
const temporaryRoot = mkdtempSync(join(tmpdir(), "reactivity-store-pack-"));

const fail = (message) => {
  throw new Error(`[reactivity-store/package] ${message}`);
};

try {
  const gitInstallFiles = ["dist/octane/client.mjs", "dist/octane/server.mjs", "dist/octane/index.d.ts"];
  for (const file of gitInstallFiles) {
    const tracked = spawnSync("git", ["ls-files", "--error-unmatch", `packages/r-store/${file}`], {
      cwd: projectRoot,
      stdio: "ignore",
    });
    if (tracked.status !== 0) fail(`${file} is not tracked for Git subdirectory installs`);
  }

  for (const configName of ["rollupBuild.ts", "rollupWatch.ts"]) {
    const config = readFileSync(join(projectRoot, "scripts", configName), "utf8");
    if (!config.includes('import { generateExternal } from "./rollupExternal"') || !/external:\s*\{\s*generateExternal,?\s*\}/.test(config)) {
      fail(`${configName} does not share the external dependency policy`);
    }
    if (!config.includes("withOctaneServerRuntime") || !config.includes("options.output")) {
      fail(`${configName} does not select the Octane server runtime`);
    }
  }

  execFileSync("pnpm", ["pack", "--pack-destination", temporaryRoot], {
    cwd: packageRoot,
    stdio: "pipe",
  });

  const tarball = readdirSync(temporaryRoot).find((name) => name.endsWith(".tgz"));
  if (!tarball) fail("pnpm pack did not create a tarball");
  execFileSync("tar", ["-xzf", join(temporaryRoot, tarball), "-C", temporaryRoot]);

  const packedRoot = join(temporaryRoot, "package");
  const manifest = JSON.parse(readFileSync(join(packedRoot, "package.json"), "utf8"));
  const octaneExport = manifest.exports?.["./octane"];
  const expectedExports = {
    types: "./dist/octane/index.d.ts",
    browser: "./dist/octane/client.mjs",
    node: "./dist/octane/server.mjs",
    import: "./dist/octane/client.mjs",
    default: "./dist/octane/client.mjs",
  };
  for (const [condition, target] of Object.entries(expectedExports)) {
    if (octaneExport?.[condition] !== target) fail(`incorrect Octane ${condition} export`);
  }

  const clientPath = join(packedRoot, "dist/octane/client.mjs");
  const serverPath = join(packedRoot, "dist/octane/server.mjs");
  const typesPath = join(packedRoot, "dist/octane/index.d.ts");
  if (![clientPath, serverPath, typesPath].every(existsSync)) fail("Octane client, server, or declarations were not packed");

  const clientRuntime = readFileSync(clientPath, "utf8");
  const serverRuntime = readFileSync(serverPath, "utf8");
  const types = readFileSync(typesPath, "utf8");
  const forbiddenImport = /(?:from\s*|import\s*\(|require\s*\()\s*["'](?:react(?:-dom)?(?:\/[^"']*)?|use-sync-external-store(?:\/[^"']*)?)["']/;
  if ([clientRuntime, serverRuntime].some((runtime) => forbiddenImport.test(runtime))) fail("Octane runtime imports a React-only module");
  if (!/from\s*["']octane["']/.test(clientRuntime)) fail("Octane client artifact does not use the client runtime");
  if (!/from\s*["']octane\/server["']/.test(serverRuntime)) fail("Octane server artifact does not use the server runtime");
  if (/from\s+["']react(?:\/[^"']*)?["']|@types\/react|reference types=["']react["']/.test(types)) {
    fail("Octane declarations reference React types");
  }

  const consumerRoot = join(temporaryRoot, "consumer");
  mkdirSync(consumerRoot);
  writeFileSync(
    join(consumerRoot, "package.json"),
    JSON.stringify({
      private: true,
      type: "module",
      dependencies: {
        "happy-dom": "20.11.2",
        octane: "0.1.36",
        "reactivity-store": `file:${join(temporaryRoot, tarball)}`,
      },
    })
  );
  const cleanNpmConfig = join(temporaryRoot, "empty.npmrc");
  writeFileSync(cleanNpmConfig, "");
  const npmEnvironment = Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.toLowerCase().startsWith("npm_config_")));
  npmEnvironment.NPM_CONFIG_USERCONFIG = cleanNpmConfig;
  execFileSync("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--package-lock=false"], {
    cwd: consumerRoot,
    env: npmEnvironment,
    stdio: "pipe",
  });

  const installedForbidden = ["react", "react-dom", "use-sync-external-store"].filter((name) => existsSync(join(consumerRoot, "node_modules", name)));
  const npmList = spawnSync("npm", ["ls", "react", "react-dom", "use-sync-external-store", "--all", "--json"], {
    cwd: consumerRoot,
    env: npmEnvironment,
    encoding: "utf8",
  });
  if (installedForbidden.length > 0) {
    fail(`Octane-only npm install contains ${installedForbidden.join(", ")}\n${npmList.stdout}`);
  }

  const browserEntry = join(consumerRoot, "browser-smoke.mjs");
  writeFileSync(
    browserEntry,
    `import { createElement, createRoot, drainPassiveEffects, flushSync } from "octane";
import { createStore, ref } from "reactivity-store/octane";
const count = ref(1);
const store = createStore(() => ({ count }));
function Component() {
  const value = store((state) => state.count, Symbol.for("reactivity-store:browser-smoke"));
  return createElement("span", { id: "count" }, String(value));
}
const container = document.createElement("div");
const root = createRoot(container);
root.render(Component);
flushSync(() => {});
drainPassiveEffects();
if (container.innerHTML !== '<span id="count">1</span>') throw new Error(\`Octane browser render failed: \${container.innerHTML}\`);
root.unmount();
`
  );
  const browserBundlePath = join(consumerRoot, "browser-bundle.mjs");
  const bundle = await build({
    absWorkingDir: consumerRoot,
    entryPoints: [browserEntry],
    outfile: browserBundlePath,
    bundle: true,
    conditions: ["browser", "import"],
    format: "esm",
    platform: "browser",
    metafile: true,
  });
  const browserInputs = Object.keys(bundle.metafile.inputs);
  if (!browserInputs.some((path) => path.endsWith("reactivity-store/dist/octane/client.mjs"))) {
    fail("browser bundler did not select the Octane client artifact");
  }
  const forbiddenGraphEntry = browserInputs.find((path) => /node_modules\/(?:react|react-dom|use-sync-external-store)(?:\/|$)/.test(path));
  if (forbiddenGraphEntry) fail(`Octane browser graph contains ${forbiddenGraphEntry}`);
  writeFileSync(
    join(consumerRoot, "browser-runner.mjs"),
    `import { Window } from "happy-dom";
const window = new Window();
Object.assign(globalThis, {
  document: window.document,
  Event: window.Event,
  HTMLElement: window.HTMLElement,
  Node: window.Node,
  window,
});
try {
  await import("./browser-bundle.mjs");
  process.exit(0);
} catch (error) {
  console.error(error);
  process.exit(1);
}
`
  );
  execFileSync("node", ["browser-runner.mjs"], { cwd: consumerRoot, stdio: "pipe", timeout: 10_000 });

  const nodeResolved = execFileSync("node", ["--input-type=module", "--eval", "console.log(import.meta.resolve('reactivity-store/octane'))"], {
    cwd: consumerRoot,
    encoding: "utf8",
  }).trim();
  if (!nodeResolved.endsWith("/dist/octane/server.mjs")) fail(`Node selected the wrong Octane artifact: ${nodeResolved}`);

  writeFileSync(
    join(consumerRoot, "server-smoke.mjs"),
    `import { createStore, ref } from "reactivity-store/octane";
import { createElement, renderToStaticMarkup } from "octane/server";
const count = ref(3);
const store = createStore(() => ({ count }));
function Component() {
  const value = store((state) => state.count, Symbol.for("reactivity-store:package-smoke"));
  return createElement("span", { id: "count" }, String(value));
}
const result = renderToStaticMarkup(Component);
if (result.html !== '<span id="count">3</span>') throw new Error(\`Octane SSR failed: \${result.html}\`);
`
  );
  execFileSync("node", ["server-smoke.mjs"], { cwd: consumerRoot, stdio: "pipe" });

  console.log(`verified ${tarball}: Octane client/server exports, SSR, browser graph, types, and React-free npm consumer`);
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
