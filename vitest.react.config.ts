import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["packages/r-store/tests/react/**/*.test.ts"],
  },
});
