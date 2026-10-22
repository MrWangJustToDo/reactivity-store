const isBuildOutput = (value: unknown): value is { entryFileNames?: string } => typeof value === "object" && value !== null;

const hasOctaneOutput = (output: unknown, fileName: string) => {
  const outputs = Array.isArray(output) ? output : [output];
  return outputs.some((item) => isBuildOutput(item) && item.entryFileNames?.endsWith(fileName));
};

export const isOctaneRuntimeBuild = (output: unknown) =>
  hasOctaneOutput(output, "octane/client.mjs") || hasOctaneOutput(output, "octane/server.mjs");

/**
 * The server artifact must bind to Octane's server hook scope. Leaving this as
 * a bare `octane` import silently selects client hooks during Node SSR.
 */
export const withOctaneServerRuntime = <T>(defaultPlugins: T[], output: unknown): T[] => {
  if (!hasOctaneOutput(output, "octane/server.mjs")) return defaultPlugins;

  const serverRuntimeAlias = {
    name: "reactivity-store-octane-server-runtime",
    resolveId(source: string) {
      if (source === "octane") return { id: "octane/server", external: true };
      return null;
    },
  } as T;

  return [serverRuntimeAlias, ...defaultPlugins];
};
