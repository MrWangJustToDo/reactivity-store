import { octane } from "octane/compiler/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [octane()],
  resolve: {
    // Vitest transforms tests through its SSR pipeline; force the DOM suite to
    // exercise the browser condition instead of Node's server artifact.
    conditions: ["browser"],
  },
  test: {
    environment: "happy-dom",
    include: ["packages/r-store/tests/octane/**/*.test.ts"],
    exclude: ["packages/r-store/tests/octane/**/*.ssr.test.ts"],
  },
});
