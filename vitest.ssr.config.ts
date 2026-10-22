import { octane } from "octane/compiler/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [octane({ ssr: true })],
  resolve: {
    alias: [{ find: /^octane$/, replacement: "octane/server" }],
  },
  test: {
    environment: "node",
    include: ["packages/r-store/tests/octane/**/*.ssr.test.ts"],
  },
});
