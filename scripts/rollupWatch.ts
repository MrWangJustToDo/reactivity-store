/* eslint-disable @typescript-eslint/no-require-imports */
import { rollupWatch } from "project-tool/rollup";

rollupWatch({
  packageName: "r-store",
  packageScope: "packages",
  plugins: {
    singleOther: ({ defaultPlugins, defaultPluginPackages: { replace } }) => {
      return [
        ...defaultPlugins,
        replace({
          __VUE_VERSION__: JSON.stringify(require("@vue/reactivity/package.json").version),
        }),
      ];
    },
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
