/* eslint-disable @typescript-eslint/no-require-imports */
import { rollupBuild } from "project-tool/rollup";

import { generateExternal } from "./rollupExternal";
import { isOctaneRuntimeBuild, withOctaneServerRuntime } from "./rollupPlugins";

type BuildPlugin = NonNullable<NonNullable<Parameters<typeof rollupBuild>[0]["plugins"]>["singleOther"]>;

const withBuildPlugins: BuildPlugin = ({ defaultPlugins, defaultPluginPackages: { replace, terser }, defaultPluginProps: { options } }) => {
  const plugins = withOctaneServerRuntime(
    [
      ...defaultPlugins,
      replace({
        __VUE_VERSION__: JSON.stringify(require("@vue/reactivity/package.json").version),
      }),
    ],
    options.output
  );
  return isOctaneRuntimeBuild(options.output) ? [...plugins, terser()] : plugins;
};

const start = async () => {
  await rollupBuild({
    packageName: "r-store",
    packageScope: "packages",
    external: {
      generateExternal,
    },
    plugins: {
      singleOther: withBuildPlugins,
      multipleDevUMD: ({ defaultPlugins, defaultPluginPackages: { replace } }) => {
        return [
          ...defaultPlugins,
          replace({
            __VUE_VERSION__: JSON.stringify(require("@vue/reactivity/package.json").version),
          }),
        ];
      },
      multipleDevOther: ({ defaultPlugins, defaultPluginPackages: { replace } }) => {
        return [
          ...defaultPlugins,
          replace({
            __VUE_VERSION__: JSON.stringify(require("@vue/reactivity/package.json").version),
          }),
        ];
      },
      multipleProdOther: ({ defaultPlugins, defaultPluginPackages: { replace } }) => {
        return [
          ...defaultPlugins,
          replace({
            __VUE_VERSION__: JSON.stringify(require("@vue/reactivity/package.json").version),
          }),
        ];
      },
      multipleProdUMD: ({ defaultPlugins, defaultPluginPackages: { replace } }) => {
        return [
          ...defaultPlugins,
          replace({
            __VUE_VERSION__: JSON.stringify(require("@vue/reactivity/package.json").version),
          }),
        ];
      },
    },
  });
  process.exit(0);
};

start();
