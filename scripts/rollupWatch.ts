/* eslint-disable @typescript-eslint/no-require-imports */
import { rollupWatch } from "project-tool/rollup";

import { generateExternal } from "./rollupExternal";
import { withOctaneServerRuntime } from "./rollupPlugins";

type BuildPlugin = NonNullable<NonNullable<Parameters<typeof rollupWatch>[0]["plugins"]>["singleOther"]>;

const withBuildPlugins: BuildPlugin = ({ defaultPlugins, defaultPluginPackages: { replace }, defaultPluginProps: { options } }) => {
  return withOctaneServerRuntime(
    [
      ...defaultPlugins,
      replace({
        __VUE_VERSION__: JSON.stringify(require("@vue/reactivity/package.json").version),
      }),
    ],
    options.output
  );
};

rollupWatch({
  packageName: "r-store",
  packageScope: "packages",
  external: { generateExternal },
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
